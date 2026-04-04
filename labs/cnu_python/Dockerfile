FROM python:3.11-bookworm
USER root
ENV DEBIAN_FRONTEND=noninteractive

# OS Dependencies & code-server
RUN apt-get update && apt-get install -y curl wget sudo git nano apt-transport-https ca-certificates gnupg lsb-release && curl -fsSL https://code-server.dev/install.sh | sh

# Python specific testing and formatting packages globally
RUN pip install pytest black flake8 requests flask beautifulsoup4 pandas

# Pre-install officially supported python extension for code-server and setup Bash styling
RUN code-server --install-extension ms-python.python && \
    echo 'export PS1="\[\e[33m\]🐍 Python Lab\[\e[m\] \[\e[34;1m\]\W\[\e[m\] \$ "' >> /root/.bashrc

WORKDIR /home/coder/project
