import React, { useEffect, useState } from "react";
import "./configuracion.css";

const API = "https://mi-api-atempo.onrender.com";

const Configuracion = () => {

  const [user, setUser] = useState(null);

  const [form, setForm] = useState({
    nombre: "",
    nombre_empresa: "",
    telefono: "",
    slug: "",
    logo: null
  });

  const [previewLogo, setPreviewLogo] = useState(null);

  useEffect(() => {

    const storedUser = JSON.parse(localStorage.getItem("user"));

    if (storedUser) {

      setUser(storedUser);

      setForm({
        nombre: storedUser.nombre || "",
        nombre_empresa: storedUser.nombre_empresa || "",
        telefono: storedUser.telefono || "",
        slug: storedUser.slug || "",
        logo: null
      });

      if (storedUser.logo) {
        setPreviewLogo(`${API}/uploads/${storedUser.logo}`);
      }

    }

  }, []);

  const handleChange = (e) => {

    const { name, value } = e.target;

    setForm({
      ...form,
      [name]: value
    });

  };

  const handleLogo = (e) => {

    const file = e.target.files[0];

    if (!file) return;

    setForm({
      ...form,
      logo: file
    });

    setPreviewLogo(URL.createObjectURL(file));

  };

  const guardarCambios = async () => {

    const formData = new FormData();

    formData.append("nombre", form.nombre);
    formData.append("nombre_empresa", form.nombre_empresa);
    formData.append("telefono", form.telefono);
    formData.append("slug", form.slug);

    if (form.logo) {
      formData.append("logo", form.logo);
    }

    try {

      const res = await fetch(`${API}/api/empresas/${user.id_empresa}`, {
        method: "PUT",
        body: formData
      });

      const data = await res.json();

      if (res.ok) {

        const nuevoUser = {
          ...user,
          ...data
        };

        localStorage.setItem("user", JSON.stringify(nuevoUser));

        alert("Configuración actualizada");

        window.location.reload();

      } else {

        alert(data.message || "Error al actualizar");

      }

    } catch (err) {

      console.error(err);
      alert("Error del servidor");

    }

  };

  return (
    <div className="config-container">

      <h2>Configuración</h2>

      <div className="config-card">

        <label>Nombre</label>
        <input
          type="text"
          name="nombre"
          value={form.nombre}
          onChange={handleChange}
        />

        <label>Nombre de la empresa</label>
        <input
          type="text"
          name="nombre_empresa"
          value={form.nombre_empresa}
          onChange={handleChange}
        />

        <label>Teléfono</label>
        <input
          type="text"
          name="telefono"
          value={form.telefono}
          onChange={handleChange}
        />

        <label>Slug (link público)</label>
        <input
          type="text"
          name="slug"
          value={form.slug}
          onChange={handleChange}
        />

        <label>Logo</label>

        {previewLogo && (
          <img
            src={previewLogo}
            alt="logo"
            className="preview-logo"
          />
        )}

        <input
          type="file"
          onChange={handleLogo}
        />

        <button
          className="btn-guardar"
          onClick={guardarCambios}
        >
          Guardar cambios
        </button>

      </div>

    </div>
  );

};

export default Configuracion;