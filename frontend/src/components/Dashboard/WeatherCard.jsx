import React, { useEffect, useState, useCallback } from 'react';
import Loader from '../Loader';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FaTemperatureHigh, FaWind } from 'react-icons/fa';
import { WiHumidity, WiDaySunny, WiDaySunnyOvercast, WiNightClear, WiCloudy, WiRain, WiThunderstorm, WiSnow } from 'react-icons/wi';
import styles from './WeatherCard.module.css';

function WeatherCard({ canton }) {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [weatherHistory, setWeatherHistory] = useState([]);
  const API_BASE_URL = 'http://127.0.0.1:5000/api';

  // Simular datos históricos al inicializar
  useEffect(() => {
    if (weather && weather.temperatura) {
      const historyData = generateHistoricalData(weather.temperatura);
      setWeatherHistory(historyData);
    }
  }, [weather?.temperatura]);

  // Función para determinar si es de día o de noche
  const isNightTime = () => {
    const currentHour = new Date().getHours();
    return currentHour < 6 || currentHour >= 18; // Considera noche de 6pm a 6am
  };

  // Función para determinar el icono según el clima y hora
  const getWeatherIcon = (description) => {
    const isNight = isNightTime();
    const lowerDesc = description ? description.toLowerCase() : '';
    
    // Seleccionar icono según la descripción y la hora del día
    if (isNight) {
      // Iconos nocturnos
      if (lowerDesc.includes('clear') || lowerDesc.includes('despejado')) {
        return <WiNightClear size={50} className={styles.weatherIcon} />;
      } else {
        // Por defecto, mostrar icono de luna para la noche con nubes u otras condiciones
        return <WiNightClear size={50} className={styles.weatherIcon} />;
      }
    } else {
      // Iconos diurnos
      if (lowerDesc.includes('clear') || lowerDesc.includes('despejado')) {
        return <WiDaySunny size={50} className={styles.weatherIcon} />;
      } else if (lowerDesc.includes('cloud') || lowerDesc.includes('nubes') || lowerDesc.includes('nublado')) {
        return <WiDaySunnyOvercast size={50} className={styles.weatherIcon} />;
      } else if (lowerDesc.includes('rain') || lowerDesc.includes('lluvia')) {
        return <WiRain size={50} className={styles.weatherIcon} />;
      } else if (lowerDesc.includes('thunder') || lowerDesc.includes('storm') || lowerDesc.includes('tormenta')) {
        return <WiThunderstorm size={50} className={styles.weatherIcon} />;
      } else if (lowerDesc.includes('snow') || lowerDesc.includes('nieve')) {
        return <WiSnow size={50} className={styles.weatherIcon} />;
      } else {
        // Por defecto, sol con nubes
        return <WiDaySunnyOvercast size={50} className={styles.weatherIcon} />;
      }
    }
  };

  // Generar datos históricos realistas con fluctuaciones
  const generateHistoricalData = (baseTemp) => {
    const data = [];
    const now = new Date();
    const hoursToSimulate = 24;
    
    for (let i = hoursToSimulate - 1; i >= 0; i--) {
      const timePoint = new Date(now);
      timePoint.setHours(now.getHours() - i);
      
      // Simulación realista de temperatura según la hora del día
      let hourFactor = timePoint.getHours();
      let tempVariation;
      
      if (hourFactor >= 6 && hourFactor < 12) {
        // Mañana: temperatura aumentando gradualmente
        tempVariation = (hourFactor - 6) * 1.2;
      } else if (hourFactor >= 12 && hourFactor < 15) {
        // Mediodía: temperatura máxima
        tempVariation = 7 + (Math.random() * 3 - 1.5);
      } else if (hourFactor >= 15 && hourFactor < 20) {
        // Tarde: temperatura disminuyendo gradualmente
        tempVariation = 7 - ((hourFactor - 15) * 1.1);
      } else {
        // Noche: temperatura mínima
        tempVariation = -3 + (Math.random() * 2.5 - 1.25);
      }
      
      const simulatedTemp = Math.round((baseTemp + tempVariation) * 10) / 10;
      
      data.push({
        time: timePoint.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        temp: simulatedTemp
      });
    }
    
    return data;
  };

  const fetchWeather = useCallback(() => {
    setLoading(true);
    fetch(`${API_BASE_URL}/weather?city=${canton}&country=CR`)
      .then(response => response.json())
      .then(data => {
        // Se asume que el API devuelve: temperatura, humedad, uv_index, avg_temp, descripción, velocidad_viento, icono
        setWeather(data);
        setLoading(false);
        
        // Actualizar el último valor de la temperatura
        if (weatherHistory.length > 0) {
          const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          // Añadir fluctuación aleatoria para simular cambios en tiempo real
          const randomFluctuation = (Math.random() * 2) - 1; // Entre -1 y +1 grado
          const newTemp = Math.round((data.temperatura + randomFluctuation) * 10) / 10;
          
          const updatedHistory = [...weatherHistory];
          if (updatedHistory.length >= 24) {
            updatedHistory.shift(); // Mantener solo las últimas 24 horas
          }
          updatedHistory.push({ time: currentTime, temp: newTemp });
          
          setWeatherHistory(updatedHistory);
        }
      })
      .catch(err => {
        console.error('Error obteniendo clima:', err);
        setLoading(false);
      });
  }, [API_BASE_URL, canton, weatherHistory]);

  useEffect(() => {
    fetchWeather();
    const intervalId = setInterval(fetchWeather, 30000);
    return () => clearInterval(intervalId);
  }, [fetchWeather]);

  return (
    <div className={styles.card}>
      <div className={styles.cardTitle}>Weather in {canton}</div>
      {loading ? (
        <Loader color="#007bff" size={50} />
      ) : weather ? (
        <div className={styles.weatherInfo}>
          <div className={styles.weatherHeader}>
            {getWeatherIcon(weather.descripcion)}
            <div className={styles.weatherMain}>
              <div className={styles.dataRow}>
                <FaTemperatureHigh size={20} /> <span>{weather.temperatura}°C</span>
              </div>
              <div className={styles.dataRow}>
                <FaWind size={20} /> <span>{weather.velocidad_viento} m/s</span>
              </div>
              <div className={styles.weatherDesc}>
                {weather.descripcion}
              </div>
            </div>
          </div>
          
          <div className={styles.dataRow}>
            <span className={styles.label}>Average Temp:</span>
            <span>{weather.avg_temp ? weather.avg_temp + '°C' : weather.temperatura + '°C'}</span>
          </div>
          <div className={styles.dataRow}>
            <WiHumidity size={20} /> <span>{weather.humedad}%</span>
          </div>
          <div className={styles.dataRow}>
            <WiDaySunny size={20} /> <span>UV Index: {weather.uv_index || 'N/A'}</span>
          </div>
        </div>
      ) : (
        <p>No se pudo cargar la información del clima.</p>
      )}

      {/* Historial: gráfico de línea */}
      {weatherHistory.length > 0 && (
        <div className={styles.chartContainer}>
          <ResponsiveContainer width="100%" height={150}>
            <LineChart data={weatherHistory}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="time" 
                tick={{ fontSize: 10 }}
                interval="preserveStartEnd"
              />
              <YAxis 
                domain={['dataMin - 2', 'dataMax + 2']}
                tick={{ fontSize: 10 }}
              />
              <Tooltip
                contentStyle={{ backgroundColor: '#333', color: '#fff' }}
                labelStyle={{ color: '#fff' }}
                itemStyle={{ color: '#fff' }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="temp" 
                stroke="#ff7300" 
                name="Temp °C" 
                dot={false}
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

export default WeatherCard;
