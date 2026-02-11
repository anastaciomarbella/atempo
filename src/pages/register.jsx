import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import logo from "../assets/logo.png";   // ← IMPORTANTE
import "../styles/login.css";

export default function Register() {
  const navigate = useNavigate();

  const [verPassword, setVerPassword] = useState(false);
  const [loading, setLoading] = useState(false);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1️⃣ Crear empresa
      const { data: empresaData, error: empresaError } = await supabase
        .from("empresas")
        .insert([{ nombre_empresa: form.nombreEmpresa }])
        .select()
        .single();

      if (empresaError) {
        alert("Error al crear empresa: " + empresaError.message);
        setLoading(false);
        return;
      }

      const idEmpresa = empresaData.id_empresa;

      // 2️⃣ Crear usuario
      const { error: usuarioError } = await supabase
        .from("usuarios")
        .insert([
          {
            nombre: form.nombre,
            correo: form.correo,
            telefono: form.telefono,
            contraseña: form.password,
            id_empresa: idEmpresa,
          },
        ]);

      if (usuarioError) {
        alert("Error al registrar usuario: " + usuarioError.message);
        setLoading(false);
        return;
      }

      alert("Registro exitoso 🎉");
      navigate("/login");
    } catch (err) {
      console.error(err);
      alert("Error de conexión con Supabase");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card show">
        <div
          className="login-body"
          style={{ textAlign: "center" }}
        >
          <img
            src={logo}
            alt="Citalia Logo"
            style={{
              width: "110px",
              marginBottom: "8px",
              display: "block",
              marginLeft: "auto",
              marginRight: "auto",
            }}
          />

          <h1 className="login-title">Citalia</h1>
          <h2 className="login-subtitle">Crear cuenta</h2>
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
