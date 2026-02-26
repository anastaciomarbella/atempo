import React, { useState, useEffect } from 'react';
import { FaTimes, FaSave, FaTrash } from 'react-icons/fa';
import './modalCita.css';

const coloresDisponibles = [
  '#f16b74', '#56fa47', '#f58225', '#bbf7d0','#def31f','#00fca8',
  '#47f183', '#58b4f1', '#3dc2ff', '#5e3aff', '#e42591','#f3343e'
];

function convertirA24h(hora) {
  if (!hora) return '';
  const [h, m] = hora.split(':');
  return `${h.padStart(2, '0')}:${m.padStart(2, '0')}`;
}

const ModalCita = ({ modo = 'crear', cita = {}, onClose, onSave }) => {
  const [personas, setPersonas] = useState([]);
  const [mostrarListaEncargados, setMostrarListaEncargados] = useState(false);
  const [formulario, setFormulario] = useState({
    id_persona: null,          // 👈 puede quedar null
    titulo: '',
    encargado: '',             // solo para mostrar en UI
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

  // === CARGAR PERSONAS ===
  useEffect(() => {
    fetch('https://mi-api-atempo.onrender.com/api/personas')
      .then(res => res.json())
      .then(data => setPersonas(Array.isArray(data) ? data : []))
      .catch(err => console.error('Error cargando personas:', err));
  }, []);

  // === CARGAR DATOS AL EDITAR ===
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

  // === SELECCIONAR ENCARGADO (opcional) ===
  const handleEncargadoSelect = (persona) => {
    setFormulario(prev => ({
      ...prev,
      id_persona: persona.id,   // si elige uno, se guarda
      encargado: persona.nombre
    }));
    setMostrarListaEncargados(false);
    setMensaje('');
  };

  // === LIMPIAR ENCARGADO (NUEVO) ===
  const quitarEncargado = () => {
    setFormulario(prev => ({
      ...prev,
      id_persona: null,
      encargado: ''
    }));
    setMostrarListaEncargados(false);
  };

  const handleGuardar = async () => {
    // ❌ YA NO EXIGIMOS ENCARGADO
    if (!formulario.titulo || !formulario.fecha || !formulario.start || !formulario.end) {
      setMensaje('Por favor completa los campos obligatorios.');
      return;
    }

    setGuardando(true);
    setMensaje('');

    const hora_inicio = convertirA24h(formulario.start);
    const hora_final = convertirA24h(formulario.end);

    const dataParaEnviar = {
      id_persona: formulario.id_persona || null, // 👈 CLAVE: puede ir vacío
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
      const url = modo === 'editar'
        ? `https://mi-api-atempo.onrender.com/api/citas/${cita.id}`
        : 'https://mi-api-atempo.onrender.com/api/citas';

      const res = await fetch(url, {
        method: modo === 'editar' ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataParaEnviar)
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || 'Error al guardar la cita');
      }

      if (onSave) {
        onSave({
          id_cita: cita?.id || Date.now(),
          ...dataParaEnviar
        });
      }

      setMensaje('Tu cita ha sido guardada exitosamente.');
      setTimeout(() => onClose(), 1500);
    } catch (error) {
      setMensaje('Error al guardar la cita: ' + error.message);
      console.error(error);
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminar = async () => {
    if (!window.confirm('¿Seguro que quieres eliminar esta cita?')) return;

    try {
      const res = await fetch(
        `https://mi-api-atempo.onrender.com/api/citas/${cita.id}`,
        { method: 'DELETE' }
      );

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || 'Error al eliminar la cita');
      }

      if (onSave) onSave({ id_cita: cita.id, eliminar: true });

      setMensaje('Cita eliminada correctamente.');
      setTimeout(() => onClose(), 1000);
    } catch (error) {
      setMensaje('Error al eliminar la cita: ' + error.message);
      console.error(error);
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
              <label>Encargado (opcional)</label>

              <div className="dropdown-encargado">
                <button
                  type="button"
                  className="dropdown-boton"
                  onClick={() => setMostrarListaEncargados(!mostrarListaEncargados)}
                  disabled={guardando}
                >
                  {formulario.encargado || 'Sin encargado'}
                </button>

                {mostrarListaEncargados && (
                  <ul className="dropdown-lista" style={{ maxHeight: 150, overflowY: 'auto' }}>

                    {/* OPCIÓN PARA QUITAR ENCARGADO */}
                    <li style={{ fontWeight: 'bold' }} onClick={quitarEncargado}>
                      ➖ Sin encargado
                    </li>

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

          <div className="agendar-botones">
            <button
              className="agendar-btn-guardar"
              onClick={handleGuardar}
              disabled={guardando}
            >
              <FaSave className="icono-guardar" />
              {guardando
                ? 'Guardando...'
                : modo === 'editar'
                ? 'Guardar cambios'
                : 'Guardar cita'}
            </button>

            {modo === 'editar' && (
              <button
                className="agendar-btn-eliminar"
                onClick={handleEliminar}
                disabled={guardando}
              >
                <FaTrash className="icono-eliminar" /> Eliminar cita
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ModalCita;
