useEffect(() => {
  fetch('http://localhost:3001/api/personas')
    .then(res => res.json())
    .then(data => setPersonas(data))
    .catch(err => console.error('Error cargando personas:', err));
}, []);

// ...

try {
  let res;
  if (modo === 'editar') {
    res = await fetch(`http://localhost:3001/api/citas/${cita.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dataParaEnviar),
    });
  } else {
    res = await fetch('http://localhost:3001/api/citas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dataParaEnviar),
    });
  }

  if (!res.ok) throw new Error('Error al guardar la cita');

  const resultado = await res.json();

  setMensaje('Tu cita ha sido guardada exitosamente.');

  setTimeout(() => {
    onClose(resultado);
  }, 1500);

} catch (error) {
  setMensaje('Error al guardar la cita: ' + error.message);
  console.error(error);
}

// ...

const handleEliminar = async () => {
  if (!cita?.id) return;
  if (!window.confirm('¿Seguro que quieres eliminar esta cita?')) return;

  try {
    setGuardando(true);
    const res = await fetch(`http://localhost:3001/api/citas/${cita.id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Error al eliminar la cita');

    setMensaje('Cita eliminada correctamente.');

    setTimeout(() => {
      onClose({ eliminada: true, id: cita.id });
    }, 1500);

  } catch (error) {
    setMensaje('Error al eliminar la cita: ' + error.message);
    console.error(error);
  } finally {
    setGuardando(false);
  }
};
