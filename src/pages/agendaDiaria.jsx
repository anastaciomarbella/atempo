import React, { useState, useEffect } from "react";
import "../styles/agendaDiaria.css";
import ModalCita from "../components/modalCita/modalCita";
import { API_URL } from "../config";

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

  const [empresa, setEmpresa] = useState("");
  const [logo, setLogo] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);

        setEmpresa(parsedUser.nombre_empresa || "");

        if (parsedUser.logo_url) {
          setLogo(
            parsedUser.logo_url.startsWith("http")
              ? parsedUser.logo_url.replace("http://", "https://")
              : `${API_URL}/${parsedUser.logo_url}`
          );
        }
      } catch (err) {
        console.error(err);
      }
    }
  }, []);

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

  const fetchCitas = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_URL}/api/citas`);
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
      setError("No se pudieron cargar las citas.");
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchCitas();
  }, [fechaActual]);

  const diasDelMes = () => {
    const fin = new Date(
      fechaActual.getFullYear(),
      fechaActual.getMonth() + 1,
      0
    );

    return Array.from({ length: fin.getDate() }, (_, i) => i + 1);
  };

  const cambiarMes = (delta) => {
    const nueva = new Date(fechaActual);
    nueva.setMonth(nueva.getMonth() + delta);
    setFechaActual(nueva);
  };

  return (
    <main className="calendar-container">

      {(empresa || logo) && (
        <div className="empresa-header">
          {logo && <img src={logo} alt="Logo empresa" className="logo-empresa" />}
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
      </div>

      {loading && <div className="loading">Cargando citas...</div>}
      {error && <div className="error-banner">{error}</div>}

      <div className="calendar-grid headers">
        {DIAS_SEMANA.map((d) => (
          <div key={d} className="day-header">{d}</div>
        ))}
      </div>

      <div className="calendar-grid body">
        {diasDelMes().map((day) => {
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