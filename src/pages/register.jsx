import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUpload } from 'react-icons/fa';
import logo from '../assets/LogoAtempoPNG.png';
import '../styles/login.css';

const Register = () => {
  const navigate = useNavigate();
  const [negocio, setNegocio] = useState('');
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [telefono, setTelefono] = useState('');
  const [password, setPassword] = useState('');
  const [foto, setFoto] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('negocio', negocio);
    formData.append('nombre', nombre);
    formData.append('correo', correo);
    formData.append('telefono', telefono);
    formData.append('password', password);
    if (foto) {
      formData.append('foto', foto);
    }

    try {
      const res = await fetch('https://mi-api-atempo.onrender.com/api/auth/registro', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || 'Error en el registro');
        return;
      }

      alert('Registro exitoso');
      navigate('/login');
    } catch (error) {
      console.error('Error en registro:', error);
      alert('Error en el servidor');
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <img src={logo} alt="Logo" className="logo" />
        <h2>Registro</h2>

        <input type="text" placeholder="Nombre del Negocio" value={negocio} onChange={(e) => setNegocio(e.target.value)} />
        <input type="text" placeholder="Nombre completo" value={nombre} onChange={(e) => setNombre(e.target.value)} />
        <input type="email" placeholder="Correo electrónico" value={correo} onChange={(e) => setCorreo(e.target.value)} />
        <input type="text" placeholder="Teléfono" value={telefono} onChange={(e) => setTelefono(e.target.value)} />
        <input type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} />

        <label className="upload-label">
          <FaUpload /> Subir Foto (opcional)
          <input type="file" accept="image/*" onChange={(e) => setFoto(e.target.files[0])} hidden />
        </label>

        <button type="submit" className="btn">Registrarse</button>
      </form>
    </div>
  );
};

export default Register;
