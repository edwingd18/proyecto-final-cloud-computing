# Documentación de Endpoints API

## Configuración de URLs

### Local (Desarrollo)

- **API Gateway**: `http://localhost:3000`
- **Servicio Activos**: `http://localhost:3001`
- **Servicio Mantenimientos**: `http://localhost:3002`
- **Frontend**: `http://localhost:3003`

### Producción (Railway)

- **API Gateway**: `https://api-gateway-production-2e6e.up.railway.app`
- **Frontend**: Usar variable de entorno `NEXT_PUBLIC_API_URL`

---

## Endpoints de Activos

Base URL: `/api/activos` (a través del Gateway) o `/activos` (directo al servicio)

### Listar Activos

```
GET /activos/lista
Query params: ?page=1&limit=10&categoria=mobiliario&estado=activo&search=texto
```

### Obtener Activo por ID

```
GET /activos/ver/:id
```

### Buscar Activos

```
GET /activos/buscar?q=texto_busqueda
```

### Estadísticas

```
GET /activos/stats
```

### Crear Activo

```
POST /activos/crear
Content-Type: application/json

Body:
{
  "nombre": "string",
  "descripcion": "string",
  "numero_serie": "string",
  "categoria": "mobiliario|electronico|maquinaria|vehiculo|equipo_computo|herramienta|otro",
  "fecha_adquisicion": "YYYY-MM-DD",
  "costo": number,
  "ubicacion": "string",
  "estado": "activo|inactivo|en_reparacion|dado_de_baja"
}
```

### Actualizar Activo

```
PUT /activos/actualizar/:id
Content-Type: application/json

Body: (mismo formato que crear)
```

### Eliminar Activo

```
DELETE /activos/eliminar/:id
```

---

## Variables de Entorno Requeridas

### API Gateway (Railway)

```
ACTIVOS_SERVICE_URL=http://servicio-activos.railway.internal:3001
MANTENIMIENTOS_SERVICE_URL=http://servicio-mantenimientos.railway.internal:3002
NODE_ENV=production
PORT=3000
```

### Frontend (Railway)

```
NEXT_PUBLIC_API_URL=https://api-gateway-production-2e6e.up.railway.app/api
NODE_ENV=production
```

### Servicio Activos (Railway)

```
DATABASE_URL=postgresql://user:password@host:5432/activos_db
NODE_ENV=production
PORT=3001
```

---

## Comandos Docker

### Levantar todo el stack localmente

```bash
docker-compose up -d
```

### Ver logs

```bash
docker-compose logs -f api-gateway
docker-compose logs -f servicio-activos
docker-compose logs -f frontend
```

### Reconstruir servicios

```bash
docker-compose up -d --build
```

### Detener todo

```bash
docker-compose down
```

---

## Testing con cURL

### Crear activo

```bash
curl -X POST http://localhost:3000/api/activos/crear \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Laptop Dell",
    "descripcion": "Laptop para desarrollo",
    "numero_serie": "DELL123456",
    "categoria": "equipo_computo",
    "fecha_adquisicion": "2024-01-15",
    "costo": 1500.00,
    "ubicacion": "Oficina Principal",
    "estado": "activo"
  }'
```

### Listar activos

```bash
curl http://localhost:3000/api/activos/lista
```

### Buscar activos

```bash
curl "http://localhost:3000/api/activos/buscar?q=laptop"
```
