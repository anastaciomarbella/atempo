import React, { useEffect, useState, useCallback, useRef } from "react";
import "../styles/agendaDiaria.css";
import { API_URL } from "../config";
import ModalCita from "../components/modalCita/modalCita";

const HORAS_DIA = Array.from({ length: 17 }, (_, i) => i + 7); // 7am a 23pm

// ─── Utilidad: convertir clave VAPID para la API del navegador ────────────────
function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

// ─── Clave pública VAPID (de tu .env) ────────────────────────────────────────
const VAPID_PUBLIC_KEY = process.env.REACT_APP_VAPID_PUBLIC_KEY;

// ─── Cuántos minutos antes avisar ────────────────────────────────────────────
const MINUTOS_AVISO_15 = 15;
const MINUTOS_AVISO_30 = 30;

// ─── Utilidad: disparar una notificación local ────────────────────────────────
function dispararNotificacion({ titulo, cuerpo, tag, cita, abrirModal }) {
  if (Notification.permission !== "granted") return;
  const notif = new Notification(titulo, {
    body: cuerpo,
    icon: "/logo192.png",
    tag,
    requireInteraction: true,
  });
  notif.onclick = () => {
    window.focus();
    if (cita && abrirModal) abrirModal(cita);
    notif.close();
  };
}

const AgendaDiaria = () => {
  const [fechaActual, setFechaActual] = useState(new Date());
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [citaSeleccionada, setCitaSeleccionada] = useState(null);

  // ── Estado de notificaciones ──────────────────────────────────────────────
  const [notifPermiso, setNotifPermiso] = useState(
    typeof Notification !== "undefined" ? Notification.permission : "default"
  );
  const [notifSuscrita, setNotifSuscrita] = useState(false);
  const [notifCargando, setNotifCargando] = useState(false);

  // Refs para no duplicar recordatorios ni notificaciones de creación
  const recordatoriosYaProgramados = useRef(new Set());
  const citasYaNotificadas = useRef(new Set()); // ← NUEVO: evita notif duplicada al crear

  const token = localStorage.getItem("token");

  // ================= FETCH =================
  const fetchCitas = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/citas`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (!Array.isArray(data)) { setCitas([]); return; }

      const citasDelDia = data.filter((cita) => {
        if (!cita.fecha) return false;
        const [y, m, d] = cita.fecha.split("-");
        const fechaCita = new Date(y, m - 1, d);
        return (
          fechaCita.getFullYear() === fechaActual.getFullYear() &&
          fechaCita.getMonth()    === fechaActual.getMonth()    &&
          fechaCita.getDate()     === fechaActual.getDate()
        );
      });

      setCitas(citasDelDia);
    } catch (err) {
      console.error("Error al cargar citas:", err);
      setCitas([]);
    } finally {
      setLoading(false);
    }
  }, [fechaActual, token]);

  useEffect(() => {
    if (token) fetchCitas();
  }, [fetchCitas, token]);

  // ================= NOTIFICACIÓN AL CREAR UNA CITA ========================
  // Cada vez que el arreglo "citas" cambia, detecta IDs nuevos y notifica
  useEffect(() => {
    if (notifPermiso !== "granted") return;

    citas.forEach((cita) => {
      const clave = `nueva-${cita.id}`;
      if (citasYaNotificadas.current.has(clave)) return; // ya notificamos esta

      // La primera vez que montamos NO notificamos (solo marcamos como conocidas)
      // Solo notificamos en recargas posteriores (cuando el Set ya fue inicializado)
      if (!citasYaNotificadas.current.has("__init__")) return;

      citasYaNotificadas.current.add(clave);

      dispararNotificacion({
        titulo: "📅 Nueva cita agendada",
        cuerpo: `${cita.titulo || "Cita"} con ${cita.nombre_cliente || "cliente"} el ${cita.fecha} a las ${cita.hora_inicio?.slice(0, 5)}`,
        tag: clave,
        cita,
        abrirModal,
      });
    });

    // Marcar que ya se hizo la inicialización y registrar las citas actuales
    if (!citasYaNotificadas.current.has("__init__")) {
      citasYaNotificadas.current.add("__init__");
      citas.forEach((c) => citasYaNotificadas.current.add(`nueva-${c.id}`));
    }
  }, [citas, notifPermiso]); // eslint-disable-line react-hooks/exhaustive-deps

  // ================= NOTIFICACIONES — SETUP =================

  // Verificar si ya hay suscripción activa al montar
  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;

    navigator.serviceWorker.ready.then((reg) => {
      reg.pushManager.getSubscription().then((sub) => {
        if (sub) setNotifSuscrita(true);
      });
    });
  }, []);

  // Activar notificaciones push (pide permiso + suscribe al servidor push)
  const activarNotificaciones = async () => {
    if (!("serviceWorker" in navigator) || !("Notification" in window)) return;

    // ✅ Validar que la clave VAPID esté definida
    if (!VAPID_PUBLIC_KEY) {
      console.error("Falta REACT_APP_VAPID_PUBLIC_KEY en el .env");
      return;
    }

    setNotifCargando(true);

    try {
      // 1. Registrar service worker
      const reg = await navigator.serviceWorker.register("/service-worker.js");

      // 2. Pedir permiso
      const permiso = await Notification.requestPermission();
      setNotifPermiso(permiso);
      if (permiso !== "granted") return;

      // 3. Crear suscripción push
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      // 4. Guardar suscripción en tu backend
      await fetch(`${API_URL}/api/push/subscribe`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(sub),
      });

      setNotifSuscrita(true);
    } catch (err) {
      console.error("Error activando notificaciones:", err);
    } finally {
      setNotifCargando(false);
    }
  };

  // Desactivar notificaciones
  const desactivarNotificaciones = async () => {
    setNotifCargando(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await sub.unsubscribe();
        await fetch(`${API_URL}/api/push/unsubscribe`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        });
      }
      setNotifSuscrita(false);
    } catch (err) {
      console.error("Error desactivando notificaciones:", err);
    } finally {
      setNotifCargando(false);
    }
  };

  // ================= NOTIFICACIONES — RECORDATORIOS (15 y 30 min) ==========
  useEffect(() => {
    if (notifPermiso !== "granted") return;

    const hoy = new Date();
    const esDiaDeHoy =
      fechaActual.getFullYear() === hoy.getFullYear() &&
      fechaActual.getMonth()    === hoy.getMonth()    &&
      fechaActual.getDate()     === hoy.getDate();

    if (!esDiaDeHoy || citas.length === 0) return;

    citas.forEach((cita) => {
      if (!cita.hora_inicio || !cita.fecha) return;

      const [y, m, d]  = cita.fecha.split("-");
      const [hh, mm]   = cita.hora_inicio.split(":").map(Number);
      const inicioCita = new Date(y, m - 1, d, hh, mm, 0);

      // ── Programar recordatorio a los dos intervalos ──────────────────────
      [MINUTOS_AVISO_30, MINUTOS_AVISO_15].forEach((minutos) => {
        const claveUnica = `${cita.id}-${cita.hora_inicio}-${minutos}min`;
        if (recordatoriosYaProgramados.current.has(claveUnica)) return;

        const avisarEn    = new Date(inicioCita.getTime() - minutos * 60 * 1000);
        const msRestantes = avisarEn.getTime() - Date.now();
        if (msRestantes <= 0) return; // ya pasó

        recordatoriosYaProgramados.current.add(claveUnica);

        setTimeout(() => {
          dispararNotificacion({
            titulo: `⏰ Cita en ${minutos} minutos`,
            cuerpo: `${cita.titulo || "Cita"} con ${cita.nombre_cliente || "cliente"} a las ${cita.hora_inicio?.slice(0, 5)}`,
            tag: claveUnica,
            cita,
            abrirModal,
          });
        }, msRestantes);

        console.log(
          `[Agenda] Recordatorio ${minutos}min programado: "${cita.titulo}" en ${Math.round(msRestantes / 60000)} min`
        );
      });
    });
  }, [citas, notifPermiso, fechaActual]); // eslint-disable-line react-hooks/exhaustive-deps

  // ================= CAMBIAR DÍA =================
  const cambiarDia = (delta) => {
    const nuevaFecha = new Date(fechaActual);
    nuevaFecha.setDate(nuevaFecha.getDate() + delta);
    setFechaActual(nuevaFecha);
  };

  // ================= FILTRAR POR HORA =================
  const citasPorHora = (hora) =>
    citas.filter((cita) => {
      if (!cita.hora_inicio) return false;
      const [hi] = cita.hora_inicio.split(":").map(Number);
      return hora === hi;
    });

  // ================= MODAL =================
  const abrirModal      = (cita) => setCitaSeleccionada(cita);
  const cerrarModal     = ()     => setCitaSeleccionada(null);
  const guardarYCerrar  = ()     => { cerrarModal(); fetchCitas(); };

  // ================= RENDER =================
  const soportaNotif =
    typeof Notification !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window;

  return (
    <main className="calendar-container">
      <div className="top-bar">
        <button onClick={() => cambiarDia(-1)}>◀</button>

        <strong>
          {fechaActual.toLocaleDateString("es-MX", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </strong>

        <button onClick={() => cambiarDia(1)}>▶</button>
      </div>

      {/* ── Banner de notificaciones ── */}
      {soportaNotif && notifPermiso !== "denied" && (
        <div className="notif-banner">
          {notifSuscrita ? (
            <>
              <span className="notif-badge notif-badge--on">🔔 Notificaciones activas</span>
              <span className="notif-hint">
                Avisamos al crear una cita y 30 y 15 min antes de cada una
              </span>
              <button
                className="notif-btn notif-btn--off"
                onClick={desactivarNotificaciones}
                disabled={notifCargando}
              >
                {notifCargando ? "..." : "Desactivar"}
              </button>
            </>
          ) : (
            <>
              <span className="notif-badge notif-badge--off">🔕 Sin notificaciones</span>
              <button
                className="notif-btn notif-btn--on"
                onClick={activarNotificaciones}
                disabled={notifCargando}
              >
                {notifCargando ? "Activando..." : "Activar recordatorios"}
              </button>
            </>
          )}
        </div>
      )}

      {notifPermiso === "denied" && (
        <p className="notif-blocked">
          🚫 Notificaciones bloqueadas. Habilítalas en la configuración de tu navegador.
        </p>
      )}

      {loading && <p>Cargando citas...</p>}

      <div className="agenda-wrapper">
        {HORAS_DIA.map((hora) => (
          <div key={hora} className="hour-row">
            <div className="hour-label">{hora}:00</div>

            <div className="hour-slot">
              {citasPorHora(hora).map((cita) => (
                <div
                  key={cita.id}
                  className="event-card"
                  onClick={() => abrirModal(cita)}
                  style={{ backgroundColor: cita.color || "#cfe2ff" }}
                >
                  <strong>{cita.titulo || "Sin título"}</strong>
                  <div className="event-time">
                    {cita.hora_inicio?.slice(0, 5)} – {cita.hora_final?.slice(0, 5)}
                  </div>
                  {cita.nombre_cliente && (
                    <div className="event-client">{cita.nombre_cliente}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {citaSeleccionada && (
        <ModalCita
          modo="ver"
          cita={citaSeleccionada}
          onClose={cerrarModal}
          onSave={guardarYCerrar}
        />
      )}
    </main>
  );
};

export default AgendaDiaria;
