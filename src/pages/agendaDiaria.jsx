import React, { useEffect, useState } from "react";
import "../styles/agendaDiaria.css";
import { API_URL } from "../config";

const HORAS_DIA = Array.from({ length: 14 }, (_, i) => i + 7); // 7:00 - 20:00
const ALTURA_HORA = 60; // 60px por hora

const AgendaDiaria = () => {
  const [fechaActual, setFechaActual] = useState(new Date());
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");
  console.log("TOKEN:", token);

  const fetchCitas = async () => {
    try {
      setLoading(true);

      const res = await fetch(`${API_URL}/api/citas`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!Array.isArray(data)) return setCitas([]);

      const citasDelDia = data.filter(c => {
        const f = new Date(c.fecha);
        return (
          f.getFullYear() === fechaActual.getFullYear() &&
          f.getMonth() === fechaActual.getMonth() &&
          f.getDate() === fechaActual.getDate()
        );
      });

      setCitas(citasDelDia);
    } catch (err) {
      console.error("Error cargando citas:", err);
      setCitas([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCitas();
  }, [fechaActual]);

  const cambiarDia = delta => {
    const nueva = new Date(fechaActual);
    nueva.setDate(nueva.getDate() + delta);
    setFechaActual(nueva);
  };

  const calcularTop = (horaInicio) => {
    const [h, m] = horaInicio.split(":").map(Number);
    const minutosDesdeInicio = (h - 7) * 60 + m;
    return (minutosDesdeInicio / 60) * ALTURA_HORA;
  };

  const calcularAltura = (horaInicio, horaFinal) => {
    const [h1, m1] = horaInicio.split(":").map(Number);
    const [h2, m2] = horaFinal.split(":").map(Number);

    const minutosInicio = h1 * 60 + m1;
    const minutosFinal = h2 * 60 + m2;

    const duracionMin = minutosFinal - minutosInicio;
    return (duracionMin / 60) * ALTURA_HORA;
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
        {/* Líneas de horas */}
        {HORAS_DIA.map(hora => (
          <div key={hora} className="hour-row">
            <div className="hour-label">{hora}:00</div>
          </div>
        ))}

        {/* Citas posicionadas libremente */}
        {citas.map(cita => (
          <div
            key={cita.id_cita}
            className="event-card"
            style={{
              top: `${calcularTop(cita.hora_inicio)}px`,
              height: `${calcularAltura(
                cita.hora_inicio,
                cita.hora_final
              )}px`,
              backgroundColor: cita.color || "#cfe2ff",
            }}
          >
            <strong>{cita.titulo}</strong>
            <div style={{ fontSize: 11 }}>
              {cita.hora_inicio.slice(0, 5)} –{" "}
              {cita.hora_final.slice(0, 5)}
            </div>
            {cita.nombre_cliente && (
              <div style={{ fontSize: 11 }}>
                {cita.nombre_cliente}
              </div>
            )}
          </div>
        ))}
      </div>
    </main>
  );
};

export default AgendaDiaria;