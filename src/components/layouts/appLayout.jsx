import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../sidebar/sidebar";
import Header from "../header/header";
import ModalNuevoEmpleado from "../modalNuevoEmpleado/modalNuevoEmpleado";
import ModalNuevoClienteFrecuente from "../modalNuevoClienteFrecuente/modalNuevoClienteFrecuente";
import ModalCita from "../modalCita/modalCita";
import "./appLayout.css";

const AppLayout = () => {
  const [modalActivo, setModalActivo] = useState(null);
  const [sidebarAbierto, setSidebarAbierto] = useState(false);

  const cerrarModales = () => setModalActivo(null);
  const toggleSidebar = () => setSidebarAbierto(!sidebarAbierto);
  const cerrarSidebar = () => setSidebarAbierto(false);

  return (
    <div className="app-layout">

      {/* OVERLAY — toca fuera para cerrar sidebar en móvil */}
      {sidebarAbierto && (
        <div className="sidebar-overlay" onClick={cerrarSidebar} />
      )}

      {/* SIDEBAR */}
      <Sidebar
        onAbrirModal={(tipo) => { setModalActivo(tipo); cerrarSidebar(); }}
        modalActivo={modalActivo}
        abierto={sidebarAbierto}
        onCerrar={cerrarSidebar}
      />

      {/* CONTENIDO PRINCIPAL */}
      <div className="main-content">
        <Header onToggleSidebar={toggleSidebar} />
        <div className="page-content">
          <Outlet />
        </div>
      </div>

      {/* MODALES */}
      {modalActivo === "empleado" && (
        <ModalNuevoEmpleado onClose={cerrarModales} />
      )}
      {modalActivo === "cliente" && (
        <ModalNuevoClienteFrecuente onClose={cerrarModales} />
      )}
      {modalActivo === "cita" && (
        <ModalCita modo="crear" onClose={cerrarModales} />
      )}

    </div>
  );
};

export default AppLayout;