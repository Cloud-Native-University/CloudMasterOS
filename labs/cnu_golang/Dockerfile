FROM golang:1.22-bookworm
USER root
ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update && apt-get install -y curl wget sudo git nano apt-transport-https ca-certificates gnupg lsb-release && curl -fsSL https://code-server.dev/install.sh | sh
WORKDIR /home/coder/project
