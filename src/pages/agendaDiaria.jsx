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
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const hours = Array.from({ length: 10 }, (_, i) => `${String(8 + i).padStart(2, '0')}:00`);
  const API_URL = process.env.REACT_APP_API_URL || 'https://mi-api-atempo.onrender.com';

  // Cargar personas
  useEffect(() => {
    const fetchPersonas = async () => {
      try {
        const res = await fetch(`${API_URL}/api/personas`);
        if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
        const data = await res.json();
        setPersonas(data);
      } catch (err) {
        console.error('Error al cargar personas:', err);
        setError('No se pudieron cargar las personas.');
      }
    };
    fetchPersonas();
  }, [API_URL]);

  // Cargar citas
  const fetchCitas = async () => {
    try {
      setCargando(true);
      let url = `${API_URL}/api/citas`;
      if (personaSeleccionada !== 'todos') url += `?id_persona=${personaSeleccionada}`;

      const res = await fetch(url);
      if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
      let data = await res.json();

      // Filtrar por fecha
      const fechaStr = fechaSeleccionada.toISOString().slice(0, 10);
      data = data.filter(cita => cita.fecha.slice(0, 10) === fechaStr);

      setCitas(data);
      setCargando(false);
    } catch (err) {
      console.error('Error al cargar citas:', err);
      setCitas([]);
      setError('No se pudieron cargar las citas.');
      setCargando(false);
    }
  };

  useEffect(() => {
    if (!isNaN(fechaSeleccionada.getTime())) fetchCitas();
  }, [personaSeleccionada, fechaSeleccionada, API_URL]);

  const cambiarFecha = (delta) => {
    const nuevaFecha = new Date(fechaSeleccionada);
    nuevaFecha.setDate(nuevaFecha.getDate() + delta);
    setFechaSeleccionada(nuevaFecha);
  };

  const getPersonaById = (id) => personas.find(p => p.id === id);

  const handleCloseModal = async (nuevaCita) => {
    setCitaSeleccionada(null);
    if (nuevaCita?.fecha) {
      const nuevaFecha = new Date(nuevaCita.fecha);
      if (!isNaN(nuevaFecha.getTime())) setFechaSeleccionada(nuevaFecha);
    }
    await fetchCitas();
  };

  return (
    <main className="daily-agenda-main">
      <div className="agenda-header">
        <div className="nav-date">
          <button className="date-nav-btn" onClick={() => cambiarFecha(-1)}><FiChevronLeft /></button>
          <button className="date-nav-btn" onClick={() => cambiarFecha(1)}><FiChevronRight /></button>
          <span>
            {!isNaN(fechaSeleccionada?.getTime())
              ? fechaSeleccionada.toLocaleDateString('es-MX', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })
              : 'Sin fecha'}
          </span>
        </div>

        <select
          className="filter-select"
          value={personaSeleccionada}
          onChange={e => setPersonaSeleccionada(e.target.value)}
        >
          <option value="todos">Todos</option>
          {personas.map(p => (
            <option key={p.id} value={p.id}>{p.nombre}</option>
          ))}
        </select>
      </div>

      {error && <div className="error-message">{error}</div>}
      {cargando ? (
        <div className="loading">Cargando citas...</div>
      ) : (
        <div
          className="agenda-grid"
          style={{ gridTemplateColumns: `80px repeat(${personaSeleccionada === 'todos' ? personas.length : 1}, 1fr)` }}
        >
          <div className="employee-header clock-header">
            <button className="clock-btn">
              <FaClock />
              <FaChevronDown className="dropdown-arrow" />
            </button>
          </div>

          {(personaSeleccionada === 'todos' ? personas : [getPersonaById(Number(personaSeleccionada))]).map(emp => (
            <div className="employee-header" key={emp?.id}>
              <img src={avatar} alt={emp?.nombre} />
              <span>{emp?.nombre}</span>
            </div>
          ))}

          {hours.map(hour => (
            <React.Fragment key={hour}>
              <div className="hour-cell">{hour}</div>
              {(personaSeleccionada === 'todos' ? personas : [getPersonaById(Number(personaSeleccionada))]).map(emp => {
                const empCitas = citas.filter(c => c.id_persona === emp?.id);
                return (
                  <div className="time-cell" key={`${emp?.id}-${hour}`}>
                    {empCitas.filter(c => c.hora_inicio.slice(0, 2) === hour.slice(0, 2)).map((cita, index) => (
                      <div
                        className="appointment"
                        key={index}
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
                        <strong>{cita.nombre_cliente}</strong>
                        <div>{cita.titulo}</div>
                        <small>{cita.hora_inicio.slice(0, 5)} - {cita.hora_final.slice(0, 5)}</small>
                      </div>
                    ))}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      )}

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
