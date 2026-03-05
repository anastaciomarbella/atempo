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

function App() {
  return (
    <Router>
      <Routes>

        {/* Ruta inicial */}
        <Route path="/" element={<Navigate to="/register" replace />} />

        {/* Rutas públicas */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/aviso-privacidad" element={<AvisoDePrivacidad />} />

        {/* Rutas privadas con layout compartido */}
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/agenda-diaria" element={<AgendaDiaria />} />
          <Route path="/agenda-semanal" element={<AgendaSemanal />} />
          <Route path="/empleados" element={<Empleados />} />
          <Route path="/clientes-frecuentes" element={<ClientesFrecuentes />} />
          <Route path="/nuevos-empleados" element={<RegisterEmployees />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/register" replace />} />

      </Routes>
    </Router>
  );
}

export default App;