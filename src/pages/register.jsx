import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/login.css';
import { FaUpload } from 'react-icons/fa';
import avatar from '../../assets/avatar.png';
import logo from '../assets/LogoAtempoPNG.png';

const Register = () => {
  const navigate = useNavigate();

  const [negocio, setNegocio] = useState('');
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [telefono, setTelefono] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const validarCorreo = (email) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  const validarTelefono = (tel) => {
    return /^\d{7,15}$/.test(tel); // entre 7 y 15 dígitos
  };

  const handleRegister = () => {
    setError('');

    if (!negocio.trim() || !nombre.trim() || !correo.trim() || !telefono.trim() || !password) {
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

    // Navegar inmediatamente al login sin esperar la llamada al servidor
    navigate('/');
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <img src={logo} alt="Atempo logo" className="login-logo" />
        <h1 className="login-title">Atempo</h1>
        <h2 className="login-subtitle">Registrar cuenta</h2>

        <button className="btn-cargar-foto">
          <FaUpload className="icono-upload" />
          Cargar foto
        </button>
        
        <input
          type="text"
          placeholder="Nombre del negocio"
          className="login-input"
          value={negocio}
          onChange={(e) => setNegocio(e.target.value)}
        />
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

        <button
          className="login-button"
          onClick={handleRegister}
        >
          Registrar cuenta
        </button>

        <p className="login-footer">
          ¿Ya tienes cuenta? <Link to="/" className="login-link">Inicia sesión</Link>
        </p>

        <p className="login-legal">
          Protegemos tu información conforme a nuestro{" "}
          <Link to="/aviso-privacidad" className="login-link" aria-label="Abrir aviso de privacidad">
            Aviso de Privacidad
          </Link>.
        </p>
      </div>
    </div>
  );
};

export default Register;
