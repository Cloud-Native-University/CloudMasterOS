FROM ubuntu:22.04
USER root
ENV DEBIAN_FRONTEND=noninteractive

# Core OS Utilities
RUN apt-get update && apt-get install -y curl wget sudo git nano vim cron htop tzdata \
    net-tools iproute2 traceroute rsync apt-transport-https ca-certificates gnupg lsb-release iptables \
    && curl -fsSL https://code-server.dev/install.sh | sh

# Setup Bash styling
RUN echo 'export PS1="\[\e[32m\]🐧 Linux Lab\[\e[m\] \[\e[34;1m\]\W\[\e[m\] \$ "' >> /root/.bashrc

WORKDIR /home/coder/project
