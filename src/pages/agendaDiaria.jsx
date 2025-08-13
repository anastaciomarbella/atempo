import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import esLocale from "date-fns/locale/es";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const API_URL = import.meta.env.VITE_API_URL || "https://mi-api-atempo.onrender.com";

const AgendaDiaria = () => {
  const [citas, setCitas] = useState([]);
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date());
  const [personaSeleccionada, setPersonaSeleccionada] = useState("todos");

  // 🔹 Cargar citas
  const fetchCitas = async () => {
    try {
      let url = `${API_URL}/api/citas`;
      if (personaSeleccionada !== "todos") {
        url += `?id_persona=${personaSeleccionada}`;
      }

      const res = await fetch(url);
      const data = await res.json();

      // ✅ Validar que lo que llega sea un array
      if (!Array.isArray(data)) {
        console.error("Respuesta inesperada de API:", data);
        setCitas([]);
        return;
      }

      // ✅ Filtrar por fecha
      const fechaStr = fechaSeleccionada.toLocaleDateString("sv-SE"); // yyyy-mm-dd
      const filtradas = data.filter(
        (cita) => cita.fecha?.slice(0, 10) === fechaStr
      );

      // ✅ Evitar duplicados
      const citasUnicas = [];
      const idsVistos = new Set();
      for (const cita of filtradas) {
        const idUnico =
          cita.id || `${cita.id_persona}-${cita.fecha}-${cita.hora_inicio}`;
        if (!idsVistos.has(idUnico)) {
          idsVistos.add(idUnico);
          citasUnicas.push(cita);
        }
      }

      setCitas(citasUnicas);
    } catch (error) {
      console.error("Error al cargar citas:", error);
      setCitas([]);
    }
  };

  useEffect(() => {
    fetchCitas();
  }, [fechaSeleccionada, personaSeleccionada]);

  // 🔹 Navegar fechas
  const cambiarDia = (dias) => {
    const nuevaFecha = new Date(fechaSeleccionada);
    nuevaFecha.setDate(nuevaFecha.getDate() + dias);
    setFechaSeleccionada(nuevaFecha);
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Agenda Diaria</h1>

      {/* 🔹 Controles de fecha */}
      <div className="flex items-center gap-2 mb-4">
        <button
          className="p-2 border rounded"
          onClick={() => cambiarDia(-1)}
        >
          <FaChevronLeft />
        </button>
        <span className="font-medium">
          {format(fechaSeleccionada, "EEEE, d 'de' MMMM 'de' yyyy", {
            locale: esLocale,
          })}
        </span>
        <button
          className="p-2 border rounded"
          onClick={() => cambiarDia(1)}
        >
          <FaChevronRight />
        </button>
      </div>

      {/* 🔹 Selector de persona */}
      <div className="mb-4">
        <label className="mr-2 font-medium">Filtrar por persona:</label>
        <select
          value={personaSeleccionada}
          onChange={(e) => setPersonaSeleccionada(e.target.value)}
          className="border p-1 rounded"
        >
          <option value="todos">Todos</option>
          <option value="1">Pedro Marquezzff</option>
          <option value="2">Luis Sosarefcer</option>
          <option value="3">Carla Martinez g</option>
          <option value="4">Jose garciajhhjj</option>
        </select>
      </div>

      {/* 🔹 Tabla de citas */}
      <div className="border rounded p-2">
        {citas.length === 0 ? (
          <p className="text-gray-500">No hay citas para este día</p>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2">Hora</th>
                <th className="border p-2">Cliente</th>
                <th className="border p-2">Servicio</th>
                <th className="border p-2">Empleado</th>
              </tr>
            </thead>
            <tbody>
              {citas.map((cita) => (
                <tr key={cita.id || `${cita.id_persona}-${cita.fecha}-${cita.hora_inicio}`}>
                  <td className="border p-2">
                    {cita.hora_inicio} - {cita.hora_final}
                  </td>
                  <td className="border p-2">{cita.cliente || "Sin nombre"}</td>
                  <td className="border p-2">{cita.servicio || "Sin servicio"}</td>
                  <td className="border p-2">{cita.empleado || "Sin asignar"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AgendaDiaria;
