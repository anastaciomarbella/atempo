import React, { useState } from 'react';
import './modalUpdateEmpleado.css';
import { FaTimes, FaSave } from 'react-icons/fa';

const ModalUpdateEmpleado = ({ empleado, onClose, onEmpleadoActualizado }) => {
  const [nombre, setNombre] = useState(empleado?.nombre || '');
  const [email, setEmail] = useState(empleado?.email || '');
  const [telefono, setTelefono] = useState(empleado?.telefono || '');
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

  const handleActualizar = async () => {
    setMensaje('');
    setError('');

    if (!nombre || !email || !telefono) {
      setError('⚠️ Todos los campos son obligatorios');
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/personas/${empleado.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, email, telefono }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Error al actualizar empleado');
      }

      setMensaje('✅ Empleado actualizado correctamente');

      setTimeout(() => {
        onEmpleadoActualizado();
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
        <h2 className="titulo-modal">Editar empleado</h2>

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

          <button className="btn-guardar" onClick={handleActualizar}>
            <FaSave className="icono-guardar" />
            Guardar
          </button>
        </div>
      </div>
    </>
  );
};

export default ModalUpdateEmpleado;
