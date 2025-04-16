import React, { useEffect, useState } from 'react';
import { FaThermometerHalf } from 'react-icons/fa';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import styles from './AverageTempCard.module.css';

function AverageTempCard({ avgTemp, currentTemp }) {
  // Usar avgTemp si está definido, de lo contrario currentTemp, o 0 como fallback
  const effectiveTemp = (avgTemp !== undefined && avgTemp !== null) ? avgTemp : (currentTemp !== undefined ? currentTemp : 0);
  
  const [tempHistory, setTempHistory] = useState([]);
  const [trend, setTrend] = useState('Stable');

  useEffect(() => {
    // Generar datos históricos al iniciar el componente
    const initialData = generateInitialHistoricalData(effectiveTemp);
    setTempHistory(initialData);
  }, []);

  // Generar datos históricos realistas para simular fluctuaciones a lo largo del día
  const generateInitialHistoricalData = (baseTemp) => {
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
        tempVariation = (hourFactor - 6) * 0.8;
      } else if (hourFactor >= 12 && hourFactor < 15) {
        // Mediodía: temperatura máxima
        tempVariation = 5 + (Math.random() * 2 - 1);
      } else if (hourFactor >= 15 && hourFactor < 20) {
        // Tarde: temperatura disminuyendo gradualmente
        tempVariation = 5 - ((hourFactor - 15) * 0.7);
      } else {
        // Noche: temperatura mínima
        tempVariation = -2 + (Math.random() * 2 - 1);
      }
      
      const simulatedTemp = parseFloat((baseTemp + tempVariation).toFixed(1));
      
      data.push({
        time: timePoint.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        value: simulatedTemp
      });
    }
    
    return data;
  };

  const simulateTempFluctuation = (currentVal) => {
    // Crear fluctuaciones más significativas (entre -1.5 y +1.5 grados)
    const fluctuation = (Math.random() * 3) - 1.5;
    return parseFloat((currentVal + fluctuation).toFixed(1));
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const lastValue = tempHistory.length > 0 ? tempHistory[tempHistory.length - 1].value : effectiveTemp;
      const newValue = simulateTempFluctuation(lastValue);
      
      // Mantener solo las últimas 24 horas de datos
      const updatedHistory = [...tempHistory, { time: timeStr, value: newValue }];
      if (updatedHistory.length > 24) {
        updatedHistory.shift();
      }
      
      setTempHistory(updatedHistory);
    }, 60000);
    return () => clearInterval(interval);
  }, [effectiveTemp, tempHistory]);

  useEffect(() => {
    if (tempHistory.length > 1) {
      const lastVal = tempHistory[tempHistory.length - 1].value;
      const prevVal = tempHistory[tempHistory.length - 2].value;
      if (lastVal > prevVal) setTrend('Increasing');
      else if (lastVal < prevVal) setTrend('Decreasing');
      else setTrend('Stable');
    }
  }, [tempHistory]);

  return (
    <div className={styles.card}>
      <div className={styles.title}>
        <FaThermometerHalf size={20} />
        <span>Average Temperature</span>
      </div>
      <div className={styles.value}>
        {effectiveTemp}°C
      </div>
      <p className={`${styles.trend} ${trend === 'Increasing' ? styles.increasing : trend === 'Decreasing' ? styles.decreasing : ''}`}>
        {trend}
      </p>
      <div className={styles.chartContainer}>
        <ResponsiveContainer width="100%" height={80}>
          <LineChart data={tempHistory}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="time" 
              tick={{ fontSize: 10 }}
              tickFormatter={(tick) => tick}
              interval="preserveStartEnd"
            />
            <YAxis 
              domain={['dataMin - 1', 'dataMax + 1']}
              tick={{ fontSize: 10 }}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#333', color: '#fff' }} 
              labelStyle={{ color: '#fff' }} 
              itemStyle={{ color: '#fff' }}
            />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke="#ff7300" 
              dot={false} 
              strokeWidth={2} 
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default AverageTempCard;
