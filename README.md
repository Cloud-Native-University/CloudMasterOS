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

## 💎 Módulos de la Comunidad (En Desarrollo):
- **cnu_docker**: Contenerización esencial.
- **cnu_podman**: Seguridad rootless.
- **cnu_linux**: Guía de supervivencia SysAdmin.
- **cnu_openshift**: Orquestación empresarial.

---

**Construido con ❤️ para la comunidad por [CloudNative.University](https://cloudnative.university).** 🎯🛰️🚀🏆
