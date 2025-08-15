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
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date('2025-07-18'));
  const [citaSeleccionada, setCitaSeleccionada] = useState(null);

  const hours = Array.from({ length: 10 }, (_, i) => `${String(8 + i).padStart(2, '0')}:00`);

  useEffect(() => {
    const fetchPersonas = async () => {
      try {
        const res = await fetch('https://mi-api-atempo.onrender.com/api/personas');
        const data = await res.json();
        setPersonas(data);
      } catch (error) {
        console.error('Error al cargar personas:', error);
      }
    };
    fetchPersonas();
  }, []);

  useEffect(() => {
    const fetchCitas = async () => {
      try {
        let url = 'https://mi-api-atempo.onrender.com/api/citas';
        if (personaSeleccionada !== 'todos') {
          url += `?id_persona=${personaSeleccionada}`;
        }
        const res = await fetch(url);
        let data = await res.json();
        const fechaStr = fechaSeleccionada.toISOString().slice(0, 10);
        data = data.filter(cita => cita.fecha.slice(0, 10) === fechaStr);
        setCitas(data);
      } catch (error) {
        console.error('Error al cargar citas:', error);
      }
    };
    fetchCitas();
  }, [personaSeleccionada, fechaSeleccionada]);

  const cambiarFecha = (delta) => {
    const nuevaFecha = new Date(fechaSeleccionada);
    nuevaFecha.setDate(nuevaFecha.getDate() + delta);
    setFechaSeleccionada(nuevaFecha);
  };

  const getPersonaById = (id) => {
    return personas.find(p => p.id === id);
  };

  return (
    <main className="daily-agenda-main">
      <div className="agenda-header">
        <div className="nav-date">
          <button className="date-nav-btn" onClick={() => cambiarFecha(-1)}><FiChevronLeft /></button>
          <button className="date-nav-btn" onClick={() => cambiarFecha(1)}><FiChevronRight /></button>
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
          onChange={e => setPersonaSeleccionada(e.target.value)}
        >
          <option value="todos">Todos</option>
          {personas.map(p => (
            <option key={p.id} value={p.id}>{p.nombre}</option>
          ))}
        </select>
      </div>

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
                  {empCitas.filter(c => c.hora_inicio.slice(0, 2) === hour.slice(0, 2)).map((cita, index) => {
                    const start = cita.hora_inicio.split(':');
                    const end = cita.hora_final.split(':');
                    const startMin = parseInt(start[0]) * 60 + parseInt(start[1]);
                    const endMin = parseInt(end[0]) * 60 + parseInt(end[1]);
                    const height = ((endMin - startMin) / 60) * 62;

                    return (
                      <div
                        className="appointment"
                        key={index}
                        style={{ height: `${height}px` }}
                        onClick={() => setCitaSeleccionada(cita)}
                      >
                        <strong>{cita.nombre_cliente}</strong>
                        <div>{cita.titulo}</div>
                        <small>{cita.hora_inicio.slice(0, 5)} - {cita.hora_final.slice(0, 5)}</small>
                      </div>
                    );
                  })}
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
          onClose={() => setCitaSeleccionada(null)}
        />
      )}
    </main>
  );
};

export default AgendaDiaria;
