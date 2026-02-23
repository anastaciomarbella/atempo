import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Swal from "sweetalert2";
import logo from "../assets/logo.png";
import "../styles/login.css";

export default function Register() {
  const navigate = useNavigate();

  const [verPassword, setVerPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imagen, setImagen] = useState(null);
  const [preview, setPreview] = useState(null);

  const initialForm = {
    nombre: "",
    correo: "",
    telefono: "",
    password: "",
    nombreEmpresa: "",
  };

  const [form, setForm] = useState(initialForm);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleImagenChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagen(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const limpiarFormulario = () => {
    setForm(initialForm);
    setImagen(null);
    setPreview(null);
    setVerPassword(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("nombre", form.nombre);
      formData.append("correo", form.correo);
      formData.append("telefono", form.telefono);
      formData.append("password", form.password);
      formData.append("nombreEmpresa", form.nombreEmpresa);

      if (imagen) {
        formData.append("imagen", imagen);
      }

      const res = await fetch(
        "https://mi-api-atempo.onrender.com/api/auth/register",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();

      if (!res.ok) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: data.message || "Error en registro",
        });
        return;
      }

      limpiarFormulario();

      await Swal.fire({
        icon: "success",
        title: "Usuario registrado",
        text: "Tu cuenta fue creada correctamente",
        timer: 1500,
        showConfirmButton: false,
      });

      navigate("/login");
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error de conexión",
        text: "No se pudo conectar con el servidor",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card show">

        <div style={{ textAlign: "center", marginTop: "20px" }}>

          {/* 🔵 NUEVO CÍRCULO PARA SUBIR IMAGEN */}
          <label
            style={{
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "110px",
              height: "110px",
              borderRadius: "50%",
              border: "2px dashed #ccc",
              overflow: "hidden",
              marginBottom: "15px",
              backgroundColor: "#f8f8f8",
              fontSize: "12px",
              color: "#777",
              textAlign: "center"
            }}
          >
            {preview ? (
              <img
                src={preview}
                alt="preview"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            ) : (
              <span>Subir logo</span>
            )}

            <input
              type="file"
              accept="image/*"
              onChange={handleImagenChange}
              style={{ display: "none" }}
            />
          </label>

          {/* 🔹 TU LOGO ORIGINAL (NO SE TOCA) */}
          <img
            src={logo}
            alt="Logo"
            style={{
              width: "70px",
              height: "70px",
              borderRadius: "50%",
              objectFit: "cover",
              marginBottom: "10px",
            }}
          />

          <h1 className="login-title">Citalia</h1>
          <h2 className="login-subtitle">Crear cuenta</h2>
        </div>

        <form onSubmit={handleSubmit} autoComplete="off">
          {/* --- TODO TU FORMULARIO IGUAL --- */}

          <div className="input-group">
            <input
              type="text"
              name="nombre"
              className="login-input"
              placeholder=" "
              value={form.nombre}
              onChange={handleChange}
              required
            />
            <label className="floating-label-text">
              Nombre completo
            </label>
          </div>

          <div className="input-group">
            <input
              type="email"
              name="correo"
              className="login-input"
              placeholder=" "
              value={form.correo}
              onChange={handleChange}
              required
            />
            <label className="floating-label-text">
              Correo
            </label>
          </div>

          <div className="input-group">
            <input
              type="tel"
              name="telefono"
              className="login-input"
              placeholder=" "
              value={form.telefono}
              onChange={handleChange}
              required
            />
            <label className="floating-label-text">
              Teléfono
            </label>
          </div>

          <div className="input-group password-group">
            <input
              type={verPassword ? "text" : "password"}
              name="password"
              className="login-input"
              placeholder=" "
              value={form.password}
              onChange={handleChange}
              required
            />
            <label className="floating-label-text">
              Contraseña
            </label>

            <button
              type="button"
              className="toggle-password"
              onClick={() => setVerPassword(!verPassword)}
            >
              {verPassword ? "Ocultar" : "Ver"}
            </button>
          </div>

          <div className="input-group">
            <input
              type="text"
              name="nombreEmpresa"
              className="login-input"
              placeholder=" "
              value={form.nombreEmpresa}
              onChange={handleChange}
              required
            />
            <label className="floating-label-text">
              Nombre de la empresa
            </label>
          </div>

          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            {loading ? "Registrando..." : "Crear cuenta"}
          </button>

        </form>

        <div className="login-footer">
          ¿Ya tienes cuenta?{" "}
          <Link to="/login" className="login-link">
            Inicia sesión
          </Link>
        </div>

      </div>
    </div>
  );
}