import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Swal from "sweetalert2";
import logo from "../assets/logo.png";
import "../styles/login.css";

export default function Register() {
  const navigate = useNavigate();

  const [verPassword, setVerPassword] = useState(false);
  const [loading, setLoading]         = useState(false);
  const [correoTocado, setCorreoTocado] = useState(false); // ← NUEVO

  const initialForm = {
    nombre: "",
    nombreEmpresa: "",
    correo: "",
    telefono: "",
    password: "",
  };

  const [form, setForm] = useState(initialForm);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // VALIDAR CORREO
  const validarCorreo = (correo) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(correo);
  };

  // Estado derivado del correo ─────────────────────────────────────────────
  // "vacio"   → el campo está vacío
  // "invalido"→ tiene texto pero no es correo válido
  // "valido"  → pasa el regex
  const estadoCorreo = !form.correo
    ? "vacio"
    : validarCorreo(form.correo)
    ? "valido"
    : "invalido";

  // VALIDAR TELEFONO
  const validarTelefono = (telefono) => /^[0-9]{10}$/.test(telefono);

  // VALIDAR PASSWORD
  const validarPassword = (password) =>
    /^(?=.*[A-Z])(?=.*\d).{8,}$/.test(password);

  const limpiarFormulario = () => {
    setForm(initialForm);
    setVerPassword(false);
    setCorreoTocado(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setCorreoTocado(true); // fuerza mostrar error si aún está vacío al enviar

    if (!validarCorreo(form.correo)) {
      Swal.fire({ icon: "error", title: "Correo inválido", text: "Ingresa un correo válido" });
      setLoading(false);
      return;
    }

    if (!validarTelefono(form.telefono)) {
      Swal.fire({ icon: "error", title: "Teléfono inválido", text: "El teléfono debe tener 10 números" });
      setLoading(false);
      return;
    }

    if (!validarPassword(form.password)) {
      Swal.fire({ icon: "error", title: "Contraseña insegura", text: "Debe tener mínimo 8 caracteres, una mayúscula y un número" });
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("https://mi-api-atempo.onrender.com/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre:        form.nombre,
          nombreEmpresa: form.nombreEmpresa,
          correo:        form.correo,
          telefono:      form.telefono,
          password:      form.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        Swal.fire({ icon: "error", title: "Error", text: data.message || "Error en registro" });
        setLoading(false);
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
    } catch {
      Swal.fire({ icon: "error", title: "Error de conexión", text: "No se pudo conectar con el servidor" });
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
            style={{ width: "70px", height: "70px", borderRadius: "50%", objectFit: "cover", marginBottom: "10px" }}
          />
          <h1 className="login-title">Citalia</h1>
          <h2 className="login-subtitle">Crear cuenta</h2>
        </div>

        <form onSubmit={handleSubmit} autoComplete="off">

          {/* Nombre */}
          <div className="input-group">
            <input type="text" name="nombre" className="login-input" placeholder=" "
              value={form.nombre} onChange={handleChange} required />
            <label className="floating-label-text">Nombre completo</label>
          </div>

          {/* Empresa */}
          <div className="input-group">
            <input type="text" name="nombreEmpresa" className="login-input" placeholder=" "
              value={form.nombreEmpresa} onChange={handleChange} required />
            <label className="floating-label-text">Nombre de la empresa</label>
          </div>

          {/* ── Correo con validación en tiempo real ── */}
          <div className={`input-group correo-group ${correoTocado && estadoCorreo !== "vacio" ? `correo--${estadoCorreo}` : ""}`}>
            <input
              type="email"
              name="correo"
              className={`login-input${correoTocado && estadoCorreo === "invalido" ? " input--error" : ""}${correoTocado && estadoCorreo === "valido" ? " input--ok" : ""}`}
              placeholder=" "
              value={form.correo}
              onChange={(e) => {
                handleChange(e);
                setCorreoTocado(true); // activa feedback apenas empieza a escribir
              }}
              required
            />
            <label className="floating-label-text">Correo</label>

            {/* Ícono de estado */}
            {correoTocado && estadoCorreo === "valido" && (
              <span className="correo-icono correo-icono--ok" title="Correo válido">✔</span>
            )}
            {correoTocado && estadoCorreo === "invalido" && (
              <span className="correo-icono correo-icono--err" title="Correo inválido">✖</span>
            )}

            {/* Mensaje de error inline */}
            {correoTocado && estadoCorreo === "invalido" && (
              <p className="correo-hint">Ingresa un correo válido (ej: nombre@dominio.com)</p>
            )}
          </div>

          {/* Teléfono */}
          <div className="input-group">
            <input
              type="tel"
              name="telefono"
              className="login-input"
              placeholder=" "
              value={form.telefono}
              maxLength={10}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "");
                setForm({ ...form, telefono: value });
              }}
              required
            />
            <label className="floating-label-text">Teléfono</label>
          </div>

          {/* Contraseña */}
          <div className="input-group password-group">
            <input
              type={verPassword ? "text" : "password"}
              name="password"
              className="login-input"
              placeholder=" "
              value={form.password}
              onChange={handleChange}
              minLength={8}
              required
            />
            <label className="floating-label-text">Contraseña</label>
            <button type="button" className="toggle-password" onClick={() => setVerPassword(!verPassword)}>
              {verPassword ? "Ocultar" : "Ver"}
            </button>
          </div>

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? "Registrando..." : "Crear cuenta"}
          </button>

        </form>

        <div className="login-footer">
          ¿Ya tienes cuenta?{" "}
          <Link to="/login" className="login-link">Inicia sesión</Link>
        </div>

      </div>
    </div>
  );
}
