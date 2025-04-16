import React, { useState } from 'react';
import styles from './UsersView.module.css';

function UsersView() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  
  // Define la URL base del backend
  const API_BASE_URL = "http://localhost:5000";

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = isLogin 
      ? API_BASE_URL + '/api/users/login' 
      : API_BASE_URL + '/api/users/register';
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      console.log('Login response:', data);
      if (response.ok) {
        if (isLogin) {
          if (data.token) {
            localStorage.setItem('userToken', data.token);
            setMessage('Logged in successfully!');
          } else {
            setMessage('No token received, but login was OK?');
          }
        } else {
          setMessage('User registered successfully!');
        }
      } else {
        setMessage(data.error || 'An error occurred.');
      }
    } catch (err) {
      console.error('Error in request:', err);
      setMessage('An error occurred while processing your request.');
    }
  };

  return (
    <div className={styles.container}>
      <h2>{isLogin ? 'Login' : 'Register'}</h2>
      <form onSubmit={handleSubmit} className={styles.form}>
        <input 
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input 
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">{isLogin ? 'Login' : 'Register'}</button>
      </form>
      {message && <p className={styles.message}>{message}</p>}
      <p onClick={() => setIsLogin(!isLogin)} className={styles.toggle}>
        {isLogin ? 'Need to register?' : 'Have an account? Login'}
      </p>
    </div>
  );
}

export default UsersView;