import React, { useState, useEffect } from 'react';
import '../styles/agendaDiaria.css';
import avatar from '../assets/avatar.png';
import { FaClock, FaChevronDown } from 'react-icons/fa';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import ModalCita from '../components/modalCita/modalCita';

const AgendaDiaria = () => {
  const [personas, setPersonas] = useState([]);
  const [personaSeleccionada, setPersonaSeleccionada] = useState('todos');
  const [citas, setCitas] = useState([]);
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date());
  const [citaSeleccionada, setCitaSeleccionada] = useState(null);

  const hours = Array.from({ length: 10 }, (_, i) => `${String(8 + i).padStart(2, '0')}:00`);
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

  const fechaLocalYYYYMMDD = (d) => {
    const dt = new Date(d);
    const y = dt.getFullYear();
    const m = String(dt.getMonth() + 1).padStart(2, '0');
    const day = String(dt.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const horaEntera = (hhmmss) => {
    if (!hhmmss) return null;
    const [h] = hhmmss.split(':');
    return parseInt(h, 10);
  };

  // Cargar personas
  useEffect(() => {
    const fetchPersonas = async () => {
      try {
        const res = await fetch(`${API_URL}/api/personas`);
        const data = await res.json();
        setPersonas(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error al cargar personas:', error);
      }
    };
    fetchPersonas();
  }, [API_URL]);

  // Cargar citas
  const fetchCitas = async () => {
    try {
      const res = await fetch(`${API_URL}/api/citas`);
      let data = await res.json();
      if (!Array.isArray(data)) data = [];
      const fechaStr = fechaLocalYYYYMMDD(fechaSeleccionada);
      data = data.filter((c) => c.fecha?.slice(0, 10) === fechaStr);
      setCitas(data);
    } catch (error) {
      console.error('Error al cargar citas:', error);
    }
  };

  useEffect(() => {
    fetchCitas();
  }, [fechaSeleccionada]);

  const cambiarFecha = (delta) => {
    const nueva = new Date(fechaSeleccionada);
    nueva.setDate(nueva.getDate() + delta);
    setFechaSeleccionada(nueva);
  };

  const getPersonaByUuid = (uuid) => personas.find((p) => p.id_persona_uuid === uuid);
  const personasVisibles =
    personaSeleccionada === 'todos' ? personas : [getPersonaByUuid(personaSeleccionada)].filter(Boolean);

  const handleCloseModal = async (nuevaCita) => {
    setCitaSeleccionada(null);
    await fetchCitas();
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
          gridTemplateColumns: `80px repeat(${personaSeleccionada === 'todos' ? personas.length : 1}, 1fr)`
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
                (c) => c.id_persona_uuid === emp.id_persona_uuid
              );
              return (
                <div className="time-cell" key={`${emp.id_persona_uuid}-${hour}`}>
                  {empCitas
                    .filter(
                      (c) => horaEntera(c.hora_inicio) === parseInt(hour.split(':')[0], 10)
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
        <ModalCita modo="editar" cita={citaSeleccionada} onClose={handleCloseModal} />
      )}
    </main>
  );
};

export default AgendaDiaria;
