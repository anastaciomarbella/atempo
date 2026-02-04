import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/login.css';
import logo from '../assets/logo.png';

const Login = () => {
  const navigate = useNavigate();

  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError('');
    setLoading(true);

    try {
      const res = await fetch("https://mi-api-atempo.onrender.com/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo, password })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Credenciales incorrectas");
        setLoading(false);
        return;
      }

      // 🔹 Guardamos los datos importantes del usuario
      const userData = {
        token: data.token,
        empresaNombre: data.empresaNombre,
        empresaLogo: data.empresaLogo
      };

      localStorage.setItem("user", JSON.stringify(userData));

      // ✅ Ahora sí redirigimos a la agenda diaria
      navigate("/agenda-diaria");

    } catch (err) {
      setError("Error de conexión con el servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <img src={logo} alt="log" className="login-logo" />
        <h1 className="login-title">Citalia</h1>
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

        <button className="login-button" onClick={handleLogin} disabled={loading}>
          {loading ? "Entrando..." : "Iniciar sesión"}
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
