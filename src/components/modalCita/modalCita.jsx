// ... (todo tu código anterior sin cambios)

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

  // ... tus useEffect, handleChange, handleColorSelect, handleEncargadoSelect

  const handleGuardar = async () => {
    // ... tu código de guardar sin cambios
  };

  // ✅ mover la función AQUÍ dentro para que tenga acceso a cita, setMensaje y onClose
  const handleEliminar = async () => {
    if (!cita?.id) return;
    if (!window.confirm('¿Estás seguro de eliminar esta cita?')) return;

    try {
      const res = await fetch(`https://mi-api-atempo.onrender.com/api/citas/${cita.id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Error al eliminar la cita');

      setMensaje('La cita fue eliminada correctamente.');
      setTimeout(() => {
        onClose({ eliminada: true, id: cita.id }); // avisamos al padre
      }, 1500);

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
          {/* ... todo tu formulario sin cambios */}

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

          {/* ✅ botón de eliminar visible solo en modo editar */}
          {modo === 'editar' && (
            <button
              className="agendar-btn-eliminar"
              onClick={handleEliminar}
              disabled={guardando}
              style={{ backgroundColor: 'red', color: 'white', marginTop: '10px' }}
            >
              Eliminar cita
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default ModalCita;
