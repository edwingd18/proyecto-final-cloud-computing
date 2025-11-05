# Flujo CI/CD - Sistema de Gestión de Activos

Diagrama y explicación del flujo completo de integración y despliegue continuo.

## 🔄 Flujo Completo

```
┌─────────────────────────────────────────────────────────────────────┐
│                         DESARROLLO LOCAL                            │
│                                                                     │
│  Developer escribe código → Tests locales → Git commit → Git push  │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        GITHUB REPOSITORY                            │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  main branch                                                 │  │
│  │  - Jenkinsfile                                               │  │
│  │  - render.yaml                                               │  │
│  │  - Código fuente                                             │  │
│  └──────────────────────────────────────────────────────────────┘  │
└──────────────┬────────────────────────┬─────────────────────────────┘
               │                        │
         (webhook/poll)          (monitoreo continuo)
               │                        │
               ▼                        │
┌────────────────────────────────────┐  │
│         JENKINS CI/CD              │  │
│  http://localhost:8080/jenkins     │  │
│                                    │  │
│  ┌──────────────────────────────┐  │  │
│  │  STAGE 1: Checkout           │  │  │
│  │  ✓ Clone repositorio         │  │  │
│  │  ✓ Verificar branch main     │  │  │
│  └──────────────────────────────┘  │  │
│               ↓                    │  │
│  ┌──────────────────────────────┐  │  │
│  │  STAGE 2: Install (Paralelo) │  │  │
│  │  ├─ servicio-activos         │  │  │
│  │  ├─ servicio-mantenimientos  │  │  │
│  │  ├─ api-gateway              │  │  │
│  │  └─ frontend                 │  │  │
│  └──────────────────────────────┘  │  │
│               ↓                    │  │
│  ┌──────────────────────────────┐  │  │
│  │  STAGE 3: Test (Paralelo)    │  │  │
│  │  ├─ Test Activos             │  │  │
│  │  └─ Test Mantenimientos      │  │  │
│  │                               │  │  │
│  │  ❌ Si falla → STOP           │  │  │
│  │  ✅ Si pasa  → Continuar      │  │  │
│  └──────────────────────────────┘  │  │
│               ↓                    │  │
│  ┌──────────────────────────────┐  │  │
│  │  STAGE 4: Build Docker       │  │  │
│  │  ✓ docker-compose build      │  │  │
│  └──────────────────────────────┘  │  │
│               ↓                    │  │
│  ┌──────────────────────────────┐  │  │
│  │  STAGE 5: Deploy to Render   │  │  │
│  │  ✓ git push render main      │  │  │
│  └──────────────────────────────┘  │  │
└────────────────┬───────────────────┘  │
                 │                      │
             (git push)                 │
                 │                      │
                 ▼                      ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        RENDER PLATFORM                              │
│                     https://render.com                              │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  Detecta cambios en repositorio Git                         │  │
│  └──────────────────────────────────────────────────────────────┘  │
│               ↓                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  Build Services (según render.yaml)                          │  │
│  │                                                               │  │
│  │  1. PostgreSQL Database         (postgres-activos)           │  │
│  │  2. Servicio Activos            (private service)            │  │
│  │  3. Servicio Mantenimientos     (private service)            │  │
│  │  4. API Gateway                 (web service - público)      │  │
│  │  5. Frontend                    (web service - público)      │  │
│  └──────────────────────────────────────────────────────────────┘  │
│               ↓                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  Deploy Automático                                            │  │
│  │  ✓ Health checks                                              │  │
│  │  ✓ Rolling deploy                                             │  │
│  │  ✓ Zero downtime                                              │  │
│  └──────────────────────────────────────────────────────────────┘  │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │   🌐 PRODUCCIÓN      │
                    │                      │
                    │  Frontend:           │
                    │  https://app.onrender.com │
                    │                      │
                    │  API Gateway:        │
                    │  https://api.onrender.com │
                    └──────────────────────┘
```

---

## 📋 Detalle de Stages de Jenkins

### Stage 1: Checkout
**Duración:** ~5 segundos
- Clone del repositorio desde GitHub
- Verificación de branch (main)
- Obtención del commit hash

### Stage 2: Install Dependencies (Paralelo)
**Duración:** ~2-3 minutos
- Instalación en paralelo de 4 servicios
- `npm ci` para instalación reproducible
- Cache de node_modules (si está configurado)

**Servicios:**
- Servicio Activos
- Servicio Mantenimientos
- API Gateway
- Frontend

### Stage 3: Run Tests (Paralelo)
**Duración:** ~30 segundos - 2 minutos
- Ejecución en paralelo de test suites
- Generación de reportes JUnit
- ❌ **Punto de fallo:** Si algún test falla, se detiene el pipeline

**Tests ejecutados:**
- Tests de Servicio Activos
- Tests de Servicio Mantenimientos

### Stage 4: Build Docker Images
**Duración:** ~3-5 minutos
- Solo se ejecuta si todos los tests pasan
- Solo en branch `main`
- Construye todas las imágenes Docker
- Valida que las imágenes se crearon correctamente

### Stage 5: Deploy to Render
**Duración:** ~10 segundos (solo el push)
- Solo se ejecuta en branch `main`
- Git push al repositorio de Render
- Render detecta el cambio automáticamente
- Inicia deployment en Render (proceso separado)

---

## ⏱️ Tiempos Estimados

| Etapa | Duración | Acumulado |
|-------|----------|-----------|
| Checkout | 5s | 5s |
| Install | 2-3 min | 2-3 min |
| Tests | 30s-2min | 3-5 min |
| Build | 3-5 min | 6-10 min |
| Deploy (push) | 10s | 6-10 min |
| **Total Jenkins** | **6-10 minutos** | - |
| Deploy en Render | 5-10 min | 11-20 min |
| **Total Completo** | **11-20 minutos** | - |

---

## 🚦 Estados del Pipeline

### ✅ Success (Verde)
- Todos los tests pasaron
- Build exitoso
- Deploy completado
- Código en producción

### ❌ Failure (Rojo)
**Posibles causas:**
- Tests fallaron
- Error de compilación
- Error en Docker build
- Fallo al hacer push a Render

**Acción:** Revisar Console Output en Jenkins

### ⚠️ Unstable (Amarillo)
- Tests pasaron pero con warnings
- Algunos tests se saltaron
- Problemas de performance

### ⏸️ Aborted (Gris)
- Pipeline cancelado manualmente
- Timeout excedido
- Build interrumpido

---

## 🔐 Credenciales Requeridas

### En Jenkins

| ID | Tipo | Uso |
|----|------|-----|
| `github-credentials` | Username/Password o SSH | Acceso al repositorio de GitHub |
| `render-git-url` | Secret Text | URL del repositorio Git de Render |

### En Render Dashboard

| Variable | Servicio | Valor |
|----------|----------|-------|
| `MONGO_URI` | servicio-mantenimientos | Connection string de MongoDB Atlas |
| `NEXT_PUBLIC_API_URL` | frontend | Auto-generado (URL del API Gateway) |

---

## 🎯 Triggers del Pipeline

### 1. Manual
- Click en "Build Now" en Jenkins
- Útil para: Testing, deploy de emergencia

### 2. Poll SCM (Automático)
- Jenkins revisa cambios cada 5 minutos
- Config: `H/5 * * * *`
- Útil para: Desarrollo sin webhooks

### 3. GitHub Webhook (Recomendado)
- Push automático triggerea Jenkins
- Respuesta inmediata (segundos)
- Requiere: Jenkins accesible públicamente o ngrok

---

## 📊 Monitoreo del Deployment

### En Jenkins
1. Dashboard → Job → Build History
2. Click en build number
3. Ver "Console Output" para logs detallados
4. Ver "Pipeline Steps" para duración de cada stage

### En Render
1. Dashboard → Services
2. Ver estado de cada servicio (verde/amarillo/rojo)
3. Click en servicio → "Events" para ver logs de deployment
4. "Logs" para logs en tiempo real

---

## 🔄 Rollback

### Opción 1: Via Render Dashboard
1. Ve al servicio en Render
2. Settings → Deploy hooks
3. Click en "Manual Deploy" de un deploy anterior
4. Espera ~5 minutos

### Opción 2: Via Git
```bash
# Volver a commit anterior
git revert HEAD
git push origin main

# Jenkins detectará el cambio y hará deploy automático
```

---

## 🛠️ Troubleshooting

### Pipeline falla en Install
```bash
# Verificar que npm esté disponible en Jenkins
docker exec jenkins npm --version

# Si no está, instalar Node.js en Jenkins
docker exec -u root jenkins bash -c "curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && apt-get install -y nodejs"
```

### Pipeline falla en Tests
```bash
# Ejecutar tests localmente
cd servicio-activos && npm test
cd servicio-mantenimientos && npm test

# Ver logs detallados en Jenkins Console Output
```

### Pipeline falla en Build
```bash
# Verificar Docker en Jenkins
docker exec jenkins docker ps

# Dar permisos si es necesario
docker exec -u root jenkins chmod 666 /var/run/docker.sock
```

### Deploy a Render falla
1. Verificar que `render-git-url` esté configurado correctamente
2. Verificar credenciales de GitHub
3. Ver logs en Render Dashboard → Events

---

## 📚 Documentos Relacionados

- [JENKINS_SETUP.md](./JENKINS_SETUP.md) - Guía completa de configuración de Jenkins
- [render.yaml](./render.yaml) - Configuración de servicios en Render
- [Jenkinsfile](./Jenkinsfile) - Pipeline definition
- [README.md](./README.md) - Documentación general del proyecto

---

## 🎉 Resultado Final

Después de completar el pipeline:

```
✅ Código testeado y validado
✅ Imágenes Docker construidas
✅ Servicios desplegados en Render
✅ Bases de datos conectadas
✅ Health checks pasando
✅ Aplicación accesible públicamente
```

**URLs de Producción:**
- Frontend: `https://tu-app.onrender.com`
- API Gateway: `https://tu-api.onrender.com`

---

## ⚡ Optimizaciones Futuras

### Caching
- [ ] Cache de node_modules en Jenkins
- [ ] Cache de Docker layers
- [ ] Reutilizar dependencias entre builds

### Parallel Execution
- [x] Install en paralelo ✅
- [x] Tests en paralelo ✅
- [ ] Build en paralelo (experimental)

### Notificaciones
- [ ] Slack notifications
- [ ] Email notifications
- [ ] GitHub status checks

### Testing Avanzado
- [ ] Integration tests
- [ ] E2E tests con Cypress
- [ ] Performance tests
- [ ] Security scanning

---

¿Preguntas? Revisa [JENKINS_SETUP.md](./JENKINS_SETUP.md) o los logs de Jenkins/Render.
