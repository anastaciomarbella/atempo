import React, { useEffect, useState } from 'react';
import '../styles/empleados.css';
import { FaUserPlus, FaEdit, FaTrash } from 'react-icons/fa';
import ModalNuevoEmpleado from '../components/modalNuevoEmpleado/modalNuevoEmpleado';
import ModalUpdateEmpleado from '../components/modalUpdateEmpleado/modalUpdateEmpleado';
import ModalConfirmacionEliminar from '../components/modalConfirmar/modalConfirmarDelete';

const Empleados = () => {
    const [mostrarModal, setMostrarModal] = useState(false);
    const [mostrarModalEditar, setMostrarModalEditar] = useState(false);
    const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);

    const [empleados, setEmpleados] = useState([]);
    const [empleadoEditar, setEmpleadoEditar] = useState(null);
    const [empleadoAEliminar, setEmpleadoAEliminar] = useState(null);

    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

    const cargarEmpleados = async () => {
        try {
            const res = await fetch(`${API_URL}/api/personas`);
            const data = await res.json();
            setEmpleados(data);
        } catch (error) {
            console.error('Error al cargar empleados:', error);
        }
    };

    useEffect(() => {
        cargarEmpleados();
    }, [API_URL]);

    const handleEditarClick = async (id) => {
        try {
            const res = await fetch(`${API_URL}/api/personas/${id}`);
            const data = await res.json();

            if (!res.ok) throw new Error(data.message || 'No se pudo obtener el empleado');

            setEmpleadoEditar(data);
            setMostrarModalEditar(true);
        } catch (error) {
            console.error('Error al obtener empleado:', error);
        }
    };

    const handleEmpleadoCreado = () => {
        setMostrarModal(false);
        cargarEmpleados();
    };

    const handleEmpleadoActualizado = () => {
        setMostrarModalEditar(false);
        cargarEmpleados();
    };

    const handleEliminarClick = (empleado) => {
        setEmpleadoAEliminar(empleado);
        setMostrarConfirmacion(true);
    };

    const eliminarEmpleado = async () => {
        if (!empleadoAEliminar) return;

        try {
            const res = await fetch(`${API_URL}/api/personas/${empleadoAEliminar.id}`, {
                method: 'DELETE',
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Error al eliminar');

            setMostrarConfirmacion(false);
            setEmpleadoAEliminar(null);
            cargarEmpleados();
        } catch (error) {
            console.error('Error al eliminar empleado:', error);
        }
    };

    return (
        <div className="empleados-container">
            <div className="header-empleados">
                <h2 className="titulo-empleados">Empleados</h2>
                <button 
                    className="nuevo-empleado-btn" 
                    onClick={() => setMostrarModal(true)}
                >
                    Nuevo empleado <FaUserPlus className="icono-btn" />
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
                    {empleados.map((emp) => (
                        <tr key={emp.id}>
                            <td>{emp.nombre}</td>
                            <td>{emp.email}</td>
                            <td>{emp.telefono}</td>
                            <td>
                                <FaEdit
                                    className="icono-editar"
                                    onClick={() => handleEditarClick(emp.id)}
                                    style={{ cursor: 'pointer' }}
                                />
                                <FaTrash
                                    className="icono-borrar"
                                    onClick={() => handleEliminarClick(emp)}
                                    style={{ cursor: 'pointer' }}
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {mostrarModal && (
                <ModalNuevoEmpleado
                    onClose={() => setMostrarModal(false)}
                    onEmpleadoCreado={handleEmpleadoCreado}
                />
            )}

            {mostrarModalEditar && empleadoEditar && (
                <ModalUpdateEmpleado
                    empleado={empleadoEditar}
                    onClose={() => setMostrarModalEditar(false)}
                    onEmpleadoActualizado={handleEmpleadoActualizado}
                />
            )}

            {mostrarConfirmacion && empleadoAEliminar && (
                <ModalConfirmacionEliminar
                    empleado={empleadoAEliminar}
                    onCancelar={() => {
                        setMostrarConfirmacion(false);
                        setEmpleadoAEliminar(null);
                    }}
                    onConfirmar={eliminarEmpleado}
                />
            )}
        </div>
    );
};

export default Empleados;