# 🚀 Jenkins - Configuración en Nueva PC

Esta guía te permite configurar Jenkins desde cero en cualquier PC usando **Configuration as Code (JCasC)**.

## 📋 Requisitos Previos

- Docker y Docker Compose instalados
- Git instalado
- Acceso al repositorio de GitHub

---

## 🔧 Paso 1: Clonar el Repositorio

```bash
git clone https://github.com/edwingd18/proyecto-final-cloud-computing.git
cd proyecto-final-cloud-computing
```

---

## 🐳 Paso 2: Levantar Jenkins con Docker Compose

```bash
# Iniciar Jenkins (primera vez toma 2-3 minutos - descarga plugins)
docker compose up -d jenkins

# Ver logs de Jenkins
docker compose logs -f jenkins
```

**Espera a ver este mensaje en los logs:**
```
Jenkins is fully up and running
```

---

## 🔑 Paso 3: Acceder a Jenkins

1. Abre tu navegador: **http://localhost:8080/jenkins**
2. Credenciales por defecto:
   - **Usuario**: `admin`
   - **Password**: `admin123`

> ⚠️ **IMPORTANTE**: Cambia esta contraseña en producción

---

## 🔐 Paso 4: Configurar Credenciales (MANUAL)

Jenkins necesita 2 credenciales que NO se versionan en Git por seguridad:

### 4.1 GitHub Personal Access Token

1. Ve a **GitHub** → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click en **"Generate new token (classic)"**
3. Configuración:
   - **Note**: `Jenkins CI/CD`
   - **Expiration**: 90 days (o No expiration)
   - **Scopes**: Marca **`repo`** (todos los sub-items)
4. Click **"Generate token"**
5. **Copia el token** (empieza con `ghp_...`)

**Agregar en Jenkins**:
1. Ve a: **Manage Jenkins** → **Credentials** → **System** → **Global credentials**
2. Click **"Add Credentials"**
3. Configuración:
   - **Kind**: `Username with password`
   - **Username**: `tu-usuario-de-github`
   - **Password**: `ghp_xxxxxxxxxxxxxxxxxxxxx` (el token que copiaste)
   - **ID**: `github-credentials` ⚠️ **EXACTAMENTE este ID**
   - **Description**: `GitHub Personal Access Token`
4. Click **"Create"**

### 4.2 Discord Webhook (Opcional - para notificaciones)

1. Ve a tu servidor de **Discord**
2. Click derecho en el canal → **Editar Canal** → **Integraciones** → **Webhooks**
3. Click **"Crear Webhook"**
4. Dale un nombre: `Jenkins CI/CD`
5. **Copia la URL del Webhook** (empieza con `https://discord.com/api/webhooks/...`)

**Agregar en Jenkins**:
1. Ve a: **Manage Jenkins** → **Credentials** → **System** → **Global credentials**
2. Click **"Add Credentials"**
3. Configuración:
   - **Kind**: `Secret text`
   - **Secret**: `https://discord.com/api/webhooks/...` (la URL que copiaste)
   - **ID**: `discord-webhook` ⚠️ **EXACTAMENTE este ID**
   - **Description**: `Discord Webhook for CI/CD notifications`
4. Click **"Create"**

---

## ✅ Paso 5: Verificar la Configuración

1. Ve a **Dashboard** → Deberías ver el job: **`sistema-gestion-activos-pipeline`**
2. Click en el job → **"Scan Repository Now"**
3. Jenkins debería detectar las ramas `develop` y `main`
4. El pipeline se ejecutará automáticamente

---

## 🔄 Paso 6: Configurar Poll SCM (Detección automática de cambios)

Esto ya está configurado en `jcasc.yaml`, pero si necesitas verificar:

1. Ve al job → **Configure**
2. En **"Build Triggers"**
3. Marca **"Poll SCM"**
4. Schedule: `* * * * *` (revisa cada minuto)
5. Click **"Save"**

---

## 🎯 ¿Qué hace la configuración automática?

Jenkins Configuration as Code (JCasC) configura automáticamente:

✅ Usuario admin con password configurable
✅ Instalación de NodeJS 20
✅ Configuración de Git (nombre y email)
✅ Job multibranch para el proyecto
✅ Poll SCM cada minuto
✅ Todos los plugins necesarios

**Lo ÚNICO que debes hacer manualmente:**
- Agregar GitHub token
- Agregar Discord webhook

---

## 🔧 Troubleshooting

### Jenkins no inicia

```bash
# Ver logs
docker compose logs jenkins

# Reiniciar Jenkins
docker compose restart jenkins
```

### "Credenciales no encontradas"

Verifica que los IDs sean exactamente:
- `github-credentials`
- `discord-webhook`

### Pipeline falla en tests

Verifica que las bases de datos estén corriendo:
```bash
docker compose up -d postgres mongodb
docker compose ps
```

---

## 📦 Estructura de Archivos

```
jenkins/
├── Dockerfile       # Imagen de Jenkins con Docker + plugins
├── plugins.txt      # Lista de plugins a instalar
├── jcasc.yaml       # Configuración completa de Jenkins
└── SETUP.md         # Este archivo
```

---

## 🔒 Seguridad

**NO versionar en Git:**
- ❌ Tokens de GitHub
- ❌ Webhooks de Discord
- ❌ Passwords reales
- ❌ Volumen completo de Jenkins

**SÍ versionar en Git:**
- ✅ `Dockerfile`
- ✅ `plugins.txt`
- ✅ `jcasc.yaml` (sin secretos)
- ✅ `Jenkinsfile` (en la raíz del proyecto)

---

## 📞 Soporte

Si tienes problemas, revisa:
1. Logs de Jenkins: `docker compose logs jenkins`
2. Verifica que Docker esté corriendo
3. Asegúrate de que los puertos 8080 y 50000 estén libres

---

**¡Listo!** Ahora tienes Jenkins configurado y listo para CI/CD 🎉
