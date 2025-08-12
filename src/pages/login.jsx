import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/login.css';
import logo from '../assets/LogoAtempoPNG.png';

const Login = () => {
  const navigate = useNavigate();

  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = () => {
    setError('');
    // Navegar inmediatamente sin validar ni esperar respuesta
    navigate('/agenda-diaria');
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <img src={logo} alt="Atempo logo" className="login-logo" />
        <h1 className="login-title">Atempo</h1>
        <h2 className="login-subtitle">Iniciar sesión</h2>

        <input
          type="email"
          placeholder="Correo electrónico"
          className="login-input"
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
        />
        <input
          type="password"
          placeholder="Contraseña"
          className="login-input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <p className="login-error">{error}</p>}

        <button className="login-button" onClick={handleLogin}>
          Iniciar sesión
        </button>

        <p className="login-footer">
          ¿No tienes cuenta?{' '}
          <Link to="/register" className="login-link">
            Regístrate aquí
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
