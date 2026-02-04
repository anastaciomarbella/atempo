import React from "react";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from "./pages/login"
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
        {/* Páginas públicas sin sidebar */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/nuevos-empleados" element={<RegisterEmployees />} />
        <Route path="/aviso-privacidad" element={<AvisoDePrivacidad />} />

        {/* Páginas privadas con sidebar */}
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
      </Routes>
    </Router>
  );
}

export default App;
