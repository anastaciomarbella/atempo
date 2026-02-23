import React, { useState, useEffect } from "react";
import "../styles/agendaDiaria.css";
import ModalCita from "../components/modalCita/modalCita";

const DIAS_SEMANA = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
];

const AgendaDiaria = () => {
  const [fechaActual, setFechaActual] = useState(new Date());
  const [citas, setCitas] = useState([]);
  const [personas, setPersonas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);

  // 🔹 NUEVO: estados para empresa y logo
  const [empresa, setEmpresa] = useState("");
  const [logo, setLogo] = useState("");

  // 🔹 NUEVO: cargar empresa y logo desde localStorage
  useEffect(() => {
    const empresaGuardada = localStorage.getItem("empresa");
    const logoGuardado = localStorage.getItem("logo");

    if (empresaGuardada) setEmpresa(empresaGuardada);
    if (logoGuardado) setLogo(logoGuardado);
  }, []);

  // === CARGAR PERSONAS ===
  useEffect(() => {
    const fetchPersonas = async () => {
      try {
        const res = await fetch(
          "https://mi-api-atempo.onrender.com/api/personas"
        );
        const data = await res.json();
        setPersonas(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error personas:", err);
        setPersonas([]);
      }
    };
    fetchPersonas();
  }, []);

  // === CARGAR CITAS ===
  const fetchCitas = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(
        "https://mi-api-atempo.onrender.com/api/citas"
      );
      let data = await res.json();

      if (!Array.isArray(data)) data = [];

      const mes = fechaActual.getMonth();
      const año = fechaActual.getFullYear();

      data = data.filter((c) => {
        const f = new Date(c.fecha);
        return f.getMonth() === mes && f.getFullYear() === año;
      });

      setCitas(data);
    } catch (err) {
      console.error("Error citas:", err);
      setCitas([]);
      setError("No se pudieron cargar las citas, pero puedes ver el calendario.");
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchCitas();
  }, [fechaActual]);

  // === GENERAR DÍAS DEL MES ===
  const generarDiasDelMes = () => {
    const fin = new Date(
      fechaActual.getFullYear(),
      fechaActual.getMonth() + 1,
      0
    );

    const dias = [];
    for (let d = 1; d <= fin.getDate(); d++) {
      dias.push(d);
    }
    return dias;
  };

  const diasDelMes = generarDiasDelMes();

  const cambiarMes = (delta) => {
    const nueva = new Date(fechaActual);
    nueva.setMonth(nueva.getMonth() + delta);
    setFechaActual(nueva);
  };

  return (
    <main className="calendar-container">

      {/* 🔹 NUEVO: encabezado empresa (NO afecta tu diseño principal) */}
      {(empresa || logo) && (
        <div className="empresa-header">
          {logo && (
            <img
              src={logo}
              alt="Logo empresa"
              className="logo-empresa"
            />
          )}
          {empresa && <h2 className="empresa-nombre">{empresa}</h2>}
        </div>
      )}

      <div className="top-bar">
        <div className="month-nav">
          <button onClick={() => cambiarMes(-1)}>◀</button>
          <span className="month-title">
            {fechaActual.toLocaleDateString("es-MX", {
              month: "long",
              year: "numeric",
            })}
          </span>
          <button onClick={() => cambiarMes(1)}>▶</button>
        </div>

        <button
          className="new-btn"
          onClick={() => setMostrarModal(true)}
        >
          + Nueva cita
        </button>
      </div>

      {loading && <div className="loading">Cargando citas...</div>}
      {error && <div className="error-banner">{error}</div>}

      <div className="calendar-grid headers">
        {DIAS_SEMANA.map((d) => (
          <div key={d} className="day-header">
            {d}
          </div>
        ))}
      </div>

      <div className="calendar-grid body">
        {diasDelMes.map((day) => {
          const citasDelDia = citas.filter(
            (c) => new Date(c.fecha).getDate() === day
          );

          return (
            <div key={day} className="day-cell">
              <span className="day-number">{day}</span>

              {citasDelDia.map((c) => (
                <div
                  key={c.id_cita}
                  className="event-card"
                  style={{ backgroundColor: c.color || "#cfe2ff" }}
                >
                  <strong>{c.nombre_cliente}</strong>
                  <div className="titulo-cita">{c.titulo}</div>
                  <small>
                    {c.hora_inicio?.slice(0, 5)} -{" "}
                    {c.hora_final?.slice(0, 5)}
                  </small>
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {mostrarModal && (
        <ModalCita
          personas={personas}
          onClose={() => setMostrarModal(false)}
          onSave={() => {
            setMostrarModal(false);
            fetchCitas();
          }}
        />
      )}
    </main>
  );
};

export default AgendaDiaria;