"""
Script para ejecutar la aplicación en modo desarrollo
"""
from app import create_app, socketio
from app.models.data_models import db

app = create_app()

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    
    print("Iniciando aplicación en modo desarrollo...")
    socketio.run(app, host='0.0.0.0', debug=True) 