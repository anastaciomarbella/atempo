import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/login";
import Register from "./pages/register";
import RegisterEmployees from "./pages/registerEmployees";
import AppLayout from "./components/layouts/appLayout";
import AgendaDiaria from "./pages/agendaDiaria";
import AgendaSemanal from "./pages/agendaSemanal";
import Empleados from "./pages/empleados";
import ClientesFrecuentes from "./pages/clientesFrecuentes";
import AvisoDePrivacidad from "./pages/avisoDePrivacidad";
import ProtectedRoute from "./components/ProtectedRoute";
import ReservarCita from "./pages/ReservarCita";
import RegistroCliente from "./pages/RegistroCliente";
import LoginCliente from "./pages/LoginCliente";
import Configuracion from "./pages/configuracion";
import ServiciosClientes from "./pages/ServiciosClienteS";
import GestionServicios from "./pages/GestionServicios"; // ← NUEVO

function App() {
  return (
    <Router>
      <Routes>

        {/* Ruta inicial */}
        <Route path="/" element={<Navigate to="/register" replace />} />

        {/* ================= PUBLICAS NEGOCIO ================= */}
        <Route path="/register"         element={<Register />} />
        <Route path="/login"            element={<Login />} />
        <Route path="/aviso-privacidad" element={<AvisoDePrivacidad />} />

        {/* ================= PUBLICAS CLIENTES ================= */}
        <Route path="/reservar/:slug"            element={<ReservarCita />} />
        <Route path="/registro-cliente/:slug"    element={<RegistroCliente />} />
        <Route path="/login-cliente/:slug"       element={<LoginCliente />} />
        <Route path="/servicios-clientes/:slug"  element={<ServiciosClientes />} />

        {/* ================= PRIVADAS ================= */}
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/agenda-diaria"       element={<AgendaDiaria />} />
          <Route path="/agenda-semanal"      element={<AgendaSemanal />} />
          <Route path="/empleados"           element={<Empleados />} />
          <Route path="/clientes-frecuentes" element={<ClientesFrecuentes />} />
          <Route path="/nuevos-empleados"    element={<RegisterEmployees />} />
          <Route path="/configuracion"       element={<Configuracion />} />
          <Route path="/ServiciosClientes"           element={<ServiciosClientes />} /> {/* ← NUEVO */}
        </Route>

        {/* ================= FALLBACK ================= */}
        <Route path="*" element={<div style={{ padding: 40 }}>Página no encontrada</div>} />

      </Routes>
    </Router>
  );
}

export default App;