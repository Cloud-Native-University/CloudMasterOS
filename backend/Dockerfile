FROM golang:1.24-alpine

RUN apk update && apk add --no-cache docker-cli docker-cli-compose

WORKDIR /app
ENV GOTOOLCHAIN=auto

COPY go.mod go.sum ./
RUN go mod edit -replace go.opentelemetry.io/contrib/instrumentation/net/http/otelhttp=go.opentelemetry.io/contrib/instrumentation/net/http/otelhttp@v0.49.0
RUN go mod edit -replace go.opentelemetry.io/otel=go.opentelemetry.io/otel@v1.24.0
RUN go mod download

COPY . .

RUN CGO_ENABLED=0 go build -o /orchestrator .

EXPOSE 8080

ENV DB_HOST=cloudmaster_db
ENV GIN_MODE=release

ENTRYPOINT ["/orchestrator"]
