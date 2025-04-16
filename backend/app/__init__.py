from flask import Flask
from flask_cors import CORS
from app.models.data_models import db
from app.api.routes import api_bp    # Endpoints para clima y sismos
from app.api.users import users_bp
from app.api.database import database_bp
import os
from apscheduler.schedulers.background import BackgroundScheduler
from app.scheduler import insert_weather_record
from dotenv import load_dotenv
load_dotenv()

def create_app():
    app = Flask(__name__)
    CORS(app)
    app.config.from_object('app.core.config')
    
    # Inicializar la base de datos con la app
    db.init_app(app)
    
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
