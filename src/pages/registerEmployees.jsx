import React, { useState } from 'react';
import '../styles/registerEmployees.css';
import logo from '../assets/log.jpeg';
import { FaUpload, FaSave, FaPlus } from 'react-icons/fa';

const RegisterEmployees = () => {
  const [empleados, setEmpleados] = useState([]);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  const API_URL = 'https://mi-api-atempo.onrender.com';

  const handleChange = (index, campo, valor) => {
    const nuevos = [...empleados];
    nuevos[index][campo] = valor;
    setEmpleados(nuevos);
  };

  const handleFotoChange = (index, e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      handleChange(index, 'foto', reader.result);
    };
    reader.readAsDataURL(file);
  };

  const agregarEmpleado = () => {
    setEmpleados([...empleados, { nombre: '', email: '', telefono: '', foto: '' }]);
  };

  const handleGuardar = async () => {
    setMensaje('');
    setError('');
    const enviados = [];

    try {
      for (const empleado of empleados) {
        const { nombre, email, telefono, foto } = empleado;

        if (!nombre || !email || !telefono) continue;

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
        setEmpleados([]);
      } else {
        setError('⚠️ Completa al menos un registro');
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

        <button className="agregar-empleado-btn" onClick={agregarEmpleado}>
          <FaPlus /> Agregar empleado
        </button>

        <div className="register-carousel-wrapper">
          <div className="register-carousel">
            {empleados.length === 0 && (
              <p style={{ textAlign: 'center', marginTop: 20, color: '#555' }}>
                No hay empleados agregados. Usa el botón para agregar.
              </p>
            )}

            {empleados.map((empleado, i) => (
              <div className="register-card" key={i}>
                <h3>Nuevo empleado</h3>

                {/* Vista previa de la foto o espacio vacío */}
                <div
                  className="register-avatar-placeholder"
                  style={{
                    width: '120px',
                    height: '120px',
                    background: empleado.foto ? 'transparent' : '#f0f0f0',
                    border: '2px dashed #ccc',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    marginBottom: '10px',
                  }}
                >
                  {empleado.foto ? (
                    <img
                      src={empleado.foto}
                      alt="Foto empleado"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <span style={{ fontSize: '12px', color: '#888', textAlign: 'center' }}>
                      Sin foto
                    </span>
                  )}
                </div>

                <label
                  className="register-upload-label"
                  htmlFor={`foto-${i}`}
                  style={{
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    marginBottom: '15px',
                    color: '#007bff',
                    fontWeight: 'bold',
                  }}
                >
                  <FaUpload className="icono-upload" style={{ marginRight: '5px' }} /> Cargar foto
                </label>
                <input
                  id={`foto-${i}`}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={(e) => handleFotoChange(i, e)}
                />

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
        </div>

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
