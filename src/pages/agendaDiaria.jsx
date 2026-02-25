import React, { useState, useEffect } from "react";
import "../styles/agendaDiaria.css";
import ModalCita from "../components/modalCita/modalCita";
import { API_URL } from "../config";

const AgendaDiaria = () => {
  // 🔹 Fecha actual
  const [fechaActual, setFechaActual] = useState(new Date());

  // 🔹 Datos
  const [citas, setCitas] = useState([]);
  const [personas, setPersonas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);

  // 🔹 Usuario logueado
  const usuarioLogueado = JSON.parse(localStorage.getItem("user") || "{}");

  // 🔹 Cargar personas
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

  // 🔹 Cargar citas del día y del usuario logueado
  const fetchCitas = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_URL}/api/citas`);
      let data = await res.json();

      if (!Array.isArray(data)) data = [];

      const fechaSeleccionada = fechaActual.toISOString().split("T")[0];

      // 🔹 Filtrar por fecha y usuario
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

  // 🔹 Cambiar día
  const cambiarDia = (delta) => {
    const nueva = new Date(fechaActual);
    nueva.setDate(nueva.getDate() + delta);
    setFechaActual(nueva);
  };

  // 🔹 Generar la grilla de horas (puedes ajustar a tu necesidad)
  const horasDia = Array.from({ length: 24 }, (_, i) => i);

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
        <button onClick={() => setMostrarModal(true)} className="btn-agregar">
          Agregar Cita
        </button>
      </div>

      {loading && <div className="loading">Cargando citas...</div>}
      {error && <div className="error-banner">{error}</div>}

      <div className="day-container">
        {/* 🔹 Cuadrícula de horas siempre visible */}
        {horasDia.map((hora) => (
          <div key={hora} className="hour-slot">
            <span className="hour-label">{hora}:00</span>
          </div>
        ))}

        {/* 🔹 Mensaje cuando no hay citas */}
        {citas.length === 0 && !loading && (
          <div className="no-events-overlay">No hay citas para este día</div>
        )}

        {/* 🔹 Renderizar citas */}
        {citas.map((c) => (
          <div
            key={c.id_cita}
            className="event-card"
            style={{
              backgroundColor: c.color || "#cfe2ff",
            }}
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
      </div>

      {/* 🔹 Modal para agregar / editar citas */}
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