import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/login.css';
import logo from '../assets/LogoAtempoPNG.png';

const Register = () => {
  const navigate = useNavigate();

  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [telefono, setTelefono] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Validar formato básico de correo
  const validarCorreo = (email) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  // Validar solo números para teléfono (puedes ajustar)
  const validarTelefono = (tel) => {
    return /^\d{7,15}$/.test(tel); // entre 7 y 15 dígitos
  };

  const handleRegister = async () => {
    setError('');
    setSuccess('');

    // Validaciones básicas antes de enviar
    if (!nombre.trim() || !correo.trim() || !telefono.trim() || !password) {
      setError('Por favor, completa todos los campos');
      return;
    }

    if (!validarCorreo(correo)) {
      setError('Ingresa un correo válido');
      return;
    }

    if (!validarTelefono(telefono)) {
      setError('Ingresa un teléfono válido (solo números)');
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('https://mi-api-atempo.onrender.com/api/auth/registro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, correo, telefono, password }),
      });

      let data = {};
      try {
        data = await response.json();
      } catch {
        // JSON inválido o vacío
      }

      if (response.ok) {
        setSuccess(data.message || 'Registro exitoso');
        setError('');
        setTimeout(() => navigate('/'), 1500);
      } else {
        setError(data.message || 'Error al registrar');
        setSuccess('');
      }
    } catch (err) {
      console.error('Error en registro:', err);
      setError('Error de conexión con el servidor');
      setSuccess('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <img src={logo} alt="Atempo logo" className="login-logo" />
        <h1 className="login-title">Atempo</h1>
        <h2 className="login-subtitle">Registrar cuenta</h2>

        <input
          type="text"
          placeholder="Nombre completo"
          className="login-input"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />
        <input
          type="tel"
          placeholder="Número de teléfono"
          className="login-input"
          value={telefono}
          onChange={(e) => setTelefono(e.target.value)}
        />
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
        <input
          type="password"
          placeholder="Confirmar contraseña"
          className="login-input"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        {error && <p className="login-error">{error}</p>}
        {success && <p className="login-success">{success}</p>}

        <button
          className="login-button"
          onClick={handleRegister}
          disabled={loading}
        >
          {loading ? 'Registrando...' : 'Registrar cuenta'}
        </button>

        <p className="login-footer">
          ¿Ya tienes cuenta? <Link to="/" className="login-link">Inicia sesión</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
