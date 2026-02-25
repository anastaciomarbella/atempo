import React, { useState, useEffect } from "react";
import "../styles/agendaDiaria.css";
import ModalCita from "../components/modalCita/modalCita";
import { API_URL } from "../config";

const AgendaDiaria = () => {
  const [fechaActual, setFechaActual] = useState(new Date());
  const [citas, setCitas] = useState([]);
  const [personas, setPersonas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const usuarioLogueado = JSON.parse(localStorage.getItem("user") || "{}");

  // Cargar personas
  useEffect(() => {
    const fetchPersonas = async () => {
      try {
        const res = await fetch(`${API_URL}/api/personas`);
        const data = await res.json();
        setPersonas(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error personas:", err);
      }
    };
    fetchPersonas();
  }, []);

  // Cargar citas del usuario y del día
  const fetchCitas = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/citas`);
      let data = await res.json();
      if (!Array.isArray(data)) data = [];

      const fechaSeleccionada = fechaActual.toISOString().split("T")[0];

      // Filtrar por fecha y usuario
      data = data.filter(
        (c) =>
          c.fecha?.split("T")[0] === fechaSeleccionada &&
          c.id_usuario === usuarioLogueado?.id_usuario
      );

      setCitas(data);
    } catch (err) {
      console.error("Error citas:", err);
      setError("No se pudieron cargar las citas.");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCitas();
  }, [fechaActual]);

  const cambiarDia = (delta) => {
    const nueva = new Date(fechaActual);
    nueva.setDate(nueva.getDate() + delta);
    setFechaActual(nueva);
  };

  // 🔹 Para que la cuadrícula siempre tenga 6 cuadros por ejemplo
  const cuadriculaVacia = Array.from({ length: 6 }, (_, i) => i);

  return (
    <main className="calendar-container">
      <div className="top-bar">
        <div className="day-nav">
          <button onClick={() => cambiarDia(-1)}>◀</button>
          <span className="day-title">
            {fechaActual.toLocaleDateString("es-MX", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </span>
          <button onClick={() => cambiarDia(1)}>▶</button>
        </div>
      </div>

      {loading && <div className="loading">Cargando citas...</div>}
      {error && <div className="error-banner">{error}</div>}

      <div className="day-container">
        {/* Renderizar siempre la cuadrícula vacía */}
        {cuadriculaVacia.map((_, idx) => (
          <div key={idx} className="event-card placeholder"></div>
        ))}

        {/* Renderizar las citas sobre los cuadros */}
        {citas.map((c) => (
          <div
            key={c.id_cita}
            className="event-card"
            style={{ backgroundColor: c.color || "#cfe2ff" }}
          >
            <h3>{c.titulo}</h3>
            <p>
              <strong>Cliente:</strong> {c.nombre_cliente}
            </p>
            <p>
              <strong>Horario:</strong> {c.hora_inicio?.slice(0, 5)} -{" "}
              {c.hora_final?.slice(0, 5)}
            </p>
            {c.descripcion && (
              <p>
                <strong>Descripción:</strong> {c.descripcion}
              </p>
            )}
            {c.telefono && (
              <p>
                <strong>Teléfono:</strong> {c.telefono}
              </p>
            )}
          </div>
        ))}

        {/* Mensaje si no hay citas */}
        {citas.length === 0 && !loading && (
          <div className="no-events">No hay citas para este día</div>
        )}
      </div>
    </main>
  );
};

export default AgendaDiaria;