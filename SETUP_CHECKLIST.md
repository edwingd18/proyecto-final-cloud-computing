# ✅ Checklist de Configuración Manual

Lista completa de pasos que debes hacer manualmente para que todo funcione.

---

## 📋 PARTE 1: LOCAL - Jenkins

### 1.1 Levantar Jenkins (2 minutos)

```bash
# Levantar Jenkins
docker-compose up -d jenkins

# Esperar ~30 segundos y obtener contraseña
docker logs jenkins
# O usar:
make jenkins-password
```

**Resultado esperado:** Contraseña alfanumérica como `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`

---

### 1.2 Configuración Inicial de Jenkins (5 minutos)

✅ **1.2.1 Acceso Inicial**
- [ ] Abrir: http://localhost:8080/jenkins
- [ ] Pegar la contraseña inicial
- [ ] Click "Continue"

✅ **1.2.2 Instalar Plugins**
- [ ] Seleccionar "Install suggested plugins"
- [ ] Esperar 2-5 minutos (se instalan automáticamente)

✅ **1.2.3 Crear Usuario Admin**
- [ ] Username: `admin`
- [ ] Password: `<tu-password-seguro>` (guárdalo!)
- [ ] Full name: `Jenkins Admin`
- [ ] Email: `tu-email@example.com`
- [ ] Click "Save and Continue"

✅ **1.2.4 Confirmar URL**
- [ ] Dejar como está: `http://localhost:8080/jenkins/`
- [ ] Click "Save and Finish"
- [ ] Click "Start using Jenkins"

---

### 1.3 Instalar Plugin de Docker (3 minutos)

✅ **1.3.1 Ir a Plugins**
- [ ] Manage Jenkins → Manage Plugins → Available

✅ **1.3.2 Buscar e Instalar**
- [ ] Buscar: "Docker Pipeline"
- [ ] Marcar checkbox
- [ ] Click "Install without restart"
- [ ] Marcar "Restart Jenkins when installation is complete"
- [ ] Esperar ~1 minuto

---

### 1.4 Instalar Node.js en Jenkins (2 minutos)

```bash
# Ejecutar este comando en tu terminal
docker exec -u root jenkins bash -c "curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && apt-get install -y nodejs"

# Verificar instalación
docker exec jenkins node --version
docker exec jenkins npm --version
```

**Resultado esperado:**
```
v20.x.x
10.x.x
```

---

### 1.5 Dar permisos de Docker (1 minuto)

```bash
# Ejecutar en tu terminal
docker exec -u root jenkins chmod 666 /var/run/docker.sock

# Verificar que funciona
docker exec jenkins docker ps
```

**Resultado esperado:** Lista de contenedores corriendo

---

## 📋 PARTE 2: GITHUB

### 2.1 Subir Código a GitHub (3 minutos)

✅ **2.1.1 Crear Repositorio en GitHub**
- [ ] Ir a: https://github.com/new
- [ ] Repository name: `sistema-gestion-activos` (o el nombre que quieras)
- [ ] Public o Private (tu elección)
- [ ] NO marcar "Initialize with README" (ya tienes código)
- [ ] Click "Create repository"

✅ **2.1.2 Subir tu código**
```bash
# En tu proyecto local
cd c:\Users\USER\Desarrollos\proyecto-fina-cloud-computing

# Inicializar Git si no existe
git init
git add .
git commit -m "Configuración inicial con Jenkins y Render"

# Agregar remote (CAMBIAR por tu URL)
git remote add origin https://github.com/TU-USUARIO/TU-REPO.git

# O si ya existe origin, actualizarlo:
git remote set-url origin https://github.com/TU-USUARIO/TU-REPO.git

# Push
git branch -M main
git push -u origin main
```

✅ **2.1.3 Crear Personal Access Token**
- [ ] Ir a: https://github.com/settings/tokens
- [ ] Click "Generate new token" → "Generate new token (classic)"
- [ ] Note: `Jenkins CI/CD`
- [ ] Expiration: `90 days` (o más)
- [ ] Permisos a marcar:
  - [x] `repo` (todos los sub-items)
  - [x] `admin:repo_hook` → `write:repo_hook`
- [ ] Click "Generate token"
- [ ] **COPIAR Y GUARDAR EL TOKEN** (solo se muestra una vez!)

**Token ejemplo:** `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

---

## 📋 PARTE 3: JENKINS - Credenciales

### 3.1 Agregar Credenciales de GitHub (2 minutos)

✅ **En Jenkins:**
- [ ] Manage Jenkins → Manage Credentials
- [ ] Click en "(global)" bajo "Stores scoped to Jenkins"
- [ ] Click "Add Credentials"

✅ **Configurar:**
- [ ] Kind: **Username with password**
- [ ] Scope: **Global**
- [ ] Username: `tu-usuario-github`
- [ ] Password: `ghp_xxxx...` (el token que copiaste)
- [ ] ID: `github-credentials`
- [ ] Description: `GitHub Credentials`
- [ ] Click "Create"

---

### 3.2 Crear Credencial de Render URL (temporal)

✅ **Por ahora, crear con URL dummy:**
- [ ] Manage Jenkins → Manage Credentials → (global) → Add Credentials
- [ ] Kind: **Secret text**
- [ ] Scope: **Global**
- [ ] Secret: `https://dummy-url.com` (actualizaremos después)
- [ ] ID: `render-git-url`
- [ ] Description: `Render Git Repository URL`
- [ ] Click "Create"

**Nota:** Actualizaremos esta URL después de crear servicios en Render.

---

## 📋 PARTE 4: JENKINS - Crear Pipeline Job

### 4.1 Crear Job (3 minutos)

✅ **4.1.1 Crear Nuevo Item**
- [ ] Dashboard → Click "New Item"
- [ ] Name: `sistema-gestion-activos-pipeline`
- [ ] Seleccionar: **Pipeline**
- [ ] Click "OK"

✅ **4.1.2 Configurar General**
- [ ] Marcar "Discard old builds"
  - Days to keep: `7`
  - Max # of builds: `10`

✅ **4.1.3 Configurar Build Triggers**
- [ ] Marcar "Poll SCM"
- [ ] Schedule: `H/5 * * * *` (cada 5 minutos)

✅ **4.1.4 Configurar Pipeline**
- [ ] Definition: **Pipeline script from SCM**
- [ ] SCM: **Git**
- [ ] Repository URL: `https://github.com/TU-USUARIO/TU-REPO.git`
- [ ] Credentials: Seleccionar `github-credentials`
- [ ] Branch Specifier: `*/main`
- [ ] Script Path: `Jenkinsfile`
- [ ] Click "Save"

---

### 4.2 Probar Pipeline (Sin Deploy a Render)

✅ **Editar Jenkinsfile temporalmente:**

Comenta el stage de Deploy para probarlo sin Render:

```groovy
// Comentar temporalmente el stage Deploy
/*
stage('Deploy to Render') {
    ...
}
*/
```

✅ **Ejecutar Build:**
- [ ] Click "Build Now"
- [ ] Ver progreso en "Build History"
- [ ] Click en el número → "Console Output"

**Resultado esperado:**
- ✅ Checkout OK
- ✅ Install OK
- ✅ Tests OK
- ✅ Build OK
- ⏭️ Deploy (skipped)

---

## 📋 PARTE 5: RENDER

### 5.1 Crear Cuenta en Render (3 minutos)

✅ **5.1.1 Registrarse**
- [ ] Ir a: https://render.com
- [ ] Click "Get Started"
- [ ] Conectar con GitHub (recomendado)
- [ ] Autorizar Render

---

### 5.2 Crear Base de Datos PostgreSQL (2 minutos)

✅ **5.2.1 Crear Database**
- [ ] Dashboard → Click "New +" → "PostgreSQL"
- [ ] Name: `postgres-activos`
- [ ] Database: `activos_db`
- [ ] User: `postgres`
- [ ] Region: `Oregon (us-west)`
- [ ] Plan: **Free**
- [ ] Click "Create Database"
- [ ] Esperar ~2 minutos (status: "Available")

✅ **5.2.2 Guardar Conexión**
- [ ] Click en la database → "Info" tab
- [ ] **COPIAR Y GUARDAR:**
  - Internal Database URL (la usaremos en render.yaml)
  - External Database URL (para conectarte localmente si quieres)

---

### 5.3 Configurar MongoDB Atlas (GRATIS) (5 minutos)

✅ **5.3.1 Crear Cuenta**
- [ ] Ir a: https://www.mongodb.com/cloud/atlas
- [ ] Click "Try Free"
- [ ] Sign up (con Google/GitHub es más rápido)

✅ **5.3.2 Crear Cluster Gratis**
- [ ] Opción: **M0 FREE** (no poner tarjeta)
- [ ] Cloud Provider: AWS
- [ ] Region: `us-west-2` (Oregon) - mismo que Render
- [ ] Cluster Name: `Cluster0` (dejar por defecto)
- [ ] Click "Create Cluster"
- [ ] Esperar ~3 minutos

✅ **5.3.3 Configurar Acceso**

**Paso A: Database Access**
- [ ] Security → Database Access → "Add New Database User"
- [ ] Authentication: Password
- [ ] Username: `admin`
- [ ] Password: Click "Autogenerate Secure Password" → **COPIAR Y GUARDAR**
- [ ] Database User Privileges: "Read and write to any database"
- [ ] Click "Add User"

**Paso B: Network Access**
- [ ] Security → Network Access → "Add IP Address"
- [ ] Click "Allow Access from Anywhere"
- [ ] IP: `0.0.0.0/0` (se pone automáticamente)
- [ ] Description: `Render Services`
- [ ] Click "Confirm"

✅ **5.3.4 Obtener Connection String**
- [ ] Database → Click "Connect" → "Connect your application"
- [ ] Driver: `Node.js`
- [ ] Version: `5.5 or later`
- [ ] **COPIAR** el connection string:
  ```
  mongodb+srv://admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
  ```
- [ ] **IMPORTANTE:** Reemplazar `<password>` con la contraseña que guardaste
- [ ] Agregar nombre de database al final:
  ```
  mongodb+srv://admin:TU_PASSWORD@cluster0.xxxxx.mongodb.net/mantenimientos_db?retryWrites=true&w=majority
  ```
- [ ] **GUARDAR** este string completo

---

### 5.4 Crear Servicios en Render desde Blueprint (10 minutos)

✅ **5.4.1 Crear Blueprint**
- [ ] Dashboard → Click "New +" → "Blueprint"
- [ ] Seleccionar tu repositorio: `TU-USUARIO/TU-REPO`
- [ ] Click "Connect"
- [ ] Render detecta el `render.yaml` automáticamente
- [ ] Review: Verás 4 servicios listados

✅ **5.4.2 Configurar Variables de Entorno**

Antes de crear, necesitas configurar la variable `MONGO_URI`:

- [ ] En la sección de "servicio-mantenimientos"
- [ ] Buscar variable: `MONGO_URI`
- [ ] Click en el campo
- [ ] Pegar el connection string completo de MongoDB Atlas
- [ ] Verificar que tenga el formato:
  ```
  mongodb+srv://admin:PASSWORD@cluster0.xxxxx.mongodb.net/mantenimientos_db?retryWrites=true&w=majority
  ```

✅ **5.4.3 Crear Servicios**
- [ ] Click "Apply"
- [ ] Esperar 10-15 minutos (primera vez tarda más)
- [ ] Verás el progreso de cada servicio

**Servicios que se crearán:**
1. `postgres-activos` (Database)
2. `servicio-activos` (Private Service)
3. `servicio-mantenimientos` (Private Service)
4. `api-gateway` (Web Service)
5. `frontend` (Web Service)

---

### 5.5 Obtener Git URL de Render (1 minuto)

✅ **Después de que los servicios estén creados:**
- [ ] Click en cualquier servicio (ej: `api-gateway`)
- [ ] Settings → "Git"
- [ ] Sección "Render Git"
- [ ] **COPIAR** la URL que empieza con: `https://git.render.com/srv-xxxxx`

---

### 5.6 Actualizar Credencial en Jenkins (1 minuto)

✅ **Volver a Jenkins:**
- [ ] Manage Jenkins → Manage Credentials → (global)
- [ ] Click en `render-git-url`
- [ ] Click "Update"
- [ ] Secret: **PEGAR** la URL de Render que copiaste
- [ ] Click "Save"

---

## 📋 PARTE 6: ACTIVAR DEPLOYMENT COMPLETO

### 6.1 Descomentar Stage de Deploy (1 minuto)

✅ **En tu código local:**
- [ ] Abrir `Jenkinsfile`
- [ ] Descomentar el stage "Deploy to Render" (si lo comentaste antes)
- [ ] Guardar

### 6.2 Push y Ver Pipeline Completo (1 minuto)

```bash
git add .
git commit -m "Activar deployment a Render"
git push origin main
```

✅ **Ver en Jenkins:**
- [ ] Esperar ~30 segundos
- [ ] Jenkins detecta cambio (por poll SCM)
- [ ] Se ejecuta el pipeline completo
- [ ] Ver progreso en "Build History"

**Stages que verás:**
- ✅ Checkout
- ✅ Install Dependencies
- ✅ Run Tests
- ✅ Build Docker Images
- ✅ Deploy to Render

---

## 📋 PARTE 7: VERIFICACIÓN FINAL

### 7.1 Verificar Deployment en Render (5 minutos)

✅ **En Render Dashboard:**
- [ ] Ver que todos los servicios estén "Live" (verde)
- [ ] Click en `frontend` → Ver URL pública
- [ ] Click en "Open" o copiar la URL

✅ **Abrir la aplicación:**
- [ ] URL: `https://tu-frontend.onrender.com`
- [ ] Deberías ver tu aplicación funcionando

---

### 7.2 Probar la Aplicación (2 minutos)

✅ **Tests básicos:**
- [ ] Página principal carga correctamente
- [ ] Ver listado de activos
- [ ] Crear un nuevo activo
- [ ] Ver detalles de un activo
- [ ] Verificar que los datos se guarden

---

## 🎯 RESUMEN DE TIEMPOS

| Parte | Tiempo Estimado |
|-------|----------------|
| 1. Jenkins Local | 13 minutos |
| 2. GitHub Setup | 3 minutos |
| 3. Jenkins Credentials | 2 minutos |
| 4. Jenkins Pipeline | 5 minutos |
| 5. Render Setup | 21 minutos |
| 6. Activar Deploy | 2 minutos |
| 7. Verificación | 7 minutos |
| **TOTAL** | **~53 minutos** |

---

## 📝 DATOS QUE DEBES GUARDAR

Durante el proceso necesitarás guardar:

1. **Jenkins Admin Password** (el que creaste)
2. **GitHub Personal Access Token** (`ghp_xxxx...`)
3. **MongoDB Atlas Password** (auto-generado)
4. **MongoDB Connection String** (completo)
5. **Render Git URL** (`https://git.render.com/srv-xxxx`)
6. **URLs de Producción** de Render

---

## ❓ ¿Algo Falló?

### Si Jenkins no inicia
```bash
docker logs jenkins
# Ver si hay errores

docker restart jenkins
```

### Si tests fallan en Jenkins
```bash
# Ejecutar localmente primero
npm test
```

### Si deployment a Render falla
- Revisar logs en Render Dashboard → Service → "Logs"
- Verificar variables de entorno (especialmente MONGO_URI)

---

## ✅ CHECKLIST FINAL

Cuando hayas completado todo, deberías tener:

- [x] Jenkins corriendo en http://localhost:8080/jenkins
- [x] Pipeline configurado y funcionando
- [x] Código en GitHub
- [x] PostgreSQL en Render
- [x] MongoDB Atlas configurado
- [x] 5 servicios "Live" en Render
- [x] Aplicación accesible públicamente
- [x] Pipeline completo funcionando (push → tests → deploy)

---

¡Felicidades! 🎉 Si llegaste aquí, tienes un sistema CI/CD completo funcionando.
