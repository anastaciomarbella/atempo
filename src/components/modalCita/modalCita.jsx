import React, { useState, useEffect, useRef } from "react";
import { FaTimes, FaSave, FaTrash } from "react-icons/fa";
import "./modalCita.css";

const coloresDisponibles = [
  "#f16b74", "#56fa47", "#f58225", "#bbf7d0",
  "#00fca8", "#47f183", "#58b4f1", "#3dc2ff",
];

function convertirA24h(hora) {
  if (!hora) return "";
  const [h, m] = hora.split(":");
  return `${h.padStart(2, "0")}:${m.padStart(2, "0")}`;
}

const ModalCita = ({ modo = "ver", cita = {}, onClose, onSave }) => {
  const [personas, setPersonas] = useState([]);
  const [mostrarListaEncargados, setMostrarListaEncargados] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [modoActual, setModoActual] = useState(modo); // "ver" | "editar" | "crear"
  const guardandoRef = useRef(false); // evita doble submit

  const [formulario, setFormulario] = useState({
    id_cliente: null,
    encargado: "",
    titulo: "",
    fecha: "",
    start: "",
    end: "",
    client: "",
    clientPhone: "",
    comentario: "",
    color: coloresDisponibles[0],
  });

  const token = localStorage.getItem("token");
  const API = "https://mi-api-atempo.onrender.com";

  // =============================
  // CARGAR EMPLEADOS
  // =============================
  useEffect(() => {
    fetch(`${API}/api/personas`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setPersonas(Array.isArray(data) ? data : []))
      .catch(() => setPersonas([]));
  }, [token]);

  // =============================
  // CARGAR DATOS DE LA CITA AL ABRIR
  // =============================
  useEffect(() => {
    if ((modoActual === "editar" || modoActual === "ver") && cita?.id) {
      const encargadoEncontrado = personas.find(
        (p) => p.id_persona === cita.id_cliente || p.id === cita.id_cliente
      );

      setFormulario({
        id_cliente: cita.id_cliente || null,
        encargado: encargadoEncontrado?.nombre || cita.encargado || "",
        titulo: cita.titulo || "",
        fecha: cita.fecha || "",
        start: cita.hora_inicio?.slice(0, 5) || "",
        end: cita.hora_final?.slice(0, 5) || "",
        client: cita.nombre_cliente || "",
        clientPhone: cita.numero_cliente || "",
        comentario: cita.motivo || "",
        color: cita.color || coloresDisponibles[0],
      });
    }
  }, [modoActual, cita, personas]);

  // =============================
  // VALIDAR SI PUEDE EDITAR (3h antes)
  // =============================
  const puedeEditar = () => {
    if (!cita?.fecha || !cita?.hora_inicio) return true;
    const citaDate = new Date(`${cita.fecha}T${cita.hora_inicio}`);
    const ahora = new Date();
    const minutos = (citaDate - ahora) / 60000;
    return minutos >= 180;
  };

  const puedeCancelar = () => {
    if (!cita?.fecha || !cita?.hora_inicio) return true;
    const citaDate = new Date(`${cita.fecha}T${cita.hora_inicio}`);
    const ahora = new Date();
    const minutos = (citaDate - ahora) / 60000;
    return minutos >= 30;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormulario((prev) => ({ ...prev, [name]: value }));
    setMensaje("");
  };

  const handleEncargadoSelect = (persona) => {
    setFormulario((prev) => ({
      ...prev,
      id_cliente: persona.id_persona || persona.id,
      encargado: persona.nombre,
    }));
    setMostrarListaEncargados(false);
  };

  // =============================
  // GUARDAR
  // =============================
  const handleGuardar = async () => {
    if (guardandoRef.current) return; // evita doble click
    guardandoRef.current = true;
    setGuardando(true);

    if (
      !formulario.titulo ||
      !formulario.fecha ||
      !formulario.start ||
      !formulario.end ||
      !formulario.id_cliente
    ) {
      setMensaje("Completa los campos obligatorios.");
      setGuardando(false);
      guardandoRef.current = false;
      return;
    }

    const dataParaEnviar = {
      id_cliente: formulario.id_cliente,
      titulo: formulario.titulo,
      fecha: formulario.fecha,
      hora_inicio: convertirA24h(formulario.start),
      hora_final: convertirA24h(formulario.end),
      nombre_cliente: formulario.client,
      numero_cliente: formulario.clientPhone,
      motivo: formulario.comentario,
      color: formulario.color,
    };

    try {
      const url =
        modoActual === "editar"
          ? `${API}/api/citas/${cita.id}`
          : `${API}/api/citas`;

      const res = await fetch(url, {
        method: modoActual === "editar" ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(dataParaEnviar),
      });

      const responseData = await res.json();

      if (!res.ok) {
        setMensaje(responseData.error || "Error al guardar la cita");
        return;
      }

      setMensaje("✅ Cita guardada correctamente");
      setTimeout(() => {
        if (onSave) onSave();
        onClose();
      }, 1000);
    } catch {
      setMensaje("Error de conexión");
    } finally {
      setGuardando(false);
      guardandoRef.current = false;
    }
  };

  // =============================
  // ELIMINAR
  // =============================
  const handleEliminar = async () => {
    if (!puedeCancelar()) {
      setMensaje("No puedes cancelar con menos de 30 minutos de anticipación");
      return;
    }

    if (!window.confirm("¿Eliminar esta cita?")) return;

    try {
      const res = await fetch(`${API}/api/citas/${cita.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const responseData = await res.json();

      if (!res.ok) {
        setMensaje(responseData.error || "Error al eliminar");
        return;
      }

      if (onSave) onSave();
      onClose();
    } catch {
      setMensaje("Error de conexión");
    }
  };

  const esVisualizacion = modoActual === "ver";

  return (
    <>
      <div className="agendar-overlay visible" onClick={onClose} />
      <div className="agendar-modal" onClick={(e) => e.stopPropagation()}>
        <button className="agendar-cerrar-modal" onClick={onClose}>
          <FaTimes />
        </button>

        <h2 className="agendar-titulo-modal">
          {modoActual === "crear"
            ? "Agendar cita"
            : modoActual === "editar"
            ? "Editar cita"
            : "Detalle de cita"}
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
                disabled={esVisualizacion}
              />
            </div>

            <div>
              <label>Encargado *</label>
              <div className="dropdown-encargado">
                <button
                  type="button"
                  className="dropdown-boton"
                  onClick={() =>
                    !esVisualizacion &&
                    setMostrarListaEncargados(!mostrarListaEncargados)
                  }
                  disabled={esVisualizacion}
                >
                  {formulario.encargado || "Seleccionar"}
                </button>
                {mostrarListaEncargados && (
                  <ul className="dropdown-lista">
                    {personas.map((p) => (
                      <li
                        key={p.id_persona || p.id}
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

          {/* FECHA + HORAS */}
          <div className="agendar-fila">
            <div>
              <label>Fecha *</label>
              <input
                type="date"
                name="fecha"
                value={formulario.fecha}
                onChange={handleChange}
                disabled={esVisualizacion}
              />
            </div>
            <div>
              <label>Hora *</label>
              <div className="agendar-horario">
                <input
                  type="time"
                  name="start"
                  value={formulario.start}
                  onChange={handleChange}
                  disabled={esVisualizacion}
                />
                <span>a</span>
                <input
                  type="time"
                  name="end"
                  value={formulario.end}
                  onChange={handleChange}
                  disabled={esVisualizacion}
                />
              </div>
            </div>
          </div>

          {/* CLIENTE */}
          <div className="agendar-fila">
            <div>
              <label>Cliente</label>
              <input
                name="client"
                value={formulario.client}
                onChange={handleChange}
                disabled={esVisualizacion}
              />
            </div>
            <div>
              <label>Teléfono</label>
              <input
                name="clientPhone"
                value={formulario.clientPhone}
                onChange={handleChange}
                disabled={esVisualizacion}
              />
            </div>
          </div>

          {/* COMENTARIO */}
          <div className="agendar-fila">
            <div style={{ gridColumn: "span 2" }}>
              <label>Comentario</label>
              <input
                name="comentario"
                value={formulario.comentario}
                onChange={handleChange}
                disabled={esVisualizacion}
              />
            </div>
          </div>

          {/* COLORES */}
          {!esVisualizacion && (
            <>
              <label>Color</label>
              <div className="agendar-colores">
                {coloresDisponibles.map((c) => (
                  <span
                    key={c}
                    className={`agendar-color ${formulario.color === c ? "seleccionado" : ""}`}
                    style={{ backgroundColor: c }}
                    onClick={() =>
                      setFormulario((prev) => ({ ...prev, color: c }))
                    }
                  />
                ))}
              </div>
            </>
          )}

          {mensaje && (
            <p
              className="mensaje"
              style={{ color: mensaje.startsWith("✅") ? "#4ade80" : "#f87171" }}
            >
              {mensaje}
            </p>
          )}

          {/* BOTONES */}
          <div className="agendar-botones">
            {esVisualizacion ? (
              <>
                {puedeEditar() ? (
                  <button
                    className="agendar-btn-guardar"
                    onClick={() => setModoActual("editar")}
                  >
                    ✏️ Editar cita
                  </button>
                ) : (
                  <p style={{ color: "#94a3b8", fontSize: "13px" }}>
                    Solo puedes editar con 3h de anticipación
                  </p>
                )}

                {puedeCancelar() ? (
                  <button
                    className="agendar-btn-eliminar"
                    onClick={handleEliminar}
                  >
                    <FaTrash /> Cancelar cita
                  </button>
                ) : (
                  <p style={{ color: "#94a3b8", fontSize: "13px" }}>
                    Solo puedes cancelar con 30min de anticipación
                  </p>
                )}
              </>
            ) : (
              <>
                <button
                  className="agendar-btn-guardar"
                  onClick={handleGuardar}
                  disabled={guardando}
                >
                  <FaSave /> {guardando ? "Guardando..." : "Guardar"}
                </button>

                {modoActual === "editar" && (
                  <button
                    className="agendar-btn-cancelar"
                    onClick={() => setModoActual("ver")}
                  >
                    Cancelar edición
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ModalCita;