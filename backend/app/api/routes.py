from flask import Blueprint, jsonify, request
from app.utils.weather_api import get_weather
from app.utils.seismic_api import get_seismic_data
from app.core.config import DEFAULT_CITY, DEFAULT_COUNTRY
from app import cache
from app.events import notify_weather_update, notify_database_change

api_bp = Blueprint('api', __name__)

@api_bp.route('/weather', methods=['GET'])
@cache.cached(timeout=60, query_string=True)  # Caché por 1 minuto
def weather():
    city = request.args.get('city', DEFAULT_CITY)
    country = request.args.get('country', DEFAULT_COUNTRY)
    try:
        weather_data = get_weather(city, country)
        result = {
            "temperatura": weather_data.get("main", {}).get("temp"),
            "humedad": weather_data.get("main", {}).get("humidity"),
            "descripcion": weather_data.get("weather", [{}])[0].get("description"),
            "icono": weather_data.get("weather", [{}])[0].get("icon"),
            "velocidad_viento": weather_data.get("wind", {}).get("speed"),
            # Aquí se forza un valor por defecto para uv_index si no se recibe
            "uv_index": weather_data.get("uv_index", 5.0),
            "avg_temp": weather_data.get("avg_temp", weather_data.get("main", {}).get("temp"))
        }
        
        # Emitir actualización a clientes conectados a través de SocketIO
        notify_weather_update({
            "city": city,
            "country": country,
            "data": result
        })
        
        return jsonify(result)
    except Exception as e:
        print("Error en /weather:", e)
        return jsonify({"error": str(e)}), 500

@api_bp.route('/seismic', methods=['GET'])
@cache.cached(timeout=300, query_string=True)  # Caché por 5 minutos
def seismic():
    min_magnitude = request.args.get('min_magnitude', default=3.5, type=float)
    limit = request.args.get('limit', default=10, type=int)
    latitude = request.args.get('latitude', default=10.63, type=float)
    longitude = request.args.get('longitude', default=-85.44, type=float)
    maxradiuskm = request.args.get('maxradiuskm', default=200, type=float)
    try:
        seismic_data = get_seismic_data(min_magnitude, limit, latitude, longitude, maxradiuskm)
        
        # Emitir actualización sísmica a través de SocketIO
        notify_database_change("seismic", "update", {
            "parameters": {
                "min_magnitude": min_magnitude,
                "maxradiuskm": maxradiuskm
            },
            "count": len(seismic_data)
        })
        
        return jsonify(seismic_data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
