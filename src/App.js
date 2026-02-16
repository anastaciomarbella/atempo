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

function App() {
  return (
    <Router>
      <Routes>

        {/* 🔓 Rutas públicas */}
        <Route path="/" element={<Navigate to="/register" />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/nuevos-empleados" element={<RegisterEmployees />} />
        <Route path="/aviso-privacidad" element={<AvisoDePrivacidad />} />

        {/* 🔒 Rutas privadas */}
        <Route
          path="/agenda-diaria"
          element={
            <AppLayout>
              <AgendaDiaria />
            </AppLayout>
          }
        />

        <Route
          path="/agenda-semanal"
          element={
            <AppLayout>
              <AgendaSemanal />
            </AppLayout>
          }
        />

        <Route
          path="/empleados"
          element={
            <AppLayout>
              <Empleados />
            </AppLayout>
          }
        />

        <Route
          path="/clientes-frecuentes"
          element={
            <AppLayout>
              <ClientesFrecuentes />
            </AppLayout>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/register" />} />

      </Routes>
    </Router>
  );
}

export default App;
