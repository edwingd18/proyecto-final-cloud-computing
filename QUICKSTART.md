# Guía de Inicio Rápido

## Opción 1: Probar con Docker (Más Fácil y Recomendado)

### Prerrequisitos
- Docker Desktop instalado y corriendo
- Docker Compose instalado (viene con Docker Desktop)

### Pasos

1. **Abrir terminal en el directorio del proyecto**
```bash
cd "c:\Users\USER\Desarrollos\proyecto-final jenkins"
```

2. **Construir las imágenes Docker**
```bash
docker-compose build
```
Esto tomará varios minutos la primera vez.

3. **Iniciar todos los servicios**
```bash
docker-compose up -d
```

4. **Verificar que los servicios estén corriendo**
```bash
docker-compose ps
```

Deberías ver todos los servicios en estado "Up":
- postgres
- mongodb
- servicio-activos
- servicio-mantenimientos
- api-gateway
- frontend

5. **Ver los logs (opcional)**
```bash
# Ver logs de todos los servicios
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f servicio-activos
docker-compose logs -f servicio-mantenimientos
docker-compose logs -f api-gateway
docker-compose logs -f frontend
```

6. **Abrir el navegador**

Espera 1-2 minutos para que todos los servicios inicien completamente, luego abre:

- **Frontend (Aplicación Web)**: http://localhost:3003
- **API Gateway (Documentación)**: http://localhost:3000
- **Servicio Activos**: http://localhost:3001/health
- **Servicio Mantenimientos**: http://localhost:3002/health

7. **Usar la aplicación**

En http://localhost:3003 verás:
- Dashboard con estadísticas
- Sección de Activos (crear, ver, editar, eliminar)
- Sección de Mantenimientos (crear, ver, editar, eliminar)

8. **Detener los servicios**
```bash
docker-compose down
```

9. **Detener y limpiar todo (incluyendo datos)**
```bash
docker-compose down -v
```

---

## Opción 2: Probar en Desarrollo Local (Sin Docker)

### Prerrequisitos
- Node.js 20+ instalado
- PostgreSQL 15 instalado y corriendo
- MongoDB 7 instalado y corriendo

### Pasos

1. **Crear bases de datos**

PostgreSQL:
```bash
# Conectar a PostgreSQL
psql -U postgres

# Crear la base de datos
CREATE DATABASE activos_db;
\q
```

MongoDB (se crea automáticamente al conectarse)

2. **Instalar dependencias de cada servicio**

Terminal 1 - Servicio de Activos:
```bash
cd servicio-activos
npm install
```

Terminal 2 - Servicio de Mantenimientos:
```bash
cd servicio-mantenimientos
npm install
```

Terminal 3 - API Gateway:
```bash
cd api-gateway
npm install
```

Terminal 4 - Frontend:
```bash
cd frontend
npm install
```

3. **Iniciar servicios en orden**

Terminal 1:
```bash
cd servicio-activos
npm run dev
```
Espera a ver: "✅ Conexión a PostgreSQL establecida"

Terminal 2:
```bash
cd servicio-mantenimientos
npm run dev
```
Espera a ver: "✅ Conexión a MongoDB establecida"

Terminal 3:
```bash
cd api-gateway
npm run dev
```
Espera a ver: "🚀 API Gateway corriendo en puerto 3000"

Terminal 4:
```bash
cd frontend
npm run dev
```
Espera a ver: "ready - started server on 0.0.0.0:3003"

4. **Abrir navegador**

- Frontend: http://localhost:3003
- API Gateway: http://localhost:3000

---

## Probar los Endpoints con Postman/cURL

### Health Checks

```bash
# API Gateway
curl http://localhost:3000/health

# Servicio Activos
curl http://localhost:3001/health

# Servicio Mantenimientos
curl http://localhost:3002/health
```

### Crear un Activo

```bash
curl -X POST http://localhost:3000/api/activos \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Laptop Dell XPS 15",
    "descripcion": "Laptop de desarrollo",
    "numero_serie": "DELL-2024-001",
    "categoria": "equipo_computo",
    "fecha_adquisicion": "2024-01-15",
    "costo": 2000.00,
    "ubicacion": "Oficina Principal",
    "estado": "activo"
  }'
```

### Obtener todos los Activos

```bash
curl http://localhost:3000/api/activos
```

### Crear un Mantenimiento

```bash
curl -X POST http://localhost:3000/api/mantenimientos \
  -H "Content-Type: application/json" \
  -d '{
    "activoId": "ID_DEL_ACTIVO_CREADO",
    "tipo": "preventivo",
    "descripcion": "Mantenimiento preventivo trimestral del equipo",
    "fecha_inicio": "2024-03-01T09:00:00Z",
    "costo": 100.00,
    "tecnico": {
      "nombre": "Juan Pérez",
      "contacto": "555-1234",
      "especialidad": "Hardware"
    },
    "prioridad": "media",
    "estado": "pendiente"
  }'
```

### Obtener todos los Mantenimientos

```bash
curl http://localhost:3000/api/mantenimientos
```

---

## Ejecutar Tests

### Con Docker

```bash
# Tests del servicio de activos
docker-compose exec servicio-activos npm test

# Tests del servicio de mantenimientos
docker-compose exec servicio-mantenimientos npm test
```

### En desarrollo local

```bash
# Servicio de Activos
cd servicio-activos
npm test

# Servicio de Mantenimientos
cd servicio-mantenimientos
npm test
```

---

## Solución de Problemas Comunes

### 1. Error "Port already in use"

Detén el proceso que está usando el puerto:

Windows:
```bash
# Ver qué proceso usa el puerto 3000 (o el puerto que necesites)
netstat -ano | findstr :3000

# Matar el proceso (reemplaza PID con el número que obtuviste)
taskkill /PID <PID> /F
```

### 2. Error de conexión a la base de datos

Verifica que las bases de datos estén corriendo:

```bash
# Ver contenedores de Docker
docker ps

# Reiniciar bases de datos
docker-compose restart postgres mongodb
```

### 3. Frontend no carga

1. Verifica que el API Gateway esté corriendo
2. Limpia caché y reconstruye:
```bash
cd frontend
rm -rf .next
npm run build
npm run dev
```

### 4. Limpiar todo y empezar de nuevo

```bash
# Detener todo
docker-compose down -v

# Limpiar Docker
docker system prune -af

# Reconstruir
docker-compose build --no-cache
docker-compose up -d
```

---

## Verificar que Todo Funciona

Checklist:
- [ ] ¿PostgreSQL está corriendo? `docker-compose ps` o `psql -U postgres -c "\l"`
- [ ] ¿MongoDB está corriendo? `docker-compose ps` o `mongosh --eval "db.version()"`
- [ ] ¿Servicio de Activos responde? `curl http://localhost:3001/health`
- [ ] ¿Servicio de Mantenimientos responde? `curl http://localhost:3002/health`
- [ ] ¿API Gateway responde? `curl http://localhost:3000/health`
- [ ] ¿Frontend carga? Abrir http://localhost:3003
- [ ] ¿Puedes crear un activo desde el frontend?
- [ ] ¿Puedes crear un mantenimiento desde el frontend?
- [ ] ¿Las estadísticas se muestran en el dashboard?

---

## Datos de Prueba

El sistema NO incluye datos de ejemplo por defecto. Debes crear activos y mantenimientos manualmente desde el frontend o usando los endpoints de la API.

---

¡Listo! Ahora tienes el sistema completo funcionando. 🚀
