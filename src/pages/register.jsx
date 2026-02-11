import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import logo from "../assets/logo.png";
import "../styles/login.css";

export default function Register() {
  const navigate = useNavigate();

  const [verPassword, setVerPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [previewFoto, setPreviewFoto] = useState(null);
  const [fotoFile, setFotoFile] = useState(null);

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

  // Seleccionar foto y mostrar preview
  const handleFotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFotoFile(file);
      setPreviewFoto(URL.createObjectURL(file));
    }
  };

  const subirFotoASupabase = async (idUsuario) => {
    if (!fotoFile) return null;

    const nombreArchivo = `perfil_${idUsuario}_${Date.now()}.jpg`;

    const { error } = await supabase.storage
      .from("fotos-usuarios")
      .upload(nombreArchivo, fotoFile, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("Error al subir foto:", error);
      return null;
    }

    const { data } = supabase.storage
      .from("fotos-usuarios")
      .getPublicUrl(nombreArchivo);

    return data.publicUrl;
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

      // 2️⃣ Crear usuario SIN foto aún
      const { data: usuarioData, error: usuarioError } = await supabase
        .from("usuarios")
        .insert([
          {
            nombre: form.nombre,
            correo: form.correo,
            telefono: form.telefono,
            contraseña: form.password,
            id_empresa: idEmpresa,
          },
        ])
        .select()
        .single();

      if (usuarioError) {
        alert("Error al registrar usuario: " + usuarioError.message);
        setLoading(false);
        return;
      }

      const idUsuario = usuarioData.id_usuario;

      // 3️⃣ Subir foto y obtener URL
      const fotoUrl = await subirFotoASupabase(idUsuario);

      if (fotoUrl) {
        // 4️⃣ Guardar URL en la tabla usuarios
        await supabase
          .from("usuarios")
          .update({ "URL de la foto": fotoUrl })
          .eq("id_usuario", idUsuario);
      }

      alert("Registro exitoso con foto 🎉");
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
      <div className="login-card show" style={{ position: "relative" }}>

        {/* LOGO CIRCULAR TIPO BURBUJA */}
        <img
          src={previewFoto || logo}
          alt="Logo"
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

        {/* BOTÓN PARA SUBIR FOTO */}
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
