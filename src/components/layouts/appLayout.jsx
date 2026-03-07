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

  const cerrarModales = () => {
    setModalActivo(null);
  };

  return (
    <div className="app-layout">

      {/* SIDEBAR */}
      <Sidebar
        onAbrirModal={(tipo) => setModalActivo(tipo)}
        modalActivo={modalActivo}
      />

      {/* CONTENIDO PRINCIPAL */}
      <div className="main-content">
        <Header />
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