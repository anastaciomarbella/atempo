import React, { useState, useEffect } from 'react';
import { FaTimes, FaSave } from 'react-icons/fa';
import './modalCita.css';

const coloresDisponibles = [
  '#ffe4e6', '#ffedd5', '#fef9c3', '#bbf7d0',
  '#dcfce7', '#e0f2fe', '#b3e5fc', '#ede9fe', '#fce7f3'
];

const ModalCita = ({ modo = 'crear', cita = {}, onClose }) => {
  const [personas, setPersonas] = useState([]);
  const [mostrarListaEncargados, setMostrarListaEncargados] = useState(false);
  const [formulario, setFormulario] = useState({
    id_persona: null,
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

  // Cargar personas
  useEffect(() => {
    fetch('https://mi-api-atempo.onrender.com/api/personas')
      .then(res => res.json())
      .then(data => setPersonas(data))
      .catch(err => console.error('Error cargando personas:', err));
  }, []);

  // Cargar datos si es modo editar
  useEffect(() => {
    if (modo === 'editar' && cita && personas.length > 0) {
      const encargadoEncontrado = personas.find(p => p.id === cita.id_persona);
      setFormulario({
        id_persona: cita.id_persona || null,
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
      id_persona: persona.id,
      encargado: persona.nombre
    }));
    setMostrarListaEncargados(false);
    setMensaje('');
  };

  const handleGuardar = async () => {
    if (!formulario.id_persona) {
      setMensaje('Por favor selecciona un encargado válido.');
      return;
    }
    if (!formulario.titulo || !formulario.fecha || !formulario.start || !formulario.end) {
      setMensaje('Por favor completa todos los campos obligatorios.');
      return;
    }

    setGuardando(true);
    setMensaje('');

    // Preparar datos para enviar (24h directo, backend los convierte)
    const dataParaEnviar = {
      id_persona: formulario.id_persona,
      titulo: formulario.titulo,
      fecha: formulario.fecha,
      hora_inicio: formulario.start,
      hora_final: formulario.end,
      nombre_cliente: formulario.client,
      numero_cliente: formulario.clientPhone,
      motivo: formulario.comentario,
      color: formulario.color
    };

    try {
      let res;
      if (modo === 'crear') {
        res = await fetch('https://mi-api-atempo.onrender.com/api/citas', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(dataParaEnviar)
        });
      } else {
        res = await fetch(`https://mi-api-atempo.onrender.com/api/citas/${cita.id}`, {
          method: 'PUT', // o PATCH según tu API
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(dataParaEnviar)
        });
      }

      if (!res.ok) throw new Error('Error al guardar la cita');

      setMensaje('Tu cita ha sido guardada exitosamente.');

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

  const handleEliminar = async () => {
    if (!cita.id) return;

    const confirmar = window.confirm('¿Deseas eliminar esta cita?');
    if (!confirmar) return;

    setGuardando(true);
    try {
      const res = await fetch(`https://mi-api-atempo.onrender.com/api/citas/${cita.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Error al eliminar la cita');
      setMensaje('Cita eliminada correctamente.');

      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      setMensaje('Error al eliminar la cita: ' + error.message);
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
                      <li key={p.id} onClick={() => handleEncargadoSelect(p)}>
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

          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
            <button
              className="agendar-btn-guardar"
              onClick={handleGuardar}
              disabled={guardando}
            >
              <FaSave className="icono-guardar" />
              {guardando ? 'Guardando...' : modo === 'editar' ? 'Guardar cambios' : 'Guardar cita'}
            </button>

            {modo === 'editar' && (
              <button
                className="agendar-btn-eliminar"
                onClick={handleEliminar}
                disabled={guardando}
                style={{ backgroundColor: '#ff4d4f', color: 'white' }}
              >
                <FaTimes className="icono-eliminar" /> Eliminar
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ModalCita;
