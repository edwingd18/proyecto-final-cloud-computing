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

# Variables de entorno
ENV NODE_ENV=production
ENV NEXT_PUBLIC_API_URL=http://localhost:3000/api




ENV PORT=3003

# Construir la aplicación
RUN npm run build

# Exponer el puerto
EXPOSE 3003

# Comando para iniciar la aplicación
CMD ["npm", "start"]
