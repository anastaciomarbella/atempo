import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/login.css';
import { FaUpload } from 'react-icons/fa';
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
  const [foto, setFoto] = useState(null); // Guardará el archivo
  const [preview, setPreview] = useState(null); // Vista previa de la imagen

  const validarCorreo = (email) => /\S+@\S+\.\S+/.test(email);
  const validarTelefono = (tel) => /^\d{7,15}$/.test(tel);

  const handleFotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFoto(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleRegister = async () => {
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

    try {
      // Crear FormData para enviar foto y datos
      const formData = new FormData();
      formData.append('nombre_empresa', negocio);
      formData.append('nombre', nombre);
      formData.append('correo', correo);
      formData.append('telefono', telefono);
      formData.append('password', password);
      if (foto) formData.append('foto', foto);

      const response = await fetch('https://mi-api-atempo.onrender.com/api/auth/register', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Error al registrar usuario');
      }

      alert('Usuario registrado correctamente');
      navigate('/');

    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <img src={logo} alt="Atempo logo" className="login-logo" />
        <h1 className="login-title">Atempo</h1>
        <h2 className="login-subtitle">Registrar cuenta</h2>

        {preview && (
          <img
            src={preview}
            alt="Vista previa"
            className="preview-foto"
            style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', marginBottom: '10px' }}
          />
        )}

        <label className="btn-cargar-foto">
          <FaUpload className="icono-upload" />
          Cargar foto
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

        <button className="login-button" onClick={handleRegister}>
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
