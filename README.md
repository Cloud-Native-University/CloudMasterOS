# 🛡️ CloudMasterOS Community Edition (Unified)

**CloudMasterOS** es la plataforma de entrenamiento nativa en Docker más avanzada para la ingeniería Cloud Native. Esta versión unificada soporta más de **75 laboratorios interactivos** (Kubernetes, Docker, Linux, Podman, y más) bajo un único orquestador modular y portátil. 🛰️🏗️🚀🏆

---

## 🏛️ Diagrama de Arquitectura Master

```text
┌───────────────────────────────────────────────────────────────────────┐
│                CloudNative University CE — Docker Stack               │
│                                                                       │
│  ┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐  │
│  │ frontend        │───▶│ orchestrator     │───▶│ postgres        │  │
│  │ React + Vite    │    │ Go + Gin REST API│    │ Port: 5432      │  │
│  │ Port: 5173      │    │ Port: 8081       │    └─────────────────┘  │
│  └─────────────────┘    └────────┬─────────┘                         │
│                                  │ /var/run/docker.sock              │
│                    ┌─────────────▼──────────────────────┐            │
│                    │        Per-Student Lab Stack        │            │
│                    │                                     │            │
│                    │  ┌───────────┐  ┌───────────────┐  │            │
│                    │  │  k3s      │  │  VS Code      │  │            │
│                    │  │  cluster  │  │  server       │  │            │
│                    │  └─────▲─────┘  └───────────────┘  │            │
│                    │        │  kubectl / helm            │            │
│                    │  ┌─────┴────────────────────────┐  │            │
│                    │  │  Student Terminal             │  │            │
│                    │  │  kubectl · helm · docker CLI │  │            │
│                    │  └──────────────────────────────┘  │            │
│                    └─────────────────────────────────────┘            │
└───────────────────────────────────────────────────────────────────────┘
```


---


Este proyecto está diseñado como un **orquestador agnóstico** que gestiona dinámicamente entornos de entrenamiento independientes.

- **Backend Unificado (Go)**: Motor de alto rendimiento que resuelve rutas específicas de cursos y provisiona espacios de trabajo. 🏗️
- **Verificación Dinámica (Checkers)**: Los scripts de validación (`test.sh`) se mapean dinámicamente desde la carpeta del curso al workspace del estudiante. 🎯
- **Diseño 100% Portátil**: Todo el sistema se controla mediante variables de entorno. Sin rutas absolutas "hardcodeadas". 🛰️🚀
- **Consolidación de Laboratorios**: Todos los materiales están centralizados en `/labs/cnu_{course_id}`.

---

## 🚀 Guía de Inicio Rápido (30 Segundos)

Sigue estos pasos para levantar tu propia universidad Cloud Native localmente.

### 1. Requisitos Previos
Asegúrate de tener instalados:
- **Docker** (V24+)
- **Docker Compose** (V2.20+)

### 2. Clonar y Preparar Entorno
```bash
# 1. Clonar el repositorio
git clone https://github.com/Cloud-Native-University/CloudMasterOS.git
cd CloudMasterOS

# 2. Crear tu archivo de configuración
cp .env.sample .env
```

### 3. Configuraciones Vitales (El Corazón del Sistema) 🚨
Abre tu archivo `.env` recién creado y ajusta estas variables. **Es obligatorio que uses rutas ABSOLUTAS** de tu sistema host para que Docker pueda montar los volúmenes correctamente.

```bash
# === Identidad del Estudiante (Aparece en los certificados/UI) ===
STUDENT_NAME=TuNombreEstudiante
STUDENT_EMAIL=tu_correo@universidad.com
STUDENT_KEY=CNU-2026

# === Seguridad y Base de Datos ===
ADMIN_PASSWORD=cambia_este_password
DB_USER=admin
DB_PASSWORD=cloudmaster
DB_NAME=cloudmaster

# === Rutas de Laboratorios (VITAL PARA DOCKER VOLUMES) ===
# Ejemplo en macOS:
LAB_CONTENT_PATH=/Users/<tu_usuario>/Projects/CloudMasterOS/labs
LAB_HOST_PATH=/Users/<tu_usuario>/Projects/CloudMasterOS/labs

# Ejemplo en Linux:
LAB_CONTENT_PATH=/home/<tu_usuario>/CloudMasterOS/labs
LAB_HOST_PATH=/home/<tu_usuario>/CloudMasterOS/labs

# Ejemplo en Windows (WSL2):
LAB_CONTENT_PATH=/home/<tu_usuario>/CloudMasterOS/labs
LAB_HOST_PATH=/home/<tu_usuario>/CloudMasterOS/labs
```


### 4. Lanzamiento Maestro 🚀
Ejecuta el comando de construcción y despliegue:

```bash
docker compose up -d --build
```

---

## 🌐 Acceso a la Plataforma

Una vez que los contenedores estén corriendo, podrás acceder a través de:

- **Panel de Estudiante (Web)**: `http://localhost:5173` 🖥️
- **API del Orquestador**: `http://localhost:8081` 🏗️
- **Base de Datos (PostgreSQL)**: Puerto `5432` 🐘

---

## 📂 ¿Cómo agregar nuevos Laboratorios?

Expandir la universidad es tan sencillo como crear una carpeta en `/labs/` siguiendo este estándar:

```text
/labs/cnu_kubernetes/
├── guia.json           # Guía interactiva (JSON con 20+ tareas) 📄
├── project/            # Archivos reales que el alumno editará 📂
├── checkers/           # Scripts de validación (test.sh) para cada tarea 🎯
└── docker-compose.yml  # Aislamiento para el entorno del estudiante 🐳
```

### 🧪 Sistema de Verificación (Checkers)
Para que una tarea se valide, el script debe estar en:
`/labs/<curso>/checkers/<id_tarea>-<nombre>/test.sh`

El orquestador lo encontrará, lo montará en el contenedor del estudiante y lo ejecutará automáticamente al presionar "Check".

---

## 🏆 Laboratorios Completados y Disponibles (100% Ready)

El sistema cuenta con los siguientes laboratorios exhaustivos de 20 fases integrados y listos para ser ejecutados desde la Interfaz Web interactiva:

### Fundamentales e Ingeniería Base
- 🐧 **Linux Kernel & CLI** (`cnu_linux`): Navegación profunda en kernel, tuberías avanzadas, gestión cron/systemd y control absoluto de permisos (SysAdmin Level).
- 🐹 **Golang Concurrency** (`cnu_golang`): Masterclass de programación. Desde Punteros hasta Goroutines, manejo mutek y Channels. Integra un entorno real con `gopls` y `dlv`.
- 🐍 **Python Data & Backend** (`cnu_python`): Desde List Comprehensions, Decoradores y Contexts, hasta despliegue de Microservicios en Flask y análisis numérico con Pandas. Incorpora Autocompletado `ms-python` y Pytest.

### Operaciones Locales y Rootless
- 🐳 **Docker Fundamentals** (`cnu_docker`): Gestión esencial del motor, empaquetado y control de ciclo de vida básico.
- 🦭 **Podman Rootless** (`cnu_podman`): Reemplazo avanzado de Docker. Escalada de privilegios evadida, contenedores sin root user, módulos Systemd transitorios y exportación a Pods YAML Kube.

### Advanced Docker & Orquestación
- 🚢 **Docker Compose** (`cnu_docker_compose`): Orquestación multi-contenedor nativa en Localhost, dependencias de startup y healthchecks.
- 🌐 **Docker Networking** (`cnu_docker_networking`): Ruteo pesado. Segmentación de capas DB/App, Túneles VXLAN, Ingress Mesh Swarm, DNS falso y simulación TC de Packet Loss.
- 🛡️ **Docker Sandbox** (`cnu_docker_sandbox`): Operaciones quirúrgicas en Cgroups. ReadOnly FileSystems, Cap_Drops al límite, Privileged Escalation testing y User Namespace mappings.
- 🌩️ **Docker Offload** (`cnu_docker_offload`): Infraestructura Cloud moderna. VDI Optimizations, Caché de Memoria Remota y GPU Offload transparente.
- 🧠 **Docker Models** (`cnu_docker_models`): Empaquetando Inteligencia Artificial (MLOps). Serving en FastAPI, serialización binaria y Multi-Stage para arquitecturas HuggingFace sin colapso.
- 🤖 **Docker MCP (AI Agents)** (`cnu_docker_mcp`): Despliegue del protocolo estandarizado de IA. Bridging de Tool-Calling autónomo bajo ambientes herméticos Dockerizados.

### Graduación Cloud Native
- ☸️ **Kubernetes (K3S)** (`cnu_kubernetes`): Adéntrate en el control master. Levantar Despliegues, ConfigMaps, Ingress Controllers y escalado Horizontal.

---

**Construido con ❤️ para la comunidad por [CloudNative.University](https://cloudnative.university).** 🎯🛰️🚀🏆
