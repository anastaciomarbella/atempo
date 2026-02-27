import React, { useState, useEffect } from "react";
import "../styles/agendaDiaria.css";
import ModalCita from "../components/modalCita/modalCita";
import { API_URL } from "../config";

const AgendaDiaria = () => {
  const [fechaActual, setFechaActual] = useState(new Date());
  const [citas, setCitas] = useState([]);
  const [citasDelDia, setCitasDelDia] = useState([]);

  // === Fetch de citas ===
  useEffect(() => {
    const fetchCitas = async () => {
      try {
        const res = await fetch(`${API_URL}/citas`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        const data = await res.json();
        setCitas(data);
      } catch (err) {
        console.error("Error al cargar citas:", err);
      }
    };
    fetchCitas();
  }, []);

  // === Filtrado de citas por fecha ===
  useEffect(() => {
    const fechaStr = fechaActual.toISOString().split("T")[0]; // 'YYYY-MM-DD'
    const filtradas = citas.filter(c => c.fecha === fechaStr);
    setCitasDelDia(filtradas);
    console.log("📌 Citas del día:", filtradas);
  }, [citas, fechaActual]);

  // === Función para calcular estilo top/height según hora ===
  const calcularPosicion = (hora_inicio, hora_final) => {
    // Convertir horas a minutos desde medianoche
    const [hiH, hiM] = hora_inicio.split(":").map(Number);
    const [hfH, hfM] = hora_final.split(":").map(Number);

    const inicioMin = hiH * 60 + hiM;
    const finMin = hfH * 60 + hfM;

    const top = (inicioMin / 60) * 50; // 50px por hora (ajustable)
    const height = ((finMin - inicioMin) / 60) * 50;

    return { top: `${top}px`, height: `${height}px` };
  };

  return (
    <div className="calendar-container">
      <div className="top-bar">
        <button onClick={() => setFechaActual(new Date(fechaActual.getTime() - 86400000))}>
          ◀
        </button>
        <h2>{fechaActual.toDateString()}</h2>
        <button onClick={() => setFechaActual(new Date(fechaActual.getTime() + 86400000))}>
          ▶
        </button>
      </div>

      <div className="day-grid">
        {/* Horas del día */}
        {Array.from({ length: 24 }).map((_, i) => (
          <div key={i} className="hour-slot">
            {i}:00
          </div>
        ))}

        {/* Citas */}
        {citasDelDia.map(cita => {
          const estilo = calcularPosicion(cita.hora_inicio, cita.hora_final);
          return (
            <div
              key={cita.id}
              className="cita"
              style={{
                top: estilo.top,
                height: estilo.height,
                backgroundColor: cita.color || "#a2d2ff",
              }}
            >
              <strong>{cita.titulo}</strong> <br />
              {cita.hora_inicio} - {cita.hora_final} <br />
              {cita.nombre_cliente}
            </div>
          );
        })}
      </div>

      {/* Modal para editar/agregar citas */}
      <ModalCita />
    </div>
  );
};

export default AgendaDiaria;