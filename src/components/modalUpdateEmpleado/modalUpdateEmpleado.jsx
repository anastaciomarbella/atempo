import React, { useState, useEffect } from 'react';
import './modalUpdateEmpleado.css';
import { FaTimes, FaSave } from 'react-icons/fa';
import avatar from '../../assets/avatar.png';

const ModalUpdateEmpleado = ({ empleado, onClose, onEmpleadoActualizado }) => {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (empleado) {
      setNombre(empleado.nombre || '');
      setEmail(empleado.email || '');
      setTelefono(empleado.telefono || '');
    }
  }, [empleado]);

  const handleGuardar = async () => {
    setMensaje('');
    setError('');

    if (!nombre || !email || !telefono) {
      setError('⚠️ Todos los campos son obligatorios');
      return;
    }

    try {
      const res = await fetch(`https://mi-api-atempo.onrender.com/api/personas/${empleado.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, email, telefono }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Error al actualizar empleado');
      }

      // Mostrar el mensaje que devuelve el backend
      setMensaje(data.message || 'Empleado actualizado correctamente');

      setTimeout(() => {
        onEmpleadoActualizado(); // Cierra modal y recarga empleados
      }, 1200);
    } catch (err) {
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
        <img src={avatar} alt="Avatar empleado" className="avatar-modal" />
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

export default ModalUpdateEmpleado;
