import React, { useState, useEffect } from "react";
import "../styles/configuracion.css";
import { FaSave, FaImage } from "react-icons/fa";
import Header from "../components/header/header"; // 👈 importar tu header

const API = "https://mi-api-atempo.onrender.com";

const Configuracion = () => {

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = localStorage.getItem("token");

  const [form, setForm] = useState({
    nombre: "",
    nombre_empresa: "",
    telefono: "",
    slug: "",
    logo: null
  });

  const [preview, setPreview] = useState(null);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    setForm({
      nombre:         user.nombre         || "",
      nombre_empresa: user.nombre_empresa || "",
      telefono:       user.telefono       || "",
      slug:           user.slug           || "",
      logo: null
    });

    setPreview(user.logo_url || null);

  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogo = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setForm({ ...form, logo: file });
    setPreview(URL.createObjectURL(file));
  };

  const guardarCambios = async () => {

    setCargando(true);

    try {

      // ==============================
      // actualizar usuario
      // ==============================
      const resUsuario = await fetch(`${API}/api/auth/usuarios/${user.id_usuario}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          nombre: form.nombre,
          telefono: form.telefono
        })
      });

      const dataUsuario = await resUsuario.json();

      if (!resUsuario.ok) {
        alert(dataUsuario.mensaje || "Error al actualizar usuario");
        setCargando(false);
        return;
      }

      // ==============================
      // actualizar empresa
      // ==============================
      const formData = new FormData();

      formData.append("nombre_empresa", form.nombre_empresa);
      formData.append("slug", form.slug);

      if (form.logo) {
        formData.append("logo", form.logo);
      }

      const resEmpresa = await fetch(`${API}/api/empresas/${user.id_empresa}`, {
        method: "PUT",
        body: formData
      });

      const dataEmpresa = await resEmpresa.json();

      if (!resEmpresa.ok) {
        alert(dataEmpresa.mensaje || "Error al actualizar empresa");
        setCargando(false);
        return;
      }

      // ==============================
      // actualizar localStorage
      // ==============================
      const nuevoUser = {
        ...user,
        nombre: form.nombre,
        telefono: form.telefono,
        nombre_empresa: dataEmpresa.nombre_empresa || form.nombre_empresa,
        slug: dataEmpresa.slug || form.slug,
        logo_url: dataEmpresa.logo_url || user.logo_url
      };

      localStorage.setItem("user", JSON.stringify(nuevoUser));

      alert("✅ Configuración actualizada correctamente");

    } catch (err) {

      console.error(err);
      alert("Error del servidor");

    } finally {

      setCargando(false);

    }
  };

  return (

    <>
      {/* HEADER */}
      <Header />

      <div className="configuracion-container">

        <h1 className="titulo-configuracion">
          Configuración de cuenta
        </h1>

        <div className="card-configuracion">

          <div className="logo-section">

            {preview ? (
              <img src={preview} className="logo-preview" alt="logo" />
            ) : (
              <div className="logo-placeholder">
                <FaImage />
              </div>
            )}

            <label className="btn-logo">
              Cambiar logo
              <input
                type="file"
                accept="image/*"
                onChange={handleLogo}
                hidden
              />
            </label>

          </div>

          <div className="form-configuracion">

            <div className="campo">
              <label>Nombre</label>
              <input
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
              />
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
              <input
                name="slug"
                value={form.slug}
                onChange={handleChange}
              />
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

    </>
  );

};

export default Configuracion;