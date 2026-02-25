import React, { useEffect, useState } from 'react';
import '../styles/empleados.css';
import { FaUserPlus, FaEdit, FaTrash } from 'react-icons/fa';
import ModalNuevoEmpleado from '../components/modalNuevoEmpleado/modalNuevoEmpleado';
import ModalUpdateEmpleado from '../components/modalUpdateEmpleado/modalUpdateEmpleado';
import ModalConfirmacionEliminar from '../components/modalConfirmar/modalConfirmarDelete';

const Empleados = () => {
    const [empleados, setEmpleados] = useState([]);
    const [mostrarModal, setMostrarModal] = useState(false);
    const [mostrarModalEditar, setMostrarModalEditar] = useState(false);
    const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
    const [empleadoEditar, setEmpleadoEditar] = useState(null);
    const [empleadoAEliminar, setEmpleadoAEliminar] = useState(null);

    const API_URL = "https://mi-api-atempo.onrender.com";

    const cargarEmpleados = async () => {
        try {
            const res = await fetch(`${API_URL}/api/personas`);
            if (!res.ok) throw new Error("Error al obtener empleados");

            const data = await res.json();

            // 🔥 Esto cubre ambos casos: array directo o { data: [...] }
            const lista = Array.isArray(data) ? data : data.data;

            setEmpleados(lista || []);
        } catch (error) {
            console.error('Error al cargar empleados:', error);
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
            console.error('Error al obtener empleado:', error);
        }
    };

    const eliminarEmpleado = async () => {
        if (!empleadoAEliminar) return;

        try {
            const id = empleadoAEliminar.id || empleadoAEliminar._id;

            const res = await fetch(`${API_URL}/api/personas/${id}`, {
                method: 'DELETE',
            });

            if (!res.ok) throw new Error("Error al eliminar");

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
                        empleados.map((emp) => {
                            const id = emp.id || emp._id;

                            return (
                                <tr key={id}>
                                    <td>{emp.nombre}</td>
                                    <td>{emp.email}</td>
                                    <td>{emp.telefono}</td>
                                    <td>
                                        <FaEdit
                                            className="icono-editar"
                                            onClick={() => handleEditarClick(id)}
                                            style={{ cursor: 'pointer' }}
                                        />
                                        <FaTrash
                                            className="icono-borrar"
                                            onClick={() => {
                                                setEmpleadoAEliminar(emp);
                                                setMostrarConfirmacion(true);
                                            }}
                                            style={{ cursor: 'pointer' }}
                                        />
                                    </td>
                                </tr>
                            );
                        })
                    )}
                </tbody>
            </table>

            {mostrarModal && (
                <ModalNuevoEmpleado
                    onClose={() => setMostrarModal(false)}
                    onEmpleadoCreado={() => {
                        setMostrarModal(false);
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