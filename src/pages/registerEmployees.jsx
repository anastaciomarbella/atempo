import React, { useState } from 'react';
import '../styles/registerEmployees.css';
import logo from '../assets/LogoAtempoPNG.png';
import { FaUpload, FaSave } from 'react-icons/fa';
import avatar from '../assets/avatar.png';

const RegisterEmployees = () => {
  const [empleados, setEmpleados] = useState([]);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  // URL base de la API en producción
  const API_URL = 'https://mi-api-atempo.onrender.com';

  const handleChange = (index, campo, valor) => {
    const nuevos = [...empleados];
    nuevos[index][campo] = valor;
    setEmpleados(nuevos);
  };

  // Opcional: función para agregar un empleado vacío al array (si quieres botón para añadir)
  const agregarEmpleado = () => {
    setEmpleados([...empleados, { nombre: '', email: '', telefono: '', foto: '' }]);
  };

  const handleGuardar = async () => {
    setMensaje('');
    setError('');
    const enviados = [];

    try {
      // Filtrar empleados con email único y completos (nombre, email, teléfono)
      const empleadosFiltrados = [];
      const emailsVistos = new Set();

      for (const empleado of empleados) {
        const { nombre, email, telefono } = empleado;
        if (!nombre || !email || !telefono) continue;
        if (emailsVistos.has(email.toLowerCase())) continue;
        emailsVistos.add(email.toLowerCase());
        empleadosFiltrados.push(empleado);
      }

      if (empleadosFiltrados.length === 0) {
        setError('⚠️ Completa al menos un registro válido y sin duplicados');
        return;
      }

      for (const empleado of empleadosFiltrados) {
        const { nombre, email, telefono, foto } = empleado;

        const res = await fetch(`${API_URL}/api/personas`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nombre, email, telefono, foto }),
        });

        let data;
        try {
          data = await res.json();
        } catch {
          throw new Error('El servidor devolvió una respuesta no válida');
        }

        if (!res.ok) {
          throw new Error(data.error || data.message || 'Error al registrar empleado');
        }

        enviados.push(data);
      }

      if (enviados.length > 0) {
        setMensaje(`✅ Se registraron ${enviados.length} empleado(s)`);
        setError('');
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Error inesperado');
    }
  };

  return (
    <div className="register-container">
      <div className="register-content-wrapper">
        <div className="employee-header">
          <img src={logo} alt="Logo Atempo" className="register-logo" />
          <h1 className="register-title">Atempo</h1>
          <h2 className="register-subtitle">Registro de empleados</h2>
        </div>

        <div className="register-carousel-wrapper">
          <div className="register-carousel-arrow left">◀</div>

          <div className="register-carousel">
            {empleados.length === 0 && (
              <p style={{ textAlign: 'center', width: '100%', padding: '20px', color: '#555' }}>
                No hay empleados agregados. Usa el botón para añadir.
              </p>
            )}
            {empleados.map((empleado, i) => (
              <div className="register-card" key={i}>
                <h3>Nuevo empleado</h3>
                <img src={empleado.foto || avatar} alt="Avatar empleado" className="register-avatar" />
                <button className="register-upload-button">
                  <FaUpload className="icono-upload" />
                  Cargar foto
                </button>
                <input
                  type="text"
                  placeholder="Nombre"
                  className="register-input"
                  value={empleado.nombre}
                  onChange={(e) => handleChange(i, 'nombre', e.target.value)}
                />
                <input
                  type="email"
                  placeholder="Correo electrónico"
                  className="register-input"
                  value={empleado.email}
                  onChange={(e) => handleChange(i, 'email', e.target.value)}
                />
                <input
                  type="tel"
                  placeholder="Número celular"
                  className="register-input"
                  value={empleado.telefono}
                  onChange={(e) => handleChange(i, 'telefono', e.target.value)}
                />
              </div>
            ))}
          </div>

          <div className="register-carousel-arrow right">▶</div>
        </div>

        {/* Botón para añadir empleado nuevo */}
        <button onClick={agregarEmpleado} style={{ margin: '10px auto', display: 'block' }}>
          + Agregar empleado
        </button>

        <button className="register-save-button" onClick={handleGuardar}>
          <FaSave className="icono-guardar" />
          Guardar
        </button>

        {mensaje && <p className="register-success">{mensaje}</p>}
        {error && <p className="register-error">{error}</p>}
      </div>

      <p className="register-skip-text">
        Si no tienes empleados o quieres registrarlos después, puedes{' '}
        <span className="register-skip-link">Omitir por ahora &gt;</span>
        <br />
        Desde la sección “Empleados” puedes registrar nuevos empleados cuando desees
      </p>
    </div>
  );
};

export default RegisterEmployees;
