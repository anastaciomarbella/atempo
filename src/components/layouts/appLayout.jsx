import React, { useState } from 'react';
import Sidebar from '../sidebar/sidebar';
import Header from '../header/header';
import ModalNuevoEmpleado from '../modalNuevoEmpleado/modalNuevoEmpleado';
import ModalNuevoClienteFrecuente from '../modalNuevoClienteFrecuente/modalNuevoClienteFrecuente';
import ModalCita from '../modalCita/modalCita';

const AppLayout = ({ children }) => {
  const [modalActivo, setModalActivo] = useState(null);

  const cerrarModales = () => setModalActivo(null);

  return (
    <div className="main-layout">
      <Sidebar onAbrirModal={setModalActivo} modalActivo={modalActivo} />
      
      <main className="main-content">
        <Header />
        {children}
      </main>

      {modalActivo === 'empleado' && <ModalNuevoEmpleado onClose={cerrarModales} />}
      {modalActivo === 'cliente' && <ModalNuevoClienteFrecuente onClose={cerrarModales} />}
      {modalActivo === 'cita' && <ModalCita modo="crear" onClose={cerrarModales} />}
    </div>
  );
};

export default AppLayout;
