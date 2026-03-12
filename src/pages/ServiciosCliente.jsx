// src/pages/GestionServicios.jsx

import { useState, useEffect } from "react";
import Sidebar from "../components/sidebar/sidebar";
import "../styles/servicios.css";
import { API_URL } from "../config";

export default function GestionServicios() {

  const [servicios, setServicios]   = useState([]);
  const [loading, setLoading]       = useState(false);
  const [modalOpen, setModalOpen]   = useState(false);
  const [editando, setEditando]     = useState(null);
  const [sidebarAbierto, setSidebarAbierto] = useState(false);

  const [form, setForm] = useState({
    nombre: "", descripcion: "", precio: "", duracion: ""
  });

  const [imagenFile, setImagenFile] = useState(null);
  const [preview, setPreview]       = useState(null);
  const [subiendo, setSubiendo]     = useState(false);

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
    if (!res.ok) throw new Error(data.error || "Error en la solicitud");
    return data;
  }

  async function cargarServicios() {
    setLoading(true);
    try {
      const data = await apiRequest("/api/servicios");
      setServicios(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("No se pudo cargar servicios:", err);
    }
    setLoading(false);
  }

  useEffect(() => { cargarServicios(); }, []);

  function abrirModal(servicio = null) {
    if (servicio) {
      setEditando(servicio.id_servicio);
      setForm({
        nombre:      servicio.nombre,
        descripcion: servicio.descripcion || "",
        precio:      servicio.precio,
        duracion:    servicio.duracion || ""
      });
      setPreview(servicio.imagen_url || null);
    } else {
      setEditando(null);
      setForm({ nombre: "", descripcion: "", precio: "", duracion: "" });
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
    if (!form.nombre || !form.precio) return alert("Nombre y precio son obligatorios");
    setSubiendo(true);
    try {
      const formData = new FormData();
      formData.append("nombre",      form.nombre);
      formData.append("descripcion", form.descripcion);
      formData.append("precio",      form.precio);
      formData.append("duracion",    form.duracion);
      if (imagenFile) formData.append("imagen", imagenFile);

      if (editando) {
        await apiRequest(`/api/servicios/${editando}`, { method: "PUT",  body: formData });
      } else {
        await apiRequest("/api/servicios",              { method: "POST", body: formData });
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
      await apiRequest(`/api/servicios/${id}`, { method: "DELETE" });
      cargarServicios();
    } catch (err) {
      alert("Error al eliminar: " + err.message);
    }
  }

  return (
    <div className="sv-layout">

      {/* ── SIDEBAR ── */}
      <Sidebar
        abierto={sidebarAbierto}
        onCerrar={() => setSidebarAbierto(false)}
      />

      {/* ── CONTENIDO ── */}
      <main className="sv-main">

        {/* Botón hamburguesa solo en móvil */}
        <button
          className="sv-hamburger"
          onClick={() => setSidebarAbierto(true)}
          aria-label="Abrir menú"
        >
          ☰
        </button>

        {/* HEADER */}
        <div className="sv-header">
          <div>
            <h1 className="sv-titulo">Gestión de Servicios</h1>
            <p className="sv-subtitulo">{servicios.length} servicios registrados</p>
          </div>
          <button className="sv-btn-agregar" onClick={() => abrirModal()}>
            + Nuevo Servicio
          </button>
        </div>

        {/* GRID / ESTADOS */}
        {loading ? (
          <div className="sv-loading">
            <p>Cargando servicios...</p>
          </div>
        ) : servicios.length === 0 ? (
          <div className="sv-empty">
            <span className="sv-empty-icon">✂️</span>
            <p>Aún no hay servicios. ¡Agrega el primero!</p>
          </div>
        ) : (
          <div className="sv-grid">
            {servicios.map((s) => (
              <div key={s.id_servicio} className="sv-card">

                <div className="sv-card-img-wrap">
                  {s.imagen_url
                    ? <img src={s.imagen_url} alt={s.nombre} className="sv-card-img" />
                    : <div className="sv-card-img-placeholder">✂️</div>
                  }
                </div>

                <div className="sv-card-body">
                  <h3 className="sv-card-nombre">{s.nombre}</h3>
                  {s.descripcion && <p className="sv-card-desc">{s.descripcion}</p>}
                  <div className="sv-card-meta">
                    <span className="sv-badge">${parseFloat(s.precio).toFixed(2)}</span>
                    {s.duracion && <span className="sv-badge-gris">{s.duracion} min</span>}
                  </div>
                </div>

                <div className="sv-card-actions">
                  <button className="sv-btn-editar"   onClick={() => abrirModal(s)}>Editar</button>
                  <button className="sv-btn-eliminar" onClick={() => eliminarServicio(s.id_servicio)}>Eliminar</button>
                </div>

              </div>
            ))}
          </div>
        )}
      </main>

      {/* ── MODAL ── */}
      {modalOpen && (
        <div className="sv-overlay" onClick={cerrarModal}>
          <div className="sv-modal" onClick={(e) => e.stopPropagation()}>

            <h2 className="sv-modal-titulo">
              {editando ? "Editar Servicio" : "Nuevo Servicio"}
            </h2>

            {/* Imagen */}
            <div className="sv-img-upload">
              <label className="sv-img-label">
                {preview
                  ? <img src={preview} alt="preview" className="sv-img-preview" />
                  : (
                    <div className="sv-img-placeholder">
                      <span>📷</span>
                      <small>Subir imagen</small>
                    </div>
                  )
                }
                <input type="file" accept="image/*" onChange={handleImagen} style={{ display: "none" }} />
              </label>
            </div>

            {/* Campos */}
            <div className="sv-campo">
              <label className="sv-label">Nombre *</label>
              <input className="sv-input" placeholder="Ej: Corte de cabello"
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
            </div>

            <div className="sv-campo">
              <label className="sv-label">Descripción</label>
              <input className="sv-input" placeholder="Describe el servicio..."
                value={form.descripcion}
                onChange={(e) => setForm({ ...form, descripcion: e.target.value })} />
            </div>

            <div className="sv-row">
              <div className="sv-campo">
                <label className="sv-label">Precio *</label>
                <input className="sv-input" type="number" placeholder="0.00"
                  value={form.precio}
                  onChange={(e) => setForm({ ...form, precio: e.target.value })} />
              </div>
              <div className="sv-campo">
                <label className="sv-label">Duración (min)</label>
                <input className="sv-input" type="number" placeholder="30"
                  value={form.duracion}
                  onChange={(e) => setForm({ ...form, duracion: e.target.value })} />
              </div>
            </div>

            <div className="sv-modal-btns">
              <button className="sv-btn-cancelar" onClick={cerrarModal}>Cancelar</button>
              <button className="sv-btn-guardar"  onClick={guardarServicio} disabled={subiendo}>
                {subiendo ? "Guardando..." : editando ? "Actualizar" : "Crear Servicio"}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
