import React, { useEffect, useState } from "react";

const API_URL = "https://mi-api-atempo.onrender.com";

const Personas = () => {
  const [empleados, setEmpleados] = useState([]);
  const [empleadoEliminar, setEmpleadoEliminar] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);

  // ==============================
  // CARGAR EMPLEADOS
  // ==============================
  const cargarEmpleados = async () => {
    try {
      const res = await fetch(`${API_URL}/api/personas`);
      const data = await res.json();

      console.log("Datos recibidos:", data);
      console.table(data);

      setEmpleados(data || []);
    } catch (error) {
      console.error("Error al cargar empleados:", error);
    }
  };

  useEffect(() => {
    cargarEmpleados();
  }, []);

  // ==============================
  // EDITAR
  // ==============================
  const handleEditarClick = (empleado) => {
    console.log("Editar:", empleado);
    // aquí puedes navegar o abrir formulario
  };

  // ==============================
  // ABRIR MODAL ELIMINAR
  // ==============================
  const handleEliminarClick = (id) => {
    console.log("ID seleccionado para eliminar:", id);
    setEmpleadoEliminar(id);
    setMostrarModal(true);
  };

  // ==============================
  // CONFIRMAR ELIMINAR
  // ==============================
  const handleConfirmarEliminar = async () => {
    if (!empleadoEliminar) return;

    console.log("Enviando DELETE con ID:", empleadoEliminar);

    try {
      const response = await fetch(
        `${API_URL}/api/personas/${empleadoEliminar}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Error al eliminar persona");
      }

      alert("Persona eliminada correctamente");

      setMostrarModal(false);
      setEmpleadoEliminar(null);
      cargarEmpleados();

    } catch (error) {
      console.error("Error al eliminar persona:", error);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Lista de Personas</h2>

      <table border="1" cellPadding="10">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Email</th>
            <th>Telefono</th>
            <th>Acciones</th>
          </tr>
        </thead>

        <tbody>
          {empleados.map((emp) => (
            <tr key={emp.id}>
              <td>{emp.id}</td>
              <td>{emp.nombre}</td>
              <td>{emp.email}</td>
              <td>{emp.telefono}</td>
              <td>
                <button onClick={() => handleEditarClick(emp)}>
                  Editar
                </button>

                <button
                  onClick={() => handleEliminarClick(emp.id)}
                  style={{ marginLeft: "10px", color: "red" }}
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ==============================
          MODAL SIMPLE
         ============================== */}

      {mostrarModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              padding: "20px",
              borderRadius: "8px",
            }}
          >
            <h3>¿Seguro que deseas eliminar?</h3>

            <button onClick={handleConfirmarEliminar}>
              Sí, eliminar
            </button>

            <button
              onClick={() => setMostrarModal(false)}
              style={{ marginLeft: "10px" }}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Personas;