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

const Sidebar = ({ onAbrirModal = () => {}, modalActivo = null }) => {
  const navigate = useNavigate();

  const [user, setUser] = useState({
    nombre_usuario: "Usuario",
    nombre_empresa: "Mi Empresa",
  });

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");

      if (!storedUser) return;

      const parsedUser = JSON.parse(storedUser);

      setUser({
        nombre_usuario: parsedUser?.nombre || "Usuario",
        nombre_empresa: parsedUser?.nombre_empresa || "Mi Empresa",
      });
    } catch (error) {
      console.error("Error leyendo usuario:", error);
    }
  }, []);

  const handleLogout = () => {
    try {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      navigate("/");
    } catch (error) {
      console.error("Error cerrando sesión:", error);
    }
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h1 className="company-title">
          {user.nombre_empresa?.toUpperCase()}
        </h1>

        <div className="user-info">
          <div className="avatar">
            {user.nombre_usuario?.charAt(0)?.toUpperCase() || "U"}
          </div>

          <span className="user-name">
            {user.nombre_usuario}
          </span>
        </div>
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
          type="button"
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

      <button
        type="button"
        className="logout-btn"
        onClick={handleLogout}
      >
        <FaSignOutAlt className="icon" />
        Cerrar sesión
      </button>
    </aside>
  );
};

export default Sidebar;