import React, { useState, useEffect } from 'react';
import '../styles/agendaDiaria.css';
import avatar from '../assets/avatar.png';
import { FaClock, FaChevronDown } from 'react-icons/fa';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import ModalCita from '../components/modalCita/modalCita';

const AgendaDiaria = () => {
  const [personas, setPersonas] = useState([]);
  const [personaSeleccionada, setPersonaSeleccionada] = useState('todos'); // value será uuid o 'todos'
  const [citas, setCitas] = useState([]);
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date());
  const [citaSeleccionada, setCitaSeleccionada] = useState(null);

  // Horas visibles (08:00 a 17:00)
  const hours = Array.from({ length: 10 }, (_, i) => `${String(8 + i).padStart(2, '0')}:00`);

  const API_URL = process.env.REACT_APP_API_URL || 'https://mi-api-atempo.onrender.com';

  // ------- Helpers -------
  // YYYY-MM-DD en hora local (evita desfase por UTC de toISOString)
  const fechaLocalYYYYMMDD = (d) => {
    const dt = new Date(d);
    const y = dt.getFullYear();
    const m = String(dt.getMonth() + 1).padStart(2, '0');
    const day = String(dt.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const horaEntera = (hhmmss) => {
    // admite "08:23:00", "08:23", "8:23"
    if (!hhmmss) return null;
    const [h] = hhmmss.split(':');
    return parseInt(h, 10);
  };

  // ------- Cargar personas -------
  useEffect(() => {
    const fetchPersonas = async () => {
      try {
        const res = await fetch(`${API_URL}/api/personas`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setPersonas(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error al cargar personas:', error);
        setPersonas([]);
      }
    };
    fetchPersonas();
  }, [API_URL]);

  // ------- Cargar citas (filtradas por fecha y persona) -------
  const fetchCitas = async () => {
    try {
      let url = `${API_URL}/api/citas`;
      // el backend debe aceptar ?id_persona=<uuid> o ?id_persona_uuid=<uuid>. Usamos el nombre correcto:
      if (personaSeleccionada !== 'todos') {
        url += `?id_persona_uuid=${personaSeleccionada}`;
      }

      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      let data = await res.json();
      if (!Array.isArray(data)) data = [];

      // Filtrar por fecha local exacta YYYY-MM-DD (la columna fecha es DATE)
      const fechaStr = fechaLocalYYYYMMDD(fechaSeleccionada);
      data = data.filter((cita) => {
        const f = typeof cita.fecha === 'string' ? cita.fecha.slice(0, 10) : fechaStr;
        return f === fechaStr;
      });

      // Eliminar duplicados por id_cita
      const citasUnicas = Array.from(
        new Map(data.map((c) => [c.id_cita, c])).values()
      );

      setCitas(citasUnicas);
    } catch (error) {
      console.error('Error al cargar citas:', error);
      setCitas([]);
    }
  };

  useEffect(() => {
    fetchCitas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [personaSeleccionada, fechaSeleccionada, API_URL]);

  // ------- Navegación de fecha -------
  const cambiarFecha = (delta) => {
    const nueva = new Date(fechaSeleccionada);
    nueva.setDate(nueva.getDate() + delta);
    setFechaSeleccionada(nueva);
  };

  // ------- Utilidades de persona -------
  const getPersonaByUuid = (uuid) =>
    personas.find((p) => String(p.id_persona_uuid) === String(uuid));

  const personasVisibles =
    personaSeleccionada === 'todos'
      ? personas
      : [getPersonaByUuid(personaSeleccionada)].filter(Boolean);

  // ------- Cierre modal -------
  const handleCloseModal = async (nuevaCita) => {
    setCitaSeleccionada(null);

    if (nuevaCita) {
      setCitas((prev) =>
        prev.some((c) => c.id_cita === nuevaCita.id_cita)
          ? prev.map((c) => (c.id_cita === nuevaCita.id_cita ? nuevaCita : c))
          : [...prev, nuevaCita]
      );
      if (nuevaCita.fecha) setFechaSeleccionada(new Date(nuevaCita.fecha));
    } else {
      await fetchCitas();
    }
  };

  return (
    <main className="daily-agenda-main">
      <div className="agenda-header">
        <div className="nav-date">
          <button className="date-nav-btn" onClick={() => cambiarFecha(-1)}>
            <FiChevronLeft />
          </button>
          <button className="date-nav-btn" onClick={() => cambiarFecha(1)}>
            <FiChevronRight />
          </button>
          <span>
            {fechaSeleccionada.toLocaleDateString('es-MX', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })}
          </span>
        </div>

        <select
          className="filter-select"
          value={personaSeleccionada}
          onChange={(e) => setPersonaSeleccionada(e.target.value)}
        >
          <option value="todos">Todos</option>
          {personas.map((p) => (
            <option key={p.id_persona_uuid} value={p.id_persona_uuid}>
              {p.nombre}
            </option>
          ))}
        </select>
      </div>

      <div
        className="agenda-grid"
        style={{
          gridTemplateColumns: `80px repeat(${
            personaSeleccionada === 'todos' ? personas.length : 1
          }, 1fr)`
        }}
      >
        <div className="employee-header clock-header">
          <button className="clock-btn">
            <FaClock />
            <FaChevronDown className="dropdown-arrow" />
          </button>
        </div>

        {personasVisibles.map((emp) => (
          <div className="employee-header" key={emp.id_persona_uuid}>
            <img src={avatar} alt={emp.nombre} />
            <span>{emp.nombre}</span>
          </div>
        ))}

        {hours.map((hour) => (
          <React.Fragment key={hour}>
            <div className="hour-cell">{hour}</div>

            {personasVisibles.map((emp) => {
              const empCitas = citas.filter(
                (c) => String(c.id_persona_uuid) === String(emp.id_persona_uuid)
              );

              return (
                <div className="time-cell" key={`${emp.id_persona_uuid}-${hour}`}>
                  {empCitas
                    .filter(
                      (c) =>
                        horaEntera(c.hora_inicio) ===
                        parseInt(hour.split(':')[0], 10)
                    )
                    .map((cita) => (
                      <div
                        className="appointment"
                        key={cita.id_cita}
                        style={{
                          height: '60px',
                          backgroundColor: cita.color || '#e0e0e0',
                          borderRadius: '6px',
                          padding: '4px',
                          marginBottom: '4px',
                          cursor: 'pointer',
                          color: '#000',
                          fontSize: '12px',
                          overflow: 'hidden'
                        }}
                        onClick={() => setCitaSeleccionada(cita)}
                      >
                        <strong>{cita.nombre_cliente || 'Sin nombre'}</strong>
                        <div>{cita.titulo || ''}</div>
                        <small>
                          {(cita.hora_inicio || '').slice(0, 5)} -{' '}
                          {(cita.hora_final || '').slice(0, 5)}
                        </small>
                      </div>
                    ))}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>

      {citaSeleccionada && (
        <ModalCita
          modo="editar"
          cita={citaSeleccionada}
          onClose={handleCloseModal}
        />
      )}
    </main>
  );
};

export default AgendaDiaria;
