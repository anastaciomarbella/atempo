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

const API_URL = "https://mi-api-atempo.onrender.com";

const Sidebar = ({ onAbrirModal, modalActivo }) => {
  const navigate = useNavigate();

  const [user, setUser] = useState({
    empresaNombre: "Mi Empresa",
    empresaLogo: null,
  });

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);

        let logoFinal = null;

        if (parsedUser.empresaLogo) {
          if (parsedUser.empresaLogo.startsWith("/")) {
            logoFinal = `${API_URL}${parsedUser.empresaLogo}`;
          } else {
            logoFinal = parsedUser.empresaLogo;
          }
        }

        setUser({
          empresaNombre: parsedUser.empresaNombre || "Mi Empresa",
          empresaLogo: logoFinal,
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

      {/* 🔥 Logo + Empresa */}
      <div className="logo-section">
        {user.empresaLogo ? (
          <img
            src={user.empresaLogo}
            alt="Logo empresa"
            className="logo"
          />
        ) : (
          <div className="logo-placeholder">
            {user.empresaNombre.charAt(0)}
          </div>
        )}

        <h2 className="brand-name">{user.empresaNombre}</h2>
      </div>

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

      <button className="logout-btn" onClick={handleLogout}>
        <FaSignOutAlt className="icon logout-icon" />
        Cerrar sesión
      </button>
    </aside>
  );
};

export default Sidebar;