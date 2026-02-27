import React, { useEffect, useState } from "react";
import "../styles/agendaDiaria.css";
import { API_URL } from "../config";

const HORAS_DIA = Array.from({ length: 14 }, (_, i) => i + 7);

const AgendaDiaria = () => {
  const [fechaActual, setFechaActual] = useState(new Date());
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  const fetchCitas = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/citas`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!Array.isArray(data)) return setCitas([]);

      // Filtrar citas del día
      const citasDelDia = data.filter(c => {
        if (!c.fecha) return false;
        const [y, m, d] = c.fecha.split("-");
        const fechaCita = new Date(y, m - 1, d);
        return (
          fechaCita.getFullYear() === fechaActual.getFullYear() &&
          fechaCita.getMonth() === fechaActual.getMonth() &&
          fechaCita.getDate() === fechaActual.getDate()
        );
      });

      setCitas(citasDelDia);
    } catch (err) {
      console.error(err);
      setCitas([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchCitas();
  }, [fechaActual]);

  const cambiarDia = delta => {
    const nueva = new Date(fechaActual);
    nueva.setDate(nueva.getDate() + delta);
    setFechaActual(nueva);
  };

  // Función para obtener citas aunque no sean exactas a la hora
  const citasPorHora = hora => {
    return citas.filter(cita => {
      if (!cita.hora_inicio) return false;
      const [h] = cita.hora_inicio.split(":");
      return parseInt(h) === hora;
    });
  };

  return (
    <main className="calendar-container">
      <div className="top-bar">
        <button onClick={() => cambiarDia(-1)}>◀</button>
        <strong>
          {fechaActual.toLocaleDateString("es-MX", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </strong>
        <button onClick={() => cambiarDia(1)}>▶</button>
      </div>

      {loading && <p>Cargando citas...</p>}

      <div className="agenda-wrapper">
        {HORAS_DIA.map(hora => (
          <div key={hora} className="hour-cell">
            <div className="hour-label">{hora}:00</div>

            {/* Mostrar todas las citas de esta hora */}
            {citasPorHora(hora).map(cita => (
              <div
                key={cita.id_cita || Math.random()} // seguridad por si id_cita falta
                className="event-card"
                style={{ backgroundColor: cita.color || "#cfe2ff" }}
              >
                <strong>{cita.titulo || "Sin título"}</strong>
                <div style={{ fontSize: 11 }}>
                  {cita.hora_inicio?.slice(0, 5) || "--:--"} –{" "}
                  {cita.hora_final?.slice(0, 5) || "--:--"}
                </div>
                {cita.nombre_cliente && (
                  <div style={{ fontSize: 11 }}>{cita.nombre_cliente}</div>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </main>
  );
};

export default AgendaDiaria;