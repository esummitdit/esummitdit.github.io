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
