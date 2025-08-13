import React, { useState, useEffect } from 'react';
import { FaTimes, FaSave } from 'react-icons/fa';
import './modalCita.css';

const coloresDisponibles = [
  '#ffe4e6', '#ffedd5', '#fef9c3', '#bbf7d0',
  '#dcfce7', '#e0f2fe', '#b3e5fc', '#ede9fe', '#fce7f3'
];

const API_BASE = 'https://mi-api-atempo.onrender.com';

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
    const cargarPersonas = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/personas`);
        if (!res.ok) throw new Error('Error al cargar personas');
        const data = await res.json();
        setPersonas(data);
      } catch (err) {
        console.error(err);
        setMensaje('Error al cargar encargados');
      }
    };
    cargarPersonas();
  }, []);

  // Cargar datos si es edición
  useEffect(() => {
    if (modo === 'editar' && cita && personas.length > 0) {
      const encargadoEncontrado = personas.find(p => p.id === cita.id_persona);
      setFormulario({
        id_persona: cita.id_persona || null,
        titulo: cita.titulo || '',
        encargado: encargadoEncontrado ? encargadoEncontrado.nombre : '',
        fecha: cita.fecha ? cita.fecha.slice(0, 10) : '',
        start: cita.hora_inicio ? cita.hora_inicio.slice(0,5) : '',
        end: cita.hora_final ? cita.hora_final.slice(0,5) : '',
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
    setFormulario(prev => ({ ...prev, [name]: value }));
    setMensaje('');
    if (name === 'start' || name === 'end') setMostrarListaEncargados(false);
  };

  const handleColorSelect = (color) => {
    setFormulario(prev => ({ ...prev, color }));
  };

  const handleEncargadoSelect = (persona) => {
    setFormulario(prev => ({ ...prev, id_persona: persona.id, encargado: persona.nombre }));
    setMostrarListaEncargados(false);
    setMensaje('');
  };

  // Guardar o editar cita
  const handleGuardar = async () => {
    if (!formulario.id_persona || !formulario.titulo || !formulario.fecha || !formulario.start || !formulario.end) {
      setMensaje('Completa todos los campos obligatorios');
      return;
    }

    setGuardando(true);
    setMensaje('');

    const dataParaEnviar = {
      id_persona: formulario.id_persona,
      titulo: formulario.titulo,
      fecha: formulario.fecha,
      hora_inicio: formulario.start + ':00', // Agrega segundos
      hora_final: formulario.end + ':00',
      nombre_cliente: formulario.client,
      numero_cliente: formulario.clientPhone,
      motivo: formulario.comentario,
      color: formulario.color,
    };

    try {
      let res;
      if (modo === 'editar') {
        res = await fetch(`${API_BASE}/api/citas/${cita.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(dataParaEnviar),
        });
      } else {
        res = await fetch(`${API_BASE}/api/citas`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(dataParaEnviar),
        });
      }

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Error al guardar la cita');
      }

      const resultado = await res.json();
      setMensaje('Cita guardada exitosamente');
      setTimeout(() => onClose(resultado), 1200);

    } catch (error) {
      console.error(error);
      setMensaje('Error: ' + error.message);
    } finally {
      setGuardando(false);
    }
  };

  // Eliminar cita
  const handleEliminar = async () => {
    if (!cita?.id) return;
    if (!window.confirm('¿Seguro que quieres eliminar esta cita?')) return;

    try {
      setGuardando(true);
      const res = await fetch(`${API_BASE}/api/citas/${cita.id}`, { method: 'DELETE' });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Error al eliminar la cita');
      }
      setMensaje('Cita eliminada');
      setTimeout(() => onClose({ eliminada: true, id: cita.id }), 1200);
    } catch (error) {
      console.error(error);
      setMensaje('Error: ' + error.message);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <>
      <div className="agendar-overlay visible"></div>
      <div className="agendar-modal">
        <button className="agendar-cerrar-modal" onClick={() => onClose()} disabled={guardando}><FaTimes /></button>
        <h2 className="agendar-titulo-modal">{modo==='editar' ? 'Editar cita' : 'Agendar cita'}</h2>

        <div className="agendar-formulario">
          <div className="agendar-fila">
            <div>
              <label>Título *</label>
              <input name="titulo" type="text" value={formulario.titulo} onChange={handleChange} disabled={guardando} placeholder="Título de la cita"/>
            </div>
            <div>
              <label>Encargado *</label>
              <div className="dropdown-encargado">
                <button type="button" className="dropdown-boton" onClick={() => setMostrarListaEncargados(!mostrarListaEncargados)} disabled={guardando}>
                  {formulario.encargado || 'Selecciona un encargado'}
                </button>
                {mostrarListaEncargados && (
                  <ul className="dropdown-lista" style={{maxHeight:150, overflowY:'auto'}}>
                    {personas.map(p => <li key={p.id} onClick={()=>handleEncargadoSelect(p)}>{p.nombre}</li>)}
                  </ul>
                )}
              </div>
            </div>
          </div>

          <div className="agendar-fila">
            <div>
              <label>Fecha *</label>
              <input name="fecha" type="date" value={formulario.fecha} onChange={handleChange} disabled={guardando}/>
            </div>
            <div>
              <label>Hora *</label>
              <div className="agendar-horario">
                <input name="start" type="time" value={formulario.start} onChange={handleChange} disabled={guardando}/>
                <span>a</span>
                <input name="end" type="time" value={formulario.end} onChange={handleChange} disabled={guardando}/>
              </div>
            </div>
          </div>

          <div className="agendar-fila">
            <div>
              <label>Cliente</label>
              <input name="client" type="text" value={formulario.client} onChange={handleChange} disabled={guardando}/>
            </div>
            <div>
              <label>Número celular</label>
              <input name="clientPhone" type="tel" value={formulario.clientPhone} onChange={handleChange} disabled={guardando}/>
            </div>
          </div>

          <div className="agendar-fila">
            <div style={{gridColumn:'span 2', margin:'0 18px'}}>
              <label>Comentario</label>
              <input name="comentario" type="text" value={formulario.comentario} onChange={handleChange} disabled={guardando}/>
            </div>
          </div>

          <label>Color *</label>
          <div className="agendar-colores">
            {coloresDisponibles.map((color,i)=>
              <span key={i} className={`agendar-color ${formulario.color===color?'seleccionado':''}`} style={{backgroundColor:color}} onClick={()=>handleColorSelect(color)}/>
            )}
          </div>

          {mensaje && <div style={{marginTop:'10px', color:mensaje.startsWith('Error')?'red':'green', fontWeight:'bold', textAlign:'center'}}>{mensaje}</div>}

          <p className="agendar-obligatorio">* Campos obligatorios</p>

          <button className="agendar-btn-guardar" onClick={handleGuardar} disabled={guardando}>
            <FaSave className="icono-guardar"/>
            {guardando ? 'Guardando...' : modo==='editar' ? 'Guardar cambios' : 'Guardar cita'}
          </button>

          {modo==='editar' && 
            <button className="agendar-btn-eliminar" onClick={handleEliminar} disabled={guardando} style={{backgroundColor:'red', color:'white', marginTop:'10px'}}>
              Eliminar cita
            </button>
          }
        </div>
      </div>
    </>
  );
};

export default ModalCita;
