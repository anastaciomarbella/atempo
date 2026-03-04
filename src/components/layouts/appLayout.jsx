import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../sidebar/sidebar";
import Header from "../header/header";
import ModalNuevoEmpleado from "../modalNuevoEmpleado/modalNuevoEmpleado";
import ModalNuevoClienteFrecuente from "../modalNuevoClienteFrecuente/modalNuevoClienteFrecuente";
import ModalCita from "../modalCita/modalCita";
import "./appLayout.css";

const AppLayout = () => {
  console.log("🟢 AppLayout renderizando");

  const [modalActivo, setModalActivo] = useState(null);

  useEffect(() => {
    console.log("📦 modalActivo cambió:", modalActivo);
  }, [modalActivo]);

  const cerrarModales = () => {
    console.log("❌ Cerrando modales");
    setModalActivo(null);
  };

  return (
    <div className="app-layout">
      {console.log("➡️ Renderizando Sidebar")}
      <Sidebar
        onAbrirModal={(tipo) => {
          console.log("🟡 Abriendo modal:", tipo);
          setModalActivo(tipo);
        }}
        modalActivo={modalActivo}
      />

      <div className="main-content">
        {console.log("➡️ Renderizando Header")}
        <Header />

        <div className="page-content">
          {console.log("➡️ Renderizando Outlet")}
          <Outlet />
        </div>
      </div>

      {modalActivo === "empleado" && (
        <>
          {console.log("🧑 Modal empleado visible")}
          <ModalNuevoEmpleado onClose={cerrarModales} />
        </>
      )}

      {modalActivo === "cliente" && (
        <>
          {console.log("👤 Modal cliente visible")}
          <ModalNuevoClienteFrecuente onClose={cerrarModales} />
        </>
      )}

      {modalActivo === "cita" && (
        <>
          {console.log("📅 Modal cita visible")}
          <ModalCita modo="crear" onClose={cerrarModales} />
        </>
      )}
    </div>
  );
};

export default AppLayout;