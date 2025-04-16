import React, { useState } from 'react';
import Topbar from '../components/Layout/Topbar';
import WeatherSection from '../components/Dashboard/WeatherSection';
import SeismicCard from '../components/Dashboard/SeismicCard';
import styles from './DashboardView.module.css';

function DashboardView() {
  const [selectedCanton, setSelectedCanton] = useState('Liberia');

  return (
    <div className={styles.dashboardView}>
      <Topbar 
        selectedCanton={selectedCanton} 
        setSelectedCanton={setSelectedCanton} 
      />
      <div className={styles.cardsContainer}>
        <WeatherSection canton={selectedCanton} />
        <SeismicCard canton={selectedCanton} />
      </div>
    </div>
  );
}

export default DashboardView;
