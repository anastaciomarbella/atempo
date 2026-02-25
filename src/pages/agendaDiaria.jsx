import React, { useState, useEffect } from "react";
import "../styles/agendaDiaria.css";
import { API_URL } from "../config";

const DIAS_SEMANA = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo"
];

const HORAS_DIA = Array.from({ length: 14 }, (_, i) => i + 7); // 7:00 a 20:00
const DIA_COLORS = [
  "#FFEBEE",
  "#E3F2FD",
  "#E8F5E9",
  "#FFF3E0",
  "#F3E5F5",
  "#E0F7FA",
  "#FBE9E7"
];

const AgendaSemanal = () => {
  const [fechaActual, setFechaActual] = useState(new Date());
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const usuarioLogueado = JSON.parse(localStorage.getItem("user") || "{}");

  // 🔹 Obtener citas
  const fetchCitas = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/citas`);
      let data = await res.json();

      if (!Array.isArray(data)) data = [];

      // Filtrar por usuario
      const filtradas = data.filter(
        c => String(c.id_usuario) === String(usuarioLogueado?.id_usuario)
      );

      console.log("Citas filtradas:", filtradas);
      setCitas(filtradas);
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar las citas.");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCitas();
  }, []);

  // 🔹 Cambiar mes
  const cambiarMes = (delta) => {
    const nueva = new Date(fechaActual);
    nueva.setMonth(nueva.getMonth() + delta);
    setFechaActual(nueva);
  };

  // 🔹 Obtener lunes de la semana
  const obtenerLunes = () => {
    const date = new Date(fechaActual);
    const day = date.getDay(); // 0 = domingo
    const diff = day === 0 ? -6 : 1 - day;
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

  // 🔹 Agrupar citas por día
  const citasPorDia = semanaFechas.map(fecha =>
    citas.filter(c => {
      if (!c.fecha) return false;
      const citaDate = new Date(c.fecha);
      return (
        citaDate.getFullYear() === fecha.getFullYear() &&
        citaDate.getMonth() === fecha.getMonth() &&
        citaDate.getDate() === fecha.getDate()
      );
    })
  );

  // 🔹 Estilo de la cita (posición real)
  const calcularEstiloCita = (cita) => {
    if (!cita.hora_inicio || !cita.hora_final) return {};

    const [hInicio, mInicio] = cita.hora_inicio.split(":").map(Number);
    const [hFin, mFin] = cita.hora_final.split(":").map(Number);

    const inicio = hInicio + mInicio / 60;
    const fin = hFin + mFin / 60;

    const top = (inicio - HORAS_DIA[0]) * 60; // 60px por hora
    const height = (fin - inicio) * 60;

    return {
      position: "absolute",
      top: `${top}px`,
      height: `${height}px`,
      width: "95%",
      left: "2.5%",
      borderRadius: "6px",
      padding: "4px",
      boxSizing: "border-box"
    };
  };

  return (
    <main className="calendar-container">
      {/* Barra superior */}
      <div className="top-bar">
        <div className="day-nav">
          <button onClick={() => cambiarMes(-1)}>◀</button>
          <span className="day-title">
            {fechaActual.toLocaleDateString("es-MX", {
              month: "long",
              year: "numeric"
            })}
          </span>
          <button onClick={() => cambiarMes(1)}>▶</button>
        </div>
      </div>

      {loading && <div className="loading">Cargando citas...</div>}
      {error && <div className="error-banner">{error}</div>}

      <div className="week-grid">
        {/* Encabezados */}
        {DIAS_SEMANA.map((dia, idx) => (
          <div
            key={dia}
            className="day-header"
            style={{ backgroundColor: DIA_COLORS[idx] }}
          >
            {dia}
            <br />
            {semanaFechas[idx].getDate()}/
            {semanaFechas[idx].getMonth() + 1}
          </div>
        ))}

        {/* Grid de horas */}
        {HORAS_DIA.map(hora => (
          <React.Fragment key={hora}>
            {semanaFechas.map((_, idx) => (
              <div
                key={`${idx}-${hora}`}
                className="hour-cell"
                style={{ position: "relative" }}
              >
                {/* Renderizar citas SOLO una vez por día */}
                {hora === HORAS_DIA[0] &&
                  citasPorDia[idx].map(cita => (
                    <div
                      key={cita.id_cita}
                      className="event-card"
                      style={{
                        ...calcularEstiloCita(cita),
                        backgroundColor:
                          cita.color || "rgba(47,128,237,0.3)"
                      }}
                    >
                      <strong>{cita.titulo}</strong>
                      <div>
                        {cita.hora_inicio?.slice(0, 5)} -{" "}
                        {cita.hora_final?.slice(0, 5)}
                      </div>
                    </div>
                  ))}
              </div>
            ))}
          </React.Fragment>
        ))}
      </div>
    </main>
  );
};

export default AgendaSemanal;