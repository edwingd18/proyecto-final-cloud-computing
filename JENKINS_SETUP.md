# Configuración de Jenkins CI/CD

Guía completa para configurar Jenkins y automatizar el deployment a Render.

## Tabla de Contenidos

1. [Iniciar Jenkins](#1-iniciar-jenkins)
2. [Configuración Inicial](#2-configuración-inicial)
3. [Instalar Plugins](#3-instalar-plugins)
4. [Configurar Credenciales](#4-configurar-credenciales)
5. [Crear Pipeline Job](#5-crear-pipeline-job)
6. [Configurar Webhooks](#6-configurar-webhooks-opcional)
7. [Testing del Pipeline](#7-testing-del-pipeline)

---

## 1. Iniciar Jenkins

### Levantar el contenedor de Jenkins

```bash
# Iniciar Jenkins junto con los demás servicios
docker-compose up -d jenkins

# O iniciar todo el stack
docker-compose up -d
```

### Obtener la contraseña inicial

```bash
# Obtener la contraseña de administrador inicial
docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword
```

**Copia la contraseña que aparece (es algo como: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`)**

### Acceder a Jenkins

1. Abre tu navegador en: **http://localhost:8080/jenkins**
2. Pega la contraseña inicial que copiaste
3. Click en **"Continue"**

---

## 2. Configuración Inicial

### Instalar plugins sugeridos

1. Selecciona **"Install suggested plugins"**
2. Espera a que se instalen (toma 2-5 minutos)

### Crear usuario administrador

1. Completa el formulario:
   - Username: `admin`
   - Password: `<tu-password-seguro>`
   - Full name: `Jenkins Admin`
   - Email: `tu-email@example.com`
2. Click en **"Save and Continue"**

### Configurar URL de Jenkins

1. Confirma la URL: `http://localhost:8080/jenkins/`
2. Click en **"Save and Finish"**
3. Click en **"Start using Jenkins"**

---

## 3. Instalar Plugins

### Plugins requeridos para este proyecto

Ve a: **Manage Jenkins** → **Manage Plugins** → **Available**

Busca e instala los siguientes plugins:

- ✅ **Git** (ya instalado por defecto)
- ✅ **Pipeline** (ya instalado por defecto)
- ✅ **Docker Pipeline** - Para ejecutar comandos Docker
- ✅ **Credentials Binding** (ya instalado por defecto)
- ✅ **JUnit** (ya instalado por defecto)
- ✅ **Slack Notification** (opcional - para notificaciones)

Después de instalar, selecciona **"Restart Jenkins when installation is complete"**

---

## 4. Configurar Credenciales

### 4.1 Credenciales de GitHub

Ve a: **Manage Jenkins** → **Manage Credentials** → **(global)** → **Add Credentials**

#### Opción A: Username/Password (más simple)

1. Kind: **Username with password**
2. Scope: **Global**
3. Username: `tu-usuario-github`
4. Password: `tu-personal-access-token`
   - Crea un token en: https://github.com/settings/tokens
   - Permisos necesarios: `repo`, `admin:repo_hook`
5. ID: `github-credentials`
6. Description: `GitHub Credentials`
7. Click en **"Create"**

#### Opción B: SSH Key (más seguro)

```bash
# Generar nueva SSH key
ssh-keygen -t rsa -b 4096 -C "jenkins@ci.local" -f ~/.ssh/jenkins_key

# Ver la clave privada
cat ~/.ssh/jenkins_key
```

1. Kind: **SSH Username with private key**
2. Scope: **Global**
3. ID: `github-ssh-credentials`
4. Username: `git`
5. Private Key: **Enter directly** → Pegar el contenido de `jenkins_key`
6. Passphrase: (dejar vacío si no configuraste uno)
7. Click en **"Create"**

Luego, agrega la clave pública a GitHub:

```bash
cat ~/.ssh/jenkins_key.pub
```

Ve a: https://github.com/settings/keys → **New SSH key** → Pegar y guardar

Ve a: **Manage Jenkins** → **Manage Credentials** → **(global)** → **Add Credentials**

1. Kind: **Secret text**
2. Scope: **Global**
3. Secret: `<URL-del-repositorio-Git-de-Render>`
   - Obtener de Render Dashboard: Settings → Repository URL
   - Formato: `https://git.render.com/srv-xxxxxxxxxxxxx`
4. ID: `render-git-url`
5. Description: `Render Git Repository URL`
6. Click en **"Create"**

---

## 5. Crear Pipeline Job

### Paso 1: Crear nuevo Job

1. En el Dashboard de Jenkins, click en **"New Item"**
2. Nombre: `sistema-gestion-activos-pipeline`
3. Selecciona **"Pipeline"**
4. Click en **"OK"**

### Paso 2: Configurar el Pipeline

#### General

- ✅ Marcar **"Discard old builds"**
  - Days to keep builds: `7`
  - Max # of builds to keep: `10`
- ✅ Marcar **"GitHub project"** (opcional)
  - Project url: `https://github.com/tu-usuario/tu-repo/`

#### Build Triggers

Opciones (elige una o varias):

- ✅ **Poll SCM** - Revisa cambios cada X tiempo
  - Schedule: `H/5 * * * *` (cada 5 minutos)
- ✅ **GitHub hook trigger** - Trigger automático via webhook
  - Requiere configurar webhook en GitHub (ver sección 6)

#### Pipeline

1. Definition: **Pipeline script from SCM**
2. SCM: **Git**
3. Repository URL: `https://github.com/tu-usuario/tu-repo.git`
   - O con SSH: `git@github.com:tu-usuario/tu-repo.git`
4. Credentials: Selecciona `github-credentials` (o `github-ssh-credentials`)
5. Branch Specifier: `*/main`
6. Script Path: `Jenkinsfile`

### Paso 3: Guardar

Click en **"Save"**

---

## 6. Configurar Webhooks (Opcional)

Para triggers automáticos cuando haces push a GitHub:

### En GitHub

1. Ve a tu repositorio → **Settings** → **Webhooks** → **Add webhook**
2. Payload URL: `http://TU-IP-PUBLICA:8080/jenkins/github-webhook/`
   - **Nota:** Si Jenkins está en localhost, necesitas exponer el puerto o usar ngrok
   - Para desarrollo local, usa Poll SCM en lugar de webhooks
3. Content type: `application/json`
4. Secret: (dejar vacío)
5. Which events: **Just the push event**
6. ✅ Active
7. Click en **"Add webhook"**

### Alternativa para desarrollo local: ngrok

```bash
# Instalar ngrok
# https://ngrok.com/download

# Exponer Jenkins al internet
ngrok http 8080

# Copia la URL que te da (ej: https://abc123.ngrok.io)
# Usa esta URL en el webhook de GitHub:
# https://abc123.ngrok.io/jenkins/github-webhook/
```

---

## 7. Testing del Pipeline

### Ejecutar manualmente

1. Ve al job: `sistema-gestion-activos-pipeline`
2. Click en **"Build Now"**
3. Observa el progreso en **"Build History"**
4. Click en el número de build → **"Console Output"** para ver logs

### Verificar stages

En la página del build, deberías ver:

- ✅ Checkout
- ✅ Install Dependencies (paralelo)
- ✅ Run Tests (paralelo)
- ✅ Build Docker Images
- ✅ Deploy to Render

### Solución de problemas comunes

#### Error: "docker: command not found"

Verificar que el socket de Docker esté montado:

```bash
docker exec jenkins docker ps
```

Si falla, verifica el `docker-compose.yml` tenga:

```yaml
volumes:
  - /var/run/docker.sock:/var/run/docker.sock
```

#### Error: "npm: command not found"

Jenkins necesita tener Node.js instalado. Dos opciones:

**Opción A: Instalar Node en Jenkins**

```bash
docker exec -u root jenkins bash -c "curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && apt-get install -y nodejs"
```

**Opción B: Usar Docker dentro de Jenkins**

Modificar el Jenkinsfile para usar containers de Node:

```groovy
agent {
    docker {
        image 'node:20-alpine'
    }
}
```

#### Error: "Permission denied" en Docker

```bash
# Dar permisos al usuario jenkins para usar docker
docker exec -u root jenkins chmod 666 /var/run/docker.sock
```

---

## 8. Configurar Render

### Paso 1: Crear cuenta en Render

1. Ve a: https://render.com
2. Crea una cuenta gratuita
3. Conecta tu cuenta de GitHub

### Paso 2: Crear base de datos PostgreSQL

1. Dashboard → **"New +"** → **"PostgreSQL"**
2. Name: `postgres-activos`
3. Database: `activos_db`
4. User: `postgres`
5. Plan: **Free**
6. Click en **"Create Database"**

### Paso 3: Configurar MongoDB Atlas

1. Ve a: https://www.mongodb.com/cloud/atlas
2. Crea cuenta y cluster **FREE** (M0)
3. Database Access → **Add New Database User**
   - Username: `admin`
   - Password: `<genera-password-seguro>`
4. Network Access → **Add IP Address** → **"Allow Access from Anywhere"** (0.0.0.0/0)
5. Clusters → **Connect** → **Connect your application**
6. Copia el connection string:
   ```
   mongodb+srv://admin:<password>@cluster0.xxxxx.mongodb.net/mantenimientos_db
   ```

### Paso 4: Crear Blueprint en Render

1. Dashboard → **"New +"** → **"Blueprint"**
2. Conecta tu repositorio de GitHub
3. Render detectará automáticamente el `render.yaml`
4. Configura las variables de entorno faltantes:
   - `MONGO_URI`: (pegar el connection string de MongoDB Atlas)
5. Click en **"Create Services"**

### Paso 5: Obtener Git URL de Render

1. Ve a cualquier servicio → **Settings** → **Git**
2. Copia la **Render Git Repository URL**
   - Ejemplo: `https://git.render.com/srv-xxxxxxxxxxxxx`
3. Guarda esta URL como credencial `render-git-url` en Jenkins (ver sección 4.2)

---

## 9. Flujo CI/CD Completo

```
┌──────────────┐
│   Developer  │
│   git push   │
└──────┬───────┘
       │
       ▼
┌─────────────────────────────────────┐
│         GitHub Repository           │
│      (tu-usuario/tu-repo)           │
└──────┬──────────────────────────────┘
       │
       │ (webhook o poll)
       ▼
┌─────────────────────────────────────┐
│           Jenkins CI                │
│  ┌───────────────────────────────┐  │
│  │ 1. Checkout código            │  │
│  │ 2. Install dependencies       │  │
│  │ 3. Run tests                  │  │
│  │ 4. Build Docker images        │  │
│  │ 5. Git push a Render repo     │  │
│  └───────────────────────────────┘  │
└──────┬──────────────────────────────┘
       │
       │ (git push)
       ▼
┌─────────────────────────────────────┐
│        Render Platform              │
│  ┌───────────────────────────────┐  │
│  │ 1. Detecta cambios en Git     │  │
│  │ 2. Build servicios            │  │
│  │ 3. Deploy automático          │  │
│  │ 4. Servicios en producción    │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
       │
       ▼
    ✅ Aplicación en producción
       https://tu-app.onrender.com
```

---

## 10. Variables de Entorno Importantes

### En Jenkins (configurar como credentials)

| Credencial ID        | Tipo                    | Uso                               |
| -------------------- | ----------------------- | --------------------------------- |
| `github-credentials` | Username/Password o SSH | Acceso al repositorio             |
| `render-git-url`     | Secret Text             | URL del repositorio Git de Render |

### En Render Dashboard

| Variable              | Servicio                | Ejemplo                  |
| --------------------- | ----------------------- | ------------------------ |
| `MONGO_URI`           | servicio-mantenimientos | `mongodb+srv://...`      |
| `NEXT_PUBLIC_API_URL` | frontend                | Auto-generado por Render |

---

## 11. Comandos Útiles

```bash
# Ver logs de Jenkins
docker logs -f jenkins

# Reiniciar Jenkins
docker restart jenkins

# Acceder al container de Jenkins
docker exec -it jenkins bash

# Ver contraseña inicial
docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword

# Backup de Jenkins home
docker run --rm \
  -v jenkins-home-data:/data \
  -v $(pwd):/backup \
  alpine tar czf /backup/jenkins-backup.tar.gz /data

# Restore de Jenkins home
docker run --rm \
  -v jenkins-home-data:/data \
  -v $(pwd):/backup \
  alpine tar xzf /backup/jenkins-backup.tar.gz -C /
```

---

## 12. Tips y Mejores Prácticas

### Seguridad

- ✅ Usa SSH keys en lugar de passwords cuando sea posible
- ✅ Rota los tokens de acceso regularmente
- ✅ No hagas commit de credenciales en el código
- ✅ Usa secrets de Jenkins para variables sensibles

### Performance

- ✅ Usa stages paralelos cuando sea posible (ya implementado)
- ✅ Habilita caching de node_modules
- ✅ Limita el número de builds antiguos a conservar

### Monitoring

- ✅ Revisa logs de Console Output regularmente
- ✅ Configura notificaciones (Slack, email)
- ✅ Monitorea el health check de Render

---

## 13. Recursos Adicionales

- 📖 [Jenkins Documentation](https://www.jenkins.io/doc/)
- 📖 [Render Documentation](https://render.com/docs)
- 📖 [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- 🎥 [Jenkins Pipeline Tutorial](https://www.jenkins.io/doc/book/pipeline/)

---

## Soporte

Si tienes problemas, revisa:

1. Console Output del build en Jenkins
2. Logs del servicio en Render Dashboard
3. Este documento en la sección de solución de problemas

¿Todo funcionando? ¡Felicidades! 🎉 Ahora tienes un pipeline CI/CD completo.
