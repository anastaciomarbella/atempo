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

        {/* Rutas privadas */}
        <Route
          path="/agenda-diaria"
          element={
            <ProtectedRoute>
              <AppLayout>
                <AgendaDiaria />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/agenda-semanal"
          element={
            <ProtectedRoute>
              <AppLayout>
                <AgendaSemanal />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/empleados"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Empleados />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/clientes-frecuentes"
          element={
            <ProtectedRoute>
              <AppLayout>
                <ClientesFrecuentes />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/nuevos-empleados"
          element={
            <ProtectedRoute>
              <AppLayout>
                <RegisterEmployees />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/register" replace />} />

      </Routes>
    </Router>
  );
}

export default App;
