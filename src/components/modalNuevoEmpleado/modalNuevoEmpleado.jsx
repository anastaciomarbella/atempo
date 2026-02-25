import React, { useState } from 'react';
import './modalNuevoEmpleado.css';
import { FaTimes, FaSave } from 'react-icons/fa';

const ModalNuevoEmpleado = ({ onClose, onEmpleadoCreado }) => {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  const handleGuardar = async () => {
    setMensaje('');
    setError('');

    if (!nombre || !email || !telefono) {
      setError('⚠️ Todos los campos son obligatorios');
      return;
    }

    try {
      const res = await fetch('https://mi-api-atempo.onrender.com/api/personas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, email, telefono }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Error al registrar empleado');
      }

      setMensaje('✅ Empleado registrado correctamente');

      setTimeout(() => {
        onEmpleadoCreado();
      }, 1000);

    } catch (err) {
      console.error(err);
      setError(err.message || 'Error inesperado');
    }
  };

  return (
    <>
      <div className="overlay visible"></div>
      <div className="modal">
        <button className="cerrar-modal" onClick={onClose}>
          <FaTimes />
        </button>

        <h2 className="titulo-modal">Nuevo empleado</h2>

        <div className="formulario-modal">
          <label>Nombre *</label>
          <input
            type="text"
            placeholder="Nombre del empleado"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />

          <label>Correo electrónico *</label>
          <input
            type="email"
            placeholder="Correo del empleado"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label>Número celular *</label>
          <input
            type="tel"
            placeholder="Número celular"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
          />

          {mensaje && <p className="mensaje-exito">{mensaje}</p>}
          {error && <p className="mensaje-error">{error}</p>}

          <button className="btn-guardar" onClick={handleGuardar}>
            <FaSave className="icono-guardar" />
            Guardar
          </button>
        </div>
      </div>
    </>
  );
};

export default ModalNuevoEmpleado;