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
    nombre_empresa: "Mi Empresa",
  });

  console.log("🟢 Sidebar renderizado");

  useEffect(() => {
    console.log("🟡 useEffect ejecutado");

    const storedUser = localStorage.getItem("user");
    console.log("📦 localStorage user:", storedUser);

    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        console.log("✅ Usuario parseado:", parsedUser);

        setUser({
          nombre_usuario: parsedUser.nombre_usuario || "Usuario",
          nombre_empresa: parsedUser.nombre_empresa || "Mi Empresa",
        });
      } catch (error) {
        console.error("❌ Error parseando usuario:", error);
      }
    } else {
      console.warn("⚠️ No existe 'user' en localStorage");
    }
  }, []);

  console.log("👤 Estado actual user:", user);

  const handleLogout = () => {
    console.log("🚪 Cerrando sesión...");
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h1 className="company-title">
          {user.nombre_empresa?.toUpperCase()}
        </h1>

        <div className="user-info">
          <div className="avatar">
            {user.nombre_usuario?.charAt(0).toUpperCase()}
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
        <FaSignOutAlt className="icon" />
        Cerrar sesión
      </button>
    </aside>
  );
};

export default Sidebar;