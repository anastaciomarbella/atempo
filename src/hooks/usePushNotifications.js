/* ============================================================
   usePushNotifications.js
   Hook para registrar el SW y suscribirse a notificaciones push
   ============================================================ */

import { useState, useEffect } from "react";

// ⚠️  Reemplaza con tu VAPID public key (ver instrucciones abajo)
const VAPID_PUBLIC_KEY = "BIl29rMHPevJ1q-p_xbjklkWPxYEQElKe0S-h7uSgk2616neLypz1PeVmAQQVg68QIIYxP6I02wpu32kRHSd168";

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

const usePushNotifications = () => {
  const [suscripcion, setSuscripcion] = useState(null);
  const [permiso, setPermiso] = useState(Notification.permission);
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(false);

  /* ── Registrar service worker al montar ── */
  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;

    navigator.serviceWorker
      .register("/service-worker.js")
      .then(async (registration) => {
        // Si ya tiene suscripción activa, guardarla en estado
        const sub = await registration.pushManager.getSubscription();
        if (sub) {
          setSuscripcion(sub);
          setPermiso("granted");
        }
      })
      .catch((err) => setError("Error al registrar service worker: " + err.message));
  }, []);

  /* ── Solicitar permiso y suscribirse ── */
  const suscribirse = async () => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setError("Tu navegador no soporta notificaciones push.");
      return;
    }

    setCargando(true);
    setError(null);

    try {
      const resultado = await Notification.requestPermission();
      setPermiso(resultado);

      if (resultado !== "granted") {
        setError("Permiso de notificaciones denegado.");
        setCargando(false);
        return;
      }

      const registration = await navigator.serviceWorker.ready;

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      setSuscripcion(subscription);

      // Enviar suscripción al backend para guardarla
      const token = localStorage.getItem("token");
      await fetch("/api/push/suscribir", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(subscription),
      });
    } catch (err) {
      setError("Error al suscribirse: " + err.message);
    } finally {
      setCargando(false);
    }
  };

  /* ── Cancelar suscripción ── */
  const desuscribirse = async () => {
    if (!suscripcion) return;
    try {
      await suscripcion.unsubscribe();
      setSuscripcion(null);
      setPermiso("default");

      const token = localStorage.getItem("token");
      await fetch("/api/push/desuscribir", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ endpoint: suscripcion.endpoint }),
      });
    } catch (err) {
      setError("Error al desuscribirse: " + err.message);
    }
  };

  return { suscripcion, permiso, error, cargando, suscribirse, desuscribirse };
};

export default usePushNotifications;