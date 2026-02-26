import React, { useState, useEffect } from 'react';
import { FaTimes, FaSave, FaTrash } from 'react-icons/fa';
import './modalCita.css';

const coloresDisponibles = [
  '#f16b74', '#56fa47', '#f58225', '#bbf7d0', '#def31f',
  '#00fca8', '#47f183', '#58b4f1', '#3dc2ff',
  '#5e3aff', '#e42591', '#f3343e'
];

function convertirA24h(hora) {
  if (!hora) return '';
  const [h, m] = hora.split(':');
  return `${h.padStart(2, '0')}:${m.padStart(2, '0')}`;
}

const ModalCita = ({ modo = 'crear', cita = {}, onClose, onSave }) => {
  const [personas, setPersonas] = useState([]);
  const [mostrarListaEncargados, setMostrarListaEncargados] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState('');

  const [formulario, setFormulario] = useState({
    id_cliente: null,
    encargado: '',
    titulo: '',
    fecha: '',
    start: '',
    end: '',
    client: '',
    clientPhone: '',
    comentario: '',
    color: coloresDisponibles[0]
  });

  const token = localStorage.getItem('token');

  // =============================
  // CARGAR EMPLEADOS
  // =============================
  useEffect(() => {
    fetch('https://mi-api-atempo.onrender.com/api/personas', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setPersonas(Array.isArray(data) ? data : []))
      .catch(() => setPersonas([]));
  }, [token]);

  // =============================
  // EDITAR
  // =============================
  useEffect(() => {
    if (modo === 'editar' && cita) {
      const encargadoEncontrado = personas.find(p => p.id === cita.id_cliente);

      setFormulario({
        id_cliente: cita.id_cliente || null,
        encargado: encargadoEncontrado?.nombre || '',
        titulo: cita.titulo || '',
        fecha: cita.fecha || '',
        start: cita.hora_inicio || '',
        end: cita.hora_final || '',
        client: cita.nombre_cliente || '',
        clientPhone: cita.numero_cliente || '',
        comentario: cita.motivo || '',
        color: cita.color || coloresDisponibles[0]
      });
    }
  }, [modo, cita, personas]);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormulario(prev => ({ ...prev, [name]: value }));
    setMensaje('');
  };

  const handleEncargadoSelect = persona => {
    setFormulario(prev => ({
      ...prev,
      id_cliente: persona.id,
      encargado: persona.nombre
    }));
    setMostrarListaEncargados(false);
  };

  // =============================
  // GUARDAR
  // =============================
  const handleGuardar = async () => {
    if (
      !formulario.titulo ||
      !formulario.fecha ||
      !formulario.start ||
      !formulario.end ||
      !formulario.id_cliente
    ) {
      setMensaje('Completa los campos obligatorios.');
      return;
    }

    setGuardando(true);

    const dataParaEnviar = {
      id_cliente: formulario.id_cliente,
      titulo: formulario.titulo,
      fecha: formulario.fecha,
      hora_inicio: convertirA24h(formulario.start),
      hora_final: convertirA24h(formulario.end),
      nombre_cliente: formulario.client,
      numero_cliente: formulario.clientPhone,
      motivo: formulario.comentario,
      color: formulario.color
    };

    try {
      const url =
        modo === 'editar'
          ? `https://mi-api-atempo.onrender.com/api/citas/${cita.id}`
          : 'https://mi-api-atempo.onrender.com/api/citas';

      const res = await fetch(url, {
        method: modo === 'editar' ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(dataParaEnviar)
      });

      if (!res.ok) throw new Error();

      if (onSave) onSave();
      setMensaje('Cita guardada correctamente');
      setTimeout(onClose, 1200);
    } catch {
      setMensaje('Error al guardar la cita');
    } finally {
      setGuardando(false);
    }
  };

  // =============================
  // ELIMINAR
  // =============================
  const handleEliminar = async () => {
    if (!window.confirm('¿Eliminar esta cita?')) return;

    try {
      await fetch(`https://mi-api-atempo.onrender.com/api/citas/${cita.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (onSave) onSave();
      onClose();
    } catch {
      setMensaje('Error al eliminar');
    }
  };

  return (
    <>
      <div className="agendar-overlay visible" />
      <div className="agendar-modal">
        <button className="agendar-cerrar-modal" onClick={onClose}>
          <FaTimes />
        </button>

        <h2 className="agendar-titulo-modal">
          {modo === 'editar' ? 'Detalles de la cita' : 'Agendar cita'}
        </h2>

        <div className="agendar-formulario">

          {/* TÍTULO + ENCARGADO */}
          <div className="agendar-fila">
            <div>
              <label>Título *</label>
              <input
                name="titulo"
                value={formulario.titulo}
                onChange={handleChange}
              />
            </div>

            <div>
              <label>Encargado *</label>
              <div className="dropdown-encargado">
                <button
                  type="button"
                  className="dropdown-boton"
                  onClick={() => setMostrarListaEncargados(!mostrarListaEncargados)}
                >
                  {formulario.encargado || 'Seleccionar'}
                </button>

                {mostrarListaEncargados && (
                  <ul className="dropdown-lista">
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

          {/* FECHA + HORAS */}
          <div className="agendar-fila">
            <div>
              <label>Fecha *</label>
              <input type="date" name="fecha" value={formulario.fecha} onChange={handleChange} />
            </div>

            <div>
              <label>Hora *</label>
              <div className="agendar-horario">
                <input type="time" name="start" value={formulario.start} onChange={handleChange} />
                <span>a</span>
                <input type="time" name="end" value={formulario.end} onChange={handleChange} />
              </div>
            </div>
          </div>

          {/* CLIENTE */}
          <div className="agendar-fila">
            <div>
              <label>Cliente</label>
              <input name="client" value={formulario.client} onChange={handleChange} />
            </div>

            <div>
              <label>Teléfono</label>
              <input name="clientPhone" value={formulario.clientPhone} onChange={handleChange} />
            </div>
          </div>

          {/* COMENTARIO */}
          <div className="agendar-fila">
            <div style={{ gridColumn: 'span 2' }}>
              <label>Comentario</label>
              <input name="comentario" value={formulario.comentario} onChange={handleChange} />
            </div>
          </div>

          {/* COLORES */}
          <label>Color</label>
          <div className="agendar-colores">
            {coloresDisponibles.map(c => (
              <span
                key={c}
                className={`agendar-color ${formulario.color === c ? 'seleccionado' : ''}`}
                style={{ backgroundColor: c }}
                onClick={() => setFormulario(prev => ({ ...prev, color: c }))}
              />
            ))}
          </div>

          {mensaje && <p className="mensaje">{mensaje}</p>}

          <div className="agendar-botones">
            <button className="agendar-btn-guardar" onClick={handleGuardar}>
              <FaSave /> Guardar
            </button>

            {modo === 'editar' && (
              <button className="agendar-btn-eliminar" onClick={handleEliminar}>
                <FaTrash /> Eliminar
              </button>
            )}
          </div>

        </div>
      </div>
    </>
  );
};

export default ModalCita;