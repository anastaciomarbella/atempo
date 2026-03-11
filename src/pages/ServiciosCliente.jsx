// src/pages/GestionServicios.jsx

import { useState, useEffect } from "react";
import { styles } from "../styles/servicioCliente";

// URL de tu API
const API_URL = "https://citalia-api.onrender.com/api";

export default function GestionServicios() {

    const [servicios, setServicios] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [editando, setEditando] = useState(null);

    const [form, setForm] = useState({
        nombre: "",
        descripcion: "",
        precio: "",
        duracion: ""
    });

    const [imagenFile, setImagenFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [subiendo, setSubiendo] = useState(false);

    function getToken() {
        return localStorage.getItem("token") || sessionStorage.getItem("token") || "";
    }

    async function apiRequest(path, options = {}) {

        const res = await fetch(`${API_URL}${path}`, {
            ...options,
            headers: {
                Authorization: `Bearer ${getToken()}`,
                ...(options.headers || {})
            }
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.error || "Error en la solicitud");
        }

        return data;
    }

    async function cargarServicios() {

        setLoading(true);

        try {

            const data = await apiRequest("/servicios");

            setServicios(data);

        } catch (err) {

            console.error(err);

        }

        setLoading(false);
    }

    useEffect(() => {
        cargarServicios();
    }, []);

    function abrirModal(servicio = null) {

        if (servicio) {

            setEditando(servicio.id_servicio);

            setForm({
                nombre: servicio.nombre,
                descripcion: servicio.descripcion || "",
                precio: servicio.precio,
                duracion: servicio.duracion || ""
            });

            setPreview(servicio.imagen_url || null);

        } else {

            setEditando(null);

            setForm({
                nombre: "",
                descripcion: "",
                precio: "",
                duracion: ""
            });

            setPreview(null);
        }

        setImagenFile(null);
        setModalOpen(true);
    }

    function cerrarModal() {

        setModalOpen(false);
        setEditando(null);
        setPreview(null);
        setImagenFile(null);

    }

    function handleImagen(e) {

        const file = e.target.files[0];

        if (!file) return;

        setImagenFile(file);
        setPreview(URL.createObjectURL(file));

    }

    async function guardarServicio() {

        if (!form.nombre || !form.precio) {
            return alert("Nombre y precio son obligatorios");
        }

        setSubiendo(true);

        try {

            const formData = new FormData();

            formData.append("nombre", form.nombre);
            formData.append("descripcion", form.descripcion);
            formData.append("precio", form.precio);
            formData.append("duracion", form.duracion);

            if (imagenFile) {
                formData.append("imagen", imagenFile);
            }

            if (editando) {

                await apiRequest(`/servicios/${editando}`, {
                    method: "PUT",
                    body: formData
                });

            } else {

                await apiRequest("/servicios", {
                    method: "POST",
                    body: formData
                });

            }

            await cargarServicios();
            cerrarModal();

        } catch (err) {

            alert("Error al guardar: " + err.message);

        }

        setSubiendo(false);
    }

    async function eliminarServicio(id) {

        if (!window.confirm("¿Eliminar este servicio?")) return;

        try {

            await apiRequest(`/servicios/${id}`, {
                method: "DELETE"
            });

            cargarServicios();

        } catch (err) {

            alert("Error al eliminar: " + err.message);

        }
    }

    return (

        <div style={styles.container}>

            {/* HEADER */}

            <div style={styles.header}>

                <div>

                    <h1 style={styles.titulo}>
                        Gestión de Servicios
                    </h1>

                    <p style={styles.subtitulo}>
                        {servicios.length} servicios registrados
                    </p>

                </div>

                <button
                    style={styles.btnAgregar}
                    onClick={() => abrirModal()}
                >
                    + Nuevo Servicio
                </button>

            </div>


            {/* GRID */}

            {loading ? (

                <div style={styles.loadingWrap}>
                    <p style={styles.loadingText}>
                        Cargando servicios...
                    </p>
                </div>

            ) : servicios.length === 0 ? (

                <div style={styles.emptyState}>

                    <p style={{ fontSize: 48 }}>
                        ✂️
                    </p>

                    <p style={styles.emptyText}>
                        Aún no hay servicios. ¡Agrega el primero!
                    </p>

                </div>

            ) : (

                <div style={styles.grid}>

                    {servicios.map((s) => (

                        <div key={s.id_servicio} style={styles.card}>

                            <div style={styles.cardImgWrap}>

                                {s.imagen_url ? (

                                    <img
                                        src={s.imagen_url}
                                        alt={s.nombre}
                                        style={styles.cardImg}
                                    />

                                ) : (

                                    <div style={styles.cardImgPlaceholder}>
                                        ✂️
                                    </div>

                                )}

                            </div>

                            <div style={styles.cardBody}>

                                <h3 style={styles.cardNombre}>
                                    {s.nombre}
                                </h3>

                                {s.descripcion && (
                                    <p style={styles.cardDesc}>
                                        {s.descripcion}
                                    </p>
                                )}

                                <div style={styles.cardMeta}>

                                    <span style={styles.badge}>
                                        ${parseFloat(s.precio).toFixed(2)}
                                    </span>

                                    {s.duracion && (

                                        <span style={styles.badgeGris}>
                                            {s.duracion} min
                                        </span>

                                    )}

                                </div>

                            </div>

                            <div style={styles.cardActions}>

                                <button
                                    style={styles.btnEditar}
                                    onClick={() => abrirModal(s)}
                                >
                                    Editar
                                </button>

                                <button
                                    style={styles.btnEliminar}
                                    onClick={() => eliminarServicio(s.id_servicio)}
                                >
                                    Eliminar
                                </button>

                            </div>

                        </div>

                    ))}

                </div>

            )}

        </div>
    );
}