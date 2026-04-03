FROM golang:1.22-bookworm
USER root
ENV DEBIAN_FRONTEND=noninteractive

# OS Dependencies & code-server
RUN apt-get update && apt-get install -y curl wget sudo git nano apt-transport-https ca-certificates gnupg lsb-release && curl -fsSL https://code-server.dev/install.sh | sh

# Install core Golang tools for VS Code Intellisense & Formatter
RUN go install golang.org/x/tools/gopls@latest && \
    go install github.com/go-delve/delve/cmd/dlv@latest && \
    go install golang.org/x/tools/cmd/goimports@latest && \
    go clean -cache && go clean -modcache

# Pre-install officially supported go extension for code-server and setup Bash styling
RUN code-server --install-extension golang.Go && \
    echo 'export PS1="\[\e[36m\]🐹 Golang Lab\[\e[m\] \[\e[34;1m\]\W\[\e[m\] \$ "' >> /root/.bashrc

# Enforce Env PATH
ENV PATH=$PATH:/go/bin

WORKDIR /home/coder/project
