# Usar una imagen base de Python (elige una versión estable)
FROM python:3.13-slim

# Establecer el directorio de trabajo en la imagen
WORKDIR /app

# Copiar el archivo requirements.txt y luego instalar las dependencias
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copiar el resto del código de la aplicación
COPY . .

# Exponer el puerto en el que corre Flask (por defecto 5000)
EXPOSE 5000

# Configurar variables de entorno necesarias para producción
ENV FLASK_APP="app"
ENV FLASK_ENV="production"

# Comando para iniciar la aplicación usando flask
CMD ["flask", "run", "--host=0.0.0.0"]
