import React from 'react';
import { FaTachometerAlt, FaUser, FaDatabase } from 'react-icons/fa';
import styles from './Sidebar.module.css';

function Sidebar({ selectedSection, setSelectedSection }) {
  return (
    <div className={styles.sidebar}>
      <div className={styles.logo}>
        <h2>Admin Panel</h2>
      </div>
      <ul className={styles.navLinks}>
        <li>
          <button 
            className={`${styles.navButton} ${selectedSection === 'dashboard' ? styles.active : ''}`}
            onClick={() => setSelectedSection('dashboard')}
          >
            <FaTachometerAlt size={18} />
            <span>Dashboard</span>
          </button>
        </li>
        <li>
          <button 
            className={`${styles.navButton} ${selectedSection === 'users' ? styles.active : ''}`}
            onClick={() => setSelectedSection('users')}
          >
            <FaUser size={18} />
            <span>Users</span>
          </button>
        </li>
        <li>
          <button 
            className={`${styles.navButton} ${selectedSection === 'database' ? styles.active : ''}`}
            onClick={() => setSelectedSection('database')}
          >
            <FaDatabase size={18} />
            <span>Database</span>
          </button>
        </li>
      </ul>
    </div>
  );
}

export default Sidebar;
