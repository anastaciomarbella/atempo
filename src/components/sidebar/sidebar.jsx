import React, { useEffect, useState } from "react";
import "./sidebar.css";
import { NavLink, useNavigate } from "react-router-dom";
import {
  FaCalendarDay,
  FaCalendarWeek,
  FaPlus,
  FaUsers,
  FaSignOutAlt,
} from "react-icons/fa";

const Sidebar = ({ onAbrirModal, modalActivo }) => {
  const navigate = useNavigate();

  const [user, setUser] = useState({
    nombre_usuario: "Usuario",
    logoUsuario: null,
  });

  // Función para obtener URL segura del logo de Supabase
  const getSafeLogoUrl = (logoUrl) => {
    if (!logoUrl || logoUrl === "null" || logoUrl.trim() === "") {
      console.log("Logo vacío o null, se usará placeholder");
      return null;
    }

    // Si ya es URL completa
    if (/^https?:\/\//i.test(logoUrl)) {
      return logoUrl;
    }

    // Si es solo el path dentro del bucket de Supabase
    const supabasePublicUrl = `https://bjstsqvzzczjiahlxffp.supabase.co/storage/v1/object/public/bucket_logo/${logoUrl}`;
    return supabasePublicUrl;
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        console.log("Usuario desde localStorage:", parsedUser);

        setUser({
          nombre_usuario: parsedUser.nombre_usuario || "Usuario",
          logoUsuario: getSafeLogoUrl(parsedUser.logo_url),
        });
      } catch (error) {
        console.error("Error leyendo usuario:", error);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <aside className="sidebar">
      {/* LOGO USUARIO */}
      <div className="logo-section">
        {user.logoUsuario ? (
          <img
            src={user.logoUsuario}
            alt="Logo usuario"
            className="logo"
            onError={(e) => {
              console.log("Error cargando la imagen del logo:", e.target.src);
              e.target.onerror = null;
              e.target.src = "/placeholder-logo.png"; // placeholder local
            }}
          />
        ) : (
          <div className="logo-placeholder">
            {user.nombre_usuario.charAt(0).toUpperCase()}
          </div>
        )}
        <h2 className="brand-name">{user.nombre_usuario}</h2>
      </div>

      {/* MENÚ */}
      <nav className="menu">
        <NavLink
          to="/agenda-diaria"
          className={({ isActive }) =>
            isActive && modalActivo !== "cita" ? "active" : ""
          }
        >
          <FaCalendarDay className="icon" />
          Agenda diaria
        </NavLink>

        <NavLink
          to="/agenda-semanal"
          className={({ isActive }) =>
            isActive && modalActivo !== "cita" ? "active" : ""
          }
        >
          <FaCalendarWeek className="icon" />
          Agenda semanal
        </NavLink>

        <button
          onClick={() => onAbrirModal("cita")}
          className={`menu-btn ${modalActivo === "cita" ? "active" : ""}`}
        >
          <FaPlus className="icon" />
          Agendar cita
        </button>

        <NavLink
          to="/empleados"
          className={({ isActive }) =>
            isActive && modalActivo !== "cita" ? "active" : ""
          }
        >
          <FaUsers className="icon" />
          Empleados
        </NavLink>
      </nav>

      {/* CERRAR SESIÓN */}
      <button className="logout-btn" onClick={handleLogout}>
        <FaSignOutAlt className="icon logout-icon" />
        Cerrar sesión
      </button>
    </aside>
  );
};

export default Sidebar;