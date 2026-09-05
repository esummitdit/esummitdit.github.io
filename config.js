"use strict";

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1"]);
const API_ORIGIN = LOCAL_HOSTS.has(window.location.hostname)
  ? "http://127.0.0.1:3000"
  : "https://apiesummitdit.shitijhalder.in";
const API_BASE = `${API_ORIGIN}/api`;

function getApiAssetUrl(path) {
  if (!path || /^https?:\/\//i.test(path) || path.startsWith("data:")) return path;
  return `${API_ORIGIN}${path.startsWith("/") ? path : `/${path}`}`;
}

function normalizeGroupId(value) {
  const raw = String(value || "").trim().toUpperCase().replace(/^ES2026_/, "");
  if (!/^\d{1,4}$/.test(raw)) return "";
  return `ES2026_${raw.padStart(4, "0")}`;
}

function setupServerStatus(element) {
  if (!element) return () => {};
  const label = element.querySelector(".login-server-label, .dash-live-status span");
  const time = element.querySelector(".login-server-time");
  const dot = element.querySelector(".login-server-dot, .dash-live-status i");

  const paint = (state, detail = "") => {
    element.classList.toggle("is-online", state === "online");
    element.classList.toggle("is-offline", state === "offline");
    element.classList.toggle("is-checking", state === "checking");
    if (label) label.textContent = state === "online" ? "Secure gateway online" : state === "offline" ? "Secure gateway offline" : "Checking secure gateway";
    if (time) time.textContent = detail;
    if (dot) dot.setAttribute("aria-label", state);
  };

  let stream;
  let reconnectTimer;
  const connect = () => {
    if (!navigator.onLine) { paint("offline", "No network"); return; }
    paint("checking", "Connecting…");
    stream?.close();
    stream = new EventSource(`${API_BASE}/health/stream`);
    stream.onopen = () => paint("online", "Live");
    stream.onmessage = () => paint("online", "Live");
    stream.onerror = () => {
      paint("offline", "Unavailable");
      stream.close();
      window.clearTimeout(reconnectTimer);
      reconnectTimer = window.setTimeout(connect, 5000);
    };
  };

  const instantOnline = () => { paint("checking", "Reconnecting…"); connect(); };
  const instantOffline = () => paint("offline", "No network");
  window.addEventListener("online", instantOnline, { passive: true });
  window.addEventListener("offline", instantOffline, { passive: true });
  document.addEventListener("visibilitychange", () => { if (!document.hidden) connect(); }, { passive: true });
  connect();
  return () => {
    window.removeEventListener("online", instantOnline);
    window.removeEventListener("offline", instantOffline);
    window.clearTimeout(reconnectTimer);
    stream?.close();
  };
}
