import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Swal from "sweetalert2";
import { supabase } from "../supabaseClient";
import logo from "../assets/logo.png";
import "../styles/login.css";

export default function Register() {
  const navigate = useNavigate();

  const [verPassword, setVerPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [logoEmpresa, setLogoEmpresa] = useState(null);

  const initialForm = {
    nombre: "",
    nombreEmpresa: "",
    correo: "",
    telefono: "",
    password: "",
  };

  const [form, setForm] = useState(initialForm);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      Swal.fire({
        icon: "error",
        title: "Archivo inválido",
        text: "Solo puedes subir imágenes",
      });
      return;
    }

    setLogoEmpresa(file);
  };

  const limpiarFormulario = () => {
    setForm(initialForm);
    setLogoEmpresa(null);
    setVerPassword(false);
  };

  // 🔥 SUBIR A SUPABASE
  const subirLogoASupabase = async (file) => {
    const fileName = `${Date.now()}-${file.name}`;

    const { error } = await supabase.storage
      .from("logos")
      .upload(fileName, file);

    if (error) {
      console.error("Error subiendo logo:", error);
      return null;
    }

    const { data } = supabase.storage
      .from("logos")
      .getPublicUrl(fileName);

    return data.publicUrl;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    try {
      let logoUrl = null;

      // 👇 Subimos primero a Supabase
      if (logoEmpresa) {
        logoUrl = await subirLogoASupabase(logoEmpresa);

        if (!logoUrl) {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "No se pudo subir el logo",
          });
          setLoading(false);
          return;
        }
      }

      // 👇 Ahora mandamos JSON al backend
      const res = await fetch(
        "https://mi-api-atempo.onrender.com/api/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nombre: form.nombre,
            nombreEmpresa: form.nombreEmpresa,
            correo: form.correo,
            telefono: form.telefono,
            password: form.password,
            logo_url: logoUrl,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: data.message || "Error en registro",
        });
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
              name="logo"
              className="login-input"
              accept="image/*"
              onChange={handleLogoChange}
              required
            />
            <label className="floating-label-text">
              Subir logo
            </label>
          </div>

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
              type="tel"
              name="telefono"
              className="login-input"
              placeholder=" "
              value={form.telefono}
              onChange={handleChange}
              required
            />
            <label className="floating-label-text">
              Teléfono
            </label>
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
          <Link to="/login" className="login-link">
            Inicia sesión
          </Link>
        </div>

      </div>
    </div>
  );
}