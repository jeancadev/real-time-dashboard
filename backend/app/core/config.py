import os

OPENWEATHER_API_KEY = os.environ.get('OPENWEATHER_API_KEY', 'fd17340b9139c6e35b3e4561824d81aa')
OPENWEATHER_BASE_URL = "https://api.openweathermap.org/data/2.5/weather"
DEFAULT_CITY = os.environ.get('DEFAULT_CITY', 'Liberia')
DEFAULT_COUNTRY = os.environ.get('DEFAULT_COUNTRY', 'CR')
UNITS = os.environ.get('UNITS', 'metric')

basedir = os.path.abspath(os.path.dirname(__file__))
SECRET_KEY = os.environ.get('SECRET_KEY', 'CLAVE_SECRETA_1234')
SQLALCHEMY_DATABASE_URI = 'sqlite:///' + os.path.join(basedir, '..', '..', 'instance', 'app.db')
SQLALCHEMY_TRACK_MODIFICATIONS = False
