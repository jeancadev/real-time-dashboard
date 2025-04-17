from flask import Flask
from flask_cors import CORS
from flask_socketio import SocketIO
from app.models.data_models import db
import os
from apscheduler.schedulers.background import BackgroundScheduler
from app.scheduler import insert_weather_record
from dotenv import load_dotenv
from prometheus_flask_exporter import PrometheusMetrics
from flask_caching import Cache

load_dotenv()

# Crear la instancia de SocketIO antes de la aplicación
socketio = SocketIO(cors_allowed_origins="*")

# Métricas de Prometheus
metrics = PrometheusMetrics.for_app_factory()

# Configuración de caché
cache = Cache(config={
    'CACHE_TYPE': 'redis' if os.environ.get('REDIS_URL') else 'simple',
    'CACHE_REDIS_URL': os.environ.get('REDIS_URL', 'redis://localhost:6379/0'),
    'CACHE_DEFAULT_TIMEOUT': 300  # 5 minutos
})

def create_app():
    app = Flask(__name__)
    CORS(app)
    app.config.from_object('app.core.config')
    
    # Inicializar caché
    cache.init_app(app)
    
    # Inicializar métricas de Prometheus
    metrics.init_app(app)
    
    # Definir algunas métricas personalizadas
    metrics.info('app_info', 'Application info', version='1.0.0')
    
    # Inicializar SocketIO con la app
    socketio.init_app(app)
    
    # Configurar eventos de SocketIO (importación tardía para evitar importación circular)
    from app import events
    events.setup_socketio(socketio)
    events.register_socketio_events(socketio)
    
    # Inicializar la base de datos con la app
    db.init_app(app)
    
    # Importación tardía de blueprints para evitar importación circular
    from app.api.routes import api_bp    # Endpoints para clima y sismos
    from app.api.users import users_bp
    from app.api.database import database_bp
    
    # Registrar blueprints
    app.register_blueprint(api_bp, url_prefix='/api')
    app.register_blueprint(users_bp, url_prefix='/api/users')
    app.register_blueprint(database_bp, url_prefix='/api/database')
    
    # Solo iniciar el scheduler en el proceso principal,
    # ya que 'WERKZEUG_RUN_MAIN' se establece solo en el proceso hijo que ejecuta la app
    if os.environ.get("WERKZEUG_RUN_MAIN") == "true":
        scheduler = BackgroundScheduler()
        # Uso de lambda para pasar la app y garantizar el contexto adecuado
        scheduler.add_job(func=lambda: insert_weather_record(app), trigger="interval", seconds=60)
        scheduler.start()
        app.config['SCHEDULER'] = scheduler
        print("Scheduler started.")
    
    return app

# Eventos de SocketIO
@socketio.on('connect')
def handle_connect():
    print('Cliente conectado a SocketIO')

@socketio.on('disconnect')
def handle_disconnect():
    print('Cliente desconectado de SocketIO')

# Funciones para emitir eventos
def notify_weather_update(data):
    """Emite una actualización de clima a todos los clientes conectados"""
    socketio.emit('weather_update', data)

def notify_database_change(record_type, action, data):
    """Emite una actualización de la base de datos a todos los clientes conectados
    
    Parameters:
    - record_type: El tipo de registro (weather, seismic, etc.)
    - action: La acción realizada (create, update, delete)
    - data: Los datos asociados con la acción
    """
    socketio.emit('database_update', {
        'record_type': record_type,
        'action': action,
        'data': data
    })
