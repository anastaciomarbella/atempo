import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

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

      // Guardar datos útiles en localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("empresaNombre", data.empresaNombre);
      if (data.empresaLogo) {
        localStorage.setItem("empresaLogo", data.empresaLogo);
      }

      // Redirigir a tu dashboard/agenda
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      alert("Error de conexión con el servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "50px auto" }}>
      <h2>Iniciar sesión</h2>

      <form onSubmit={handleLogin}>
        <div>
          <label>Correo</label>
          <input
            type="email"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Contraseña</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Ingresando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}
