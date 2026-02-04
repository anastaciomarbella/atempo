// pages/Register.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/login.css';
import { FaUpload } from 'react-icons/fa';
import logo from '../assets/logo.png';

const Register = () => {
  const navigate = useNavigate();

  const [negocio, setNegocio] = useState('');
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [telefono, setTelefono] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [foto, setFoto] = useState(null);
  const [preview, setPreview] = useState(null);

  const validarCorreo = (email) => /\S+@\S+\.\S+/.test(email);
  const validarTelefono = (tel) => /^\d{7,15}$/.test(tel);

  const handleFotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFoto(file);
      setPreview(URL.createObjectURL(file));
    }
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

    navigate('/');
  };

  return (
    <div className="login-container">
      <div className="login-card">

        {/* 🔹 NUEVO ENCABEZADO: LOGO A LA IZQUIERDA */}
        <div className="login-header">
          <img src={logo} alt="Citalia logo" className="login-logo" />
          <h1 className="login-title">Citalia</h1>
        </div>

        <div className="login-body">
          <h2 className="login-subtitle">Registrar cuenta</h2>

          {/* Vista previa de la foto */}
          {preview && (
            <img
              src={preview}
              alt="Vista previa"
              className="preview-logo"
              style={{
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                objectFit: 'cover',
                marginBottom: '10px',
              }}
            />
          )}

          {/* Botón para subir foto */}
          <label className="btn-cargar-logo">
            <FaUpload className="icono-upload" />
            Cargar Logo
            <input
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleFotoChange}
            />
          </label>

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

          <p className="login-legal">
            Protegemos tu información conforme a nuestro{" "}
            <Link to="/aviso-privacidad" className="login-link">
              Aviso de Privacidad
            </Link>.
          </p>

          <button className="login-button" onClick={handleRegister}>
            Registrar cuenta
          </button>

          <p className="login-footer">
            ¿Ya tienes cuenta?{" "}
            <Link to="/" className="login-link">
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
