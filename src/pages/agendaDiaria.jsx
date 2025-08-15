import React, { useState, useEffect } from 'react';
import '../styles/agendaDiaria.css';
import avatar from '../assets/avatar.png';
import { FaClock, FaChevronDown } from 'react-icons/fa';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

import ModalCita from '../components/modalCita/modalCita';

const AgendaDiaria = () => {
  const [personas, setPersonas] = useState([]);
  const [personaSeleccionada, setPersonaSeleccionada] = useState(null);
  const [citas, setCitas] = useState([]);
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date());
  const [mostrarDropdown, setMostrarDropdown] = useState(false);
  const [citaSeleccionada, setCitaSeleccionada] = useState(null);

  useEffect(() => {
    fetch('http://localhost:3001/api/personas')
      .then(res => res.json())
      .then(data => {
        setPersonas(data);
        if (data.length > 0) {
          setPersonaSeleccionada(data[0].id_persona);
        }
      })
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    if (personaSeleccionada) {
      const fechaISO = fechaSeleccionada.toISOString().split('T')[0];
      fetch(`http://localhost:3001/api/citas?persona_id=${personaSeleccionada}&fecha=${fechaISO}`)
        .then(res => res.json())
        .then(data => setCitas(data))
        .catch(err => console.error(err));
    }
  }, [personaSeleccionada, fechaSeleccionada]);

  const cambiarDia = (dias) => {
    const nuevaFecha = new Date(fechaSeleccionada);
    nuevaFecha.setDate(nuevaFecha.getDate() + dias);
    setFechaSeleccionada(nuevaFecha);
  };

  const horas = Array.from({ length: 13 }, (_, i) => 8 + i); // 8:00 a 20:00

  return (
    <div className="agenda-diaria">
      <div className="header">
        <button onClick={() => cambiarDia(-1)}><FiChevronLeft /></button>
        <h2>{fechaSeleccionada.toLocaleDateString()}</h2>
        <button onClick={() => cambiarDia(1)}><FiChevronRight /></button>

        <div className="persona-selector">
          <div onClick={() => setMostrarDropdown(!mostrarDropdown)}>
            <img src={avatar} alt="avatar" className="avatar" />
            <span>
              {personas.find(p => p.id_persona === personaSeleccionada)?.nombre}
            </span>
            <FaChevronDown />
          </div>
          {mostrarDropdown && (
            <ul className="dropdown">
              {personas.map(persona => (
                <li
                  key={persona.id_persona}
                  onClick={() => {
                    setPersonaSeleccionada(persona.id_persona);
                    setMostrarDropdown(false);
                  }}
                >
                  {persona.nombre}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="agenda-grid">
        <div className="horas">
          {horas.map(hora => (
            <div key={hora} className="hora">
              <FaClock /> {hora}:00
            </div>
          ))}
        </div>

        <div className="citas">
          {citas.map(cita => {
            const horaInicio = parseInt(cita.hora_inicio.split(':')[0], 10);
            const minutoInicio = parseInt(cita.hora_inicio.split(':')[1], 10);
            const horaFinal = parseInt(cita.hora_final.split(':')[0], 10);
            const minutoFinal = parseInt(cita.hora_final.split(':')[1], 10);

            const top = ((horaInicio - 8) * 60 + minutoInicio) * (60 / 60);
            const height = ((horaFinal - horaInicio) * 60 + (minutoFinal - minutoInicio)) * (60 / 60);

            return (
              <div
                className="appointment"
                key={cita.id_cita}
                style={{
                  top: `${top}px`,
                  height: `${height}px`,
                  backgroundColor: cita.color || 'green' // cambio para usar el color de la BD
                }}
                onClick={() => setCitaSeleccionada(cita)}
              >
                <strong>{cita.nombre_cliente}</strong>
                <div className="titulo-cita">{cita.titulo}</div>
                <small>{cita.hora_inicio.slice(0, 5)} - {cita.hora_final.slice(0, 5)}</small>
              </div>
            );
          })}
        </div>
      </div>

      {citaSeleccionada && (
        <ModalCita
          cita={citaSeleccionada}
          onClose={() => setCitaSeleccionada(null)}
          onSave={() => {
            const fechaISO = fechaSeleccionada.toISOString().split('T')[0];
            fetch(`http://localhost:3001/api/citas?persona_id=${personaSeleccionada}&fecha=${fechaISO}`)
              .then(res => res.json())
              .then(data => setCitas(data))
              .catch(err => console.error(err));
          }}
        />
      )}
    </div>
  );
};

export default AgendaDiaria;
