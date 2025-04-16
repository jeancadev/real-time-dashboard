import requests
from app.core.config import OPENWEATHER_API_KEY, OPENWEATHER_BASE_URL, UNITS

def get_weather(city, country):
    params = {
        "q": f"{city},{country}",
        "appid": OPENWEATHER_API_KEY,
        "units": UNITS
    }
    response = requests.get(OPENWEATHER_BASE_URL, params=params)
    response.raise_for_status()
    return response.json()
