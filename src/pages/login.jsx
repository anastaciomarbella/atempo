import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import logo from "../assets/logo.png";
import "../styles/login.css";

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const initialForm = {
    correo: "",
    password: "",
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
          body: JSON.stringify({
            correo: form.correo.trim().toLowerCase(),
            password: form.password.trim(),
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Correo o contraseña incorrectos");
        setLoading(false);
        return;
      }

      // Guardar usuario y token
      localStorage.setItem("token", data.token);
      localStorage.setItem("usuario", JSON.stringify(data.usuario));

      limpiarFormulario();
      navigate("/dashboard");

    } catch (error) {
      alert("No se pudo conectar con el servidor");
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
            />
            <label className="floating-label-text">
              Correo
            </label>
          </div>

          <div className="input-group">
            <input
              type="password"
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
          </div>

          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            {loading ? "Ingresando..." : "Ingresar"}
          </button>

        </form>

        <div className="login-footer">
          ¿No tienes cuenta?{" "}
          <Link to="/register" className="login-link">
            Crear cuenta
          </Link>
        </div>

      </div>
    </div>
  );
}
