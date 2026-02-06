import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../styles/login.css";
import logo from "../assets/logo.png";

export default function Login() {
  const navigate = useNavigate();

  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [verPassword, setVerPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(
        "https://mi-api-atempo.onrender.com/api/auth/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ correo, password }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Error en login");
        setLoading(false);
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("empresaNombre", data.empresaNombre);

      if (data.empresaLogo) {
        localStorage.setItem("empresaLogo", data.empresaLogo);
      }

      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      alert("Error de conexión con el servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">

      {/* ======= TARJETA DE LOGIN (siempre visible) ======= */}
      <div className="login-card show">

        <div className="login-header">
          <img src={logo} alt="Logo Atempo" className="login-logo" />
        </div>

        <div className="login-body">
          <h1 className="login-title">Citalia</h1>
          <h2 className="login-subtitle">Iniciar sesión</h2>
        </div>

        <form onSubmit={handleLogin}>

          <div className="input-group">
            <input
              type="email"
              className="login-input"
              placeholder=" "
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              required
            />
            <label className="floating-label-text">Correo</label>
          </div>

          <div className="input-group password-group">
            <input
              type={verPassword ? "text" : "password"}
              className="login-input"
              placeholder=" "
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <label className="floating-label-text">Contraseña</label>

            <button
              type="button"
              className="toggle-password"
              onClick={() => setVerPassword(!verPassword)}
            >
              {verPassword ? "Ocultar" : "Ver"}
            </button>
          </div>

          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            {loading ? "Ingresando..." : "Entrar"}
          </button>
        </form>

        <div className="login-footer">
          ¿No tienes cuenta?{" "}
          <Link to="/register" className="login-link">
            Regístrate
          </Link>
        </div>

        <p className="login-legal">
          Al continuar, aceptas nuestros Términos y Política de privacidad.
        </p>
      </div>
    </div>
  );
}
