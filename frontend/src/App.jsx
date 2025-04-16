import React, { useState } from 'react';
import Sidebar from './components/Layout/Sidebar';
import DashboardView from './views/DashboardView';
import UsersView from './views/UsersView';
import DatabaseView from './views/DatabaseView';
import styles from './App.module.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const [selectedSection, setSelectedSection] = useState('dashboard');

  return (
    <div className={styles.appContainer}>
      <Sidebar 
        selectedSection={selectedSection} 
        setSelectedSection={setSelectedSection} 
      />
      <div className={styles.mainContent}>
        {selectedSection === 'dashboard' && <DashboardView />}
        {selectedSection === 'users' && <UsersView />}
        {selectedSection === 'database' && <DatabaseView />}
      </div>
      <ToastContainer />
    </div>
  );
}

export default App;
