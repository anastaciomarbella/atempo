import React, { useState, useEffect } from 'react';
import '../styles/clientesFrecuentes.css';
import ModalNuevoClienteFrecuente from '../components/modalNuevoClienteFrecuente/modalNuevoClienteFrecuente';
import ModalCita from '../components/modalCita/modalCita';
import { FaUserPlus, FaEdit, FaTrash } from 'react-icons/fa';

const ClientesFrecuentes = () => {
  const [mostrarModal, setMostrarModal] = useState(false);
  const [clientes, setClientes] = useState([]);
  const [mostrarModalCita, setMostrarModalCita] = useState(false);
  const [citaSeleccionada, setCitaSeleccionada] = useState(null);

  // Base URL desde variable de entorno
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

  const obtenerClientes = () => {
    fetch(`${API_URL}/api/frecuentes`)
      .then((res) => {
        if (!res.ok) throw new Error('Error al obtener los clientes frecuentes');
        return res.json();
      })
      .then((data) => {
        setClientes(data.clientes || []);
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  };

  useEffect(() => {
    obtenerClientes();
  }, [API_URL]);

  const handleEditar = (cliente) => {
    setCitaSeleccionada(cliente);
    setMostrarModalCita(true);
  };

  const handleEliminar = async (idCita) => {
    const confirmar = window.confirm('¿Estás seguro de que deseas eliminar esta cita?');
    if (!confirmar) return;

    try {
      const res = await fetch(`${API_URL}/api/frecuentes/${idCita}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al eliminar');

      alert('Cita eliminada correctamente');
      obtenerClientes(); // Refresca la lista
    } catch (err) {
      console.error('Error al eliminar:', err);
      alert('Hubo un error al eliminar la cita.');
    }
  };

  return (
    <div className="clientes-container">
      <div className="header-clientes">
        <h2 className="titulo-clientes">Clientes frecuentes</h2>
        <button className="nuevo-cliente-btn" onClick={() => setMostrarModal(true)}>
          Nuevo cliente frecuente <FaUserPlus className="icono-btn" />
        </button>
      </div>
      <table className="tabla-clientes">
        <thead>
          <tr>
            <th>Nombre(s)</th>
            <th>Apellidos</th>
            <th>Número celular</th>
            <th>Opciones</th>
          </tr>
        </thead>
        <tbody>
          {clientes.length === 0 ? (
            <tr>
              <td colSpan="4">No hay clientes frecuentes para mostrar</td>
            </tr>
          ) : (
            clientes.map((cliente, index) => (
              <tr key={index}>
                <td>{cliente.nombre}</td>
                <td>{cliente.apellidos}</td>
                <td>{cliente.numero_cliente}</td>
                <td>
                  <FaEdit
                    className="icono-editar"
                    onClick={() => handleEditar(cliente)}
                    title="Editar cita"
                  />
                  <FaTrash
                    className="icono-borrar"
                    onClick={() => handleEliminar(cliente.id_cita)}
                    title="Eliminar cita"
                  />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {mostrarModal && (
        <ModalNuevoClienteFrecuente onClose={() => setMostrarModal(false)} />
      )}

      {mostrarModalCita && citaSeleccionada && (
        <ModalCita
          modo="editar"
          cita={citaSeleccionada}
          onClose={() => {
            setMostrarModalCita(false);
            setCitaSeleccionada(null);
            obtenerClientes(); // Refrescar después de editar también
          }}
        />
      )}
    </div>
  );
};

export default ClientesFrecuentes;
