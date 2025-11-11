# Imagen base de Node.js
FROM node:20-alpine

# Crear directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el código de la aplicación
COPY . .

# ARG: Recibe el valor desde docker-compose o usa el valor por defecto (Railway)
# Usar directamente el servicio de activos para evitar problemas de redirect
ARG NEXT_PUBLIC_API_URL=https://servicio-activos-production.up.railway.app

# Variables de entorno
ENV NODE_ENV=production
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}




ENV PORT=3003

# Construir la aplicación
RUN npm run build

# Exponer el puerto
EXPOSE 3003

# Comando para iniciar la aplicación
CMD ["npm", "start"]
