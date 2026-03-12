import { useState, useEffect } from "react";
import "../styles/servicios.css";
import { API_URL } from "../config";

export default function GestionServicios() {

  const [servicios, setServicios]   = useState([]);
  const [loading, setLoading]       = useState(false);
  const [modalOpen, setModalOpen]   = useState(false);
  const [editando, setEditando]     = useState(null);

  const [form, setForm] = useState({
    nombre:      "",
    descripcion: "",
    precio:      "",
    // MODIFICADO: en lugar de un solo campo "duracion" (tipo time HH:MM),
    // ahora se manejan dos campos separados: horas y minutos como números.
    duracionHoras:   "",
    duracionMinutos: "",
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

  useEffect(() => {
    cargarServicios();
  }, []);

  // AGREGADO: convierte cualquier valor de duración que venga de la API
  // (número de minutos totales, o string "HH:MM") a { horas, minutos }.
  function parsearDuracion(duracion) {
    if (!duracion) return { horas: "", minutos: "" };

    if (typeof duracion === "number") {
      return {
        horas:   String(Math.floor(duracion / 60)),
        minutos: String(duracion % 60),
      };
    }

    if (typeof duracion === "string") {
      // Formato "HH:MM" que venía del input type="time"
      if (duracion.includes(":")) {
        const [h, m] = duracion.split(":");
        return { horas: String(parseInt(h) || 0), minutos: String(parseInt(m) || 0) };
      }
      // Formato número en string, e.g. "90"
      const total = parseInt(duracion);
      if (!isNaN(total)) {
        return { horas: String(Math.floor(total / 60)), minutos: String(total % 60) };
      }
    }

    return { horas: "", minutos: "" };
  }

  // AGREGADO: convierte los campos horas y minutos del formulario a minutos totales
  // para enviarlo a la API (igual que antes, pero calculado desde los dos campos).
  function calcularMinutosTotales(horas, minutos) {
    const h = parseInt(horas)   || 0;
    const m = parseInt(minutos) || 0;
    return h * 60 + m;
  }

  function abrirModal(servicio = null) {
    if (servicio) {
      setEditando(servicio.id_servicio);
      // MODIFICADO: al editar, descompone la duración en horas y minutos
      const { horas, minutos } = parsearDuracion(servicio.duracion);
      setForm({
        nombre:          servicio.nombre,
        descripcion:     servicio.descripcion || "",
        precio:          servicio.precio,
        duracionHoras:   horas,
        duracionMinutos: minutos,
      });
      setPreview(servicio.imagen_url || null);
    } else {
      setEditando(null);
      setForm({
        nombre:          "",
        descripcion:     "",
        precio:          "",
        duracionHoras:   "",
        duracionMinutos: "",
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

    // MODIFICADO: convierte horas+minutos a minutos totales antes de enviar
    const minutosTotales = calcularMinutosTotales(form.duracionHoras, form.duracionMinutos);

    setSubiendo(true);
    try {
      const formData = new FormData();
      formData.append("nombre",      form.nombre);
      formData.append("descripcion", form.descripcion);
      formData.append("precio",      form.precio);
      // MODIFICADO: se envía la duración como minutos totales (número entero)
      formData.append("duracion",    minutosTotales > 0 ? minutosTotales : "");

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

  // MODIFICADO: formatea la duración guardada (minutos totales o string HH:MM)
  // a texto legible como "30 min", "1 h", "1 h 30 min".
  function formatearDuracion(duracion) {
    if (!duracion) return "";

    let totalMin = 0;

    if (typeof duracion === "number") {
      totalMin = duracion;
    } else if (typeof duracion === "string") {
      if (duracion.includes(":")) {
        const [h, m] = duracion.split(":");
        totalMin = parseInt(h) * 60 + parseInt(m);
      } else {
        totalMin = parseInt(duracion) || 0;
      }
    }

    if (totalMin <= 0) return "";

    const horas   = Math.floor(totalMin / 60);
    const minutos = totalMin % 60;

    if (horas > 0 && minutos > 0) return `${horas} h ${minutos} min`;
    if (horas > 0)                 return `${horas} h`;
    return `${minutos} min`;
  }

  // AGREGADO: texto de vista previa de la duración mientras el usuario escribe
  // en los campos del modal, para dar feedback inmediato.
  function previewDuracion() {
    const h = parseInt(form.duracionHoras)   || 0;
    const m = parseInt(form.duracionMinutos) || 0;
    if (h === 0 && m === 0) return null;
    if (h > 0 && m > 0) return `${h} h ${m} min`;
    if (h > 0)           return `${h} h`;
    return `${m} min`;
  }

  return (
    <div className="sv-page">

      <div className="sv-header">
        <div>
          <h1 className="sv-titulo">Gestión de Servicios</h1>
          <p className="sv-subtitulo">{servicios.length} servicios registrados</p>
        </div>
        <button className="sv-btn-agregar" onClick={() => abrirModal()}>
          + Nuevo Servicio
        </button>
      </div>

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

        <div className="sv-scroll">
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
                    {/* MODIFICADO: usa formatearDuracion actualizado */}
                    {s.duracion && (
                      <span className="sv-badge-gris">⏱ {formatearDuracion(s.duracion)}</span>
                    )}
                  </div>
                </div>

                <div className="sv-card-actions">
                  <button className="sv-btn-editar"   onClick={() => abrirModal(s)}>Editar</button>
                  <button className="sv-btn-eliminar" onClick={() => eliminarServicio(s.id_servicio)}>Eliminar</button>
                </div>

              </div>
            ))}
          </div>
        </div>

      )}

      {/* MODAL */}
      {modalOpen && (
        <div className="sv-overlay" onClick={cerrarModal}>
          <div className="sv-modal" onClick={(e) => e.stopPropagation()}>

            <h2 className="sv-modal-titulo">
              {editando ? "Editar Servicio" : "Nuevo Servicio"}
            </h2>

            <div className="sv-img-upload">
              <label className="sv-img-label">
                {preview
                  ? <img src={preview} alt="preview" className="sv-img-preview" />
                  : <div className="sv-img-placeholder"><span>📷</span><small>Subir imagen</small></div>
                }
                <input type="file" accept="image/*" onChange={handleImagen} style={{ display: "none" }} />
              </label>
            </div>

            <div className="sv-campo">
              <label className="sv-label">Nombre *</label>
              <input className="sv-input" value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
            </div>

            <div className="sv-campo">
              <label className="sv-label">Descripción</label>
              <input className="sv-input" value={form.descripcion}
                onChange={(e) => setForm({ ...form, descripcion: e.target.value })} />
            </div>

            <div className="sv-row">

              <div className="sv-campo">
                <label className="sv-label">Precio *</label>
                <input className="sv-input" type="number" value={form.precio}
                  onChange={(e) => setForm({ ...form, precio: e.target.value })} />
              </div>

              {/* MODIFICADO: reemplaza el input type="time" por dos inputs
                  numéricos separados: uno para horas y otro para minutos.
                  Debajo se muestra una vista previa del texto formateado. */}
              <div className="sv-campo">
                <label className="sv-label">Duración</label>
                <div className="sv-duracion-row">

                  <div className="sv-duracion-campo">
                    <input
                      className="sv-input sv-input-duracion"
                      type="number"
                      min="0"
                      max="23"
                      placeholder="0"
                      value={form.duracionHoras}
                      onChange={(e) => setForm({ ...form, duracionHoras: e.target.value })}
                    />
                    {/* AGREGADO: etiqueta de unidad debajo del input */}
                    <span className="sv-duracion-unidad">horas</span>
                  </div>

                  <span className="sv-duracion-sep">:</span>

                  <div className="sv-duracion-campo">
                    <input
                      className="sv-input sv-input-duracion"
                      type="number"
                      min="0"
                      max="59"
                      placeholder="0"
                      value={form.duracionMinutos}
                      onChange={(e) => setForm({ ...form, duracionMinutos: e.target.value })}
                    />
                    {/* AGREGADO: etiqueta de unidad debajo del input */}
                    <span className="sv-duracion-unidad">min</span>
                  </div>

                </div>

                {/* AGREGADO: vista previa del texto formateado en tiempo real */}
                {previewDuracion() && (
                  <p className="sv-duracion-preview">⏱ {previewDuracion()}</p>
                )}

              </div>

            </div>

            <div className="sv-modal-btns">
              <button className="sv-btn-cancelar" onClick={cerrarModal}>Cancelar</button>
              <button className="sv-btn-guardar" onClick={guardarServicio} disabled={subiendo}>
                {subiendo ? "Guardando..." : editando ? "Actualizar" : "Crear Servicio"}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
