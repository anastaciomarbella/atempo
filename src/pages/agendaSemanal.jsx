import React, { useState, useEffect } from "react";
import "../styles/agendaSemanal.css";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";


const diasSemana = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
];

const AgendaSemanal = () => {
  const [citas, setCitas] = useState([]);
  const [fechaBase, setFechaBase] = useState(new Date()); // semana actual

  // Obtener inicio de semana (lunes)
  const getInicioSemana = (fecha) => {
    const f = new Date(fecha);
    const dia = f.getDay(); // 0=domingo, 1=lunes...
    const diff = dia === 0 ? -6 : 1 - dia;
    f.setDate(f.getDate() + diff);
    return f;
  };

  const inicioSemana = getInicioSemana(fechaBase);

  // Generar 35 días (5 filas x 7 columnas)
  const generarDiasCalendario = () => {
    const dias = [];
    const actual = new Date(inicioSemana);

    for (let i = 0; i < 35; i++) {
      dias.push(new Date(actual));
      actual.setDate(actual.getDate() + 1);
    }
    return dias;
  };

  const diasCalendario = generarDiasCalendario();

  // Cargar citas
  useEffect(() => {
    const fetchCitas = async () => {
      try {
        const res = await fetch(
          "https://mi-api-atempo.onrender.com/api/citas"
        );
        const data = await res.json();
        setCitas(data);
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

  const citasPorDia = (fecha) => {
    const fechaStr = fecha.toISOString().slice(0, 10);

    return citas.filter(
      (c) => c.fecha.slice(0, 10) === fechaStr
    );
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

      <div className="calendar-grid">
        {/* Encabezado de días */}
        {diasSemana.map((d) => (
          <div key={d} className="day-header">
            {d}
          </div>
        ))}

        {/* 5 filas de calendario */}
        {diasCalendario.map((fecha, i) => {
          const citasHoy = citasPorDia(fecha);

          return (
            <div key={i} className="day-cell">
              <div className="day-number">
                {fecha.getDate()}
              </div>

              {citasHoy.map((cita) => (
                <div
                  key={cita.id_cita}
                  className="calendar-appointment"
                  style={{ backgroundColor: cita.color || "#6FA8DC" }}
                >
                  {cita.titulo}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </main>
  );
};

export default AgendaSemanal;
