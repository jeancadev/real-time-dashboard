# backend/app/main.py
from app import create_app
from app.models.data_models import db
from apscheduler.schedulers.background import BackgroundScheduler
from app.scheduler import insert_weather_record

app = create_app()
db.init_app(app)

if __name__ == '__main__':
    with app.app_context():
        db.create_all()  # Crea todas las tablas si no existen

    # Configurar el scheduler para ejecutar la función cada 60 segundos
    scheduler = BackgroundScheduler()
    # Usamos lambda para pasar el objeto app y garantizar que tenga el contexto
    scheduler.add_job(func=lambda: insert_weather_record(app), trigger="interval", seconds=60)
    scheduler.start()
    print("Scheduler started. Running app...")
    try:
        app.run(debug=True)
    except (KeyboardInterrupt, SystemExit):
        scheduler.shutdown()
