import React from 'react';
import '../modalNuevoEmpleado/modalNuevoEmpleado.css';
import { FaTimes, FaSave } from 'react-icons/fa';

const ModalNuevoClienteFrecuente = ({ onClose }) => {
  return (
    <>
      <div className="overlay visible"></div>
      <div className="modal">
        <button className="cerrar-modal" onClick={onClose}>
          <FaTimes />
        </button>
        <h2 className="titulo-modal">Nuevo cliente frecuente</h2>

        <div className="formulario-modal">
          <label>Nombre *</label>
          <input type="text" placeholder="Nombre del cliente" />
          <label>Apellidos *</label>
          <input type="text" placeholder="Apellidos del cliente" />
          <label>Número celular *</label>
          <input type="tel" placeholder="Número celular" />
          <button className="btn-guardar">
            <FaSave className="icono-guardar" />
            Guardar
          </button>
        </div>
      </div>
    </>
  );
};

export default ModalNuevoClienteFrecuente;
