import React from 'react';
import './modalConfirmarDelete.css';

const ModalConfirmacion = ({ mensaje, onConfirmar, onCancelar }) => {
  return (
    <div className="overlay visible">
      <div className="modal-confirmacion">
        <h3 className="titulo-confirmacion">¿Estás seguro?</h3>
        <p className="mensaje-confirmacion">{mensaje}</p>
        <div className="acciones-confirmacion">
          <button className="btn-confirmar" onClick={onConfirmar}>
            Sí, eliminar
          </button>
          <button className="btn-cancelar" onClick={onCancelar}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalConfirmacion;
