import React, { useState, useEffect } from "react";
import "../styles/agendaDiaria.css";
import { API_URL } from "../config";

const AgendaDiaria = () => {
  const [fechaActual, setFechaActual] = useState(new Date());
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const usuarioLogueado = JSON.parse(localStorage.getItem("user") || "{}");

  // Cargar citas
  const fetchCitas = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/citas`);
      let data = await res.json();
      if (!Array.isArray(data)) data = [];

      // Filtrar solo citas del usuario logueado
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

  // Cambiar día de vista (mes completo)
  const cambiarDia = (delta) => {
    const nueva = new Date(fechaActual);
    nueva.setMonth(nueva.getMonth() + delta);
    setFechaActual(nueva);
  };

  // Número de días en el mes
  const year = fechaActual.getFullYear();
  const month = fechaActual.getMonth();
  const diasMes = new Date(year, month + 1, 0).getDate();

  // Crear array de días del mes
  const diasArray = Array.from({ length: diasMes }, (_, i) => i + 1);

  return (
    <main className="calendar-container">
      <div className="top-bar">
        <div className="day-nav">
          <button onClick={() => cambiarDia(-1)}>◀</button>
          <span className="day-title">
            {fechaActual.toLocaleDateString("es-MX", {
              month: "long",
              year: "numeric",
            })}
          </span>
          <button onClick={() => cambiarDia(1)}>▶</button>
        </div>
      </div>

      {loading && <div className="loading">Cargando citas...</div>}
      {error && <div className="error-banner">{error}</div>}

      <div className="calendar-grid">
        {diasArray.map((dia) => {
          // Filtrar citas que correspondan a este día
          const fechaStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
          const citasDia = citas.filter((c) => c.fecha?.split("T")[0] === fechaStr);

          return (
            <div key={dia} className="day-cell">
              <span className="day-number">{dia}</span>

              {citasDia.length > 0 ? (
                citasDia.map((cita) => (
                  <div
                    key={cita.id_cita}
                    className="event-card"
                    style={{ backgroundColor: cita.color || "rgba(47,128,237,0.15)" }}
                  >
                    <strong>{cita.titulo}</strong>
                    <div>
                      {cita.hora_inicio?.slice(0, 5)} - {cita.hora_final?.slice(0, 5)}
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-events">No hay citas</div>
              )}
            </div>
          );
        })}
      </div>
    </main>
  );
};

export default AgendaDiaria;