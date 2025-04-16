import React from 'react';
import CantonSelector from '../CantonSelector';
import CurrentDateTime from '../CurrentDateTime';
import styles from './Topbar.module.css';

function Topbar({ selectedCanton, setSelectedCanton }) {
  return (
    <div className={styles.topbar}>
      <h1 className={styles.title}>Guanacaste Monitoring</h1>
      <div className={styles.topbarRight}>
        <CantonSelector 
          selectedCanton={selectedCanton} 
          setSelectedCanton={setSelectedCanton}
        />
        <CurrentDateTime />
      </div>
    </div>
  );
}

export default Topbar;
