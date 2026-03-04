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
import { API_URL } from "../../config"; // Asegúrate de tener tu API_URL

const Sidebar = ({ onAbrirModal, modalActivo }) => {
  const navigate = useNavigate();

  const [user, setUser] = useState({
    empresaNombre: "Mi Empresa",
    empresaLogo: null,
  });

  // Función para obtener URL segura del logo
  const getSafeLogoUrl = (logoUrl) => {
    if (!logoUrl) return null;

    // Si es absoluta (http o https), forzar https
    if (/^https?:\/\//i.test(logoUrl)) {
      return logoUrl.replace(/^http:\/\//i, "https://");
    }

    // Si es relativa, agregar API_URL
    return `${API_URL}/${logoUrl}`;
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);

        setUser({
          empresaNombre: parsedUser.nombre_empresa || "Mi Empresa",
          empresaLogo: getSafeLogoUrl(parsedUser.logo_url),
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
      {/* LOGO */}
      <div className="logo-section">
        {user.empresaLogo ? (
          <img
            src={user.empresaLogo}
            alt="Logo empresa"
            className="logo"
            onError={(e) => {
              // Si falla la carga, mostrar placeholder
              e.target.onerror = null;
              e.target.src = null;
            }}
          />
        ) : (
          <div className="logo-placeholder">
            {user.empresaNombre.charAt(0).toUpperCase()}
          </div>
        )}
        <h2 className="brand-name">{user.empresaNombre}</h2>
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