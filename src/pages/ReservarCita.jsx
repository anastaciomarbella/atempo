import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './reservarCita.css';

const coloresDisponibles = [
  '#f16b74', '#56fa47', '#f58225', '#bbf7d0',
  '#00fca8', '#47f183', '#58b4f1', '#3dc2ff',
];

const API = 'https://mi-api-atempo.onrender.com';

const ReservarCita = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  const clienteUser = JSON.parse(localStorage.getItem('clienteUser') || 'null');
  const clienteToken = localStorage.getItem('clienteToken');

  const [vista, setVista] = useState('reservar'); // 'reservar' | 'mis-citas'
  const [empresa, setEmpresa] = useState(null);
  const [personas, setPersonas] = useState([]);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [exito, setExito] = useState(false);
  const [mostrarEncargados, setMostrarEncargados] = useState(false);
  const [misCitas, setMisCitas] = useState([]);
  const [loadingCitas, setLoadingCitas] = useState(false);

  const [formulario, setFormulario] = useState({
    id_cliente: null,
    encargado: '',
    titulo: '',
    fecha: '',
    hora_inicio: '',
    hora_final: '',
    nombre_cliente: clienteUser?.nombre || '',
    numero_cliente: clienteUser?.telefono || '',
    motivo: '',
    color: coloresDisponibles[0],
  });

  // Redirigir si no está logueado
  useEffect(() => {
    if (!clienteToken) {
      navigate(`/login-cliente/${slug}`);
    }
  }, []);

  // Cargar empresa y encargados
  useEffect(() => {
    fetch(`${API}/api/publico/${slug}`)
      .then(r => r.json())
      .then(d => setEmpresa(d))
      .catch(() => setEmpresa(null));

    fetch(`${API}/api/publico/${slug}/personas`)
      .then(r => r.json())
      .then(d => setPersonas(Array.isArray(d) ? d : []))
      .catch(() => setPersonas([]));
  }, [slug]);

  // Cargar mis citas
  const cargarMisCitas = async () => {
    setLoadingCitas(true);
    try {
      const res = await fetch(`${API}/api/cliente-auth/mis-citas`, {
        headers: { Authorization: `Bearer ${clienteToken}` }
      });
      const data = await res.json();
      setMisCitas(Array.isArray(data) ? data : []);
    } catch {
      setMisCitas([]);
    } finally {
      setLoadingCitas(false);
    }
  };

  useEffect(() => {
    if (vista === 'mis-citas') cargarMisCitas();
  }, [vista]);

  const handleChange = e => {
    setFormulario(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setMensaje('');
  };

  // Cancelar cita
  const handleCancelar = async (cita) => {
    const citaDate = new Date(`${cita.fecha}T${cita.hora_inicio}`);
    const minutos = (citaDate - new Date()) / 60000;

    if (minutos < 30) {
      alert('Solo puedes cancelar con al menos 30 minutos de anticipación');
      return;
    }

    if (!window.confirm('¿Cancelar esta cita?')) return;

    try {
      const res = await fetch(`${API}/api/citas/${cita.id_cita}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${clienteToken}` }
      });

      if (res.ok) cargarMisCitas();
      else alert('Error al cancelar la cita');
    } catch {
      alert('Error de conexión');
    }
  };

  const handleGuardar = async () => {
    const { id_cliente, titulo, fecha, hora_inicio, hora_final, nombre_cliente, numero_cliente } = formulario;

    if (!id_cliente || !titulo || !fecha || !hora_inicio || !hora_final || !nombre_cliente || !numero_cliente) {
      setMensaje('Por favor completa todos los campos obligatorios.');
      return;
    }

    setGuardando(true);
    try {
      const res = await fetch(`${API}/api/publico/${slug}/citas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_cliente: formulario.id_cliente,
          titulo: formulario.titulo,
          fecha: formulario.fecha,
          hora_inicio: formulario.hora_inicio,
          hora_final: formulario.hora_final,
          nombre_cliente: formulario.nombre_cliente,
          numero_cliente: formulario.numero_cliente,
          motivo: formulario.motivo,
          color: formulario.color,
        }),
      });

      const data = await res.json();
      if (!res.ok) { setMensaje(data.error || 'Error al agendar'); return; }

      setExito(true);
    } catch {
      setMensaje('Error de conexión');
    } finally {
      setGuardando(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('clienteToken');
    localStorage.removeItem('clienteUser');
    navigate(`/login-cliente/${slug}`);
  };

  if (!empresa) return <div className="reservar-loading">Cargando...</div>;

  if (exito) return (
    <div className="reservar-exito">
      {empresa.logo_url && <img src={empresa.logo_url} alt="logo" className="reservar-logo" />}
      <h2>{empresa.nombre_empresa}</h2>
      <div className="exito-icono">✅</div>
      <h3>¡Cita agendada con éxito!</h3>
      <p>Te esperamos el <strong>{formulario.fecha}</strong> a las <strong>{formulario.hora_inicio}</strong></p>
      <button onClick={() => {
        setExito(false);
        setFormulario(prev => ({
          ...prev,
          id_cliente: null, encargado: '', titulo: '',
          fecha: '', hora_inicio: '', hora_final: '', motivo: '',
          color: coloresDisponibles[0]
        }));
      }}>
        Agendar otra cita
      </button>
      <button onClick={() => setVista('mis-citas')} style={{ background: '#1e293b', border: '1px solid #334155' }}>
        Ver mis citas
      </button>
    </div>
  );

  return (
    <div className="reservar-container">
      <div className="reservar-card">

        {/* HEADER */}
        <div className="reservar-header">
          {empresa.logo_url && <img src={empresa.logo_url} alt="logo" className="reservar-logo" />}
          <h1 className="reservar-titulo">{empresa.nombre_empresa}</h1>
          <p className="reservar-subtitulo">Hola, <strong>{clienteUser?.nombre}</strong></p>

          {/* TABS */}
          <div className="reservar-tabs">
            <button
              className={vista === 'reservar' ? 'tab-activo' : ''}
              onClick={() => setVista('reservar')}
            >
              Agendar cita
            </button>
            <button
              className={vista === 'mis-citas' ? 'tab-activo' : ''}
              onClick={() => setVista('mis-citas')}
            >
              Mis citas
            </button>
            <button className="tab-logout" onClick={handleLogout}>
              Cerrar sesión
            </button>
          </div>
        </div>

        {/* ===== VISTA: RESERVAR ===== */}
        {vista === 'reservar' && (
          <div className="reservar-formulario">

            <div className="reservar-campo">
              <label>Servicio *</label>
              <input name="titulo" placeholder="Ej: Corte de cabello" value={formulario.titulo} onChange={handleChange} />
            </div>

            <div className="reservar-campo">
              <label>Encargado *</label>
              <div className="reservar-dropdown">
                <button type="button" onClick={() => setMostrarEncargados(!mostrarEncargados)}>
                  {formulario.encargado || 'Seleccionar encargado'}
                </button>
                {mostrarEncargados && (
                  <ul>
                    {personas.map(p => (
                      <li key={p.id_persona} onClick={() => {
                        setFormulario(prev => ({ ...prev, id_cliente: p.id_persona, encargado: p.nombre }));
                        setMostrarEncargados(false);
                      }}>
                        {p.nombre}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <div className="reservar-campo">
              <label>Fecha *</label>
              <input type="date" name="fecha" value={formulario.fecha} onChange={handleChange}
                min={new Date().toISOString().split('T')[0]} />
            </div>

            <div className="reservar-fila">
              <div className="reservar-campo">
                <label>Hora inicio *</label>
                <input type="time" name="hora_inicio" value={formulario.hora_inicio} onChange={handleChange} />
              </div>
              <div className="reservar-campo">
                <label>Hora fin *</label>
                <input type="time" name="hora_final" value={formulario.hora_final} onChange={handleChange} />
              </div>
            </div>

            <div className="reservar-campo">
              <label>Tu nombre *</label>
              <input name="nombre_cliente" value={formulario.nombre_cliente} onChange={handleChange} />
            </div>

            <div className="reservar-campo">
              <label>Tu teléfono *</label>
              <input name="numero_cliente" value={formulario.numero_cliente} onChange={handleChange} />
            </div>

            <div className="reservar-campo">
              <label>Comentario</label>
              <input name="motivo" placeholder="Opcional" value={formulario.motivo} onChange={handleChange} />
            </div>

            <div className="reservar-campo">
              <label>Color de tu cita</label>
              <div className="reservar-colores">
                {coloresDisponibles.map(c => (
                  <span key={c}
                    className={`reservar-color ${formulario.color === c ? 'seleccionado' : ''}`}
                    style={{ backgroundColor: c }}
                    onClick={() => setFormulario(prev => ({ ...prev, color: c }))}
                  />
                ))}
              </div>
            </div>

            {mensaje && <p className="reservar-mensaje">{mensaje}</p>}

            <button className="reservar-btn" onClick={handleGuardar} disabled={guardando}>
              {guardando ? 'Agendando...' : 'Confirmar cita'}
            </button>
          </div>
        )}

        {/* ===== VISTA: MIS CITAS ===== */}
        {vista === 'mis-citas' && (
          <div className="mis-citas-container">
            {loadingCitas ? (
              <p className="reservar-subtitulo">Cargando citas...</p>
            ) : misCitas.length === 0 ? (
              <div className="mis-citas-vacio">
                <p>No tienes citas registradas</p>
                <button className="reservar-btn" onClick={() => setVista('reservar')}>
                  Agendar mi primera cita
                </button>
              </div>
            ) : (
              misCitas.map(cita => {
                const citaDate = new Date(`${cita.fecha}T${cita.hora_inicio}`);
                const pasada = citaDate < new Date();
                return (
                  <div key={cita.id_cita} className={`cita-card ${pasada ? 'cita-pasada' : ''}`}
                    style={{ borderLeft: `4px solid ${cita.color || '#3b82f6'}` }}>
                    <div className="cita-card-header">
                      <strong>{cita.titulo}</strong>
                      <span className={`cita-estado ${pasada ? 'pasada' : 'proxima'}`}>
                        {pasada ? 'Pasada' : 'Próxima'}
                      </span>
                    </div>
                    <p>📅 {cita.fecha} · ⏰ {cita.hora_inicio?.slice(0, 5)} – {cita.hora_final?.slice(0, 5)}</p>
                    {cita.motivo && <p>💬 {cita.motivo}</p>}
                    {!pasada && (
                      <button className="btn-cancelar-cita" onClick={() => handleCancelar(cita)}>
                        Cancelar cita
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReservarCita;