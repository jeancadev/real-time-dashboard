import React, { useState, useEffect } from 'react';
import { FaTrash, FaLock } from 'react-icons/fa';
import { toast } from 'react-toastify';
import styles from './DatabaseView.module.css';

function DatabaseView() {
  const [records, setRecords] = useState([]);
  const [message, setMessage] = useState('');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [recordType, setRecordType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [totalPages, setTotalPages] = useState(1);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  const API_BASE_URL = "http://localhost:5000";

  // Verificar autenticación cuando se monta el componente y cada 30 segundos
  useEffect(() => {
    checkAuthentication();
    
    // Verificar periódicamente si el usuario sigue autenticado
    const intervalId = setInterval(checkAuthentication, 30000);
    
    return () => clearInterval(intervalId);
  }, []);

  const checkAuthentication = () => {
    const token = localStorage.getItem('userToken');
    const authenticated = !!token;
    
    setIsAuthenticated(authenticated);
    setAuthChecked(true);
    
    if (!authenticated) {
      setMessage('You must be logged in to view records.');
      setRecords([]);
    }
  };

  const fetchRecords = async () => {
    // Re-verificar autenticación antes de cada operación
    const token = localStorage.getItem('userToken');
    if (!token) {
      setIsAuthenticated(false);
      setMessage('You must be logged in to view records.');
      setRecords([]);
      return;
    }
    
    try {
      // Construir parámetros de búsqueda
      const params = new URLSearchParams();
      params.append("page", page);
      params.append("per_page", perPage);
      if (recordType) params.append("record_type", recordType);
      if (startDate) params.append("start_date", startDate);
      if (endDate) params.append("end_date", endDate);

      const url = `${API_BASE_URL}/api/database/records?${params.toString()}`;
      const response = await fetch(url, {
        headers: {
          'Authorization': 'Bearer ' + token,
        },
      });
      
      // Verificar si la respuesta es JSON antes de intentar parsearla
      const contentType = response.headers.get("content-type");
      let data;
      
      if (contentType && contentType.indexOf("application/json") !== -1) {
        data = await response.json();
      } else {
        throw new Error("Response was not JSON");
      }
      
      console.log("Records response:", data);
      
      if (response.ok) {
        setRecords(data.records || []);
        setTotalPages(data.pages || 1);
        setMessage('');
        toast.info("Records loaded successfully!");
      } else {
        // Si el token es inválido o expirado
        if (response.status === 401) {
          setIsAuthenticated(false);
          localStorage.removeItem('userToken');
          toast.error('Your session has expired. Please log in again.');
          setMessage('Your session has expired. Please log in again.');
        } else {
          setMessage(data.error || 'Error fetching records.');
        }
        setRecords([]);
      }
    } catch (err) {
      console.error('Error fetching records:', err);
      
      // Si hay un error de red o de parseo, verificar el token nuevamente
      const token = localStorage.getItem('userToken');
      if (!token) {
        setIsAuthenticated(false);
      }
      
      setMessage('Error fetching records: ' + err.message);
      setRecords([]);
    }
  };

  const deleteRecord = async (recordId) => {
    // Re-verificar autenticación antes de cada operación
    const token = localStorage.getItem('userToken');
    if (!token) {
      setIsAuthenticated(false);
      setMessage('You must be logged in to delete records.');
      return;
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/database/records/${recordId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': 'Bearer ' + token,
        },
      });
      
      // Verificar si la respuesta es JSON antes de intentar parsearla
      const contentType = response.headers.get("content-type");
      let data;
      
      if (contentType && contentType.indexOf("application/json") !== -1) {
        data = await response.json();
      } else {
        throw new Error("Response was not JSON");
      }
      
      console.log("Delete response:", data);
      
      if (response.ok) {
        setRecords(records.filter(record => record.id !== recordId));
        toast.success("Record deleted successfully!");
      } else {
        // Si el token es inválido o expirado
        if (response.status === 401) {
          setIsAuthenticated(false);
          localStorage.removeItem('userToken');
          toast.error('Your session has expired. Please log in again.');
          setMessage('Your session has expired. Please log in again.');
        } else {
          setMessage(data.error || 'Error deleting record.');
        }
      }
    } catch (err) {
      console.error('Error deleting record:', err);
      
      // Si hay un error de red o de parseo, verificar el token nuevamente
      const token = localStorage.getItem('userToken');
      if (!token) {
        setIsAuthenticated(false);
      }
      
      setMessage('Error deleting record: ' + err.message);
    }
  };

  // Función para parsear data (si es un JSON string) y retornarla como objeto
  const parseRecordData = (recordData) => {
    try {
      return JSON.parse(recordData);
    } catch (e) {
      console.error("Error parsing record data:", e, recordData);
      return { raw: recordData };
    }
  };

  const handlePageChange = (newPage) => {
    // Verificar autenticación antes de cambiar de página
    if (!isAuthenticated) {
      setMessage('You must be logged in to view records.');
      return;
    }
    
    setPage(newPage);
    fetchRecords();
  };

  // Mostrar cargando hasta que se verifique la autenticación
  if (!authChecked) {
    return (
      <div className={styles.container}>
        <h2>Database Records</h2>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h2>Database Records</h2>
      
      {!isAuthenticated ? (
        <div className={styles.authMessage}>
          <FaLock size={40} />
          <p>You must be logged in to view database records.</p>
        </div>
      ) : (
        <>
          {/* Controles de filtro y paginación - solo visible para usuarios autenticados */}
          <div className={styles.controls}>
            <input
              type="number"
              placeholder="Page"
              value={page}
              onChange={(e) => setPage(parseInt(e.target.value) || 1)}
              min={1}
            />
            <input
              type="number"
              placeholder="Per Page"
              value={perPage}
              onChange={(e) => setPerPage(parseInt(e.target.value) || 10)}
              min={1}
            />
            <input
              type="text"
              placeholder="Record Type (e.g., weather)"
              value={recordType}
              onChange={(e) => setRecordType(e.target.value)}
            />
            <input
              type="date"
              placeholder="Start Date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <input
              type="date"
              placeholder="End Date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
            <button onClick={fetchRecords}>Load Records</button>
          </div>

          {message && <p className={styles.message}>{message}</p>}
          
          {records.length > 0 ? (
            <>
              <table className={styles.recordsTable}>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Record Type</th>
                    <th>Data</th>
                    <th>Timestamp</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((record) => {
                    const parsedData = parseRecordData(record.data);
                    return (
                      <tr key={record.id}>
                        <td>{record.id}</td>
                        <td>{record.record_type}</td>
                        <td>
                          {record.record_type === 'weather' && typeof parsedData === 'object' ? (
                            <div>
                              <strong>Temperatura:</strong> {parsedData.temperatura}°C<br/>
                              <strong>Humedad:</strong> {parsedData.humedad}%<br/>
                              <strong>UV Index:</strong> {parsedData.uv_index}<br/>
                              <strong>Avg Temp:</strong> {parsedData.avg_temp}°C<br/>
                              <strong>Desc:</strong> {parsedData.descripcion}<br/>
                              <strong>Vel. Viento:</strong> {parsedData.velocidad_viento} m/s
                            </div>
                          ) : (
                            <pre>{JSON.stringify(parsedData, null, 2)}</pre>
                          )}
                        </td>
                        <td>{record.timestamp}</td>
                        <td>
                          <button onClick={() => deleteRecord(record.id)} className={styles.deleteButton}>
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div className={styles.pagination}>
                <button disabled={page <= 1} onClick={() => handlePageChange(page - 1)}>
                  Previous
                </button>
                <span>Page {page} of {totalPages}</span>
                <button disabled={page >= totalPages} onClick={() => handlePageChange(page + 1)}>
                  Next
                </button>
              </div>
            </>
          ) : (
            <p>No records found.</p>
          )}
        </>
      )}
    </div>
  );
}

export default DatabaseView;
