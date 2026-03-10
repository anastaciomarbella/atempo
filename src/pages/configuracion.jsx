import React, { useState, useEffect } from "react";
import "../styles/configuracion.css";
import { FaSave, FaImage } from "react-icons/fa";

const API = "https://mi-api-atempo.onrender.com";

const Configuracion = () => {
  const token = localStorage.getItem("token");

  // Leer user siempre fresco del localStorage (no al montar solo)
  const getUser = () => JSON.parse(localStorage.getItem("user") || "{}");

  const [form, setForm] = useState({
    nombre: "",
    nombre_empresa: "",
    telefono: "",
    slug: "",
    logo: null,
  });

  const [preview, setPreview] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [alerta, setAlerta] = useState(null);

  // Cargar datos del usuario al montar
  useEffect(() => {
    const user = getUser();
    setForm({
      nombre:         user.nombre         || "",
      nombre_empresa: user.nombre_empresa || "",
      telefono:       user.telefono       || "",
      slug:           user.slug           || "",
      logo: null,
    });
    // Quitar el ?t=... del preview para que no acumule timestamps
    setPreview(user.logo_url ? user.logo_url.split("?")[0] : null);
  }, []);

  const mostrarAlerta = (tipo, mensaje) => {
    setAlerta({ tipo, mensaje });
    setTimeout(() => setAlerta(null), 3500);
  };

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleLogo = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setForm({ ...form, logo: file });
    setPreview(URL.createObjectURL(file)); // preview local inmediato
  };

  const guardarCambios = async () => {
    setCargando(true);
    const user = getUser(); // leer fresco por si cambió

    try {
      // ── 1. Actualizar datos del usuario ──────────────────────────────────
      const resUsuario = await fetch(
        `${API}/api/auth/usuarios/${user.id_usuario}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            nombre:   form.nombre,
            telefono: form.telefono,
          }),
        }
      );

      const dataUsuario = await resUsuario.json();
      if (!resUsuario.ok) {
        mostrarAlerta("error", dataUsuario.mensaje || "Error al actualizar usuario");
        return;
      }

      // ── 2. Actualizar empresa (con logo si cambió) ────────────────────────
      const formData = new FormData();
      formData.append("nombre_empresa", form.nombre_empresa);
      formData.append("slug", form.slug);
      if (form.logo) formData.append("logo", form.logo);

      const resEmpresa = await fetch(
        `${API}/api/empresas/${user.id_empresa}`,
        { method: "PUT", body: formData }
      );

      const dataEmpresa = await resEmpresa.json();
      if (!resEmpresa.ok) {
        mostrarAlerta("error", dataEmpresa.mensaje || "Error al actualizar empresa");
        return;
      }

      // ── 3. Actualizar localStorage con todos los datos nuevos ─────────────
      // La URL de Supabase es permanente; quitamos el ?t= para el storage
      const logoUrlLimpia = dataEmpresa.logo_url
        ? dataEmpresa.logo_url.split("?")[0]
        : user.logo_url?.split("?")[0] || null;

      const nuevoUser = {
        ...user,
        nombre:         form.nombre,
        telefono:       form.telefono,
        nombre_empresa: dataEmpresa.nombre_empresa || form.nombre_empresa,
        slug:           dataEmpresa.slug           || form.slug,
        logo_url:       logoUrlLimpia,
      };

      localStorage.setItem("user", JSON.stringify(nuevoUser));

      // ── 4. Notificar al Sidebar para que se refresque ─────────────────────
      window.dispatchEvent(new Event("user-updated"));

      // ── 5. Actualizar preview con cache-busting para ver el cambio ya ─────
      if (logoUrlLimpia) {
        setPreview(`${logoUrlLimpia}?t=${Date.now()}`);
      }

      // Limpiar el archivo seleccionado
      setForm((prev) => ({ ...prev, logo: null }));

      mostrarAlerta("exito", "✅ Cambios guardados correctamente");

    } catch (err) {
      console.error(err);
      mostrarAlerta("error", "Error del servidor");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="configuracion-container">

      {alerta && (
        <div className={`alerta-toast ${alerta.tipo}`}>
          {alerta.mensaje}
        </div>
      )}

      <h1 className="titulo-configuracion">Configuración de cuenta</h1>

      <div className="card-configuracion">

        {/* LOGO */}
        <div className="logo-section">
          {preview ? (
            <img
              src={preview}
              className="logo-preview"
              alt="logo"
              onError={(e) => {
                e.target.style.display = "none";
                setPreview(null);
              }}
            />
          ) : (
            <div className="logo-placeholder">
              <FaImage />
            </div>
          )}

          <label className="btn-logo">
            Cambiar logo
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleLogo}
              hidden
            />
          </label>

          {form.logo && (
            <p className="logo-hint">
              📎 {form.logo.name} — guarda los cambios para subir
            </p>
          )}
        </div>

        {/* FORMULARIO */}
        <div className="form-configuracion">
          <div className="campo">
            <label>Nombre</label>
            <input name="nombre" value={form.nombre} onChange={handleChange} />
          </div>

          <div className="campo">
            <label>Nombre de empresa</label>
            <input
              name="nombre_empresa"
              value={form.nombre_empresa}
              onChange={handleChange}
            />
          </div>

          <div className="campo">
            <label>Teléfono</label>
            <input
              name="telefono"
              value={form.telefono}
              onChange={handleChange}
            />
          </div>

          <div className="campo">
            <label>Slug del link público</label>
            <input name="slug" value={form.slug} onChange={handleChange} />
          </div>

          <button
            className="guardar-btn"
            onClick={guardarCambios}
            disabled={cargando}
          >
            <FaSave />
            {cargando ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>

      </div>
    </div>
  );
};

export default Configuracion;
