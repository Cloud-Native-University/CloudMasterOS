FROM ubuntu:22.04
USER root
ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update && apt-get install -y curl wget sudo git nano apt-transport-https ca-certificates gnupg lsb-release podman iptables && curl -fsSL https://code-server.dev/install.sh | sh
WORKDIR /home/coder/project
