import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { API_URL } from "../config";
import logo from "../assets/logo.png";
import "../styles/login.css";

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [logoError, setLogoError] = useState(false);

  const initialForm = {
    correo: "",
    password: "",
  };

  const [form, setForm] = useState(initialForm);

  // 🔍 Debug del logo al montar el componente
  console.log("🖼️ [Logo] Valor importado:", logo);
  console.log("🖼️ [Logo] Tipo:", typeof logo);
  console.log("🖼️ [Logo] Es string vacío?", logo === "");
  console.log("🖼️ [Logo] Es undefined?", logo === undefined);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const limpiarFormulario = () => {
    setForm(initialForm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.correo || !form.password) {
      setError("Todos los campos son obligatorios");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          correo: form.correo.trim().toLowerCase(),
          password: form.password.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.message || "Correo o contraseña incorrectos");
        return;
      }

      if (!data.token) {
        setError("El servidor no devolvió token");
        return;
      }

      // Guardar sesión
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.usuario));

      // 🔔 Notificar al Sidebar que el usuario cambió
      window.dispatchEvent(new Event("user-updated"));

      limpiarFormulario();

      // Redirigir
      navigate("/agenda-diaria");

    } catch (error) {
      console.error("Error login:", error);
      setError("No se pudo conectar con el servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      {/* ✅ Logo FUERA del login-card para que persista */}
      <div className="login-logo-wrapper">
        {logoError ? (
          <div style={{
            width: "90px", height: "90px", borderRadius: "50%",
            background: "#ccc", display: "flex", alignItems: "center",
            justifyContent: "center", fontSize: "12px", color: "#666"
          }}>
            Sin logo
          </div>
        ) : (
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
            onLoad={() => {
              console.log("✅ [Logo] Imagen cargada correctamente. src:", logo);
            }}
            onError={(e) => {
              console.error("❌ [Logo] Error al cargar la imagen");
              console.error("❌ [Logo] src intentado:", e.target.src);
              console.error("❌ [Logo] Verifica que el archivo exista en: src/assets/logo.png");
              setLogoError(true);
            }}
          />
        )}
        <h1 className="login-title">Citalia</h1>
      </div>

      <div className="login-card show">
        <div style={{ textAlign: "center", marginTop: "10px" }}>
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
              required
            />
            <label className="floating-label-text">Contraseña</label>
          </div>

          {error && (
            <div className="login-error">{error}</div>
          )}

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