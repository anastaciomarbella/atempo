import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import "../styles/login.css";

export default function Register() {
  const navigate = useNavigate();

  const [verPassword, setVerPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [previewFoto, setPreviewFoto] = useState(null);

  const [form, setForm] = useState({
    nombre: "",
    correo: "",
    telefono: "",
    password: "",
    nombreEmpresa: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Solo para preview visual (NO se envía al backend ahora)
  const handleFotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("Tu foto es muy pesada. Usa una menor a 2MB.");
      return;
    }

    setPreviewFoto(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(
        "https://mi-api-atempo.onrender.com/api/auth/registro",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nombre: form.nombre,
            correo: form.correo,
            telefono: form.telefono,
            password: form.password,
            nombreEmpresa: form.nombreEmpresa,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Error en registro");
        return;
      }

      alert("Cuenta creada correctamente");
      navigate("/login");

    } catch (err) {
      console.error(err);
      alert("Error de conexión con el servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card show" style={{ position: "relative" }}>
        
        <img
          src={previewFoto || logo}
          alt="Foto de perfil"
          style={{
            width: "70px",
            height: "70px",
            borderRadius: "50%",
            objectFit: "cover",
            position: "absolute",
            top: "15px",
            left: "15px",
            boxShadow: "0 4px 10px rgba(0,0,0,.15)",
            border: "2px solid white",
          }}
        />

        <div className="login-body" style={{ textAlign: "center", marginTop: "30px" }}>
          <h1 className="login-title">Citalia</h1>
          <h2 className="login-subtitle">Crear cuenta</h2>
        </div>

        <div style={{ textAlign: "center", marginBottom: "10px" }}>
          <label
            style={{
              display: "inline-block",
              padding: "8px 12px",
              borderRadius: "8px",
              background: "#f2f2f2",
              cursor: "pointer",
              fontSize: "13px",
              border: "1px solid #ddd",
            }}
          >
            📷 Subir foto de perfil
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={handleFotoChange}
            />
          </label>
        </div>

        <form onSubmit={handleSubmit}>
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
            <label className="floating-label-text">Nombre completo</label>
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
            <label className="floating-label-text">Correo</label>
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
            <label className="floating-label-text">Teléfono</label>
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
            <label className="floating-label-text">Contraseña</label>

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
            <label className="floating-label-text">Nombre de la empresa</label>
          </div>

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? "Creando cuenta..." : "Crear cuenta"}
          </button>
        </form>

        <div className="login-footer">
          ¿Ya tienes cuenta?{" "}
          <a href="/login" className="login-link">
            Inicia sesión
          </a>
        </div>

        <p className="login-legal">
          Al crear tu cuenta aceptas nuestros Términos y Política de privacidad.
        </p>
      </div>
    </div>
  );
}
