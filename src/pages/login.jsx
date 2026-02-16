import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import "../styles/login.css";

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const initialForm = {
    correo: "",
    telefono: "",
  };

  const [form, setForm] = useState(initialForm);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const limpiarFormulario = () => {
    setForm(initialForm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(
        "https://mi-api-atempo.onrender.com/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        }
      );

      const data = await res.json();
      console.log("Respuesta backend:", data);

      if (!res.ok) {
        alert(data.message || "Error en login");
        return;
      }

      alert("Login exitoso");

      // Guardar usuario en localStorage
      localStorage.setItem("usuario", JSON.stringify(data.usuario));

      limpiarFormulario();
      navigate("/dashboard");

    } catch (error) {
      console.error("Error:", error);
      alert("No se pudo conectar con el servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card show">

        {/* LOGO + TITULOS */}
        <div
          className="login-body"
          style={{ textAlign: "center", marginTop: "20px" }}
        >
          <img
            src={logo}
            alt="Logo"
            style={{
              width: "90px",
              height: "90px",
              borderRadius: "50%",
              objectFit: "cover",
              marginBottom: "10px",
              boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
            }}
          />
          <h1 className="login-title">Citalia</h1>
          <h2 className="login-subtitle">Iniciar sesión</h2>
        </div>

        {/* FORMULARIO */}
        <form onSubmit={handleSubmit} autoComplete="off">

          <div className="input-group">
            <input
              type="email"
              name="correo"
              className="login-input"
              placeholder=" "
              value={form.correo}
              onChange={handleChange}
              required
              autoComplete="off"
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
              autoComplete="off"
            />
            <label className="floating-label-text">
              Teléfono
            </label>
          </div>

          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            {loading ? "Ingresando..." : "Ingresar"}
          </button>

        </form>

        {/* FOOTER */}
        <div className="login-footer">
          ¿No tienes cuenta?{" "}
          <a href="/register" className="login-link">
            Crear cuenta
          </a>
        </div>

      </div>
    </div>
  );
}
