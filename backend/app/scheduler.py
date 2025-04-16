import random
import datetime
import json
from app.models.data_models import db, User, Record

def is_similar(new_data, last_data, temp_threshold=1.0, humedad_threshold=5):
    """
    Compara dos conjuntos de datos de clima.
    Devuelve True si la diferencia en temperatura y humedad está por debajo de los umbrales definidos.
    """
    try:
        # Convertir ambos a flotantes
        new_temp = float(new_data.get("temperatura", 0))
        last_temp = float(last_data.get("temperatura", new_temp))
        new_humedad = float(new_data.get("humedad", 0))
        last_humedad = float(last_data.get("humedad", new_humedad))
        temp_diff = abs(new_temp - last_temp)
        humedad_diff = abs(new_humedad - last_humedad)
        # Si ambas diferencias son menores a los umbrales, considera que son similares
        return temp_diff < temp_threshold and humedad_diff < humedad_threshold
    except Exception as e:
        # Si ocurre algún problema en la comparación, forza que se inserte un nuevo registro
        return False

def insert_weather_record(app):
    with app.app_context():
        users = User.query.all()
        print(f"[{datetime.datetime.utcnow()}] Scheduler running. Users found:", [u.id for u in users])
        
        for user in users:
            # Simular datos del clima
            weather_data = {
                "temperatura": round(random.uniform(20, 30), 1),
                "humedad": random.randint(40, 80),
                "uv_index": round(random.uniform(0, 10), 1),
                "avg_temp": round(random.uniform(20, 30), 1),
                "descripcion": random.choice(["clear sky", "few clouds", "overcast", "rain"]),
                "velocidad_viento": round(random.uniform(0.5, 5), 1)
            }

            # Consultar el último registro del usuario del tipo 'weather'
            last_record = Record.query.filter_by(user_id=user.id, record_type="weather")\
                                        .order_by(Record.timestamp.desc()).first()

            if last_record:
                try:
                    # Convertir el campo data a dict
                    last_data = json.loads(last_record.data)
                except Exception as e:
                    last_data = {}
            else:
                last_data = None

            # Si existe un registro previo y los datos nuevos son similares, saltar inserción
            if last_data and is_similar(weather_data, last_data):
                print(f"[{datetime.datetime.utcnow()}] Data for user {user.id} is similar. Skipping insertion.")
                continue

            # Insertar nuevo registro
            new_record = Record(
                record_type="weather",
                data=json.dumps(weather_data),  # Es preferible almacenar como JSON
                user_id=user.id,
                timestamp=datetime.datetime.utcnow()
            )
            db.session.add(new_record)
        
        try:
            db.session.commit()
            print(f"[{datetime.datetime.utcnow()}] Weather records inserted for {len(users)} users (if data varied).")
        except Exception as e:
            db.session.rollback()
            print("Error inserting weather records:", e)
