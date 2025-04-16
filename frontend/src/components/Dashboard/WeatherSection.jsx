import React, { useEffect, useState, useCallback } from 'react';
import Loader from '../Loader';
import MainWeatherCard from './MainWeatherCard';
import AverageTempCard from './AverageTempCard';
import UvIndexCard from './UvIndexCard';
import HumidityCard from './HumidityCard';
import styles from './WeatherSection.module.css';

function WeatherSection({ canton }) {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const API_BASE_URL = 'http://127.0.0.1:5000/api';

  const fetchWeather = useCallback(() => {
    setLoading(true);
    setError(null);

    fetch(`${API_BASE_URL}/weather?city=${canton}&country=CR`)
      .then(response => response.json())
      .then(data => {
        // data = { temperatura, humedad, uv_index, avg_temp, descripcion, velocidad_viento, ... }
        setWeatherData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error obteniendo clima:', err);
        setError('No se pudo cargar la información del clima.');
        setLoading(false);
      });
  }, [API_BASE_URL, canton]);

  useEffect(() => {
    fetchWeather();
    const intervalId = setInterval(fetchWeather, 60000);
    return () => clearInterval(intervalId);
  }, [fetchWeather]);

  if (loading) {
    return (
      <div className={styles.loaderContainer}>
        <Loader color="#007bff" size={50} />
      </div>
    );
  }

  if (error) {
    return <p className={styles.error}>{error}</p>;
  }

  if (!weatherData) {
    return <p className={styles.error}>No hay datos de clima disponibles.</p>;
  }

  return (
    <div className={styles.weatherSection}>
      {/* Mostramos las tarjetas independientes */}
      <MainWeatherCard weather={weatherData} canton={canton} />
      <AverageTempCard avgTemp={weatherData.avg_temp} currentTemp={weatherData.temperatura} />
      <UvIndexCard uvIndex={weatherData.uv_index} />
      <HumidityCard humidity={weatherData.humedad} />
    </div>
  );
}

export default WeatherSection;
