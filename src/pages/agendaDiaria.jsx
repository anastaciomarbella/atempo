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

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
  const hours = Array.from({ length: 10 }, (_, i) => `${String(8 + i).padStart(2, '0')}:00`);
  const cellHeight = 62;

  // Cargar personas
  useEffect(() => {
    const fetchPersonas = async () => {
      try {
        const res = await fetch(`${API_URL}/api/personas`);
        const data = await res.json();
        setPersonas(data);
      } catch (error) {
        console.error('Error cargando personas:', error);
      }
    };
    fetchPersonas();
  }, [API_URL]);

  // Cargar citas filtradas por día y persona
  useEffect(() => {
    const fetchCitas = async () => {
      try {
        let url = `${API_URL}/api/citas`;
        if (personaSeleccionada !== 'todos') {
          url = `${API_URL}/api/citas/persona/${personaSeleccionada}`;
        }
        const res = await fetch(url);
        const data = await res.json();

        const fechaStr = fechaSeleccionada.toISOString().slice(0, 10);
        const citasFiltradas = data.filter(cita => cita.fecha.slice(0, 10) === fechaStr);

        setCitas(citasFiltradas);
      } catch (error) {
        console.error('Error cargando citas:', error);
      }
    };
    fetchCitas();
  }, [personaSeleccionada, fechaSeleccionada, API_URL]);

  const cambiarFecha = (dias) => {
    const nuevaFecha = new Date(fechaSeleccionada);
    nuevaFecha.setDate(nuevaFecha.getDate() + dias);
    setFechaSeleccionada(nuevaFecha);
  };

  // Lista de empleados a mostrar
  const empleados = personaSeleccionada === 'todos'
    ? personas
    : [personas.find(p => p.id === Number(personaSeleccionada))].filter(Boolean);

  return (
    <main className="weekly-agenda-main">
      <div className="agenda-header">
        <div className="nav-date">
          <button className="date-nav-btn" onClick={() => cambiarFecha(-1)}><FiChevronLeft /></button>
          <button className="date-nav-btn" onClick={() => cambiarFecha(1)}><FiChevronRight /></button>
          <span>
            {fechaSeleccionada.toLocaleDateString('es-MX', {
              weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
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

      <div className="agenda-grid" style={{ gridTemplateColumns: `80px repeat(${empleados.length}, 1fr)` }}>
        <div className="employee-header weekly-clock-header">
          <button className="weekly-clock-btn">
            <FaClock />
            <FaChevronDown className="dropdown-arrow" />
          </button>
        </div>

        {empleados.map(emp => (
          <div className="employee-header" key={emp.id}>
            <img src={avatar} alt={emp.nombre} />
            <span>{emp.nombre}</span>
          </div>
        ))}

        {hours.map(hour => (
          <React.Fragment key={hour}>
            <div className="hour-cell">{hour}</div>
            {empleados.map(emp => {
              const empCitas = citas.filter(c => c.id_persona === emp.id);
              return (
                <div className="time-cell" key={`${emp.id}-${hour}`}>
                  {empCitas
                    .filter(c => parseInt(c.hora_inicio.slice(0, 2)) === parseInt(hour.slice(0, 2)))
                    .map((cita, index) => {
                      const [startH, startM] = cita.hora_inicio.split(':').map(Number);
                      const [endH, endM] = cita.hora_final.split(':').map(Number);
                      const startMin = startH * 60 + startM;
                      const endMin = endH * 60 + endM;
                      const offsetTop = ((startMin - startH * 60) / 60) * cellHeight;
                      const height = ((endMin - startMin) / 60) * cellHeight;

                      return (
                        <div
                          className="appointment"
                          key={index}
                          style={{ top: `${offsetTop}px`, height: `${height}px`, position: 'absolute', left: 0, right: 0 }}
                          onClick={() => setCitaSeleccionada(cita)}
                        >
                          <strong>{cita.nombre_cliente}</strong>
                          <div>{cita.titulo}</div>
                          <small>{cita.hora_inicio} - {cita.hora_final}</small>
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
