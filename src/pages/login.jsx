import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { API_URL } from "../config";
import logo from "../assets/logo.png";
import "../styles/login.css";

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const initialForm = { correo: "", password: "" };
  const [form, setForm] = useState(initialForm);

  // 🔹 Si ya hay token, redirigir automáticamente
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) navigate("/agenda-diaria");
  }, [navigate]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const limpiarFormulario = () => {
    setForm(initialForm);
    setErrorMsg("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!form.correo || !form.password) {
      setErrorMsg("Todos los campos son obligatorios");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          correo: form.correo.trim().toLowerCase(),
          password: form.password.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data?.message || "Correo o contraseña incorrectos");
        return;
      }

      if (!data.token) {
        setErrorMsg("El servidor no devolvió token");
        return;
      }

      // 🔹 Guardar token y usuario en localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.usuario));

      limpiarFormulario();
      navigate("/agenda-diaria");

    } catch (error) {
      console.error("Error login:", error);
      setErrorMsg("No se pudo conectar con el servidor");
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
              autoComplete="username"
              required
            />
            <label className="floating-label-text">Correo</label>
          </div>

          <div className="input-group">
            <input
              type="password"
              name="password"
              className="login-input"
              placeholder=" "
              value={form.password}
              onChange={handleChange}
              autoComplete="current-password"
              required
            />
            <label className="floating-label-text">Contraseña</label>
          </div>

          {errorMsg && <div className="login-error">{errorMsg}</div>}

          <button type="submit" className="login-button" disabled={loading}>
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