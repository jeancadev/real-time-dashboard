import React, { useEffect, useState } from 'react';
import { WiHumidity } from 'react-icons/wi';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import styles from './HumidityCard.module.css';

function HumidityCard({ humidity }) {
  const effectiveHumidity = (humidity !== undefined && humidity !== null) ? humidity : 50;
  
  const [humHistory, setHumHistory] = useState([]);
  const [trend, setTrend] = useState('Stable');

  useEffect(() => {
    // Generar datos históricos al iniciar el componente
    const initialData = generateInitialHistoricalData(effectiveHumidity);
    setHumHistory(initialData);
  }, []);

  // Generar datos históricos realistas para simular fluctuaciones a lo largo del día
  const generateInitialHistoricalData = (baseHumidity) => {
    const data = [];
    const now = new Date();
    const hoursToSimulate = 24;
    
    for (let i = hoursToSimulate - 1; i >= 0; i--) {
      const timePoint = new Date(now);
      timePoint.setHours(now.getHours() - i);
      
      // Simulación realista de humedad según la hora del día
      let hourFactor = timePoint.getHours();
      let humVariation;
      
      if (hourFactor >= 5 && hourFactor < 9) {
        // Amanecer: humedad alta
        humVariation = 15 + (Math.random() * 8 - 4);
      } else if (hourFactor >= 9 && hourFactor < 16) {
        // Día: humedad disminuye
        humVariation = -10 + ((hourFactor - 9) * -0.8) + (Math.random() * 6 - 3);
      } else if (hourFactor >= 16 && hourFactor < 20) {
        // Tarde: humedad comienza a subir nuevamente
        humVariation = -5 + ((hourFactor - 16) * 2) + (Math.random() * 5 - 2.5);
      } else {
        // Noche: humedad más alta
        humVariation = 10 + (Math.random() * 7 - 3.5);
      }
      
      // Asegurar que la humedad esté en el rango de 0-100%
      let simulatedHum = Math.round(baseHumidity + humVariation);
      simulatedHum = Math.max(0, Math.min(simulatedHum, 100));
      
      data.push({
        time: timePoint.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        value: simulatedHum
      });
    }
    
    return data;
  };

  const simulateHumFluctuation = (currentVal) => {
    // Fluctuaciones más significativas entre -8 y +8
    const fluctuation = Math.floor(Math.random() * 17) - 8; 
    let newVal = currentVal + fluctuation;
    newVal = Math.max(0, Math.min(newVal, 100)); // Limitar entre 0 y 100
    return newVal;
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const lastValue = humHistory.length > 0 ? humHistory[humHistory.length - 1].value : effectiveHumidity;
      const newValue = simulateHumFluctuation(lastValue);
      
      // Mantener solo las últimas 24 horas de datos
      const updatedHistory = [...humHistory, { time: timeStr, value: newValue }];
      if (updatedHistory.length > 24) {
        updatedHistory.shift();
      }
      
      setHumHistory(updatedHistory);
    }, 60000);
    return () => clearInterval(interval);
  }, [effectiveHumidity, humHistory]);

  useEffect(() => {
    if (humHistory.length > 1) {
      const lastVal = humHistory[humHistory.length - 1].value;
      const prevVal = humHistory[humHistory.length - 2].value;
      if (lastVal > prevVal) setTrend('Increasing');
      else if (lastVal < prevVal) setTrend('Decreasing');
      else setTrend('Stable');
    }
  }, [humHistory]);

  return (
    <div className={styles.card}>
      <div className={styles.title}>
        <WiHumidity size={24} />
        <span>Humidity</span>
      </div>
      <div className={styles.value}>
        {effectiveHumidity}%
      </div>
      <p className={`${styles.trend} ${trend === 'Increasing' ? styles.increasing : trend === 'Decreasing' ? styles.decreasing : ''}`}>
        {trend}
      </p>
      <div className={styles.chartContainer}>
        <ResponsiveContainer width="100%" height={80}>
          <LineChart data={humHistory}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="time" 
              tick={{ fontSize: 10 }}
              tickFormatter={(tick) => tick}
              interval="preserveStartEnd"
            />
            <YAxis 
              domain={[0, 100]}
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
              stroke="#00adb5" 
              dot={false} 
              strokeWidth={2} 
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default HumidityCard;
