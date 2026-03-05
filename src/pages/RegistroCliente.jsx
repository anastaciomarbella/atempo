import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import '../styles/reservarCita.css';

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
            navigate(`/reservar/${slug}`);
        } catch {
            setError('Error de conexión');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="reservar-container">
            <div className="reservar-card">
                <div className="reservar-header">
                    <h1 className="reservar-titulo">Crear cuenta</h1>
                    <p className="reservar-subtitulo">Regístrate para agendar tu cita</p>
                </div>

                <div className="reservar-formulario">
                    <div className="reservar-campo">
                        <label>Nombre completo *</label>
                        <input name="nombre" placeholder="Tu nombre" value={form.nombre} onChange={handleChange} />
                    </div>

                    <div className="reservar-campo">
                        <label>Teléfono *</label>
                        <input name="telefono" placeholder="10 dígitos" value={form.telefono} onChange={handleChange} />
                    </div>

                    <div className="reservar-campo">
                        <label>Contraseña *</label>
                        <input type="password" name="password" placeholder="Mínimo 6 caracteres" value={form.password} onChange={handleChange} />
                    </div>

                    {error && <p className="reservar-mensaje">{error}</p>}

                    <button className="reservar-btn" onClick={handleSubmit} disabled={loading}>
                        {loading ? 'Registrando...' : 'Crear cuenta'}
                    </button>

                    <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>
                        ¿Ya tienes cuenta?{' '}
                        <Link to={`/login-cliente/${slug}`} style={{ color: '#3b82f6' }}>
                            Inicia sesión
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RegistroCliente;