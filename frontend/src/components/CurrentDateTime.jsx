import React, { useEffect, useState } from 'react';
import styles from './CurrentDateTime.module.css';

function CurrentDateTime() {
  const [dateTime, setDateTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className={styles.currentDateTime}>
      <span>{dateTime.toLocaleDateString()}</span> <span>{dateTime.toLocaleTimeString()}</span>
    </div>
  );
}

export default CurrentDateTime;
