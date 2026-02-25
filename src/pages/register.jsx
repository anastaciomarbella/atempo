import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Swal from "sweetalert2";
import logo from "../assets/logo.png";
import "../styles/login.css";

export default function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [verPassword, setVerPassword] = useState(false);
  const [logoEmpresa, setLogoEmpresa] = useState(null);

  const [form, setForm] = useState({
    nombre: "",
    nombreEmpresa: "",
    correo: "",
    telefono: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowed = ["image/jpeg", "image/png"];

    if (!allowed.includes(file.type)) {
      Swal.fire({
        icon: "error",
        title: "Formato inválido",
        text: "Solo se permiten imágenes JPG o PNG",
      });
      return;
    }

    setLogoEmpresa(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("nombre", form.nombre);
      formData.append("nombreEmpresa", form.nombreEmpresa);
      formData.append("correo", form.correo);
      formData.append("telefono", form.telefono);
      formData.append("password", form.password);
      formData.append("logo", logoEmpresa);

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
          text: data.message || "Error en el registro",
        });
        return;
      }

      await Swal.fire({
        icon: "success",
        title: "Registro exitoso",
        text: "Tu empresa fue registrada correctamente",
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

          <div className="input-group">
            <input
              type="file"
              accept="image/png, image/jpeg"
              onChange={handleLogoChange}
              required
            />
            <label className="floating-label-text">Logo de la empresa</label>
          </div>

          <div className="input-group">
            <input
              type="text"
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              required
            />
            <label className="floating-label-text">Nombre completo</label>
          </div>

          <div className="input-group">
            <input
              type="text"
              name="nombreEmpresa"
              value={form.nombreEmpresa}
              onChange={handleChange}
              required
            />
            <label className="floating-label-text">Empresa</label>
          </div>

          <div className="input-group">
            <input
              type="email"
              name="correo"
              value={form.correo}
              onChange={handleChange}
              required
            />
            <label className="floating-label-text">Correo</label>
          </div>

          <div className="input-group">
            <input
              type="tel"
              name="telefono"
              value={form.telefono}
              onChange={handleChange}
              required
            />
            <label className="floating-label-text">Teléfono</label>
          </div>

          <div className="input-group password-group">
            <input
              type={verPassword ? "text" : "password"}
              name="password"
              value={form.password}
              onChange={handleChange}
              required
            />
            <label className="floating-label-text">Contraseña</label>
            <button
              type="button"
              onClick={() => setVerPassword(!verPassword)}
            >
              {verPassword ? "Ocultar" : "Ver"}
            </button>
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Registrando..." : "Crear cuenta"}
          </button>

        </form>

        <div className="login-footer">
          ¿Ya tienes cuenta?{" "}
          <Link to="/login">Inicia sesión</Link>
        </div>

      </div>
    </div>
  );
}