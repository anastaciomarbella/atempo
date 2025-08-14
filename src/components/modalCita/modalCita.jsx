import React, { useState, useEffect } from 'react';
import { FaTimes, FaSave } from 'react-icons/fa';
import './modalCita.css';

const coloresDisponibles = [
  '#ffe4e6', '#ffedd5', '#fef9c3', '#bbf7d0',
  '#dcfce7', '#e0f2fe', '#b3e5fc', '#ede9fe', '#fce7f3'
];

function convertir24hAAmPm(hora24) {
  if (!hora24) return '';
  const [horaStr, minStr] = hora24.split(':');
  let hora = parseInt(horaStr, 10);
  const minutos = minStr;
  const ampm = hora >= 12 ? 'PM' : 'AM';
  hora = hora % 12;
  if (hora === 0) hora = 12;
  return `${hora}:${minutos} ${ampm}`;
}

const ModalCita = ({ modo = 'crear', cita = {}, onClose }) => {
  const [personas, setPersonas] = useState([]);
  const [mostrarListaEncargados, setMostrarListaEncargados] = useState(false);
  const [formulario, setFormulario] = useState({
    id_persona_uuid: null, // ✅ Cambiado de id_persona a id_persona_uuid
    titulo: '',
    encargado: '',
    fecha: '',
    start: '',
    end: '',
    client: '',
    clientPhone: '',
    comentario: '',
    color: coloresDisponibles[0]
  });
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    fetch('https://mi-api-atempo.onrender.com/api/personas')
      .then(res => res.json())
      .then(data => setPersonas(data))
      .catch(err => console.error('Error cargando personas:', err));
  }, []);

  useEffect(() => {
    if (modo === 'editar' && cita && personas.length > 0) {
      const encargadoEncontrado = personas.find(p => p.id_persona_uuid === cita.id_persona_uuid);
      setFormulario({
        id_persona_uuid: cita.id_persona_uuid || null,
        titulo: cita.titulo || '',
        encargado: encargadoEncontrado ? encargadoEncontrado.nombre : '',
        fecha: cita.fecha || '',
        start: cita.hora_inicio || '',
        end: cita.hora_final || '',
        client: cita.nombre_cliente || '',
        clientPhone: cita.numero_cliente || '',
        comentario: cita.motivo || '',
        color: cita.color || coloresDisponibles[0]
      });
      setMensaje('');
    }
  }, [modo, cita, personas]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if ((name === 'start' || name === 'end') && mostrarListaEncargados) {
      setMostrarListaEncargados(false);
    }

    setFormulario(prev => ({ ...prev, [name]: value }));
    setMensaje('');
  };

  const handleColorSelect = (color) => {
    setFormulario(prev => ({ ...prev, color }));
  };

  const handleEncargadoSelect = (persona) => {
    setFormulario(prev => ({
      ...prev,
      id_persona_uuid: persona.id_persona_uuid, // ✅ Aquí también cambiamos
      encargado: persona.nombre
    }));
    setMostrarListaEncargados(false);
    setMensaje('');
  };

  const handleGuardar = async () => {
    if (!formulario.id_persona_uuid) {
      setMensaje('Por favor selecciona un encargado válido.');
      return;
    }
    if (!formulario.titulo || !formulario.fecha || !formulario.start || !formulario.end) {
      setMensaje('Por favor completa todos los campos obligatorios.');
      return;
    }

    setGuardando(true);
    setMensaje('');

    const hora_inicio = convertir24hAAmPm(formulario.start);
    const hora_final = convertir24hAAmPm(formulario.end);

    const dataParaEnviar = {
      id_persona_uuid: formulario.id_persona_uuid, // ✅ Usamos UUID
      titulo: formulario.titulo,
      fecha: formulario.fecha,
      hora_inicio,
      hora_final,
      nombre_cliente: formulario.client,
      numero_cliente: formulario.clientPhone,
      motivo: formulario.comentario,
      color: formulario.color
    };

    try {
      const res = await fetch('https://mi-api-atempo.onrender.com/api/citas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataParaEnviar)
      });
      if (!res.ok) throw new Error('Error al guardar la cita');

      setMensaje('Tu cita ha sido agendada exitosamente.');

      setTimeout(() => {
        onClose();
      }, 2000);

    } catch (error) {
      setMensaje('Error al guardar la cita: ' + error.message);
      console.error(error);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <>
      <div className="agendar-overlay visible"></div>
      <div className="agendar-modal">
        <button className="agendar-cerrar-modal" onClick={onClose} disabled={guardando}>
          <FaTimes />
        </button>
        <h2 className="agendar-titulo-modal">
          {modo === 'editar' ? 'Detalles de la cita' : 'Agendar citas'}
        </h2>

        <div className="agendar-formulario">
          <div className="agendar-fila">
            <div>
              <label>Título *</label>
              <input
                name="titulo"
                type="text"
                placeholder="Título de la cita"
                value={formulario.titulo}
                onChange={handleChange}
                disabled={guardando}
              />
            </div>
            <div>
              <label>Encargado *</label>
              <div className="dropdown-encargado">
                <button
                  type="button"
                  className="dropdown-boton"
                  onClick={() => setMostrarListaEncargados(!mostrarListaEncargados)}
                  disabled={guardando}
                >
                  {formulario.encargado || 'Selecciona un encargado'}
                </button>
                {mostrarListaEncargados && (
                  <ul className="dropdown-lista" style={{ maxHeight: 150, overflowY: 'auto' }}>
                    {personas.map(p => (
                      <li
                        key={p.id_persona_uuid} // ✅ UUID como key
                        onClick={() => handleEncargadoSelect(p)}
                      >
                        {p.nombre}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>

          <div className="agendar-fila">
            <div>
              <label>Fecha *</label>
              <input
                name="fecha"
                type="date"
                value={formulario.fecha}
                onChange={handleChange}
                disabled={guardando}
              />
            </div>
            <div>
              <label>Hora *</label>
              <div className="agendar-horario">
                <input
                  name="start"
                  type="time"
                  value={formulario.start}
                  onChange={handleChange}
                  disabled={guardando}
                />
                <span>a</span>
                <input
                  name="end"
                  type="time"
                  value={formulario.end}
                  onChange={handleChange}
                  disabled={guardando}
                />
              </div>
            </div>
          </div>

          <div className="agendar-fila">
            <div>
              <label>Cliente</label>
              <input
                name="client"
                type="text"
                placeholder="Nombre del cliente"
                value={formulario.client}
                onChange={handleChange}
                disabled={guardando}
              />
            </div>
            <div>
              <label>Número celular</label>
              <input
                name="clientPhone"
                type="tel"
                placeholder="Número celular"
                value={formulario.clientPhone}
                onChange={handleChange}
                disabled={guardando}
              />
            </div>
          </div>

          <div className="agendar-fila">
            <div style={{ gridColumn: 'span 2', margin: '0 18px' }}>
              <label>Comentario</label>
              <input
                name="comentario"
                type="text"
                placeholder="Descripción o comentario"
                value={formulario.comentario}
                onChange={handleChange}
                disabled={guardando}
              />
            </div>
          </div>

          <label>Color *</label>
          <div className="agendar-colores">
            {coloresDisponibles.map((color, i) => (
              <span
                key={i}
                className={`agendar-color ${formulario.color === color ? 'seleccionado' : ''}`}
                style={{ backgroundColor: color }}
                onClick={() => handleColorSelect(color)}
              />
            ))}
          </div>

          {mensaje && (
            <div
              style={{
                marginTop: '10px',
                color: mensaje.startsWith('Error') ? 'red' : 'green',
                fontWeight: 'bold',
                textAlign: 'center'
              }}
            >
              {mensaje}
            </div>
          )}

          <p className="agendar-obligatorio">* Campos obligatorios</p>
          <button
            className="agendar-btn-guardar"
            onClick={handleGuardar}
            disabled={guardando}
          >
            <FaSave className="icono-guardar" />
            {guardando ? 'Guardando...' : modo === 'editar' ? 'Guardar cambios' : 'Guardar cita'}
          </button>
        </div>
      </div>
    </>
  );
};

export default ModalCita;
