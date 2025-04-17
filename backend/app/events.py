"""
Módulo para manejar eventos y notificaciones en tiempo real
"""

# La instancia de SocketIO se establecerá después desde __init__.py
# Usamos esta variable para evitar importación circular
socketio = None

def setup_socketio(socketio_instance):
    """Configura la instancia global de socketio"""
    global socketio
    socketio = socketio_instance

def notify_weather_update(data):
    """Emite una actualización de clima a todos los clientes conectados"""
    if socketio:
        socketio.emit('weather_update', data)

def notify_database_change(record_type, action, data):
    """Emite una actualización de la base de datos a todos los clientes conectados
    
    Parameters:
    - record_type: El tipo de registro (weather, seismic, etc.)
    - action: La acción realizada (create, update, delete)
    - data: Los datos asociados con la acción
    """
    if socketio:
        socketio.emit('database_update', {
            'record_type': record_type,
            'action': action,
            'data': data
        })

# Eventos de Socket.IO (se configurarán cuando socketio esté disponible)
def register_socketio_events(socketio_instance):
    """Registra los eventos de SocketIO"""
    
    @socketio_instance.on('connect')
    def handle_connect():
        print('Cliente conectado a SocketIO')

    @socketio_instance.on('disconnect')
    def handle_disconnect():
        print('Cliente desconectado de SocketIO') 