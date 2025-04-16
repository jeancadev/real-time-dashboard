import requests

def get_seismic_data(min_magnitude=3.5, limit=10, latitude=10.63, longitude=-85.44, maxradiuskm=200):
    url = "https://earthquake.usgs.gov/fdsnws/event/1/query"
    params = {
        "format": "geojson",
        "minmagnitude": min_magnitude,
        "limit": limit,
        "latitude": latitude,
        "longitude": longitude,
        "maxradiuskm": maxradiuskm
    }
    response = requests.get(url, params=params)
    if response.status_code == 200:
        return response.json()
    else:
        response.raise_for_status()
