# Usamos la imagen oficial pura de Kali Linux (Rolling Release)
FROM kalilinux/kali-rolling:latest

USER root

# Evitar prompts interactivos durante la instalación
ENV DEBIAN_FRONTEND=noninteractive

# 1. Instalamos las utilidades base y el motor web de VS Code (code-server)
RUN apt-get update && apt-get install -y \
    curl \
    sudo \
    wget \
    gnupg \
    procps \
    git \
    nano \
    && curl -fsSL https://code-server.dev/install.sh | sh

# 2. Instalamos el verdadero arsenal de Kali Linux Nativo (Top Tools del CTF)
RUN apt-get update && apt-get install -y \
    nmap \
    gobuster \
    nikto \
    sqlmap \
    python3 \
    python3-pip \
    iputils-ping \
    netcat-traditional \
    seclists \
    wordlists \
    && rm -rf /var/lib/apt/lists/*

# Descomprimimos rockyou.txt (El estándar de oro para ataques de fuerza bruta)
RUN if [ -f /usr/share/wordlists/rockyou.txt.gz ]; then gzip -d /usr/share/wordlists/rockyou.txt.gz; fi

# Configuramos el directorio central de trabajo del alumno
WORKDIR /home/coder/project
