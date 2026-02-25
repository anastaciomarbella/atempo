import React, { useState, useEffect } from "react";
import "../styles/agendaDiaria.css";
import { API_URL } from "../config";

const DIAS_SEMANA = [
  "Lunes","Martes","Miércoles","Jueves","Viernes","Sábado","Domingo"
];

const HORAS_DIA = Array.from({ length: 14 }, (_, i) => i + 7);
const DIA_COLORS = [
  "#FFEBEE","#E3F2FD","#E8F5E9","#FFF3E0","#F3E5F5","#E0F7FA","#FBE9E7"
];

const AgendaSemanal = () => {
  const [fechaActual, setFechaActual] = useState(new Date());
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const usuarioLogueado = JSON.parse(localStorage.getItem("user") || "{}");

  // 🔹 ID real del usuario/persona
  const personaId =
    usuarioLogueado?.id_persona ??
    usuarioLogueado?.id ??
    usuarioLogueado?.user_id ??
    null;

  const fetchCitas = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_URL}/api/citas`);
      let data = await res.json();
      if (!Array.isArray(data)) data = [];

      console.log("Usuario logueado:", usuarioLogueado);
      console.log("PersonaID resuelto:", personaId);
      console.log("Citas sin filtrar:", data);

      // ✅ FILTRO CORRECTO
      let citasFinales = data;

      if (personaId !== null) {
        citasFinales = data.filter(
          c => String(c.id_persona) === String(personaId)
        );
      }

      console.log("Citas finales:", citasFinales);
      setCitas(citasFinales);
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

  const obtenerLunes = () => {
    const d = new Date(fechaActual);
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    const lunes = new Date(d);
    lunes.setDate(d.getDate() + diff);
    return lunes;
  };

  const lunes = obtenerLunes();

  const semanaFechas = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(lunes);
    d.setDate(lunes.getDate() + i);
    return d;
  });

  const citasPorDia = semanaFechas.map(fecha =>
    citas.filter(c => {
      const f = new Date(c.fecha);
      return (
        f.getFullYear() === fecha.getFullYear() &&
        f.getMonth() === fecha.getMonth() &&
        f.getDate() === fecha.getDate()
      );
    })
  );

  const convertirAHoras = (hora) => {
    const [h, m] = hora.split(":").map(Number);
    return h + m / 60;
  };

  const calcularEstiloCita = (cita) => {
    const inicio = convertirAHoras(cita.hora_inicio);
    const fin = convertirAHoras(cita.hora_final);

    return {
      position: "absolute",
      top: `${(inicio - 7) * 60}px`,
      height: `${(fin - inicio) * 60}px`,
      width: "95%",
      left: "2.5%",
      backgroundColor: cita.color || "rgba(47,128,237,0.3)",
      borderRadius: "6px",
      padding: "4px",
      cursor: "pointer"
    };
  };

  return (
    <main className="calendar-container">
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
        {DIAS_SEMANA.map((dia, idx) => (
          <div
            key={dia}
            className="day-header"
            style={{ backgroundColor: DIA_COLORS[idx] }}
          >
            {dia}
            <br />
            {semanaFechas[idx].getDate()}/{semanaFechas[idx].getMonth() + 1}
          </div>
        ))}

        {HORAS_DIA.map(hora => (
          <React.Fragment key={hora}>
            {semanaFechas.map((_, idx) => (
              <div
                key={`${idx}-${hora}`}
                className="hour-cell"
                style={{ position: "relative" }}
              >
                {hora === HORAS_DIA[0] &&
                  citasPorDia[idx].map(cita => (
                    <div
                      key={cita.id}
                      className="event-card"
                      style={calcularEstiloCita(cita)}
                    >
                      <strong>{cita.titulo}</strong>
                      <div>
                        {cita.hora_inicio.slice(0,5)} -{" "}
                        {cita.hora_final.slice(0,5)}
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