FROM jenkins/jenkins:lts-jdk17

USER root

# Instalar Docker CLI y Docker Compose
RUN apt-get update && \
    apt-get install -y \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release && \
    curl -fsSL https://download.docker.com/linux/debian/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg && \
    echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/debian bullseye stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null && \
    apt-get update && \
    apt-get install -y docker-ce-cli docker-compose-plugin && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Dar permisos al socket de Docker al iniciar
RUN echo '#!/bin/bash\nchmod 666 /var/run/docker.sock 2>/dev/null || true\nexec /usr/local/bin/jenkins.sh "$@"' > /usr/local/bin/docker-entrypoint.sh && \
    chmod +x /usr/local/bin/docker-entrypoint.sh

# Cambiar a usuario Jenkins
USER jenkins

# Copiar lista de plugins e instalarlos automáticamente
COPY plugins.txt /usr/share/jenkins/ref/plugins.txt
RUN jenkins-plugin-cli --plugin-file /usr/share/jenkins/ref/plugins.txt

# Configurar JCasC (el archivo se montará desde docker-compose)
ENV CASC_JENKINS_CONFIG=/var/casc_configs/jcasc.yaml

# Desactivar el wizard de setup inicial
ENV JAVA_OPTS="-Djenkins.install.runSetupWizard=false"

USER root
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]