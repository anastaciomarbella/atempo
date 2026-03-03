import React, { useState, useEffect } from "react";
import "../styles/agendaSemanal.css";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

const HORAS = Array.from({ length: 17 }, (_, i) => i + 7); // 7am - 23pm

const AgendaSemanal = () => {
  const [citas, setCitas] = useState([]);
  const [fechaBase, setFechaBase] = useState(new Date());

  // Obtener lunes
  const getInicioSemana = (fecha) => {
    const f = new Date(fecha);
    const dia = f.getDay();
    const diff = dia === 0 ? -6 : 1 - dia;
    f.setDate(f.getDate() + diff);
    return f;
  };

  const inicioSemana = getInicioSemana(fechaBase);

  const diasSemana = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(inicioSemana);
    d.setDate(d.getDate() + i);
    return d;
  });

  // ================= FETCH =================
  useEffect(() => {
    const fetchCitas = async () => {
      try {
        const res = await fetch(
          "https://mi-api-atempo.onrender.com/api/citas"
        );
        const data = await res.json();
        setCitas(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error cargando citas", err);
      }
    };

    fetchCitas();
  }, []);

  const cambiarSemana = (delta) => {
    const nueva = new Date(fechaBase);
    nueva.setDate(nueva.getDate() + delta * 7);
    setFechaBase(nueva);
  };

  // ================= FILTRAR CITA POR DIA Y HORA =================
  const obtenerCita = (fecha, hora) => {
    const fechaStr = fecha.toISOString().slice(0, 10);

    return citas.find((c) => {
      if (!c.fecha || !c.hora_inicio) return false;

      const [hi] = c.hora_inicio.split(":").map(Number);

      return (
        c.fecha.slice(0, 10) === fechaStr &&
        hi === hora
      );
    });
  };

  return (
    <main className="semanal-main">
      <header className="semanal-header">
        <button onClick={() => cambiarSemana(-1)}>
          <FiChevronLeft />
        </button>

        <h2>
          Semana del{" "}
          {inicioSemana.toLocaleDateString("es-MX", {
            day: "numeric",
            month: "long",
          })}
        </h2>

        <button onClick={() => cambiarSemana(1)}>
          <FiChevronRight />
        </button>
      </header>

      <div className="week-grid">

        {/* Encabezado */}
        <div className="hour-header"></div>
        {diasSemana.map((dia, i) => (
          <div key={i} className="day-header">
            {dia.toLocaleDateString("es-MX", {
              weekday: "short",
              day: "numeric",
            })}
          </div>
        ))}

        {/* Filas por hora */}
        {HORAS.map((hora) => (
          <React.Fragment key={hora}>
            <div className="hour-label">{hora}:00</div>

            {diasSemana.map((dia, i) => {
              const cita = obtenerCita(dia, hora);

              return (
                <div key={i} className="cell">
                  {cita && (
                    <div
                      className="event"
                      style={{
                        backgroundColor:
                          cita.color || "#6FA8DC",
                      }}
                    >
                      <strong>{cita.titulo}</strong>
                      <div className="event-time">
                        {cita.hora_inicio?.slice(0, 5)} –{" "}
                        {cita.hora_final?.slice(0, 5)}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </main>
  );
};

export default AgendaSemanal;