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

      // Convertimos la fecha a YYYY-MM-DD
      const fechaStr = fechaSeleccionada.toISOString().slice(0, 10);
      data = data.filter(cita => cita.fecha.slice(0, 10) === fechaStr);

      // Eliminar duplicados por ID
      const citasUnicas = Array.from(
        new Map(data.map(cita => [cita.id, cita])).values()
      );

      setCitas(citasUnicas);
    } catch (error) {
      console.error('Error al cargar citas:', error);
    }
  };

  useEffect(() => {
    fetchCitas();
  }, [personaSeleccionada, fechaSeleccionada, API_URL]);

  const cambiarFecha = (delta) => {
    const nuevaFecha = new Date(fechaSeleccionada);
    nuevaFecha.setDate(nuevaFecha.getDate() + delta);
    setFechaSeleccionada(nuevaFecha);
  };

  const getPersonaById = (id) => personas.find(p => String(p.id) === String(id));

  const handleCloseModal = async (nuevaCita) => {
    setCitaSeleccionada(null);

    if (nuevaCita) {
      setCitas(prev =>
        prev.some(c => c.id === nuevaCita.id)
          ? prev.map(c => c.id === nuevaCita.id ? nuevaCita : c)
          : [...prev, nuevaCita]
      );
      setFechaSeleccionada(new Date(nuevaCita.fecha));
    } else {
      await fetchCitas();
    }
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

        {(personaSeleccionada === 'todos' ? personas : [getPersonaById(personaSeleccionada)]).map(emp => (
          <div className="employee-header" key={emp?.id}>
            <img src={avatar} alt={emp?.nombre} />
            <span>{emp?.nombre}</span>
          </div>
        ))}

        {hours.map(hour => (
          <React.Fragment key={hour}>
            <div className="hour-cell">{hour}</div>
            {(personaSeleccionada === 'todos' ? personas : [getPersonaById(personaSeleccionada)]).map(emp => {
              const empCitas = citas.filter(c => String(c.id_persona) === String(emp?.id));
              return (
                <div className="time-cell" key={`${emp?.id}-${hour}`}>
                  {empCitas
                    .filter(c => parseInt(c.hora_inicio.split(':')[0]) === parseInt(hour.split(':')[0]))
                    .map((cita, index) => (
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
