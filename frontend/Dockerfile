# Usar una imagen base de Node.js
FROM node:22-alpine

# Establecer el directorio de trabajo en la imagen
WORKDIR /app

# Copiar package.json y package-lock.json e instalar dependencias
COPY package.json package-lock.json* ./
RUN npm install --production

# Copiar el resto del código de la aplicación React
COPY . .

# Construir la aplicación para producción
RUN npm run build

# Utilizar una imagen base de Nginx para servir la aplicación estática
FROM nginx:1.27-bookworm

# Copiar los archivos build de React al directorio de Nginx
COPY --from=0 /app/build /usr/share/nginx/html

# Exponer el puerto 80 (puedes cambiarlo si es necesario)
EXPOSE 80

# El contenedor se inicia automáticamente usando la imagen base de Nginx
CMD ["nginx", "-g", "daemon off;"]
