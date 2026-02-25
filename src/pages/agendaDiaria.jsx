import React, { useState, useEffect } from "react";
import "../styles/agendaDiaria.css";
import { API_URL } from "../config";

const DIAS_SEMANA = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
const HORAS_DIA = Array.from({ length: 14 }, (_, i) => i + 7); // 7:00 a 20:00

// Colores para cada día de la semana
const DIA_COLORS = ["#FFEBEE", "#E3F2FD", "#E8F5E9", "#FFF3E0", "#F3E5F5", "#E0F7FA", "#FBE9E7"];

const AgendaDiaria = () => {
  const [fechaActual, setFechaActual] = useState(new Date());
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const usuarioLogueado = JSON.parse(localStorage.getItem("user") || "{}");

  const fetchCitas = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/citas`);
      let data = await res.json();
      if (!Array.isArray(data)) data = [];

      data = data.filter((c) => c.id_usuario === usuarioLogueado?.id_usuario);
      setCitas(data);
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar las citas.");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCitas();
  }, []);

  const cambiarMes = (delta) => {
    const nueva = new Date(fechaActual);
    nueva.setMonth(nueva.getMonth() + delta);
    setFechaActual(nueva);
  };

  const year = fechaActual.getFullYear();
  const month = fechaActual.getMonth();

  // Obtener la fecha del lunes de la semana actual
  const obtenerLunes = () => {
    const date = new Date(fechaActual);
    const day = date.getDay(); // 0=Domingo, 1=Lunes...
    const diff = day === 0 ? -6 : 1 - day; // ajusta domingo
    const lunes = new Date(date);
    lunes.setDate(date.getDate() + diff);
    return lunes;
  };

  const lunes = obtenerLunes();
  const semanaFechas = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(lunes);
    d.setDate(lunes.getDate() + i);
    return d;
  });

  // Filtrar citas por fecha de la semana
  const citasPorDia = semanaFechas.map((fecha) => {
    const fechaStr = fecha.toISOString().split("T")[0];
    return citas.filter((c) => c.fecha?.split("T")[0] === fechaStr);
  });

  return (
    <main className="calendar-container">
      <div className="top-bar">
        <div className="day-nav">
          <button onClick={() => cambiarMes(-1)}>◀</button>
          <span className="day-title">
            {fechaActual.toLocaleDateString("es-MX", { month: "long", year: "numeric" })}
          </span>
          <button onClick={() => cambiarMes(1)}>▶</button>
        </div>
      </div>

      {loading && <div className="loading">Cargando citas...</div>}
      {error && <div className="error-banner">{error}</div>}

      <div className="week-grid">
        {/* Encabezado de días */}
        {DIAS_SEMANA.map((dia, idx) => (
          <div key={dia} className="day-header" style={{ backgroundColor: DIA_COLORS[idx] }}>
            {dia} <br /> {semanaFechas[idx].getDate()}/{semanaFechas[idx].getMonth() + 1}
          </div>
        ))}

        {/* Filas de horas */}
        {HORAS_DIA.map((hora) => (
          <React.Fragment key={hora}>
            {semanaFechas.map((fecha, idx) => {
              const fechaStr = fecha.toISOString().split("T")[0];
              const citasHora = citasPorDia[idx].filter(
                (c) => Number(c.hora_inicio?.split(":")[0]) === hora
              );

              return (
                <div key={idx + "-" + hora} className="hour-cell">
                  {citasHora.map((cita) => (
                    <div
                      key={cita.id_cita}
                      className="event-card"
                      style={{ backgroundColor: cita.color || "rgba(47,128,237,0.3)" }}
                    >
                      <strong>{cita.titulo}</strong>
                      <div>
                        {cita.hora_inicio?.slice(0, 5)} - {cita.hora_final?.slice(0, 5)}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </main>
  );
};

export default AgendaDiaria;