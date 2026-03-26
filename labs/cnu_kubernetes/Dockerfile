FROM codercom/code-server:latest
USER root

# ── Kubernetes CLI (kubectl) ───────────────────────────────────────────────
RUN curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl" \
    && install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl \
    && rm kubectl

# ── Helm ──────────────────────────────────────────────────────────────────
RUN curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash

# ── Docker CLI + Compose plugin (Docker-out-of-Docker via host socket) ────
# Installs the docker CLI so students can run `docker` and `docker compose`
# from the VS Code terminal. The actual Docker daemon runs on the host
# and is accessed via the /var/run/docker.sock volume mount.
RUN apt-get update && apt-get install -y --no-install-recommends \
        ca-certificates \
        curl \
        gnupg \
        lsb-release \
    && install -m 0755 -d /etc/apt/keyrings \
    && curl -fsSL https://download.docker.com/linux/debian/gpg \
       | gpg --dearmor -o /etc/apt/keyrings/docker.gpg \
    && chmod a+r /etc/apt/keyrings/docker.gpg \
    && echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
       https://download.docker.com/linux/debian $(lsb_release -cs) stable" \
       > /etc/apt/sources.list.d/docker.list \
    && apt-get update \
    && apt-get install -y --no-install-recommends \
        docker-ce-cli \
        docker-compose-plugin \
    && rm -rf /var/lib/apt/lists/*

# Allow the 'coder' user to run docker without sudo
# (the socket permissions are inherited from the host's docker group via bind mount)
RUN usermod -aG docker coder 2>/dev/null || true

# ── Default user & workdir ────────────────────────────────────────────────
USER coder
WORKDIR /home/coder/project
