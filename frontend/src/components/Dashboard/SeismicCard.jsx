import React, { useEffect, useState, useCallback } from 'react';
import Loader from '../Loader';
import { BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import styles from './SeismicCard.module.css';

function SeismicCard({ canton }) {
  const [seismicData, setSeismicData] = useState([]);
  const [loading, setLoading] = useState(true);
  const API_BASE_URL = 'http://127.0.0.1:5000/api';

  const fetchSeismicData = useCallback(() => {
    setLoading(true);
    // La llamada puede usar parámetros fijos o ajustarse según el cantón si la API lo soporta.
    fetch(`${API_BASE_URL}/seismic`)
      .then(response => response.json())
      .then(data => {
        if (data.features) {
          const events = data.features.map(event => ({
            id: event.id,
            magnitude: event.properties.mag,
            place: event.properties.place,
            time: new Date(event.properties.time).toLocaleTimeString()
          }));
          setSeismicData(events);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Error obteniendo datos sísmicos:', err);
        setLoading(false);
      });
  }, [API_BASE_URL]);

  useEffect(() => {
    fetchSeismicData();
    const intervalId = setInterval(fetchSeismicData, 60000);
    return () => clearInterval(intervalId);
  }, [fetchSeismicData]);

  return (
    <div className={styles.card}>
      <div className={styles.cardTitle}>Recent Earthquakes</div>
      {loading ? (
        <Loader color="#dc3545" size={50} />
      ) : seismicData.length > 0 ? (
        <BarChart width={300} height={150} data={seismicData} margin={{ top: 20, right: 20, left: 20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="place" hide={true} />
          <YAxis hide={true} />
          <Tooltip
            contentStyle={{ backgroundColor: '#333', color: '#fff' }}
            labelStyle={{ color: '#fff' }}
            itemStyle={{ color: '#fff' }}
          />
          <Legend />
          <Bar dataKey="magnitude" fill="#8884d8" name="Magnitude" />
        </BarChart>
      ) : (
        <p>No earthquake data available.</p>
      )}
    </div>
  );
}

export default SeismicCard;
