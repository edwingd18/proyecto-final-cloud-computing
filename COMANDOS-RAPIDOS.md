# Comandos Rápidos para Probar el Proyecto

## 1️⃣ LIMPIAR TODO (Si tuviste errores antes)

```powershell
# Detener y eliminar todo
docker-compose down -v

# Limpiar imágenes antiguas (opcional)
docker system prune -f
```

## 2️⃣ CONSTRUIR LAS IMÁGENES

```powershell
# Construir todas las imágenes desde cero
docker-compose build --no-cache
```

⏱️ **Tiempo estimado:** 5-10 minutos

## 3️⃣ INICIAR LOS SERVICIOS

```powershell
# Iniciar todos los contenedores
docker-compose up -d
```

## 4️⃣ VERIFICAR QUE TODO ESTÉ CORRIENDO

```powershell
# Ver el estado de los contenedores
docker-compose ps
```

**Deberías ver:**
```
NAME                        STATUS
postgres-activos           Up
mongodb-mantenimientos     Up
servicio-activos           Up (healthy)
servicio-mantenimientos    Up (healthy)
api-gateway                Up (healthy)
frontend                   Up
```

## 5️⃣ VER LOS LOGS (Opcional, para debugging)

```powershell
# Ver logs de todos los servicios
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f servicio-activos
docker-compose logs -f servicio-mantenimientos
docker-compose logs -f api-gateway
docker-compose logs -f frontend

# Presiona Ctrl+C para salir
```

## 6️⃣ PROBAR LA APLICACIÓN

Abre tu navegador y ve a:

### 🌐 Aplicación Principal
**http://localhost:3003**

Aquí verás:
- ✅ Dashboard con estadísticas
- ✅ Gestión de Activos (crear, ver, editar, eliminar)
- ✅ Gestión de Mantenimientos (crear, ver, editar, eliminar)

### 🔍 Health Checks (Para verificar que los servicios funcionen)

- API Gateway: http://localhost:3000/health
- Servicio Activos: http://localhost:3001/health
- Servicio Mantenimientos: http://localhost:3002/health

### 📚 Documentación de la API

- API Gateway (lista de endpoints): http://localhost:3000/

## 7️⃣ DETENER LOS SERVICIOS

```powershell
# Detener sin borrar datos
docker-compose down

# Detener y borrar datos de las bases de datos
docker-compose down -v
```

---

## 🧪 EJECUTAR TESTS

```powershell
# Tests del servicio de activos
docker-compose exec servicio-activos npm test

# Tests del servicio de mantenimientos
docker-compose exec servicio-mantenimientos npm test
```

---

## 🔧 SOLUCIÓN DE PROBLEMAS

### Error: "Port already in use"

```powershell
# Ver qué proceso usa el puerto
netstat -ano | findstr :3000

# Matar el proceso (reemplaza PID)
taskkill /PID <PID> /F
```

### Reiniciar un servicio específico

```powershell
docker-compose restart servicio-activos
docker-compose restart servicio-mantenimientos
docker-compose restart api-gateway
docker-compose restart frontend
```

### Ver logs en tiempo real de un servicio

```powershell
docker-compose logs -f frontend
```

### Acceder a la base de datos

```powershell
# PostgreSQL
docker-compose exec postgres psql -U postgres -d activos_db

# MongoDB
docker-compose exec mongodb mongosh mantenimientos_db
```

### Limpiar COMPLETAMENTE y empezar de nuevo

```powershell
# Detener todo
docker-compose down -v

# Limpiar sistema Docker
docker system prune -af

# Reconstruir
docker-compose build --no-cache

# Iniciar
docker-compose up -d
```

---

## 📝 CREAR DATOS DE PRUEBA

Una vez que la aplicación esté corriendo en http://localhost:3003:

1. **Crear un Activo:**
   - Clic en "Activos" → "Nuevo Activo"
   - Llenar el formulario
   - Guardar

2. **Crear un Mantenimiento:**
   - Clic en "Mantenimientos" → "Nuevo Mantenimiento"
   - Seleccionar el activo creado
   - Llenar el formulario
   - Guardar

3. **Ver Estadísticas:**
   - Ir al Dashboard (inicio)
   - Ver las estadísticas actualizadas

---

## ✅ CHECKLIST DE VERIFICACIÓN

- [ ] ¿Docker Desktop está corriendo?
- [ ] ¿Todos los contenedores están "Up"? (`docker-compose ps`)
- [ ] ¿El frontend carga en http://localhost:3003?
- [ ] ¿Puedes crear un activo?
- [ ] ¿Puedes crear un mantenimiento?
- [ ] ¿El dashboard muestra estadísticas?

---

¡Listo! 🚀 Tu sistema de microservicios está funcionando.
