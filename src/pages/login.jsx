import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/login.css';
import logo from '../assets/LogoAtempoPNG.png';

const Login = () => {
    const navigate = useNavigate();

    const [correo, setCorreo] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    // Detecta la URL base de la API (variable de entorno o URL producción o local)
    const API_URL = process.env.REACT_APP_API_URL || 'https://mi-api-atempo.onrender.com';

    const handleLogin = async () => {
        try {
            const url = `${API_URL}/api/auth/login`;
            console.log('URL de login:', url);

            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ correo, password }),
            });

            const text = await response.text();
            console.log('Respuesta del servidor:', text);

            try {
                const data = JSON.parse(text);

                if (response.ok) {
                    console.log('Login exitoso:', data.usuario);
                    navigate('/agenda-diaria');
                } else {
                    setError(data.message || 'Error al iniciar sesión');
                }
            } catch {
                setError('Respuesta inesperada del servidor');
            }
        } catch (err) {
            console.error('Error en login:', err);
            setError('Error de conexión con el servidor');
        }
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
