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

  const API_URL = process.env.REACT_APP_API_URL || 'https://mi-api-atempo.onrender.com';

  // Cargar personas
  useEffect(() => {
    const fetchPersonas = async () => {
      try {
        const res = await fetch(`${API_URL}/api/personas`);
        const data = await res.json();
        setPersonas(data);
      } catch (error) {
        console.error('Error al cargar personas:', error);
      }
    };
    fetchPersonas();
  }, [API_URL]);

  // Cargar citas filtradas por fecha y persona
  const fetchCitas = async () => {
    try {
      let url = `${API_URL}/api/citas`;
      if (personaSeleccionada !== 'todos') {
        url += `?id_persona=${personaSeleccionada}`;
      }
      const res = await fetch(url);
      let data = await res.json();

      const fechaStr = fechaSeleccionada.toLocaleDateString('sv-SE');
      data = data.filter(cita => cita.fecha.slice(0, 10) === fechaStr);

      setCitas(data);
    } catch (error) {
      console.error('Error al cargar citas:', error);
    }
  };

  useEffect(() => {
    if (!isNaN(fechaSeleccionada.getTime())) {
      fetchCitas();
    }
  }, [personaSeleccionada, fechaSeleccionada, API_URL]);

  const cambiarFecha = (delta) => {
    const nuevaFecha = new Date(fechaSeleccionada);
    nuevaFecha.setDate(nuevaFecha.getDate() + delta);
    setFechaSeleccionada(nuevaFecha);
  };

  const getPersonaById = (id) => personas.find(p => p.id === id);

  const handleCloseModal = async (nuevaCita) => {
    setCitaSeleccionada(null);

    // Si hay nueva cita con fecha válida, actualiza la fecha seleccionada
    if (nuevaCita && nuevaCita.fecha) {
      const nuevaFecha = new Date(nuevaCita.fecha);
      if (!isNaN(nuevaFecha.getTime())) {
        setFechaSeleccionada(nuevaFecha);
      }
    }

    // Recargar citas con la fecha actual
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
                    return (
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
          onClose={handleCloseModal}
        />
      )}
    </main>
  );
};

export default AgendaDiaria;
