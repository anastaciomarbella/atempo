import React, { useEffect, useState } from 'react';
import '../styles/empleados.css';
import { FaUserPlus, FaEdit, FaTrash } from 'react-icons/fa';
import ModalNuevoEmpleado from '../components/modalNuevoEmpleado/modalNuevoEmpleado';
import ModalUpdateEmpleado from '../components/modalUpdateEmpleado/modalUpdateEmpleado';
import ModalConfirmacion from '../components/modalConfirmar/modalConfirmarDelete';

const API_URL = "https://mi-api-atempo.onrender.com";

const Empleados = () => {

  const [empleados, setEmpleados] = useState([]);
  const [mostrarModalNuevo, setMostrarModalNuevo] = useState(false);
  const [mostrarModalEditar, setMostrarModalEditar] = useState(false);
  const [mostrarModalEliminar, setMostrarModalEliminar] = useState(false);

  const [empleadoEditar, setEmpleadoEditar] = useState(null);
  const [empleadoEliminar, setEmpleadoEliminar] = useState(null);

  const cargarEmpleados = async () => {
    try {
      const res = await fetch(`${API_URL}/api/personas`);
      if (!res.ok) throw new Error("Error al obtener empleados");

      const data = await res.json();
      const lista = Array.isArray(data) ? data : data.data;

      setEmpleados(lista || []);
    } catch (error) {
      console.error("Error al cargar empleados:", error);
    }
  };

  useEffect(() => {
    cargarEmpleados();
  }, []);

  const handleEditarClick = async (id) => {
    try {
      const res = await fetch(`${API_URL}/api/personas/${id}`);
      if (!res.ok) throw new Error("No se pudo obtener el empleado");

      const data = await res.json();

      setEmpleadoEditar(data);
      setMostrarModalEditar(true);

    } catch (error) {
      console.error("Error al obtener empleado:", error);
    }
  };

  const handleEliminarClick = (empleado) => {
    setEmpleadoEliminar(empleado);
    setMostrarModalEliminar(true);
  };

  const handleConfirmarEliminar = async () => {
    try {
      const res = await fetch(
        `${API_URL}/api/personas/${empleadoEliminar.id}`,
        { method: "DELETE" }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Error al eliminar empleado");
      }

      setMostrarModalEliminar(false);
      setEmpleadoEliminar(null);
      cargarEmpleados();

    } catch (error) {
      alert(error.message);
      console.error("Error al eliminar:", error);
    }
  };

  return (
    <div className="empleados-container">

      <div className="header-empleados">
        <h2 className="titulo-empleados">Empleados</h2>

        <button
          className="nuevo-empleado-btn"
          onClick={() => setMostrarModalNuevo(true)}
        >
          Nuevo empleado <FaUserPlus />
        </button>
      </div>

      <table className="tabla-empleados">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Correo electrónico</th>
            <th>Teléfono</th>
            <th>Opciones</th>
          </tr>
        </thead>

        <tbody>
          {empleados.length === 0 ? (
            <tr>
              <td colSpan="4" style={{ textAlign: "center" }}>
                No hay empleados registrados
              </td>
            </tr>
          ) : (
            empleados.map((emp) => (
              <tr key={emp.id}>
                <td>{emp.nombre}</td>
                <td>{emp.email}</td>
                <td>{emp.telefono}</td>
                <td>
                  <FaEdit
                    className="icono-editar"
                    onClick={() => handleEditarClick(emp.id)}
                    style={{ cursor: "pointer", marginRight: "10px" }}
                  />

                  <FaTrash
                    className="icono-eliminar"
                    onClick={() => handleEliminarClick(emp)}
                    style={{ cursor: "pointer", color: "red" }}
                  />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {mostrarModalNuevo && (
        <ModalNuevoEmpleado
          onClose={() => setMostrarModalNuevo(false)}
          onEmpleadoCreado={() => {
            setMostrarModalNuevo(false);
            cargarEmpleados();
          }}
        />
      )}

      {mostrarModalEditar && empleadoEditar && (
        <ModalUpdateEmpleado
          empleado={empleadoEditar}
          onClose={() => setMostrarModalEditar(false)}
          onEmpleadoActualizado={() => {
            setMostrarModalEditar(false);
            cargarEmpleados();
          }}
        />
      )}

      {mostrarModalEliminar && empleadoEliminar && (
        <ModalConfirmacion
          mensaje={`Se eliminará a ${empleadoEliminar.nombre}. Esta acción no se puede deshacer.`}
          onConfirmar={handleConfirmarEliminar}
          onCancelar={() => {
            setMostrarModalEliminar(false);
            setEmpleadoEliminar(null);
          }}
        />
      )}

    </div>
  );
};

export default Empleados;