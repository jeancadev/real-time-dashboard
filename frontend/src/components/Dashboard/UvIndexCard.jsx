import React, { useEffect, useState } from 'react';
import { WiDaySunny } from 'react-icons/wi';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import styles from './UvIndexCard.module.css';

function UvIndexCard({ uvIndex }) {
  // Si uvIndex es indefinido, usar 5 por defecto
  const effectiveUvIndex = (uvIndex !== undefined && uvIndex !== null) ? uvIndex : 5;

  // Estado para el historial y la tendencia
  const [uvHistory, setUvHistory] = useState([]);
  const [trend, setTrend] = useState('Stable');

  useEffect(() => {
    // Generar datos históricos al iniciar el componente
    const initialData = generateInitialHistoricalData(effectiveUvIndex);
    setUvHistory(initialData);
  }, []);

  // Generar datos históricos realistas para simular fluctuaciones a lo largo del día
  const generateInitialHistoricalData = (baseUv) => {
    const data = [];
    const now = new Date();
    const hoursToSimulate = 24;
    
    for (let i = hoursToSimulate - 1; i >= 0; i--) {
      const timePoint = new Date(now);
      timePoint.setHours(now.getHours() - i);
      
      // Simulación realista de UV según la hora del día
      let hourFactor = timePoint.getHours();
      let uvVariation;
      
      if (hourFactor >= 5 && hourFactor < 8) {
        // Amanecer: UV comienza a aumentar
        uvVariation = ((hourFactor - 5) * 0.8) - 2;
      } else if (hourFactor >= 8 && hourFactor < 12) {
        // Mañana: UV sigue aumentando
        uvVariation = ((hourFactor - 8) * 0.9);
      } else if (hourFactor >= 12 && hourFactor < 16) {
        // Mediodía: UV máximo
        uvVariation = 3.5 + (Math.random() * 1 - 0.5);
      } else if (hourFactor >= 16 && hourFactor < 19) {
        // Tarde: UV comienza a disminuir
        uvVariation = 3.5 - ((hourFactor - 16) * 1.5);
      } else {
        // Noche: UV mínimo
        uvVariation = -3 + (Math.random() * 0.6 - 0.3);
      }
      
      // Asegurar que el UV no sea negativo
      let simulatedUv = Math.max(0, parseFloat((baseUv + uvVariation).toFixed(1)));
      
      data.push({
        time: timePoint.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        value: simulatedUv
      });
    }
    
    return data;
  };

  // Función para simular fluctuaciones más significativas
  const simulateUvFluctuation = (currentVal) => {
    const fluctuation = (Math.random() * 1.0) - 0.5; // Un cambio aleatorio entre -0.5 y +0.5
    return Math.max(0, parseFloat((currentVal + fluctuation).toFixed(1))); // UV nunca negativo
  };

  // Actualizar el historial periódicamente
  useEffect(() => {
    const interval = setInterval(() => {
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const lastValue = uvHistory.length > 0 ? uvHistory[uvHistory.length - 1].value : effectiveUvIndex;
      const newValue = simulateUvFluctuation(lastValue);
      
      // Mantener solo las últimas 24 horas de datos
      const updatedHistory = [...uvHistory, { time: timeStr, value: newValue }];
      if (updatedHistory.length > 24) {
        updatedHistory.shift();
      }
      
      setUvHistory(updatedHistory);
    }, 60000);
    return () => clearInterval(interval);
  }, [effectiveUvIndex, uvHistory]);

  // Calcular la tendencia comparando el último valor con el penúltimo
  useEffect(() => {
    if (uvHistory.length > 1) {
      const lastVal = uvHistory[uvHistory.length - 1].value;
      const prevVal = uvHistory[uvHistory.length - 2].value;
      if (lastVal > prevVal) setTrend('Increasing');
      else if (lastVal < prevVal) setTrend('Decreasing');
      else setTrend('Stable');
    }
  }, [uvHistory]);

  return (
    <div className={styles.card}>
      <div className={styles.title}>
        <WiDaySunny size={24} />
        <span>UV Index</span>
      </div>
      <div className={styles.value}>
        {effectiveUvIndex}
      </div>
      <p className={`${styles.trend} ${trend === 'Increasing' ? styles.increasing : trend === 'Decreasing' ? styles.decreasing : ''}`}>
        {trend}
      </p>
      <div className={styles.chartContainer}>
        <ResponsiveContainer width="100%" height={80}>
          <LineChart data={uvHistory}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="time" 
              tick={{ fontSize: 10 }}
              tickFormatter={(tick) => tick}
              interval="preserveStartEnd"
            />
            <YAxis 
              domain={[0, 'dataMax + 1']}
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
              stroke="#7F5AF0" 
              dot={false} 
              strokeWidth={2} 
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default UvIndexCard;
