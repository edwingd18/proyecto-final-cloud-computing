# 🏢 Sistema de Gestión de Activos y Mantenimientos

Sistema de microservicios para la gestión integral de activos empresariales y sus mantenimientos, construido con arquitectura de microservicios, API Gateway y despliegue en Railway.

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Arquitectura](#-arquitectura)
- [Tecnologías](#-tecnologías)
- [Requisitos Previos](#-requisitos-previos)
- [Instalación y Configuración](#-instalación-y-configuración)
- [Uso en Local](#-uso-en-local)
- [Despliegue en Producción](#-despliegue-en-producción)
- [CI/CD con Jenkins](#-cicd-con-jenkins)
- [API Endpoints](#-api-endpoints)
- [Testing](#-testing)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Troubleshooting](#-troubleshooting)

---

## ✨ Características

### Gestión de Activos

- ✅ CRUD completo de activos empresariales
- 🔍 Búsqueda y filtrado avanzado
- 📊 Estadísticas y reportes
- 🏷️ Categorización (electrónico, maquinaria, vehículo, mobiliario, etc.)
- 📍 Seguimiento de ubicación y estado

### Gestión de Mantenimientos

- 🔧 Registro de mantenimientos (preventivo, correctivo, predictivo, emergencia)
- 👨‍🔧 Asignación de técnicos
- 💰 Control de costos y piezas
- 📝 Notas y historial de cambios
- ⚡ Priorización (baja, media, alta, crítica)
- 📅 Programación y seguimiento

### Características Técnicas

- 🚀 Arquitectura de microservicios
- 🔄 API Gateway centralizado
- 🐳 Dockerizado completamente
- ⚙️ CI/CD con Jenkins
- ☁️ Desplegado etizados
- 📱 Frontend responsive con Next.js

---

## 🏗️ Arquitectura

```
┌─────────────┐
│   Frontend  │ (Next.js)
│  Port 3003  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ API Gateway │ (Express)
│  Port 3000  │
└──────┬──────┘
       │
       ├──────────────┬──────────────┐
       ▼              ▼              ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│  Servicio   │ │  Servicio   │ │   Otros     │
│   Activos   │ │Mantenimientos│ │  Servicios  │
│  Port 3001  │ │  Port 3002  │ │             │
└──────┬──────┘ └──────┬──────┘ └─────────────┘
       │              │
       ▼              ▼
┌─────────────┐ ┌─────────────┐
│ PostgreSQL  │ │   MongoDB   │
│  Port 5432  │ │  Port 27017 │
└─────────────┘ └─────────────┘
```

### Componentes

1. **Frontend (Next.js)**: Interfaz de usuario responsive
2. **API Gateway**: Punto de entrada único, enrutamiento y proxy
3. **Servicio de Activos**: Gestión de activos con PostgreSQL
4. **Servicio de Mantenimientos**: Gestión de mantenimientos con MongoDB
5. **Bases de Datos**: PostgreSQL para activos, MongoDB para mantenimientos

---

## 🛠️ Tecnologías

### Backend

- **Node.js** v18+
- **Express.js** - Framework web
- **PostgreSQL** - Base de datos relacional (Activos)
- **MongoDB** - Base de datos NoSQL (Mantenimientos)
- **Sequelize** - ORM para PostgreSQL
- **Mongoose** - ODM para MongoDB

### Frontend

- **Next.js** 14
- **React** 18
- **Axios** - Cliente HTTP
- **Tailwind CSS** - Estilos

### DevOps & CI/CD

- **Docker** & **Docker Compose** - Contenedorización
- **Jenkins** - CI/CD Pipeline automatizado
- **Railway** - Plataforma de despliegue cloud
- **Jest** - Testing framework
- **Supertest** - Testing de APIs REST
- **GitHub Webhooks** - Integración continua

---

## 📦 Requisitos Previos

### Para desarrollo local:

- **Node.js** v18 o superior
- **Docker** y **Docker Compose**
- **Git**
- **npm** o **yarn**

### Para despliegue en Railway:

- Cuenta en [Railway](https://railway.app)
- Git configurado
- Repositorio en GitHub/GitLab

---

## 🚀 Instalación y Configuración

### 1. Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd proyecto-fina-cloud-computing
```

### 2. Instalar dependencias

```bash
# Instalar dependencias de todos los servicios
npm install --prefix api-gateway
npm install --prefix servicio-activos
npm install --prefix servicio-mantenimientos
npm install --prefix frontend
```

### 3. Configurar variables de entorno

#### API Gateway (`.env`)

```env
PORT=3000
NODE_ENV=development
ACTIVOS_SERVICE_URL=http://localhost:3001
MANTENIMIENTOS_SERVICE_URL=http://localhost:3002
```

#### Servicio de Activos (`.env`)

```env
PORT=3001
NODE_ENV=development
DATABASE_URL=postgresql://postgres:postgres123@postgres:5432/activos_db
```

#### Servicio de Mantenimientos (`.env`)

```env
PORT=3002
NODE_ENV=development
MONGO_URI=mongodb://mongodb:27017/mantenimientos_db
```

#### Frontend (`.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

---

## 💻 Uso en Local

### Opción 1: Con Docker Compose (Recomendado)

```bash
# Levantar todos los servicios
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener servicios
docker-compose down

# Reconstruir servicios
docker-compose up -d --build
```

**URLs locales:**

- Frontend: http://localhost:3003
- API Gateway: http://localhost:3000
- Servicio Activos: http://localhost:3001
- Servicio Mantenimientos: http://localhost:3002

### Opción 2: Sin Docker (Manual)

```bash
# Terminal 1 - PostgreSQL (necesitas tenerlo instalado)
# Crear base de datos: activos_db

# Terminal 2 - MongoDB (necesitas tenerlo instalado)
mongod

# Terminal 3 - API Gateway
cd api-gateway
npm run dev

# Terminal 4 - Servicio Activos
cd servicio-activos
npm run dev

# Terminal 5 - Servicio Mantenimientos
cd servicio-mantenimientos
npm run dev

# Terminal 6 - Frontend
cd frontend
npm run dev
```

---

## ☁️ Despliegue en Producción (Railway)

### 1. Preparar el proyecto

Asegúrate de que todos los cambios estén en Git:

```bash
git add .
git commit -m "Preparar para despliegue"
git push
```

### 2. Crear proyecto en Railway

1. Ve a [Railway](https://railway.app)
2. Crea un nuevo proyecto
3. Conecta tu repositorio de GitHub

### 3. Crear servicios

Crea los siguientes servicios en Railway:

#### A. Base de Datos PostgreSQL

- Agregar servicio → PostgreSQL
- Nombre: `postgres-production`
- Copiar la `DATABASE_URL` generada

#### B. Base de Datos MongoDB

- Agregar servicio → MongoDB
- Nombre: `mongodb-production`
- Copiar la `MONGO_URI` generada

#### C. Servicio de Activos

- Agregar servicio → GitHub Repo
- Root Directory: `servicio-activos`
- Variables de entorno:
  ```
  NODE_ENV=production
  PORT=3001
  DATABASE_URL=<url-de-postgres>
  ```

#### D. Servicio de Mantenimientos

- Agregar servicio → GitHub Repo
- Root Directory: `servicio-mantenimientos`
- Variables de entorno:
  ```
  NODE_ENV=production
  PORT=3002
  MONGO_URI=<url-de-mongodb>
  ```

#### E. API Gateway

- Agregar servicio → GitHub Repo
- Root Directory: `api-gateway`
- Variables de entorno:
  ```
  NODE_ENV=production
  PORT=3000
  ACTIVOS_SERVICE_URL=https://servicio-activos-production.up.railway.app
  MANTENIMIENTOS_SERVICE_URL=https://servicio-mantenimientos-production.up.railway.app
  ```

#### F. Frontend

- Agregar servicio → GitHub Repo
- Root Directory: `frontend`
- Variables de entorno:
  ```
  NODE_ENV=production
  NEXT_PUBLIC_API_URL=https://api-gateway-production-xxxx.up.railway.app/api
  ```

### 4. Configurar dominios públicos

En cada servicio, ve a Settings → Networking → Generate Domain

### 5. Actualizar URLs

Actualiza las variables de entorno con las URLs públicas generadas.

---

## � CI/CD dcon Jenkins

Este proyecto incluye integración continua y despliegue continuo (CI/CD) usando Jenkins.

### Configuración de Jenkins

#### 1. Levantar Jenkins con Docker

```bash
# Opción 1: Usar docker-compose (incluye Jenkins)
docker-compose up -d jenkins

# Opción 2: Levantar Jenkins standalone
docker build -f jenkins.Dockerfile -t jenkins-custom .
docker run -d -p 8080:8080 -p 50000:50000 \
  -v jenkins_home:/var/jenkins_home \
  -v /var/run/docker.sock:/var/run/docker.sock \
  --name jenkins jenkins-custom
```

#### 2. Acceder a Jenkins

1. Abrir http://localhost:8080
2. Obtener la contraseña inicial:
   ```bash
   docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword
   ```
3. Instalar plugins recomendados
4. Crear usuario administrador

#### 3. Configurar Pipeline

1. **Crear nuevo Job:**

   - New Item → Pipeline
   - Nombre: `proyecto-activos-pipeline`

2. **Configurar SCM:**

   - Pipeline → Definition: Pipeline script from SCM
   - SCM: Git
   - Repository URL: `<tu-repositorio>`
   - Branch: `*/main`
   - Script Path: `Jenkinsfile`

3. **Configurar Webhooks (opcional):**
   - En GitHub: Settings → Webhooks → Add webhook
   - Payload URL: `http://tu-jenkins:8080/github-webhook/`
   - Content type: `application/json`
   - Events: Push events

### Pipeline Stages

El `Jenkinsfile` incluye las siguientes etapas:

```
┌─────────────────────────────────────────────────────────┐
│                    Jenkins Pipeline                      │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  1. 📥 Checkout                                         │
│     └─ Clonar código del repositorio                   │
│                                                          │
│  2. 🔍 Verificar Cambios                               │
│     └─ Detectar qué servicios cambiaron                │
│                                                          │
│  3. 🧪 Tests                                            │
│     ├─ Test Servicio Activos                           │
│     └─ Test Servicio Mantenimientos                    │
│                                                          │
│  4. 🐳 Build Docker Images                             │
│     ├─ Build API Gateway                               │
│     ├─ Build Servicio Activos                          │
│     ├─ Build Servicio Mantenimientos                   │
│     └─ Build Frontend                                   │
│                                                          │
│  5. 🚀 Deploy                                           │
│     └─ Desplegar servicios modificados                 │
│                                                          │
│  6. ✅ Verificación                                     │
│     └─ Health checks de servicios                      │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Características del Pipeline

- ✅ **Tests automáticos** antes de cada deploy
- ✅ **Build condicional** - solo construye servicios modificados
- ✅ **Despliegue automático** a Railway
- ✅ **Health checks** post-despliegue
- ✅ **Notificaciones** de estado del build
- ✅ **Rollback automático** en caso de fallo

### Variables de Entorno en Jenkins

Configurar en Jenkins → Manage Jenkins → Configure System → Global properties:

```
RAILWAY_TOKEN=<tu-token-de-railway>
DOCKER_REGISTRY=<tu-registry> (opcional)
SLACK_WEBHOOK=<webhook-para-notificaciones> (opcional)
```

### Comandos Útiles

```bash
# Ver logs de Jenkins
docker logs -f jenkins

# Reiniciar Jenkins
docker restart jenkins

# Backup de Jenkins
docker exec jenkins tar -czf /tmp/jenkins-backup.tar.gz /var/jenkins_home
docker cp jenkins:/tmp/jenkins-backup.tar.gz ./jenkins-backup.tar.gz

# Restaurar Jenkins
docker cp ./jenkins-backup.tar.gz jenkins:/tmp/
docker exec jenkins tar -xzf /tmp/jenkins-backup.tar.gz -C /
```

### Flujo de Trabajo CI/CD

```
Developer → Git Push → GitHub
                         ↓
                    Webhook
                         ↓
                     Jenkins
                         ↓
                  ┌──────┴──────┐
                  ↓             ↓
              Run Tests    Build Images
                  ↓             ↓
                  └──────┬──────┘
                         ↓
                    Deploy to Railway
                         ↓
                   Health Checks
                         ↓
                  ✅ Success / ❌ Rollback
```

### Notas sobre Jenkins

- El archivo `Jenkinsfile` en la raíz del proyecto contiene la configuración completa del pipeline
- Jenkins se ejecuta en el puerto 8080 por defecto
- Los builds se ejecutan automáticamente al hacer push si los webhooks están configurados
- Puedes ejecutar builds manualmente desde la interfaz de Jenkins

---

## 📡 API Endpoints

### Activos

| Método | Endpoint                      | Descripción              |
| ------ | ----------------------------- | ------------------------ |
| GET    | `/api/activos/lista`          | Listar todos los activos |
| GET    | `/api/activos/ver/:id`        | Obtener un activo por ID |
| GET    | `/api/activos/buscar?q=`      | Buscar activos           |
| GET    | `/api/activos/stats`          | Estadísticas de activos  |
| POST   | `/api/activos/crear`          | Crear nuevo activo       |
| PUT    | `/api/activos/actualizar/:id` | Actualizar activo        |
| DELETE | `/api/activos/eliminar/:id`   | Eliminar activo          |

### Mantenimientos

| Método | Endpoint                                 | Descripción                     |
| ------ | ---------------------------------------- | ------------------------------- |
| GET    | `/api/mantenimientos/lista`              | Listar todos los mantenimientos |
| GET    | `/api/mantenimientos/ver/:id`            | Obtener un mantenimiento        |
| GET    | `/api/mantenimientos/por-activo/:id`     | Mantenimientos por activo       |
| GET    | `/api/mantenimientos/stats`              | Estadísticas                    |
| POST   | `/api/mantenimientos/crear`              | Crear mantenimiento             |
| PUT    | `/api/mantenimientos/actualizar/:id`     | Actualizar mantenimiento        |
| PATCH  | `/api/mantenimientos/cambiar-estado/:id` | Cambiar estado                  |
| POST   | `/api/mantenimientos/agregar-nota/:id`   | Agregar nota                    |
| DELETE | `/api/mantenimientos/eliminar/:id`       | Eliminar mantenimiento          |

**Nota:** Todos los endpoints requieren el prefijo `/api` cuando se accede a través del API Gateway.

---

## 🧪 Testing

### Ejecutar tests

```bash
# Tests del servicio de activos
cd servicio-activos
npm test

# Tests del servicio de mantenimientos
cd servicio-mantenimientos
npm test

# Con Docker
docker-compose run servicio-activos npm test
docker-compose run servicio-mantenimientos npm test
```

### Coverage

```bash
npm test -- --coverage
```

---

## 📁 Estructura del Proyecto

```
proyecto-fina-cloud-computing/
├── api-gateway/                 # API Gateway
│   ├── src/
│   │   └── index.js            # Configuración del gateway
│   ├── Dockerfile
│   └── package.json
│
├── servicio-activos/           # Microservicio de Activos
│   ├── src/
│   │   ├── config/            # Configuración DB
│   │   ├── controllers/       # Controladores
│   │   ├── models/            # Modelos Sequelize
│   │   ├── routes/            # Rutas
│   │   └── index.js
│   ├── tests/                 # Tests
│   ├── Dockerfile
│   └── package.json
│
├── servicio-mantenimientos/   # Microservicio de Mantenimientos
│   ├── src/
│   │   ├── config/            # Configuración DB
│   │   ├── controllers/       # Controladores
│   │   ├── models/            # Modelos Mongoose
│   │   ├── routes/            # Rutas
│   │   └── index.js
│   ├── tests/                 # Tests
│   ├── Dockerfile
│   └── package.json
│
├── frontend/                   # Frontend Next.js
│   ├── src/
│   │   ├── app/               # App Router
│   │   ├── components/        # Componentes React
│   │   └── services/          # Servicios API
│   ├── Dockerfile
│   └── package.json
│
├── postgres-init/              # Scripts de inicialización PostgreSQL
├── docker-compose.yml          # Orquestación local
├── railway.toml               # Configuración Railway
├── API_ENDPOINTS.md           # Documentación de API
└── README.md                  # Este archivo
```

---

## 🔧 Troubleshooting

### Problema: Error de conexión a base de datos en local

**Solución:**

```bash
# Verificar que los contenedores estén corriendo
docker-compose ps

# Reiniciar servicios
docker-compose restart postgres mongodb
```

### Problema: Puerto ya en uso

**Solución:**

```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3000 | xargs kill -9
```

### Problema: Error 301 en producción

**Solución:**

- Verificar que las URLs en Railway usen HTTPS
- Verificar variables de entorno en Railway
- Forzar redespliegue del servicio

### Problema: Tests fallan

**Solución:**

```bash
# Limpiar node_modules y reinstalar
rm -rf node_modules package-lock.json
npm install

# Verificar que las bases de datos de test estén disponibles
docker-compose up -d postgres mongodb
```

### Problema: Frontend no se conecta al backend

**Solución:**

- Verificar `NEXT_PUBLIC_API_URL` en `.env.local`
- Verificar que el API Gateway esté corriendo
- Revisar CORS en el API Gateway
- Limpiar cache del navegador (Ctrl+Shift+R)

---

## 📝 Notas Adicionales

### Desarrollo

- Los cambios en el código se reflejan automáticamente con hot-reload
- Los logs se pueden ver con `docker-compose logs -f <servicio>`
- Para debugging, usa `console.log` o herramientas como Postman

### Producción

- Railway redespliegue automáticamente al hacer push a la rama principal
- Los logs están disponibles en el dashboard de Railway
- Las bases de datos en Railway tienen backups automáticos

### Seguridad

- Nunca commitear archivos `.env` con credenciales reales
- Usar variables de entorno para configuración sensible
- Implementar autenticación JWT (próxima feature)

---

## 👥 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 📄 Licencia

Este proyecto es parte de un trabajo académico de Cloud Computing.

---

## 📞 Soporte

Para problemas o preguntas:

- Abrir un issue en GitHub
- Revisar la sección de API Endpoints en este README
- Consultar los logs de Railway o Docker
- Revisar la sección de Troubleshooting

---

**¡Gracias por usar el Sistema de Gestión de Activos y Mantenimientos!** 🚀
