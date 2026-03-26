# --- STAGE 1: Frontend Build ---
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ .
RUN npm run build

# --- STAGE 2: Backend Build ---
# Forcamos que el constructor corra en la plataforma nativa del host (Mac)
# pero compile para el destino correcto (Cross-Compilation)
FROM --platform=$BUILDPLATFORM golang:1.24-alpine AS backend-builder
ARG TARGETOS
ARG TARGETARCH
ARG BUILD_TAGS=""
WORKDIR /app/backend
RUN apk add --no-cache git
COPY backend/go.mod backend/go.sum ./
ENV GOTOOLCHAIN=local
RUN go mod edit -go=1.24
# Correcting otel dependencies in build time
RUN go mod edit -replace go.opentelemetry.io/contrib/instrumentation/net/http/otelhttp=go.opentelemetry.io/contrib/instrumentation/net/http/otelhttp@v0.49.0
RUN go mod edit -replace go.opentelemetry.io/otel=go.opentelemetry.io/otel@v1.24.0
RUN go mod download
COPY backend/ .
RUN CGO_ENABLED=0 GOOS=$TARGETOS GOARCH=$TARGETARCH go build -tags "$BUILD_TAGS" -o /orchestrator .

# --- STAGE 3: Final Production Image ---
FROM alpine:latest
RUN apk add --no-cache docker-cli docker-cli-compose docker-cli-buildx bash

WORKDIR /app
# Final directory structure
# /app/orchestrator
# /app/static/ (Frontend dist)

COPY --from=backend-builder /orchestrator /app/orchestrator
COPY --from=frontend-builder /app/frontend/dist /app/static

# --- New: Educational Content Inclusion ---
# Local: CloudMasterOS/project -> Container: /app/labs/project
COPY project /app/labs/project

# Local: CloudMasterOS/lab-compose.yml -> Container: /app/labs/docker-compose.yml
COPY lab-compose.yml /app/labs/docker-compose.yml

# --- New: Added for inner-build support ---
# Local: CloudMasterOS/lab-workspace.Dockerfile -> Container: /app/labs/Dockerfile
COPY lab-workspace.Dockerfile /app/labs/Dockerfile

# Local: CloudMasterOS/labspace -> Container: /app/labs/labspace
COPY labspace /app/labs/labspace

# Local: CloudMasterOS/checkers -> Container: /opt/cloudmaster/checkers
COPY checkers /opt/cloudmaster/checkers

# Local: CloudMasterOS/guia.json -> Container: /app/labs/guia.json
COPY guia.json /app/labs/guia.json

# Env variables for portability
ENV GIN_MODE=release
ENV LABSPACE_SOURCE_PATH=/app/labs
ENV DB_HOST=localhost

EXPOSE 8081

ENTRYPOINT ["/app/orchestrator"]
