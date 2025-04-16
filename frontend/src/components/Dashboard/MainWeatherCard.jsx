import React, { useEffect, useState } from 'react';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { FaTemperatureHigh, FaWind } from 'react-icons/fa';
import styles from './MainWeatherCard.module.css';

function MainWeatherCard({ weather, canton }) {
  const [weatherHistory, setWeatherHistory] = useState([]);

  useEffect(() => {
    // Cuando cambie el clima, agregam un registro al historial
    if (weather && weather.temperatura != null) {
      setWeatherHistory(prev => [
        ...prev,
        { time: new Date().toLocaleTimeString(), temp: weather.temperatura }
      ]);
    }
  }, [weather]);

  return (
    <div className={styles.card}>
      <div className={styles.title}>Weather in {canton}</div>
      <div className={styles.row}>
        <FaTemperatureHigh size={20} />
        <span>{weather.temperatura}°C</span>
      </div>
      <div className={styles.row}>
        <FaWind size={20} />
        <span>{weather.velocidad_viento} m/s</span>
      </div>
      <p className={styles.desc}>{weather.descripcion}</p>

      {/* Historial gráfico */}
      {weatherHistory.length > 0 && (
        <div className={styles.chartContainer}>
          <LineChart width={300} height={150} data={weatherHistory}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" hide />
            <YAxis hide />
            <Tooltip
              contentStyle={{ backgroundColor: '#333', color: '#fff' }}
              labelStyle={{ color: '#fff' }}
              itemStyle={{ color: '#fff' }}
            />
            <Legend />
            <Line type="monotone" dataKey="temp" stroke="#ff7300" name="Temp" />
          </LineChart>
        </div>
      )}
    </div>
  );
}

export default MainWeatherCard;
