import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import logo from '../assets/logo.png';
import '../styles/login.css';

const API = 'https://mi-api-atempo.onrender.com';

const RegistroCliente = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ nombre: '', telefono: '', password: '' });

  const handleChange = e => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async () => {
    if (!form.nombre || !form.telefono || !form.password) {
      setError('Todos los campos son obligatorios');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API}/api/cliente-auth/registro`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, slug })
      });

      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }

      localStorage.setItem('clienteToken', data.token);
      localStorage.setItem('clienteUser', JSON.stringify(data.cliente));
     navigate(`/login-cliente/${slug}`);
    } catch {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card show">

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <img
            src={logo}
            alt="Logo"
            style={{
              width: '90px',
              height: '90px',
              borderRadius: '50%',
              objectFit: 'cover',
              marginBottom: '10px',
              boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
            }}
          />
          <h1 className="login-title">Citalia</h1>
          <h2 className="login-subtitle">Crear cuenta</h2>
        </div>

        <div className="input-group">
          <input
            type="text"
            name="nombre"
            className="login-input"
            placeholder=" "
            value={form.nombre}
            onChange={handleChange}
          />
          <label className="floating-label-text">Nombre completo</label>
        </div>

        <div className="input-group">
          <input
            type="tel"
            name="telefono"
            className="login-input"
            placeholder=" "
            value={form.telefono}
            onChange={handleChange}
          />
          <label className="floating-label-text">Teléfono</label>
        </div>

        <div className="input-group">
          <input
            type="password"
            name="password"
            className="login-input"
            placeholder=" "
            value={form.password}
            onChange={handleChange}
          />
          <label className="floating-label-text">Contraseña</label>
        </div>

        {error && <div className="login-error">{error}</div>}

        <button
          className="login-button"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? 'Registrando...' : 'Crear cuenta'}
        </button>

        <div className="login-footer">
          ¿Ya tienes cuenta?{' '}
          <Link to={`/login-cliente/${slug}`} className="login-link">
            Inicia sesión
          </Link>
        </div>

      </div>
    </div>
  );
};

export default RegistroCliente;