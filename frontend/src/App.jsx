import React, { useState, useEffect } from 'react';
import Sidebar from './components/Layout/Sidebar';
import DashboardView from './views/DashboardView';
import UsersView from './views/UsersView';
import DatabaseView from './views/DatabaseView';
import styles from './App.module.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { io } from 'socket.io-client';
import { toast } from 'react-toastify';

function App() {
  const [selectedSection, setSelectedSection] = useState('dashboard');

  // Configurar Socket.IO para recibir actualizaciones en tiempo real
  useEffect(() => {
    // Conectar al servidor Socket.IO
    const socket = io('http://localhost:5000', {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    // Eventos de conexión
    socket.on('connect', () => {
      console.log('Conectado al servidor WebSocket');
    });

    socket.on('disconnect', () => {
      console.log('Desconectado del servidor WebSocket');
    });

    socket.on('connect_error', (error) => {
      console.error('Error de conexión WebSocket:', error);
    });

    // Escuchar actualizaciones de clima
    socket.on('weather_update', (data) => {
      console.log('Recibida actualización de clima:', data);
      // Actualiza el estado de la aplicación con los nuevos datos
      toast.info(`Datos del clima actualizados para ${data.city}`);
    });

    // Escuchar actualizaciones de base de datos
    socket.on('database_update', (data) => {
      console.log('Recibida actualización de base de datos:', data);
      // Actualizar UI según el tipo de actualización
      const { record_type, action } = data;
      
      if (action === 'create') {
        toast.success(`Nuevo registro de ${record_type} creado`);
      } else if (action === 'delete') {
        toast.info(`Registro de ${record_type} eliminado`);
      } else if (action === 'update') {
        toast.info(`Datos de ${record_type} actualizados`);
      }
    });

    // Limpiar conexión al desmontar
    return () => {
      socket.disconnect();
    };
  }, []);

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
