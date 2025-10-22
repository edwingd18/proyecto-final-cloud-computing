# Sistema de Gestión de Activos y Mantenimientos

Sistema de gestión de activos y mantenimientos basado en arquitectura de microservicios con Node.js, PostgreSQL, MongoDB, Next.js y Docker.

## Arquitectura del Proyecto

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (Next.js)                     │
│                    Puerto: 3003                             │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    API Gateway (Express)                    │
│                    Puerto: 3000                             │
└──────────────┬─────────────────────────┬────────────────────┘
               │                         │
               ▼                         ▼
┌──────────────────────────┐  ┌──────────────────────────┐
│  Servicio de Activos     │  │ Servicio Mantenimientos  │
│  (Express + PostgreSQL)  │  │  (Express + MongoDB)     │
│  Puerto: 3001            │  │  Puerto: 3002            │
└──────────┬───────────────┘  └───────────┬──────────────┘
           │                              │
           ▼                              ▼
┌──────────────────────┐      ┌──────────────────────┐
│   PostgreSQL 15      │      │      MongoDB 7       │
│   Puerto: 5432       │      │   Puerto: 27017      │
└──────────────────────┘      └──────────────────────┘
```

## Componentes

### 1. **Servicio de Activos** (Node.js + Express + PostgreSQL)
- Gestión de activos de la empresa
- Base de datos relacional PostgreSQL
- API RESTful con validaciones
- Modelo: ID, nombre, descripción, número de serie, categoría, fecha de adquisición, costo, ubicación, estado

### 2. **Servicio de Mantenimientos** (Node.js + Express + MongoDB)
- Gestión de mantenimientos y reparaciones
- Base de datos NoSQL MongoDB con modelos flexibles
- Subdocumentos: técnico, piezas, notas, historial
- Arrays dinámicos para aprovechar características de MongoDB

### 3. **API Gateway** (Express)
- Punto de entrada único para el frontend
- Enrutamiento a microservicios
- Rate limiting
- Manejo centralizado de CORS

### 4. **Frontend** (Next.js + Chakra UI)
- Interfaz moderna con Next.js 14 (App Router)
- Componentes de Chakra UI
- Dashboard con estadísticas
- CRUD completo para activos y mantenimientos
- Diseño responsivo

## Stack Tecnológico

### Backend
- **Node.js 20 LTS**
- **Express.js** - Framework web
- **PostgreSQL 15** - Base de datos relacional
- **MongoDB 7** - Base de datos NoSQL
- **Sequelize** - ORM para PostgreSQL
- **Mongoose** - ODM para MongoDB

### Frontend
- **Next.js 14** - Framework de React
- **Chakra UI v2** - Librería de componentes
- **Axios** - Cliente HTTP
- **React Hook Form** - Manejo de formularios

### DevOps
- **Docker** - Contenedores
- **Docker Compose** - Orquestación
- **Jenkins** - CI/CD (para implementar después)

### Testing
- **Jest** - Framework de testing
- **Supertest** - Testing de APIs
- **MongoDB Memory Server** - MongoDB en memoria para tests

## Requisitos Previos

- Node.js 20+
- Docker y Docker Compose
- Git
- Make (opcional, para usar Makefile)

## Instalación y Configuración

### 1. Clonar el Repositorio

```bash
git clone <url-del-repositorio>
cd proyecto-final-jenkins
```

### 2. Opción A: Con Docker (Recomendado)

#### Usando Docker Compose

```bash
# Construir las imágenes
docker-compose build

# Iniciar todos los servicios
docker-compose up -d

# Ver logs
docker-compose logs -f
```

#### Usando Makefile

```bash
# Ver todos los comandos disponibles
make help

# Construir e iniciar servicios
make build
make up

# Ver logs
make logs

# Detener servicios
make down
```

### 3. Opción B: Desarrollo Local

#### Instalar Dependencias

```bash
# Servicio de Activos
cd servicio-activos
npm install

# Servicio de Mantenimientos
cd ../servicio-mantenimientos
npm install

# API Gateway
cd ../api-gateway
npm install

# Frontend
cd ../frontend
npm install
```

#### Iniciar Bases de Datos con Docker

```bash
# PostgreSQL
docker run -d \
  --name postgres-activos \
  -e POSTGRES_DB=activos_db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres123 \
  -p 5432:5432 \
  postgres:15-alpine

# MongoDB
docker run -d \
  --name mongodb-mantenimientos \
  -p 27017:27017 \
  mongo:7
```

#### Iniciar Servicios en Modo Desarrollo

```bash
# Terminal 1 - Servicio de Activos
cd servicio-activos
npm run dev

# Terminal 2 - Servicio de Mantenimientos
cd servicio-mantenimientos
npm run dev

# Terminal 3 - API Gateway
cd api-gateway
npm run dev

# Terminal 4 - Frontend
cd frontend
npm run dev
```

## Acceso a los Servicios

Una vez iniciados los servicios, puedes acceder a:

- **Frontend**: http://localhost:3003
- **API Gateway**: http://localhost:3000
- **Servicio de Activos**: http://localhost:3001
- **Servicio de Mantenimientos**: http://localhost:3002
- **PostgreSQL**: localhost:5432
- **MongoDB**: localhost:27017

## Endpoints de la API

### Servicio de Activos (vía Gateway: `/api/activos`)

```
GET    /api/activos                 - Listar activos (con paginación y filtros)
GET    /api/activos/:id             - Obtener activo por ID
GET    /api/activos/search?q=       - Buscar activos
GET    /api/activos/estadisticas    - Obtener estadísticas
POST   /api/activos                 - Crear activo
PUT    /api/activos/:id             - Actualizar activo
DELETE /api/activos/:id             - Eliminar activo
```

### Servicio de Mantenimientos (vía Gateway: `/api/mantenimientos`)

```
GET    /api/mantenimientos                    - Listar mantenimientos
GET    /api/mantenimientos/:id                - Obtener mantenimiento por ID
GET    /api/mantenimientos/activo/:activoId   - Mantenimientos de un activo
GET    /api/mantenimientos/estadisticas       - Obtener estadísticas
POST   /api/mantenimientos                    - Crear mantenimiento
PUT    /api/mantenimientos/:id                - Actualizar mantenimiento
PATCH  /api/mantenimientos/:id/estado         - Cambiar estado
POST   /api/mantenimientos/:id/notas          - Agregar nota
DELETE /api/mantenimientos/:id                - Eliminar mantenimiento
```

### Health Checks

```
GET /health - Estado del servicio individual
GET /health/all - Estado de todos los servicios (solo en Gateway)
```

## Ejecutar Tests

### Con Docker

```bash
# Tests del servicio de activos
docker-compose exec servicio-activos npm test

# Tests del servicio de mantenimientos
docker-compose exec servicio-mantenimientos npm test
```

### Localmente

```bash
# Servicio de Activos
cd servicio-activos
npm test

# Servicio de Mantenimientos
cd servicio-mantenimientos
npm test
```

### Con Makefile

```bash
make test           # Ejecutar todos los tests
make test-activos   # Solo servicio de activos
make test-mantenimientos  # Solo servicio de mantenimientos
```

## Estructura del Proyecto

```
proyecto-final-jenkins/
├── servicio-activos/
│   ├── src/
│   │   ├── config/          # Configuración de DB
│   │   ├── models/          # Modelos Sequelize
│   │   ├── controllers/     # Controladores
│   │   ├── routes/          # Rutas Express
│   │   └── index.js         # Entrada principal
│   ├── tests/               # Tests
│   ├── Dockerfile
│   └── package.json
│
├── servicio-mantenimientos/
│   ├── src/
│   │   ├── config/          # Configuración MongoDB
│   │   ├── models/          # Schemas Mongoose
│   │   ├── controllers/     # Controladores
│   │   ├── routes/          # Rutas Express
│   │   └── index.js         # Entrada principal
│   ├── tests/               # Tests
│   ├── Dockerfile
│   └── package.json
│
├── api-gateway/
│   ├── src/
│   │   └── index.js         # Gateway con proxies
│   ├── Dockerfile
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── app/             # Páginas (App Router)
│   │   ├── components/      # Componentes React
│   │   └── services/        # Servicios API
│   ├── Dockerfile
│   └── package.json
│
├── docker-compose.yml       # Orquestación
├── Makefile                 # Comandos útiles
├── .gitignore
└── README.md
```

## Comandos Útiles con Docker Compose

```bash
# Iniciar servicios
docker-compose up -d

# Ver logs
docker-compose logs -f

# Logs de un servicio específico
docker-compose logs -f servicio-activos

# Ver estado
docker-compose ps

# Detener servicios
docker-compose down

# Detener y eliminar volúmenes
docker-compose down -v

# Reconstruir imágenes
docker-compose build --no-cache

# Reiniciar un servicio específico
docker-compose restart servicio-activos

# Acceder a shell de un contenedor
docker-compose exec servicio-activos sh

# Acceder a PostgreSQL
docker-compose exec postgres psql -U postgres -d activos_db

# Acceder a MongoDB
docker-compose exec mongodb mongosh mantenimientos_db
```

## Variables de Entorno

### Servicio de Activos
```env
PORT=3001
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=activos_db
DB_USER=postgres
DB_PASSWORD=postgres123
```

### Servicio de Mantenimientos
```env
PORT=3002
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/mantenimientos_db
```

### API Gateway
```env
PORT=3000
NODE_ENV=development
ACTIVOS_SERVICE_URL=http://localhost:3001
MANTENIMIENTOS_SERVICE_URL=http://localhost:3002
```

### Frontend
```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

## Próximos Pasos - Jenkins CI/CD

Para implementar Jenkins (cuando lo solicites), se creará:

1. **Jenkinsfile** con pipeline declarativo
2. **Stages**: Checkout → Install → Test → Build → Deploy
3. Integración con Docker
4. Notificaciones de build

## Solución de Problemas

### Error de conexión a PostgreSQL

```bash
# Verificar que PostgreSQL esté corriendo
docker-compose ps

# Ver logs de PostgreSQL
docker-compose logs postgres

# Reiniciar PostgreSQL
docker-compose restart postgres
```

### Error de conexión a MongoDB

```bash
# Verificar que MongoDB esté corriendo
docker-compose ps

# Ver logs de MongoDB
docker-compose logs mongodb

# Reiniciar MongoDB
docker-compose restart mongodb
```

### Frontend no se conecta al API Gateway

Verificar que `NEXT_PUBLIC_API_URL` esté configurado correctamente:

```bash
# En desarrollo local
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# En Docker
NEXT_PUBLIC_API_URL=http://api-gateway:3000/api
```

### Limpiar y Reiniciar Todo

```bash
# Detener todo
docker-compose down -v

# Limpiar sistema Docker
docker system prune -af

# Reconstruir e iniciar
docker-compose build --no-cache
docker-compose up -d
```

## Contribuciones

Este proyecto fue desarrollado como parcial académico para demostrar arquitectura de microservicios.

## Licencia

ISC

## Autor

Proyecto desarrollado para el parcial de arquitectura de microservicios.
