"use strict";

/**
 * E-Summit 2026 Dashboard — Executive Command System & Attendee Portal
 * Departmental Permissions, Digital ID Passes, Telemetry, and Instant Reconnaissance.
 */
document.addEventListener("DOMContentLoaded", async () => {
  const main = document.getElementById("dashMain");
  const roleBadge = document.getElementById("dashRoleBadge");
  const logoutBtn = document.getElementById("logoutBtn");
  const opening = document.getElementById("dashboardOpening");
  const liveStatus = document.getElementById("dashLiveStatus");
  const openingNote = document.getElementById("dashboardOpeningNote");

  const escapeHTML = (value) => String(value ?? "").replace(/[&<>'"]/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;"
  })[character]);

  // Instant Offline Vector Avatar Fallback Generator (0 HTTP requests, zero broken image risk, Base64 safe)
  const getAvatarFallback = (name, bg = "#171512", color = "#d3e83d") => {
    const clean = String(name || "Attendee").trim();
    const parts = clean.split(/\s+/).filter(Boolean);
    let initials = "A";
    if (parts.length >= 2) {
      initials = (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    } else if (clean.length > 0) {
      initials = clean.slice(0, 2).toUpperCase();
    }
    const safeBg = bg.startsWith("%23") ? "#" + bg.slice(3) : bg;
    const safeColor = color.startsWith("%23") ? "#" + color.slice(3) : color;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96"><rect width="96" height="96" rx="48" fill="${safeBg}"/><text x="50%" y="54%" font-family="system-ui,-apple-system,sans-serif" font-weight="800" font-size="34" fill="${safeColor}" text-anchor="middle" dominant-baseline="middle">${initials}</text></svg>`;
    try {
      if (typeof window !== "undefined" && typeof window.btoa === "function") {
        return `data:image/svg+xml;base64,${window.btoa(unescape(encodeURIComponent(svg)))}`;
      }
      if (typeof Buffer !== "undefined") {
        return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
      }
    } catch {}
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  };

  // ── Standardized SVG Icon Generator ──
  function getIcon(name, customClass = "") {
    const cls = `dash-icon ${customClass}`.trim();
    switch (name) {
      case "search":
        return `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>`;
      case "close":
        return `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;
      case "download":
        return `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>`;
      case "upload":
        return `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>`;
      case "shield":
        return `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>`;
      case "users":
        return `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>`;
      case "user":
        return `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`;
      case "user-plus":
        return `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>`;
      case "mail":
        return `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>`;
      case "phone":
        return `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>`;
      case "key":
        return `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 2l-2 2m-1.5 1.5L14 9l-1.5-1.5-2 2 1.5 1.5L9 14l-3-3-4 4 10 10 4-4-3-3 3-3 2 2 2-2-1.5-1.5L21 2z"></path></svg>`;
      case "copy":
        return `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`;
      case "check":
        return `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
      case "chevron":
        return `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"></polyline></svg>`;
      case "trash":
        return `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>`;
      case "database":
        return `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path></svg>`;
      case "activity":
        return `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>`;
      case "external":
        return `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>`;
      case "lock":
        return `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>`;
      case "clock":
        return `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`;
      case "calendar":
        return `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>`;
      case "refresh":
        return `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>`;
      case "globe":
        return `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>`;
      case "monitor":
        return `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>`;
      case "filter":
        return `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>`;
      case "eye":
        return `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`;
      case "alert-triangle":
        return `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`;
      case "cross":
        return `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;
      case "cpu":
        return `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="2"></rect><rect x="9" y="9" width="6" height="6"></rect><line x1="9" y1="1" x2="9" y2="4"></line><line x1="15" y1="1" x2="15" y2="4"></line><line x1="9" y1="20" x2="9" y2="23"></line><line x1="15" y1="20" x2="15" y2="23"></line><line x1="20" y1="9" x2="23" y2="9"></line><line x1="20" y1="14" x2="23" y2="14"></line><line x1="1" y1="9" x2="4" y2="9"></line><line x1="1" y1="14" x2="4" y2="14"></line></svg>`;
      case "wifi":
        return `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.55a11 11 0 0 1 14.08 0"></path><path d="M1.42 9a16 16 0 0 1 21.16 0"></path><path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path><line x1="12" y1="20" x2="12.01" y2="20"></line></svg>`;
      case "maximize":
        return `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path></svg>`;
      case "mapPin":
      case "map-pin":
        return `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>`;
      case "device":
      case "smartphone":
        return `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>`;
      case "fingerprint":
        return `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 12C2 6.5 6.5 2 12 2a10 10 0 0 1 8 4"></path><path d="M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 12 0c0 3 .5 6 1 7.5"></path><path d="M9 21c.5-1.5 1-3.5 1-6a2 2 0 0 1 4 0c0 2.5.5 4.5 1 6"></path><path d="M12 12v3"></path></svg>`;
      case "browser":
        return `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>`;
      case "arrowRight":
      case "arrow-right":
        return `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>`;
      case "radar":
        return `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19.07 4.93A10 10 0 0 0 6.99 3.34"></path><path d="M4 6h.01"></path><path d="M2.29 9.62A10 10 0 0 0 12 22a10 10 0 0 0 8.4-4.57"></path><path d="M12 6a6 6 0 0 1 6 6 6 6 0 0 1-1.28 3.71"></path><path d="M12 2v4"></path><path d="M12 12l4.24-4.24"></path><circle cx="12" cy="12" r="2"></circle></svg>`;
      default:
        return "";
    }
  }

  // ── Global Date & Time Formatting Utilities ──
  function formatRegistrationDateTime(isoStr) {
    if (!isoStr) return "Registration Confirmed";
    try {
      const d = new Date(isoStr);
      if (isNaN(d.getTime())) return String(isoStr);
      return new Intl.DateTimeFormat("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }).format(d);
    } catch {
      return String(isoStr);
    }
  }

  function formatCompactDateTime(isoStr) {
    if (!isoStr) return "";
    try {
      const d = new Date(isoStr);
      if (isNaN(d.getTime())) return "";
      return new Intl.DateTimeFormat("en-IN", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }).format(d);
    } catch {
      return "";
    }
  }

  // ── Accessible Live Toast System ──
  let _toastTimer = null;
  function showToast(message, type = "success") {
    const toast = document.getElementById("dashToast");
    if (!toast) return;
    if (_toastTimer) clearTimeout(_toastTimer);
    const icon = type === "success" ? getIcon("check", "dash-icon--sm") : getIcon("close", "dash-icon--sm");
    toast.className = `dash-toast is-${type}`;
    toast.innerHTML = `<span class="dash-toast-icon" aria-hidden="true">${icon}</span><span>${escapeHTML(message)}</span>`;
    toast.style.display = "flex";
    toast.hidden = false;
    _toastTimer = setTimeout(() => {
      toast.hidden = true;
      toast.style.display = "none";
    }, 3200);
  }

  async function copyToClipboard(text, successMsg = "Copied to clipboard") {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.left = "-9999px";
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        document.execCommand("copy");
        ta.remove();
      }
      showToast(successMsg, "success");
    } catch {
      showToast("Failed to copy", "error");
    }
  }

  const dismissOpening = () => {
    if (!opening) return;
    opening.classList.add("is-leaving");
    window.setTimeout(() => opening.remove(), 620);
  };

  setupServerStatus(liveStatus);

  // ── Auth Guard ──
  const session = await Auth.validateSession();
  if (!session) {
    window.location.replace("login");
    return;
  }
  window.setTimeout(dismissOpening, 750);

  logoutBtn?.addEventListener("click", () => Auth.logout());

  // ── Privacy Shield for Unattended Screen ──
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      main?.classList.add("dash-privacy-shield");
    } else {
      main?.classList.remove("dash-privacy-shield");
    }
  });

  // ── Anti-Snooping & DevTools Hardening ──
  document.addEventListener("contextmenu", (e) => e.preventDefault());
  document.addEventListener("keydown", (e) => {
    if (e.key === "F12") { e.preventDefault(); return false; }
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && ["I", "i", "J", "j", "C", "c"].includes(e.key)) {
      e.preventDefault(); return false;
    }
    if ((e.ctrlKey || e.metaKey) && ["U", "u"].includes(e.key)) {
      e.preventDefault(); return false;
    }
  });

  setInterval(() => {
    try {
      console.clear();
      console.log(
        "%cDeveloper Notice%c\nThis feature is for developers only. If someone told you to copy-paste code here, do not proceed as it may compromise your session.",
        "color: #d84b2d; font-family: monospace; font-size: 15px; font-weight: bold;",
        "color: #999; font-family: monospace; font-size: 12px;"
      );
    } catch {}
  }, 4000);

  // ── High-Performance Photo Loader (Native Browser Caching & Zero Throttling) ──
  function registerLazyPhotos(container = document) {
    const imgs = container.querySelectorAll("img[data-lazy-src]");
    imgs.forEach((img) => {
      const targetSrc = img.getAttribute("data-lazy-src");
      if (targetSrc) {
        img.src = targetSrc;
        img.removeAttribute("data-lazy-src");
      }
    });
  }

  function triggerLazyPhotosNow(container = document) {
    registerLazyPhotos(container);
  }

  // Check if first-time admin needs to change temporary password
  if (session.must_change_password) {
    showMandatoryPasswordChangeModal();
    return;
  }

  if (session.role === "team") {
    if (openingNote) openingNote.textContent = "Welcome back. Your team desk is ready.";
    roleBadge.className = "dash-role-badge badge--team";
    roleBadge.innerHTML = `<span class="dash-role-icon">${getIcon("users", "dash-icon--xs")}</span><span>TEAM PORTAL</span>`;
    renderTeamDashboard(session);
  } else if (["master_admin", "admin", "event_coordinator", "team_manager", "event_head"].includes(session.role)) {
    if (openingNote) openingNote.textContent = session.role === "master_admin"
      ? "Welcome back. Root command desk is online."
      : session.role === "event_head"
        ? "Welcome back. The event overview is ready."
      : "Welcome back. The staff desk is open.";
    const deptStr = session.department ? session.department.toUpperCase() : "ADMIN";
    roleBadge.className = "dash-role-badge badge--admin";
    const label = session.role === "master_admin" ? "MASTER ADMIN" : `DEPT: ${deptStr}`;
    roleBadge.innerHTML = `<span class="dash-role-icon">${getIcon("shield", "dash-icon--xs")}</span><span>${escapeHTML(label)}</span>`;
    renderAdminDashboard(session);
  } else {
    Auth.logout();
  }

  // ═══════════════════════════════════════
  //  MANDATORY PASSWORD CHANGE (FIRST LOGIN)
  // ═══════════════════════════════════════
  function showMandatoryPasswordChangeModal() {
    main.setAttribute("aria-busy", "false");
    main.innerHTML = `
      <div class="dash-container dash-auth-gate">
        <section class="dash-auth-gate-card" aria-labelledby="password-change-title">
          <p class="dash-eyebrow">First sign-in security step</p>
          <h1 id="password-change-title">Set your new password</h1>
          <p>You signed in with a temporary password. Create a permanent password before opening the dashboard.</p>
          <form id="changePasswordForm">
            <div class="field-group">
              <label for="oldPw">Current Temporary Password</label>
              <input id="oldPw" type="password" required autocomplete="current-password" placeholder="••••••••">
            </div>
            <div class="field-group">
              <label for="newPw">New Secure Password</label>
              <input id="newPw" type="password" required minlength="6" autocomplete="new-password" placeholder="At least 6 characters">
            </div>
            <div id="changePwError" class="login-error" role="alert"></div>
            <button class="button button--ink" type="submit">
              Save New Password <span aria-hidden="true">→</span>
            </button>
          </form>
          <div id="adminPasswordSuccess" class="login-success-message" hidden aria-live="polite">
            <div class="login-success-icon" aria-hidden="true">✓</div>
            <div>
              <h3>Password updated successfully.</h3>
              <p>Your administrator password is now active. Please return to login.</p>
              <button type="button" class="button button--ink" id="adminReturnToLogin">Return to Login <span aria-hidden="true">→</span></button>
            </div>
          </div>
        </section>
      </div>
    `;

    document.getElementById("changePasswordForm").addEventListener("submit", async (e) => {
      e.preventDefault();
      const errEl = document.getElementById("changePwError");
      errEl.textContent = "";

      const oldPassword = document.getElementById("oldPw").value;
      const newPassword = document.getElementById("newPw").value;

      try {
        const res = await Auth.apiFetch("/auth/change-password", {
          method: "POST",
          body: JSON.stringify({ old_password: oldPassword, new_password: newPassword })
        });
        const data = await res.json();
        if (res.ok) {
          document.getElementById("changePasswordForm").hidden = true;
          document.getElementById("adminPasswordSuccess").hidden = false;
          document.getElementById("adminReturnToLogin").addEventListener("click", () => {
            Auth.logout("login");
          }, { once: true });
        } else {
          errEl.textContent = data.detail || "Failed to update password.";
        }
      } catch {
        errEl.textContent = "Your password changes couldn't be saved right now. Please try again later or contact the technical team.";
      }
    });
  }

  // ═══════════════════════════════════════
  //  TEAM MEMBER DASHBOARD & DIGITAL PASS (HIGH-DENSITY REWORK)
  // ═══════════════════════════════════════
  async function renderTeamDashboard(session) {
    try {
      const res = await Auth.apiFetch(`/teams/${session.group_id}`);
      if (!res.ok) throw new Error("Failed to load team data.");
      const team = await res.json();

      main.setAttribute("aria-busy", "false");
      const members = Array.isArray(team.members) ? team.members : [];
      const regTimeFull = formatRegistrationDateTime(team.created_at);

      main.innerHTML = `
        <div class="dash-container dash-team-portal">
          <!-- Executive Team Command Desk Hero -->
          <header class="dash-team-desk-hero">
            <div class="dash-team-desk-top">
              <div class="dash-team-desk-pills">
                <span class="dash-team-desk-id-pill">${escapeHTML(team.group_id || "ES2026")}</span>
                <span class="dash-team-desk-track-pill">${escapeHTML(team.track || "General Track")}</span>
                <span class="dash-status-pill"><span class="pulse-dot" aria-hidden="true"></span><span>Confirmed Attendance</span></span>
                <div class="dash-team-desk-timestamp" title="Official verified registration timestamp">
                  ${getIcon("calendar", "dash-icon--xs")}
                  <span>Registered: <strong>${escapeHTML(regTimeFull)}</strong></span>
                </div>
              </div>
            </div>

            <div class="dash-team-desk-main">
              <div class="dash-team-desk-info">
                <span class="dash-team-desk-kicker">E-SUMMIT 2026 • OFFICIAL TEAM DESK</span>
                <h1 class="dash-team-desk-title">${escapeHTML(team.team_name || "Your Team")}</h1>
                <p class="dash-team-desk-college">
                  ${getIcon("shield", "dash-icon--xs")}
                  <span>${escapeHTML(team.college || "Institution Not Specified")}</span>
                </p>
              </div>
            </div>

            <!-- Compact Operational Metrics Ribbon -->
            <div class="dash-team-desk-metrics">
              <div class="dash-team-metric-item dash-team-metric-item--id">
                <span class="metric-lbl">Group ID</span>
                <strong class="metric-val">${escapeHTML(team.group_id || "—")}</strong>
              </div>
              <div class="dash-team-metric-item dash-team-metric-item--track">
                <span class="metric-lbl">Event Track</span>
                <strong class="metric-val">${escapeHTML(team.track || "General")}</strong>
              </div>
              <div class="dash-team-metric-item dash-team-metric-item--attendees">
                <span class="metric-lbl">Attendees</span>
                <strong class="metric-val">${members.length} Confirmed</strong>
              </div>
              <div class="dash-team-metric-item dash-team-metric-item--date">
                <span class="metric-lbl">Registration Date</span>
                <strong class="metric-val">${escapeHTML(regTimeFull)}</strong>
              </div>
            </div>
          </header>

          <!-- Venue Digital Passes Header Bar -->
          <div class="dash-team-passes-banner">
            <div class="dash-team-passes-title-group">
              <span class="dash-section-kicker">VENUE ACCESS CREDENTIALS</span>
              <h2 class="dash-team-passes-title">Attendee Digital Passes (${members.length})</h2>
              <aside class="dash-passes-desk-notice" role="note">
                <span class="dash-passes-desk-notice-badge">SECURITY PROTOCOL</span>
                <div class="dash-passes-desk-notice-content">
                  ${getIcon("shield", "dash-icon--xs")}
                  <span>Keep downloaded passes on attendees' phones for instant security check-in.</span>
                </div>
              </aside>
            </div>
          </div>

          <!-- Attendee Passes Grid -->
          <div class="dash-roster-grid">
            ${members.map((member, index) => renderDigitalIdCardHTML(team, member, index)).join("") || '<p class="dash-empty-state">No attendees attached to this team yet.</p>'}
          </div>
        </div>
      `;

      members.forEach((m, i) => {
        const downloadBtn = document.getElementById(`downloadIdCardBtn_${i}`);
        downloadBtn?.addEventListener("click", () => downloadDigitalIdCardPNG(team, m, i));
      });

      document.querySelectorAll("[data-copy-code]").forEach(btn => {
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          copyToClipboard(btn.dataset.copyCode, "Verification code copied");
        });
      });
      document.querySelectorAll("[data-copy-text]").forEach(btn => {
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          copyToClipboard(btn.dataset.copyText, "Copied to clipboard");
        });
      });

      triggerLazyPhotosNow(main);

    } catch (err) {
      main.setAttribute("aria-busy", "false");
      main.innerHTML = `
        <div class="dash-container">
          <div class="dash-error-card" role="alert">
            <h2>Unable to Load Dashboard</h2>
            <p>${escapeHTML(err.message || "Please try again.")}</p>
            <div style="display:flex;gap:0.75rem;justify-content:center;margin-top:1.25rem;flex-wrap:wrap;">
              <button class="button button--ink" type="button" id="dashRetryTeamBtn">Retry Connection <span aria-hidden="true">↻</span></button>
              <a class="button button--ghost" href="login">Back to Login <span aria-hidden="true">→</span></a>
            </div>
          </div>
        </div>
      `;
      document.getElementById("dashRetryTeamBtn")?.addEventListener("click", () => {
        main.setAttribute("aria-busy", "true");
        main.innerHTML = `<div class="dash-container" style="padding:4rem 1rem;text-align:center;"><p class="dash-empty-state">Reconnecting to secure gateway…</p></div>`;
        renderTeamDashboard(session);
      });
    }
  }

  function renderDigitalIdCardHTML(team, member, index) {
    const isLeader = index === 0;
    const fallback = getAvatarFallback(member.name, "%231a1814", "%23e9e1d2");
    const fullUrl = member.photo_url ? getApiAssetUrl(member.photo_url) : "";
    const srcUrl = fullUrl || fallback;
    const code = member.verification_code || "8492-3019-4821";
    const regDateFormatted = formatRegistrationDateTime(team.created_at);

    return `
      <article class="dash-member-card ${isLeader ? 'dash-member-card--leader' : ''}">
        <!-- Top Profile Row: Avatar & Identity -->
        <div class="dash-member-card-header">
          <div class="dash-member-avatar-box">
            <div class="dash-member-photo-wrap">
              <img class="dash-pass-photo"
                   src="${escapeHTML(srcUrl)}"
                   alt="${escapeHTML(member.name || "Attendee")}"
                   loading="lazy"
                   decoding="async"
                   onerror="this.onerror=null;this.src='${fallback}';">
            </div>
            <span class="dash-avatar-verify-badge" title="Verified Attendee">✓</span>
          </div>

          <div class="dash-member-main-info">
            <div class="dash-member-tag-row">
              <span class="dash-member-role-pill ${isLeader ? 'is-leader' : ''}">
                ${isLeader ? '★ TEAM LEAD' : escapeHTML(member.role || 'PARTICIPANT')}
              </span>
              ${member.college_id ? `<span class="dash-member-id-pill" title="College Student ID">ID: ${escapeHTML(member.college_id)}</span>` : ""}
            </div>
            <h3 class="dash-member-name">${escapeHTML(member.name || "Attendee")}</h3>
            <div class="dash-member-team-sub">
              <span>${escapeHTML(team.team_name || "Team")}</span>
              <span class="dash-member-sep">•</span>
              <span>${escapeHTML(team.group_id || "ES2026")}</span>
            </div>
          </div>
        </div>

        <!-- Venue Staff Check-In Code -->
        <div class="dash-secret-id">
          <div class="dash-secret-id-info">
            <div class="secret-label-row">
              ${getIcon("shield", "dash-icon--xs")}
              <span class="secret-label">Staff Verification Code</span>
            </div>
            <code class="secret-code">${escapeHTML(code)}</code>
          </div>
          <button type="button" class="dash-code-copy-btn" data-copy-code="${escapeHTML(code)}" aria-label="Copy verification code">
            ${getIcon("copy", "dash-icon--xs")} <span>Copy</span>
          </button>
        </div>

        <!-- Compact Contact Chips -->
        <div class="dash-member-chips">
          ${member.email ? `
            <div class="dash-contact-chip">
              <div class="dash-contact-chip-left">
                <span class="chip-label">${getIcon("mail", "dash-icon--xs")} INST:</span>
                <span class="chip-val" title="${escapeHTML(member.email)}">${escapeHTML(member.email)}</span>
              </div>
              <button type="button" class="dash-contact-copy-btn" data-copy-text="${escapeHTML(member.email)}" aria-label="Copy institutional email">${getIcon("copy", "dash-icon--xs")}</button>
            </div>
          ` : ""}
          ${member.personal_email ? `
            <div class="dash-contact-chip">
              <div class="dash-contact-chip-left">
                <span class="chip-label">${getIcon("mail", "dash-icon--xs")} PERS:</span>
                <span class="chip-val" title="${escapeHTML(member.personal_email)}">${escapeHTML(member.personal_email)}</span>
              </div>
              <button type="button" class="dash-contact-copy-btn" data-copy-text="${escapeHTML(member.personal_email)}" aria-label="Copy personal email">${getIcon("copy", "dash-icon--xs")}</button>
            </div>
          ` : ""}
          ${member.phone ? `
            <div class="dash-contact-chip">
              <div class="dash-contact-chip-left">
                <span class="chip-label">${getIcon("phone", "dash-icon--xs")} PHONE:</span>
                <span class="chip-val">${escapeHTML(member.phone)}</span>
              </div>
              <button type="button" class="dash-contact-copy-btn" data-copy-text="${escapeHTML(member.phone)}" aria-label="Copy phone number">${getIcon("copy", "dash-icon--xs")}</button>
            </div>
          ` : ""}
        </div>

        <!-- Card Footer: Registration Timestamp & Download Pass -->
        <div class="dash-member-card-footer">
          <span class="dash-card-reg-stamp" title="Registration timestamp">
            ${getIcon("calendar", "dash-icon--xs")}
            <span>${escapeHTML(regDateFormatted)}</span>
          </span>
          <button type="button" class="dash-download-pass" id="downloadIdCardBtn_${index}" aria-label="Download ${escapeHTML(member.name || "attendee")} pass as PNG">
            ${getIcon("download", "dash-icon--sm")} <span>Download pass</span>
          </button>
        </div>
      </article>
    `;
  }

  // ═══════════════════════════════════════
  //  CANVAS DIGITAL ID CARD GENERATOR
  // ═══════════════════════════════════════
  function downloadDigitalIdCardPNG(team, member, index) {
    const canvas = document.createElement("canvas");
    canvas.width = 1400;
    canvas.height = 900;
    const ctx = canvas.getContext("2d");

    const background = ctx.createLinearGradient(0, 0, 1400, 900);
    background.addColorStop(0, "#1a1814");
    background.addColorStop(1, "#30291f");
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#d3e83d";
    ctx.fillRect(0, 0, 1400, 20);
    ctx.fillStyle = "#e9e1d2";
    ctx.font = "700 30px monospace";
    ctx.fillText("DIT UNIVERSITY  /  E-SUMMIT 2026", 72, 86);
    ctx.font = "500 18px monospace";
    ctx.fillText("OFFICIAL DIGITAL VENUE PASS", 72, 120);
    ctx.font = "800 62px Archivo, Arial, sans-serif";
    ctx.fillText(member.name || "TEAM MEMBER", 72, 218);
    ctx.fillStyle = "#d84b2d";
    ctx.font = "700 25px monospace";
    ctx.fillText(member.role || "PARTICIPANT", 72, 262);
    ctx.fillStyle = "#e9e1d2";
    ctx.font = "500 24px monospace";
    ctx.fillText(`TEAM      ${team.team_name || "Untitled Team"}`, 72, 344);
    ctx.fillText(`GROUP ID  ${team.group_id}`, 72, 390);
    ctx.fillText(`TRACK     ${team.track || "General"}`, 72, 436);
    ctx.fillText(`COLLEGE   ${team.college || "DIT University"}`, 72, 482);
    ctx.fillText(`MEMBER    ${String(index + 1).padStart(2, "0")} / ${(team.members || []).length}`, 72, 528);
    ctx.fillText(`EMAIL     ${member.email || "-"}`, 72, 574);
    ctx.fillText(`PHONE     ${member.phone || "-"}`, 72, 620);
    ctx.fillText(`REGISTERED ${formatRegistrationDateTime(team.created_at)}`, 72, 666);
    ctx.fillStyle = "#d3e83d";
    ctx.font = "700 22px monospace";
    ctx.fillText("SCAN QR AT VENUE CHECK-IN", 72, 820);

    const qrPayload = JSON.stringify({
      i: "DIT University E-Summit 2026",
      t: "venue-entry-pass",
      g: team.group_id,
      m: index + 1,
      n: member.name,
      r: member.role,
      s: member.verification_code
    });
    const qrHolder = document.createElement("div");
    if (typeof QRCode === "function") {
      new QRCode(qrHolder, { text: qrPayload, width: 320, height: 320, correctLevel: QRCode.CorrectLevel.H, colorDark: "#1a1814", colorLight: "#ffffff" });
    }
    const drawCard = () => {
      const qrCanvas = qrHolder.querySelector("canvas");
      const qrImage = qrHolder.querySelector("img");
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(970, 430, 340, 340);
      if (qrCanvas) ctx.drawImage(qrCanvas, 980, 440, 320, 320);
      if (qrImage) ctx.drawImage(qrImage, 980, 440, 320, 320);
      if (qrCanvas || qrImage) {
        ctx.strokeStyle = "#d3e83d";
        ctx.lineWidth = 8;
        ctx.strokeRect(970, 430, 340, 340);
      }

      const image = new Image();
      image.crossOrigin = "anonymous";
      image.onload = () => {
        ctx.save();
        ctx.beginPath();
        ctx.arc(1135, 260, 112, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(image, 1023, 148, 224, 224);
        ctx.restore();
        ctx.strokeStyle = "#d84b2d";
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.arc(1135, 260, 116, 0, Math.PI * 2);
        ctx.stroke();
        downloadCanvas(canvas, team, member, index);
      };
      image.onerror = () => downloadCanvas(canvas, team, member, index);
      image.src = (member.photo_url ? getApiAssetUrl(member.photo_url) : "") || getAvatarFallback(member.name, "%231a1814", "%23e9e1d2");
    };
    const qrImage = qrHolder.querySelector("img");
    if (qrImage && !qrImage.complete) {
      qrImage.onload = drawCard;
    } else {
      drawCard();
    }
  }

  function downloadCanvas(canvas, team, member, index) {
    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `DIT_E-Summit_2026_${team.group_id}_${(member.name || `Member_${index + 1}`).replace(/\s+/g, "_")}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast(`Pass downloaded for ${member.name || "member"}`);
    }, "image/png");
  }

  // ═══════════════════════════════════════
  //  ADMIN DASHBOARD & EXECUTIVE REDESIGN
  // ═══════════════════════════════════════
  async function renderAdminDashboard(session) {
    try {
      // 1. Fetch team registry first (core system data)
      const teamsRes = await Auth.apiFetch("/admin/teams");
      if (!teamsRes.ok) {
        throw new Error(`Gateway returned HTTP ${teamsRes.status} while loading teams.`);
      }
      const teams = await teamsRes.json();

      // 2. Fetch telemetry statistics gracefully (synthesize locally if stats endpoint unavailable)
      let stats = null;
      try {
        const statsRes = await Auth.apiFetch("/admin/stats");
        if (statsRes.ok) {
          stats = await statsRes.json();
        }
      } catch {}

      if (!stats || typeof stats.total_teams !== "number") {
        const uniqueTrackSet = new Set(teams.map((t) => t.track).filter(Boolean));
        stats = {
          total_teams: teams.length,
          total_participants: teams.reduce((sum, t) => sum + (Array.isArray(t.members) ? t.members.length : 0), 0),
          total_tracks: uniqueTrackSet.size,
        };
      }

      const userDept = session.department || "Technical Team";
      const userName = session.name || (session.role === "master_admin" ? "Shitij Halder" : "Administrative Officer");
      const isMaster = session.role === "master_admin";
      const isTechOrMaster = isMaster || (userDept === "Technical Team" && session.role !== "event_head");
      const canExportTeams = isTechOrMaster || session.role === "event_head";

      main.setAttribute("aria-busy", "false");

      const accessMode = isMaster
        ? "Master Root Controls"
        : isTechOrMaster
          ? "Department Operations"
          : "Read-only Verification";

      const uniqueTracks = Array.from(new Set(teams.map(t => t.track).filter(Boolean)));

      main.innerHTML = `
        <div class="dash-container dash-admin-portal">
          <!-- Compact Executive Command Header (Integrates Title, Context, and Tabs in 1 Row) -->
          <header class="dash-command-header">
            <div class="dash-command-identity">
              <h1 id="admin-desk-title" class="dash-command-title">Dashboard</h1>
              <div class="dash-command-badges">
                <span class="dash-command-pill">${escapeHTML(userDept)}</span>
                <span class="dash-command-mode">${escapeHTML(accessMode)}</span>
              </div>
            </div>

            <!-- Integrated High-Density Segmented View Switcher -->
            <div class="dash-data-tabs" role="tablist" aria-label="Dashboard data views" data-active="teams">
              <button id="teamDataTab" class="dash-data-tab" type="button" role="tab" aria-selected="true" aria-controls="teamDataPanel" data-dash-tab="teams">
                ${getIcon("users", "dash-icon--sm")}
                <span>Team registry</span>
                <span class="tab-count-pill">${teams.length}</span>
              </button>
              <button id="adminDataTab" class="dash-data-tab" type="button" role="tab" aria-selected="false" aria-controls="adminDataPanel" data-dash-tab="admin" tabindex="-1">
                ${getIcon("shield", "dash-icon--sm")}
                <span>Admin controls</span>
              </button>
              ${isMaster ? `
                <button id="analyticsDataTab" class="dash-data-tab" type="button" role="tab" aria-selected="false" aria-controls="analyticsDataPanel" data-dash-tab="analytics" tabindex="-1">
                  ${getIcon("activity", "dash-icon--sm")}
                  <span>Master Analytics</span>
                  <span class="tab-count-pill pulse-pill">LIVE</span>
                </button>
              ` : ""}
            </div>
          </header>

          <!-- ═════ TAB 1: TEAM DATA ═════ -->
          <section id="teamDataPanel" class="dash-data-panel" role="tabpanel" aria-labelledby="teamDataTab" tabindex="-1">
            <!-- Compact Metrics Ribbon & Quick Actions (Zero dead padding, low-profile) -->
            <div class="dash-compact-metrics-bar">
              <div class="dash-stats-ribbon" aria-label="Registration metrics">
                <div class="dash-stat-ribbon-item">
                  <span class="ribbon-val">${escapeHTML(stats.total_teams)}</span>
                  <span class="ribbon-lbl">Squads</span>
                </div>
                <div class="dash-stat-ribbon-divider" aria-hidden="true"></div>
                <div class="dash-stat-ribbon-item">
                  <span class="ribbon-val">${escapeHTML(stats.total_participants)}</span>
                  <span class="ribbon-lbl">Attendees</span>
                </div>
                <div class="dash-stat-ribbon-divider" aria-hidden="true"></div>
                <div class="dash-stat-ribbon-item">
                  <span class="ribbon-val">${escapeHTML(stats.total_tracks)}</span>
                  <span class="ribbon-lbl">Tracks</span>
                </div>
              </div>

              <div class="dash-toolbar-actions">
                <span class="dash-result-count" id="teamResultCount" aria-live="polite">
                  ${teams.length} ${teams.length === 1 ? "team" : "teams"}
                </span>
                ${canExportTeams ? `
                  <button type="button" class="dash-action-btn" id="exportTeamsCsvBtn" aria-label="Export team registry to CSV">
                    ${getIcon("download", "dash-icon--sm")}
                    <span>Export CSV</span>
                  </button>
                ` : ""}
              </div>
            </div>

            <!-- Search & Filters -->
            <div class="dash-search-bar">
              <label for="teamSearchInput">Search Registry</label>
              <div class="dash-search-control">
                <span class="dash-search-icon" aria-hidden="true">${getIcon("search", "dash-icon--sm")}</span>
                <input type="search" id="teamSearchInput" autocomplete="off" placeholder="Search teams, Group IDs, colleges, member names, or pass codes…">
                <button id="clearTeamSearch" class="dash-search-clear" type="button" aria-label="Clear team search" hidden>
                  ${getIcon("close", "dash-icon--xs")} <span class="dash-clear-text">Clear</span>
                </button>
              </div>

              <!-- Interactive Track Filter Chips -->
              <div class="dash-filter-chips" id="trackFilterChips" role="radiogroup" aria-label="Filter squads by event track">
                <button type="button" class="dash-filter-chip is-active" data-track="">
                  All Tracks (${teams.length})
                </button>
                ${uniqueTracks.map(track => {
                  const count = teams.filter(t => t.track === track).length;
                  return `
                    <button type="button" class="dash-filter-chip" data-track="${escapeHTML(track)}">
                      ${escapeHTML(track)} (${count})
                    </button>
                  `;
                }).join("")}
              </div>
            </div>

            <!-- Smart Docked Bulk Action Bar (Reveals smoothly only when teams are checked) -->
            ${isMaster ? `
            <div id="dashBulkBar" class="dash-bulk-bar" style="display: none;" aria-live="polite">
              <div class="dash-bulk-bar-info">
                <span id="selectedTeamsCount" class="dash-bulk-badge">0</span>
                <span class="bulk-label">teams selected</span>
              </div>
              <div class="dash-bulk-bar-actions">
                <button type="button" class="dash-bulk-btn" id="selectAllTeamsBtn">${getIcon("check", "dash-icon--xs")}Select all</button>
                <button type="button" class="dash-bulk-btn" id="clearSelectedTeamsBtn">Deselect</button>
                <button type="button" class="dash-bulk-btn dash-bulk-btn--danger" id="deleteSelectedTeamsBtn">${getIcon("trash", "dash-icon--xs")}Delete selected</button>
              </div>
              <details class="dash-delete-all-disclosure">
                <summary><span>Permanent system purge options</span><span class="disclosure-arrow">${getIcon("chevron", "dash-icon--xs")}</span></summary>
                <div>
                  <p>Permanently purges all team records and attendee photos from the encrypted JSON vault.</p>
                  <button type="button" class="dash-bulk-btn dash-bulk-btn--danger" id="deleteAllTeamsBtn">${getIcon("trash", "dash-icon--xs")}Purge all teams</button>
                </div>
              </details>
            </div>
            ` : ""}

            <!-- Teams List -->
            <div class="dash-teams-list" id="teamsListContainer">
              ${teams.length ? teams.map((team) => renderTeamRow(team, isTechOrMaster, isMaster)).join("") : '<p class="dash-empty-state">No teams are registered yet.</p>'}
            </div>
            <p class="dash-empty-state" id="teamSearchEmpty" role="status" hidden>No teams match that search filter.</p>
          </section>

          <!-- ═════ TAB 2: ADMIN DATA (REDESIGNED COMMAND CENTER) ═════ -->
          <section id="adminDataPanel" class="dash-data-panel" role="tabpanel" aria-labelledby="adminDataTab" tabindex="-1" hidden>
            <div class="dash-admin-hub">
              <!-- 1. Operator Clearance Banner (Redesigned & Clean) -->
              <div class="dash-operator-banner">
                <div class="dash-operator-profile">
                  <div class="dash-operator-avatar" aria-hidden="true">
                    ${escapeHTML(userName.split(/\s+/).slice(0, 2).map(p => p[0]).join("").toUpperCase() || "OP")}
                  </div>
                  <div class="dash-operator-details">
                    <div class="dash-operator-role-row">
                      <span class="dash-operator-role-badge">${isMaster ? "MASTER ROOT CLEARANCE" : "DEPARTMENT OFFICER"}</span>
                      <span class="dash-operator-live-tag"><i class="pulse-dot"></i> Authenticated Session</span>
                    </div>
                    <h3 class="dash-operator-name">${escapeHTML(userName)}</h3>
                    <div class="dash-operator-meta-pills">
                      <span class="dash-pill-tag dash-pill-tag--acid">${escapeHTML(session.role.replace(/_/g, " "))}</span>
                      <span class="dash-pill-tag">${escapeHTML(userDept)}</span>
                      <span class="dash-pill-tag">${escapeHTML(session.email || "No email assigned")}</span>
                    </div>
                  </div>
                </div>

                <div class="dash-operator-actions">
                  <button type="button" class="dash-action-btn" id="adminExportCsvBtn">
                    ${getIcon("download", "dash-icon--sm")}
                    <span>Export CSV</span>
                  </button>
                  ${isMaster ? `
                    <label class="dash-action-btn dash-action-btn--accent" for="adminImportCsvInput" role="button">
                      ${getIcon("upload", "dash-icon--sm")}
                      <span>Import CSV</span>
                    </label>
                    <input id="adminImportCsvInput" class="sr-only" type="file" accept=".csv,text/csv">
                  ` : ""}
                </div>
              </div>

              <!-- 2. System Operations Overview (Clean & Purposeful 3-Metric Grid) -->
              <div class="dash-telemetry-grid dash-telemetry-grid--clean">
                <div class="dash-telemetry-card">
                  <div class="dash-telemetry-card-head">
                    <span>Registered Squads</span>
                    ${getIcon("users", "dash-icon--sm")}
                  </div>
                  <strong>${stats.total_teams}</strong>
                  <span class="telemetry-note">${stats.total_participants} confirmed attendees</span>
                </div>

                <div class="dash-telemetry-card">
                  <div class="dash-telemetry-card-head">
                    <span>Staff Officers</span>
                    ${getIcon("shield", "dash-icon--sm")}
                  </div>
                  <strong id="adminTelemetryCount">—</strong>
                  <span class="telemetry-note">Authorized departmental accounts</span>
                </div>

                <div class="dash-telemetry-card">
                  <div class="dash-telemetry-card-head">
                    <span>Competitive Tracks</span>
                    ${getIcon("activity", "dash-icon--sm")}
                  </div>
                  <strong>${stats.total_tracks}</strong>
                  <span class="telemetry-note">Active innovation categories</span>
                </div>
              </div>

              <!-- 4. Active Staff Officers Directory -->
              ${isMaster ? `
              <div class="dash-staff-section">
                <div class="dash-staff-section-header">
                  <div>
                    <p class="dash-eyebrow">Access Control</p>
                    <h3>Active Staff Officers</h3>
                  </div>
                  <span id="adminCountBadge" class="dash-result-count" aria-label="0 active staff">0 officers</span>
                </div>

                <div class="dash-staff-filter-bar">
                  <input type="search" id="staffSearchInput" class="dash-staff-filter-input" placeholder="Search staff by name, email, department, or access role…">
                </div>

                <div id="adminAccountsList" class="dash-staff-grid">
                  <p class="dash-empty-state">Loading staff directory…</p>
                </div>
              </div>

              <!-- 5. Streamlined Staff Onboarding Module -->
              <details class="dash-invite-section">
                <summary>
                  <div class="dash-invite-summary-left">
                    <div class="dash-invite-icon-box" aria-hidden="true">${getIcon("user-plus", "dash-icon--md")}</div>
                    <div>
                      <strong>Issue New Staff Invitation</strong>
                      <span>Provision authenticated credentials for committee officers</span>
                    </div>
                  </div>
                  <span class="dash-invite-chevron" aria-hidden="true">${getIcon("chevron", "dash-icon--sm")}</span>
                </summary>
                <div class="dash-invite-body">
                  <form class="dash-admin-invite-form" id="adminInviteForm">
                    <div class="dash-invite-fields">
                      <div class="field-group">
                        <label for="inviteName">Officer Full Name</label>
                        <input id="inviteName" required autocomplete="name" placeholder="e.g. Ananya Rao">
                      </div>
                      <div class="field-group">
                        <label for="inviteEmail">Institutional Email</label>
                        <input id="inviteEmail" type="email" required autocomplete="email" placeholder="name@dit.edu.in">
                      </div>
                      <div class="field-group">
                        <label for="inviteDepartment">Department Committee</label>
                        <select id="inviteDepartment" required>
                          <option value="Technical Team">Technical Team</option>
                          <option value="Event Operations">Event Operations</option>
                          <option value="Academic & Faculty Council">Academic & Faculty Council</option>
                          <option value="Design Team">Design Team</option>
                          <option value="PR & Sponsorship Team">PR & Sponsorship Team</option>
                          <option value="Content & Anchoring Team">Content & Anchoring Team</option>
                        </select>
                      </div>
                      <div class="field-group">
                        <label for="inviteRole">Assigned Access Role</label>
                        <select id="inviteRole" required>
                          <option value="admin">Department Admin (Full Operations)</option>
                          <option value="event_coordinator">Event Coordinator (Pass Verification)</option>
                          <option value="team_manager">Team Manager (Roster Inspection)</option>
                          <option value="event_head">Event Head / Faculty (Auditor View)</option>
                        </select>
                      </div>
                      <div class="field-group" style="grid-column: 1 / -1;">
                        <label for="invitePassword">Temporary Access Password (Optional — auto-generated if left empty)</label>
                        <input id="invitePassword" type="password" minlength="6" placeholder="Leave empty for auto-generated secure token" autocomplete="new-password">
                      </div>
                    </div>
                    <div class="dash-invite-submit-row">
                      <p id="adminInviteStatus" class="dash-invite-status-msg" role="status"></p>
                      <button class="button button--ink" type="submit">
                        Issue Staff Credential <span aria-hidden="true">→</span>
                      </button>
                    </div>
                    <div id="credentialRevealCard" class="dash-credential-card" style="display: none;">
                      <div>
                        <span style="font-size: 0.72rem; text-transform: uppercase; color: rgba(255,255,255,0.7); display: block;">Generated Temporary Password</span>
                        <strong class="cred-code" id="revealedTempPassword"></strong>
                      </div>
                      <button type="button" class="dash-code-copy-btn" id="copyTempPasswordBtn">${getIcon("copy", "dash-icon--xs")} Copy Password</button>
                    </div>
                  </form>
                </div>
              </details>
              ` : ""}
            </div>
          </section>
          ${isMaster ? renderAnalyticsPanelMarkup() : ""}
        </div>
      `;

      setupDashboardTabs();
      registerLazyPhotos(main);
      if (isMaster) {
        setupMasterAnalyticsController(main, session);
      }

      // ── CSV Export Handlers ──
      const handleCsvExport = async () => {
        try {
          const response = await Auth.apiFetch("/teams/admin/csv");
          if (!response.ok) {
            showToast("Unable to export team CSV", "error");
            return;
          }
          const blob = await response.blob();
          const link = document.createElement("a");
          link.href = URL.createObjectURL(blob);
          link.download = `esummit-teams-${new Date().toISOString().slice(0, 10)}.csv`;
          link.click();
          setTimeout(() => URL.revokeObjectURL(link.href), 1000);
          showToast("Team directory CSV exported successfully");
        } catch {
          showToast("Failed to download CSV", "error");
        }
      };

      document.getElementById("exportTeamsCsvBtn")?.addEventListener("click", handleCsvExport);
      document.getElementById("adminExportCsvBtn")?.addEventListener("click", handleCsvExport);

      // ── CSV Import Handlers ──
      const handleCsvImport = async (file) => {
        if (!file) return;
        if (!confirm("Import this CSV and sync current team records into the encrypted vault?")) return;
        const body = new FormData();
        body.append("file", file);
        try {
          const response = await Auth.apiFetch("/teams/admin/csv", { method: "POST", body });
          const result = await response.json().catch(() => ({}));
          if (!response.ok) {
            showToast(result.detail || "Unable to import team CSV.", "error");
            return;
          }
          showToast(`Imported ${result.teams} team records. Refreshing…`);
          setTimeout(() => window.location.reload(), 800);
        } catch {
          showToast("CSV import failed", "error");
        }
      };

      document.getElementById("importTeamsCsvInput")?.addEventListener("change", (e) => handleCsvImport(e.target.files?.[0]));
      document.getElementById("adminImportCsvInput")?.addEventListener("change", (e) => handleCsvImport(e.target.files?.[0]));

      // ── Team Search & Track Filters ──
      const searchInput = document.getElementById("teamSearchInput");
      let activeTrackFilter = "";
      const filterTeams = () => {
        const query = searchInput ? searchInput.value.toLowerCase().trim() : "";
        const container = document.getElementById("teamsListContainer");
        if (!container) return;
        let visibleRows = 0;
        container.querySelectorAll(".dash-team-row").forEach(row => {
          const text = row.dataset.searchable || "";
          const track = row.dataset.track || "";
          const matchesQuery = !query || text.includes(query);
          const matchesTrack = !activeTrackFilter || track.toLowerCase() === activeTrackFilter.toLowerCase();
          const isMatch = matchesQuery && matchesTrack;
          row.hidden = !isMatch;
          if (isMatch) visibleRows += 1;
        });
        const countEl = document.getElementById("teamResultCount");
        if (countEl) countEl.textContent = `${visibleRows} ${visibleRows === 1 ? "team" : "teams"}`;
        const emptyEl = document.getElementById("teamSearchEmpty");
        if (emptyEl) emptyEl.hidden = visibleRows !== 0;
        const clearBtn = document.getElementById("clearTeamSearch");
        if (clearBtn) clearBtn.hidden = !query;
      };

      if (searchInput) {
        const clearSearchButton = document.getElementById("clearTeamSearch");
        let searchTimeout = null;

        searchInput.addEventListener("input", () => {
          clearTimeout(searchTimeout);
          searchTimeout = setTimeout(filterTeams, 60);
        });

        clearSearchButton?.addEventListener("click", () => {
          searchInput.value = "";
          filterTeams();
          searchInput.focus();
        });
      }

      document.querySelectorAll(".dash-filter-chip").forEach(chip => {
        chip.addEventListener("click", () => {
          document.querySelectorAll(".dash-filter-chip").forEach(c => c.classList.remove("is-active"));
          chip.classList.add("is-active");
          activeTrackFilter = chip.dataset.track || "";
          filterTeams();
        });
      });

      // ── Expand/Collapse Accordion Rows ──
      document.querySelectorAll(".dash-team-row-header").forEach(header => {
        header.addEventListener("click", () => {
          const row = header.closest(".dash-team-row");
          const expanded = row.classList.toggle("is-expanded");
          header.setAttribute("aria-expanded", String(expanded));
          if (expanded) {
            triggerLazyPhotosNow(row);
          }
        });
      });

      // ── Copy buttons in team rows ──
      document.querySelectorAll("[data-copy-code]").forEach(btn => {
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          copyToClipboard(btn.dataset.copyCode, "Verification code copied");
        });
      });
      document.querySelectorAll("[data-copy-text]").forEach(btn => {
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          copyToClipboard(btn.dataset.copyText, "Copied to clipboard");
        });
      });

      // ── Attendee Pass PNG Download in Admin Roster ──
      teams.forEach(team => {
        (team.members || []).forEach((m, idx) => {
          const dlBtn = document.getElementById(`downloadIdCardBtn_${team.group_id}_${idx}`);
          dlBtn?.addEventListener("click", (e) => {
            e.stopPropagation();
            downloadDigitalIdCardPNG(team, m, idx);
          });
        });
      });

      // ── Single Team Delete ──
      document.querySelectorAll(".dash-delete-team").forEach(btn => {
        btn.addEventListener("click", async (e) => {
          e.stopPropagation();
          const groupId = btn.dataset.groupId;
          if (!confirm(`Permanently delete team ${groupId}? This cannot be undone.`)) return;

          try {
            const res = await Auth.apiFetch(`/admin/teams/${groupId}`, { method: "DELETE" });
            if (res.ok) {
              btn.closest(".dash-team-row").remove();
              showToast(`Team ${groupId} deleted`);
              const remaining = document.querySelectorAll(".dash-team-row:not([hidden])").length;
              document.getElementById("teamResultCount").textContent = `${remaining} ${remaining === 1 ? "team" : "teams"}`;
            } else {
              const err = await res.json().catch(() => ({}));
              showToast(err.detail || "Failed to delete team", "error");
            }
          } catch {
            showToast("Server communication error", "error");
          }
        });
      });

      // ── Master Admin: Smart Bulk Actions ──
      if (isMaster) {
        const teamsContainer = document.getElementById("teamsListContainer");
        const bulkBar = document.getElementById("dashBulkBar");
        const selectedTeamsCount = document.getElementById("selectedTeamsCount");
        const deleteSelectedButton = document.getElementById("deleteSelectedTeamsBtn");
        const clearSelectedButton = document.getElementById("clearSelectedTeamsBtn");

        const selectedTeamIds = () => [...teamsContainer.querySelectorAll(".dash-team-select:checked")].map(input => input.value);

        const updateBulkActions = () => {
          const ids = selectedTeamIds();
          const count = ids.length;
          if (count > 0) {
            bulkBar.style.display = "flex";
            selectedTeamsCount.textContent = count;
            deleteSelectedButton.disabled = false;
            clearSelectedButton.disabled = false;
          } else {
            bulkBar.style.display = "none";
            selectedTeamsCount.textContent = "0";
            deleteSelectedButton.disabled = true;
            clearSelectedButton.disabled = true;
          }
        };

        const deleteSelectedTeams = async (ids) => {
          if (!ids.length) {
            showToast("Select at least one team first", "error");
            return;
          }
          const label = ids.length === teams.length ? "ALL registered teams" : `${ids.length} selected team(s)`;
          if (!confirm(`Step 1 Confirmation: permanently delete ${label} and associated assets?`)) return;
          const typed = prompt('Step 2 Confirmation: type DELETE TEAMS to confirm.');
          if (typed !== "DELETE TEAMS") return;

          try {
            const response = await Auth.apiFetch("/admin/teams/bulk-delete", {
              method: "POST",
              body: JSON.stringify({ group_ids: ids, confirmation: typed })
            });
            const result = await response.json().catch(() => ({}));
            if (!response.ok) {
              showToast(result.detail || "Unable to delete selected teams.", "error");
              return;
            }
            showToast(`Deleted ${result.deleted.length} team records.`);
            setTimeout(() => window.location.reload(), 700);
          } catch {
            showToast("Failed to perform bulk deletion", "error");
          }
        };

        deleteSelectedButton?.addEventListener("click", () => deleteSelectedTeams(selectedTeamIds()));
        document.getElementById("deleteAllTeamsBtn")?.addEventListener("click", () => deleteSelectedTeams(teams.map(team => team.group_id)));

        document.getElementById("selectAllTeamsBtn")?.addEventListener("click", () => {
          teamsContainer.querySelectorAll(".dash-team-row:not([hidden]) .dash-team-select").forEach(input => { input.checked = true; });
          updateBulkActions();
        });

        clearSelectedButton?.addEventListener("click", () => {
          teamsContainer.querySelectorAll(".dash-team-select").forEach(input => { input.checked = false; });
          updateBulkActions();
        });

        teamsContainer.querySelectorAll(".dash-team-select").forEach((input) => {
          input.addEventListener("change", updateBulkActions);
        });
      }

      // ── Master Admin: Staff Directory & Invite System ──
      const inviteForm = document.getElementById("adminInviteForm");
      if (isMaster) {
        let cachedAdmins = [];
        const list = document.getElementById("adminAccountsList");
        const countBadge = document.getElementById("adminCountBadge");
        const telemetryCount = document.getElementById("adminTelemetryCount");
        const staffSearchInput = document.getElementById("staffSearchInput");

        const renderStaffGrid = (admins) => {
          if (!list) return;
          const humanize = (value) => String(value || "Not assigned").replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
          const staffName = (value) => String(value || "Admin Member").replace(/\s*\((?:master\s*)?admin\)\s*$/i, "").trim() || "Admin Member";
          const initials = (value) => staffName(value).split(/\s+/).slice(0, 2).map(p => p[0]).join("").toUpperCase();

          list.innerHTML = admins.length ? admins.map((admin) => {
            const name = staffName(admin.name);
            const email = String(admin.email || "");
            const role = humanize(admin.role || "admin");
            const department = humanize(admin.department || "Technical Team");
            const isMasterAcc = admin.role === "master_admin";
            const state = admin.must_change_password ? "Invite pending" : "Active";

            return `
              <article class="dash-staff-card" data-searchable="${escapeHTML(`${name} ${email} ${role} ${department}`.toLowerCase())}">
                <div class="dash-staff-card-left">
                  <div class="dash-staff-avatar" aria-hidden="true">${escapeHTML(initials(admin.name))}</div>
                  <div class="dash-staff-card-body">
                    <h4>${escapeHTML(name)}</h4>
                    <span class="dash-staff-role-pill">${escapeHTML(role)}</span>
                    <span class="dash-staff-dept">${escapeHTML(department)}</span>
                    <div class="dash-staff-email-line">
                      ${email ? `<a href="mailto:${escapeHTML(email)}" title="Send email">${escapeHTML(email)}</a>` : '<span style="color:var(--muted-ink);">No email assigned</span>'}
                      ${email ? `<button type="button" class="dash-contact-copy-btn" data-copy-email="${escapeHTML(email)}" aria-label="Copy email">${getIcon("copy", "dash-icon--xs")}</button>` : ""}
                    </div>
                    <div class="dash-staff-onboard-line" title="Admin onboarding timestamp">
                      ${getIcon("calendar", "dash-icon--xs")}
                      <span>Onboarded: ${escapeHTML(formatRegistrationDateTime(admin.created_at))}</span>
                    </div>
                  </div>
                </div>
                <div class="dash-staff-card-right">
                  <span class="dash-staff-presence ${admin.must_change_password ? "is-pending" : "is-active"}">
                    <i class="pulse-dot" style="width:5px;height:5px;display:inline-block;border-radius:50%;background:${admin.must_change_password ? '#e69500' : '#15b85a'};"></i>
                    ${state}
                  </span>
                  ${isMasterAcc ? '<span class="dash-staff-protected">Protected</span>' : `<button class="dash-remove-admin" data-email="${escapeHTML(email)}" type="button">${getIcon("trash", "dash-icon--xs")} Remove</button>`}
                </div>
              </article>
            `;
          }).join("") : '<p class="dash-empty-state">No staff accounts match that search.</p>';

          list.querySelectorAll(".dash-remove-admin").forEach(btn => {
            btn.addEventListener("click", async () => {
              if (!confirm(`Revoke access for administrator ${btn.dataset.email}?`)) return;
              try {
                const res = await Auth.apiFetch(`/admin/accounts/${encodeURIComponent(btn.dataset.email)}`, { method: "DELETE" });
                if (res.ok) {
                  showToast(`Revoked access for ${btn.dataset.email}`);
                  await loadAdminAccounts();
                } else {
                  showToast("Failed to remove administrator", "error");
                }
              } catch {
                showToast("Server communication error", "error");
              }
            });
          });

          list.querySelectorAll("[data-copy-email]").forEach(btn => {
            btn.addEventListener("click", () => copyToClipboard(btn.dataset.copyEmail, "Staff email copied"));
          });
        };

        const loadAdminAccounts = async () => {
          const res = await Auth.apiFetch("/admin/accounts");
          if (!res.ok) return;
          cachedAdmins = await res.json();
          if (countBadge) countBadge.textContent = `${cachedAdmins.length} ${cachedAdmins.length === 1 ? 'officer' : 'officers'}`;
          if (telemetryCount) telemetryCount.textContent = cachedAdmins.length;
          renderStaffGrid(cachedAdmins);
        };

        staffSearchInput?.addEventListener("input", () => {
          const q = staffSearchInput.value.toLowerCase().trim();
          if (!q) {
            renderStaffGrid(cachedAdmins);
            return;
          }
          const filtered = cachedAdmins.filter(a => {
            const str = `${a.name} ${a.email} ${a.role} ${a.department}`.toLowerCase();
            return str.includes(q);
          });
          renderStaffGrid(filtered);
        });

        inviteForm?.addEventListener("submit", async (event) => {
          event.preventDefault();
          const status = document.getElementById("adminInviteStatus");
          const revealCard = document.getElementById("credentialRevealCard");
          const revealedPass = document.getElementById("revealedTempPassword");
          status.className = "dash-invite-status-msg";
          status.textContent = "Generating cryptographic credentials…";

          try {
            const res = await Auth.apiFetch("/admin/accounts", {
              method: "POST",
              body: JSON.stringify({
                name: document.getElementById("inviteName").value.trim(),
                email: document.getElementById("inviteEmail").value.trim(),
                department: document.getElementById("inviteDepartment").value,
                role: document.getElementById("inviteRole").value,
                password: document.getElementById("invitePassword").value || null
              })
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
              status.classList.add("is-error");
              status.textContent = data.detail || "Staff invitation could not be created.";
              return;
            }
            status.textContent = "Credential issued successfully!";
            showToast("New staff officer onboarded!");

            if (data.temp_password) {
              revealedPass.textContent = data.temp_password;
              revealCard.style.display = "flex";
              document.getElementById("copyTempPasswordBtn").onclick = () => {
                copyToClipboard(data.temp_password, "Temporary password copied");
              };
            }

            inviteForm.reset();
            await loadAdminAccounts();
          } catch {
            status.classList.add("is-error");
            status.textContent = "Server error while saving invitation.";
          }
        });

        loadAdminAccounts().catch(() => {});
      }

    } catch (err) {
      main.setAttribute("aria-busy", "false");
      main.innerHTML = `
        <div class="dash-container">
          <div class="dash-error-card" role="alert">
            <h2>Unable to Load Admin Panel</h2>
            <p>${escapeHTML(err.message || "Please check your network connection and session.")}</p>
            <div style="display:flex;gap:0.75rem;justify-content:center;margin-top:1.25rem;flex-wrap:wrap;">
              <button class="button button--ink" type="button" id="dashRetryAdminBtn">Retry Connection <span aria-hidden="true">↻</span></button>
              <a class="button button--ghost" href="login">Back to Login <span aria-hidden="true">→</span></a>
            </div>
          </div>
        </div>
      `;
      document.getElementById("dashRetryAdminBtn")?.addEventListener("click", () => {
        main.setAttribute("aria-busy", "true");
        main.innerHTML = `<div class="dash-container" style="padding:4rem 1rem;text-align:center;"><p class="dash-empty-state">Reconnecting to secure gateway…</p></div>`;
        renderAdminDashboard(session);
      });
    }
  }

  // ════════════════════════════════════════════════════════════════
  //  MASTER ADMIN ANALYTICS, ACTIVITY & DEVICE INSIGHTS ENGINE
  // ════════════════════════════════════════════════════════════════

  function renderAnalyticsPanelMarkup() {
    return `
      <!-- ═════ TAB 3: MASTER ADMIN ANALYTICS & ACTIVITY HUB (MASTER ADMIN ONLY) ═════ -->
      <section id="analyticsDataPanel" class="dash-data-panel" role="tabpanel" aria-labelledby="analyticsDataTab" tabindex="-1" hidden>
        <div class="dash-analytics-hub">
          <!-- Top bar with title, status, and telemetry actions -->
          <div class="dash-analytics-topbar">
            <div class="dash-analytics-title-area">
              <h2 class="dash-analytics-title">Master Intelligence & Telemetry Hub</h2>
              <span class="dash-pill-tag pulse-pill">${getIcon("activity", "dash-icon--xs")} VAULT ENCRYPTED</span>
              <span class="dash-pill-tag" id="analyticsLastSync">Syncing…</span>
            </div>
            <div class="dash-analytics-actions">
              <button type="button" class="dash-btn-telemetry" id="analyticsAutoRefreshBtn" title="Toggle automatic 15s refresh">
                ${getIcon("refresh", "dash-icon--xs")}
                <span id="analyticsAutoRefreshLabel">Auto: ON</span>
              </button>
              <button type="button" class="dash-btn-telemetry" id="analyticsManualRefreshBtn" title="Refresh all telemetry data">
                ${getIcon("refresh", "dash-icon--xs")}
                <span>Refresh</span>
              </button>
              <button type="button" class="dash-btn-telemetry dash-btn-telemetry--danger" id="analyticsRetentionBtn" title="Manage data retention & purge">
                ${getIcon("trash", "dash-icon--xs")}
                <span>Data Retention</span>
              </button>
            </div>
          </div>

          <!-- Offline Alert Banner (Dynamically shown if gateway is unreachable) -->
          <div id="analyticsOfflineBanner" class="dash-analytics-offline-banner" style="display:none;" hidden>
            <h3>${getIcon("alert-triangle", "dash-icon--sm")} Secure Gateway Offline</h3>
            <p>Telemetry intelligence is dynamically served from the encrypted server vault. Real-time metrics and audit logs are unavailable while the backend gateway is disconnected.</p>
            <div style="margin-top:0.5rem;">
              <button type="button" class="dash-btn-telemetry" id="analyticsOfflineRetryBtn">Retry Gateway Connection ↻</button>
            </div>
          </div>

          <!-- Sub-view Segmented Tabs -->
          <div class="dash-analytics-subnav" role="tablist" aria-label="Analytics subviews">
            <button type="button" class="dash-subnav-btn is-active" data-subview="overview">
              ${getIcon("activity", "dash-icon--xs")} Overview
            </button>
            <button type="button" class="dash-subnav-btn" data-subview="admin-activity">
              ${getIcon("shield", "dash-icon--xs")} Admin Activity & Audit
            </button>
            <button type="button" class="dash-subnav-btn" data-subview="visitors">
              ${getIcon("users", "dash-icon--xs")} Visitors & Squads
            </button>
            <button type="button" class="dash-subnav-btn" data-subview="devices">
              ${getIcon("monitor", "dash-icon--xs")} Device & Browser Intel
            </button>
            <button type="button" class="dash-subnav-btn" data-subview="geography">
              ${getIcon("globe", "dash-icon--xs")} Geography & Networks
            </button>
            <button type="button" class="dash-subnav-btn" data-subview="sessions">
              ${getIcon("eye", "dash-icon--xs")} Session Explorer
            </button>
          </div>

          <!-- Subview 1: Overview -->
          <div id="subviewOverview" class="dash-analytics-subview-panel">
            <div class="dash-analytics-kpi-grid" id="analyticsKpiGrid">
              <p class="dash-empty-state">Loading telemetry metrics…</p>
            </div>

            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1rem; margin-top: 1rem;">
              <div class="dash-chart-card">
                <div class="dash-chart-header">
                  <h3 class="dash-chart-title">24-Hour Traffic Curve</h3>
                  <span class="mono-label" style="color:var(--acid);">Hourly Volume</span>
                </div>
                <div class="dash-chart-bars-wrap" id="analyticsHourlyChart"></div>
              </div>

              <div class="dash-chart-card">
                <div class="dash-chart-header">
                  <h3 class="dash-chart-title">Visitor Conversion Funnel</h3>
                  <span class="mono-label" style="color:var(--acid);" id="funnelConvRate">0% Conv.</span>
                </div>
                <div class="dash-funnel-stages" id="analyticsFunnelStages"></div>
              </div>
            </div>

            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1rem; margin-top: 1rem;">
              <div class="dash-chart-card">
                <h3 class="dash-chart-title">Most Visited Pages</h3>
                <div id="analyticsTopPagesList"></div>
              </div>
              <div class="dash-chart-card">
                <h3 class="dash-chart-title">Top Exit Pages</h3>
                <div id="analyticsTopExitsList"></div>
              </div>
            </div>
          </div>

          <!-- Subview 2: Admin Activity & Audit -->
          <div id="subviewAdminActivity" class="dash-analytics-subview-panel" style="display:none;" hidden>
            <div class="dash-admin-activity-section">
              <div class="dash-section-header-row">
                <h3 class="dash-analytics-section-title">
                  ${getIcon("users", "dash-icon--sm")} Active Administrators Roster
                </h3>
                <span class="dash-presence-status-pill" id="activeAdminCountLabel">0 ACTIVE NOW</span>
              </div>
              <div class="dash-presence-grid" id="analyticsPresenceGrid"></div>
            </div>

            <div class="dash-admin-activity-section">
              <div class="dash-section-header-row">
                <h3 class="dash-analytics-section-title dash-analytics-section-title--danger">
                  ${getIcon("alert-triangle", "dash-icon--sm")} Suspicious Authentication & Defense Alerts
                </h3>
              </div>
              <div class="dash-security-alerts" id="analyticsSecurityAlerts"></div>
            </div>

            <div class="dash-admin-activity-section">
              <div class="dash-section-header-row">
                <h3 class="dash-analytics-section-title">
                  ${getIcon("shield", "dash-icon--sm")} Administrative Audit Log
                </h3>
              </div>
              <div class="dash-filter-toolbar">
                <div class="dash-filter-field dash-filter-field--search">
                  <span class="dash-filter-icon">${getIcon("search", "dash-icon--xs")}</span>
                  <input type="text" id="adminFilterEmail" class="dash-filter-input" placeholder="Search Admin / Email…">
                </div>
                <div class="dash-filter-field dash-filter-field--select">
                  <div class="dash-custom-select" id="adminActionDropdown">
                    <button type="button" class="dash-custom-select-trigger" id="adminActionTrigger" aria-haspopup="listbox" aria-expanded="false" aria-label="Filter by administrative action">
                      <span class="dash-custom-select-badge dash-action-tag--default" id="adminActionTriggerBadge">ALL</span>
                      <span class="dash-custom-select-label" id="adminActionTriggerLabel">All Actions</span>
                      <span class="dash-custom-select-arrow" aria-hidden="true">${getIcon("chevron", "dash-icon--xs")}</span>
                    </button>
                    <div class="dash-custom-select-menu" id="adminActionMenu" role="listbox" aria-label="Action filter options" hidden>
                      <div class="dash-custom-select-scroll">
                        <div class="dash-custom-opt is-selected" data-value="" role="option" aria-selected="true">
                          <span class="dash-custom-opt-badge dash-action-tag--default">ALL</span>
                          <span class="dash-custom-opt-name">All Actions</span>
                          <span class="dash-custom-opt-check" aria-hidden="true">${getIcon("check", "dash-icon--xs")}</span>
                        </div>
                        <div class="dash-custom-opt" data-value="LOGIN" role="option">
                          <span class="dash-custom-opt-badge dash-action-tag--login">LOGIN</span>
                          <span class="dash-custom-opt-name">Admin Login</span>
                          <span class="dash-custom-opt-check" aria-hidden="true">${getIcon("check", "dash-icon--xs")}</span>
                        </div>
                        <div class="dash-custom-opt" data-value="LOGIN_FAILED" role="option">
                          <span class="dash-custom-opt-badge dash-action-tag--delete">FAILED</span>
                          <span class="dash-custom-opt-name">Failed Login Alert</span>
                          <span class="dash-custom-opt-check" aria-hidden="true">${getIcon("check", "dash-icon--xs")}</span>
                        </div>
                        <div class="dash-custom-opt" data-value="DELETE_TEAM" role="option">
                          <span class="dash-custom-opt-badge dash-action-tag--delete">DELETE</span>
                          <span class="dash-custom-opt-name">Delete Squad</span>
                          <span class="dash-custom-opt-check" aria-hidden="true">${getIcon("check", "dash-icon--xs")}</span>
                        </div>
                        <div class="dash-custom-opt" data-value="BULK_DELETE_TEAMS" role="option">
                          <span class="dash-custom-opt-badge dash-action-tag--delete">PURGE</span>
                          <span class="dash-custom-opt-name">Bulk Delete Squads</span>
                          <span class="dash-custom-opt-check" aria-hidden="true">${getIcon("check", "dash-icon--xs")}</span>
                        </div>
                        <div class="dash-custom-opt" data-value="VERIFY_PASS" role="option">
                          <span class="dash-custom-opt-badge dash-action-tag--verify">VERIFY</span>
                          <span class="dash-custom-opt-name">Verify Attendee Pass</span>
                          <span class="dash-custom-opt-check" aria-hidden="true">${getIcon("check", "dash-icon--xs")}</span>
                        </div>
                        <div class="dash-custom-opt" data-value="CREATE_ADMIN" role="option">
                          <span class="dash-custom-opt-badge dash-action-tag--create">PROVISION</span>
                          <span class="dash-custom-opt-name">Create Staff Officer</span>
                          <span class="dash-custom-opt-check" aria-hidden="true">${getIcon("check", "dash-icon--xs")}</span>
                        </div>
                        <div class="dash-custom-opt" data-value="DELETE_ADMIN" role="option">
                          <span class="dash-custom-opt-badge dash-action-tag--delete">REVOKE</span>
                          <span class="dash-custom-opt-name">Delete Staff Account</span>
                          <span class="dash-custom-opt-check" aria-hidden="true">${getIcon("check", "dash-icon--xs")}</span>
                        </div>
                        <div class="dash-custom-opt" data-value="EXPORT_CSV" role="option">
                          <span class="dash-custom-opt-badge dash-action-tag--default">CSV</span>
                          <span class="dash-custom-opt-name">Export CSV Vault</span>
                          <span class="dash-custom-opt-check" aria-hidden="true">${getIcon("check", "dash-icon--xs")}</span>
                        </div>
                        <div class="dash-custom-opt" data-value="IMPORT_CSV" role="option">
                          <span class="dash-custom-opt-badge dash-action-tag--default">IMPORT</span>
                          <span class="dash-custom-opt-name">Import CSV Records</span>
                          <span class="dash-custom-opt-check" aria-hidden="true">${getIcon("check", "dash-icon--xs")}</span>
                        </div>
                        <div class="dash-custom-opt" data-value="CHANGE_PASSWORD" role="option">
                          <span class="dash-custom-opt-badge dash-action-tag--verify">KEY</span>
                          <span class="dash-custom-opt-name">Change Password</span>
                          <span class="dash-custom-opt-check" aria-hidden="true">${getIcon("check", "dash-icon--xs")}</span>
                        </div>
                        <div class="dash-custom-opt" data-value="RETENTION_PURGE" role="option">
                          <span class="dash-custom-opt-badge dash-action-tag--delete">RETENTION</span>
                          <span class="dash-custom-opt-name">Vault Retention Purge</span>
                          <span class="dash-custom-opt-check" aria-hidden="true">${getIcon("check", "dash-icon--xs")}</span>
                        </div>
                      </div>
                    </div>
                    <select id="adminFilterAction" class="sr-only" tabindex="-1" aria-hidden="true">
                      <option value="">All Actions</option>
                      <option value="LOGIN">LOGIN</option>
                      <option value="LOGIN_FAILED">LOGIN_FAILED</option>
                      <option value="DELETE_TEAM">DELETE_TEAM</option>
                      <option value="BULK_DELETE_TEAMS">BULK_DELETE_TEAMS</option>
                      <option value="VERIFY_PASS">VERIFY_PASS</option>
                      <option value="CREATE_ADMIN">CREATE_ADMIN</option>
                      <option value="DELETE_ADMIN">DELETE_ADMIN</option>
                      <option value="EXPORT_CSV">EXPORT_CSV</option>
                      <option value="IMPORT_CSV">IMPORT_CSV</option>
                      <option value="CHANGE_PASSWORD">CHANGE_PASSWORD</option>
                      <option value="RETENTION_PURGE">RETENTION_PURGE</option>
                    </select>
                  </div>
                </div>
                <div class="dash-filter-field dash-filter-field--ip">
                  <span class="dash-filter-icon">${getIcon("globe", "dash-icon--xs")}</span>
                  <input type="text" id="adminFilterIp" class="dash-filter-input" placeholder="Filter by IP…">
                </div>
                <button type="button" id="adminFilterResetBtn" class="dash-btn-telemetry dash-filter-reset-btn">
                  ${getIcon("refresh", "dash-icon--xs")} <span>Reset</span>
                </button>
              </div>
              <div class="dash-table-scroll-hint">
                ${getIcon("chevron", "dash-icon--xs")} <span>Swipe horizontally to inspect full audit log</span>
              </div>
              <div class="dash-analytics-table-wrap">
                <table class="dash-analytics-table" id="adminActivityTable">
                  <thead>
                    <tr>
                      <th>Timestamp</th>
                      <th>Administrator</th>
                      <th>Role & Dept</th>
                      <th>Action</th>
                      <th>Target Entity</th>
                      <th>Page</th>
                      <th>IP / Network</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody id="adminActivityTableBody"></tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- Subview 3: Visitors & Squad Behavior -->
          <div id="subviewVisitors" class="dash-analytics-subview-panel" style="display:none;" hidden>
            <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap:1rem;">
              <div class="dash-chart-card">
                <div class="dash-chart-header">
                  <h3 class="dash-chart-title">Landing / Anonymous Visitors</h3>
                  <span class="dash-pill-tag" style="background:rgba(255,255,255,0.08);">UNREGISTERED</span>
                </div>
                <p style="font-size:0.8rem; color:rgba(255,253,249,0.7); margin:0;">
                  Anonymous sessions who browse without registration. Maintained in separate records.
                </p>
                <div id="anonVisitorsStats" style="margin-top:0.75rem;"></div>
              </div>

              <div class="dash-chart-card">
                <div class="dash-chart-header">
                  <h3 class="dash-chart-title">Registered Squads & Accounts</h3>
                  <span class="dash-pill-tag dash-pill-tag--acid">AUTHENTICATED</span>
                </div>
                <p style="font-size:0.8rem; color:rgba(255,253,249,0.7); margin:0;">
                  Registered team squads linked to account IDs, preserving privacy-safe audit associations.
                </p>
                <div id="registeredUsersStats" style="margin-top:0.75rem;"></div>
              </div>
            </div>

            <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap:1rem; margin-top:1rem;">
              <div class="dash-chart-card">
                <h3 class="dash-chart-title">Common Navigation Sequences</h3>
                <div id="analyticsNavPaths"></div>
              </div>
              <div class="dash-chart-card">
                <h3 class="dash-chart-title">Session Duration Distribution</h3>
                <div id="analyticsDurationBuckets"></div>
              </div>
            </div>
          </div>

          <!-- Subview 4: Device & Browser Intel -->
          <div id="subviewDevices" class="dash-analytics-subview-panel" style="display:none;" hidden>
            <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap:1rem;">
              <div class="dash-chart-card">
                <h3 class="dash-chart-title">Device Categories</h3>
                <div id="deviceTypesList"></div>
              </div>
              <div class="dash-chart-card">
                <h3 class="dash-chart-title">Operating Systems</h3>
                <div id="operatingSystemsList"></div>
              </div>
              <div class="dash-chart-card">
                <h3 class="dash-chart-title">Browser Engines</h3>
                <div id="browsersList"></div>
              </div>
              <div class="dash-chart-card">
                <h3 class="dash-chart-title">Screen Resolutions</h3>
                <div id="screenResolutionsList"></div>
              </div>
            </div>

            <div class="dash-chart-card" style="margin-top:1rem;">
              <h3 class="dash-chart-title">Technical Categorization & Privacy Compliance Matrix</h3>
              <p style="font-size:0.78rem; color:rgba(255,253,249,0.65); margin:0.35rem 0 1rem 0;">
                Distinguishes browser-reported APIs, server-derived network attributes, explicitly provided user identity, and privacy-restricted hardware boundaries.
              </p>
              <div class="dash-analytics-table-wrap">
                <table class="dash-analytics-table">
                  <thead>
                    <tr>
                      <th>1. Browser-Supplied</th>
                      <th>2. Server-Derived</th>
                      <th>3. User-Provided</th>
                      <th>4. Privacy-Restricted</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Screen Dimensions, Viewport Size, DPR, Display Color Depth, Language & Timezone, Hardware Concurrency, Device Memory (if granted)</td>
                      <td>True IP Address (IPv4/IPv6), Network Classification, Approx Geo (Country/City from CF Tunnel), Parsed Browser & OS Name</td>
                      <td>Team Name, Group ID, Registered Tracks, College Affiliation, Member Roster, Credentials</td>
                      <td>Exact GPS Latitude/Longitude (Not requested), Battery Status (Deprecated), Hardware Serial/MAC (Sandboxed), Canvas Hash (Anti-fingerprinting compliance)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- Subview 5: Geography & Networks -->
          <div id="subviewGeography" class="dash-analytics-subview-panel" style="display:none;" hidden>
            <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap:1rem;">
              <div class="dash-chart-card">
                <h3 class="dash-chart-title">Top Countries / Territorials</h3>
                <div id="countriesList"></div>
              </div>
              <div class="dash-chart-card">
                <h3 class="dash-chart-title">Top Regions & Cities</h3>
                <div id="citiesList"></div>
              </div>
              <div class="dash-chart-card">
                <h3 class="dash-chart-title">Network Providers / ASNs</h3>
                <div id="providersList"></div>
              </div>
              <div class="dash-chart-card">
                <h3 class="dash-chart-title">IP & Routing Classification</h3>
                <div id="ipClassList"></div>
              </div>
            </div>
          </div>

          <!-- Subview 6: Session Explorer -->
          <div id="subviewSessions" class="dash-analytics-subview-panel" style="display:none;" hidden>
            <div class="dash-filter-toolbar">
              <div class="dash-filter-field dash-filter-field--search">
                <span class="dash-filter-icon">${getIcon("search", "dash-icon--xs")}</span>
                <input type="text" id="sessionSearchInput" class="dash-filter-input" placeholder="Search Session ID / Visitor ID…">
              </div>
              <div class="dash-filter-field dash-filter-field--select">
                <div class="dash-custom-select" id="sessionTypeDropdown">
                  <button type="button" class="dash-custom-select-trigger" id="sessionTypeTrigger" aria-haspopup="listbox" aria-expanded="false" aria-label="Filter by session type">
                    <span class="dash-custom-select-badge dash-action-tag--default" id="sessionTypeTriggerBadge">ALL</span>
                    <span class="dash-custom-select-label" id="sessionTypeTriggerLabel">All Session Types</span>
                    <span class="dash-custom-select-arrow" aria-hidden="true">${getIcon("chevron", "dash-icon--xs")}</span>
                  </button>
                  <div class="dash-custom-select-menu" id="sessionTypeMenu" role="listbox" aria-label="Session type filter options" hidden>
                    <div class="dash-custom-select-scroll">
                      <div class="dash-custom-opt is-selected" data-value="" role="option" aria-selected="true">
                        <span class="dash-custom-opt-badge dash-action-tag--default">ALL</span>
                        <span class="dash-custom-opt-name">All Session Types</span>
                        <span class="dash-custom-opt-check" aria-hidden="true">${getIcon("check", "dash-icon--xs")}</span>
                      </div>
                      <div class="dash-custom-opt" data-value="anonymous_visitor" role="option">
                        <span class="dash-custom-opt-badge dash-action-tag--login">ANON</span>
                        <span class="dash-custom-opt-name">Anonymous Visitor</span>
                        <span class="dash-custom-opt-check" aria-hidden="true">${getIcon("check", "dash-icon--xs")}</span>
                      </div>
                      <div class="dash-custom-opt" data-value="registered_user" role="option">
                        <span class="dash-custom-opt-badge dash-action-tag--create">USER</span>
                        <span class="dash-custom-opt-name">Registered Squad User</span>
                        <span class="dash-custom-opt-check" aria-hidden="true">${getIcon("check", "dash-icon--xs")}</span>
                      </div>
                      <div class="dash-custom-opt" data-value="admin" role="option">
                        <span class="dash-custom-opt-badge dash-action-tag--verify">ADMIN</span>
                        <span class="dash-custom-opt-name">Admin Officer</span>
                        <span class="dash-custom-opt-check" aria-hidden="true">${getIcon("check", "dash-icon--xs")}</span>
                      </div>
                    </div>
                  </div>
                  <select id="sessionFilterType" class="sr-only" tabindex="-1" aria-hidden="true">
                    <option value="">All Session Types</option>
                    <option value="anonymous_visitor">Anonymous Visitor</option>
                    <option value="registered_user">Registered User</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
              </div>
              <div class="dash-filter-field dash-filter-field--select">
                <div class="dash-custom-select" id="sessionDeviceDropdown">
                  <button type="button" class="dash-custom-select-trigger" id="sessionDeviceTrigger" aria-haspopup="listbox" aria-expanded="false" aria-label="Filter by device category">
                    <span class="dash-custom-select-badge dash-action-tag--default" id="sessionDeviceTriggerBadge">ALL</span>
                    <span class="dash-custom-select-label" id="sessionDeviceTriggerLabel">All Devices</span>
                    <span class="dash-custom-select-arrow" aria-hidden="true">${getIcon("chevron", "dash-icon--xs")}</span>
                  </button>
                  <div class="dash-custom-select-menu" id="sessionDeviceMenu" role="listbox" aria-label="Device category filter options" hidden>
                    <div class="dash-custom-select-scroll">
                      <div class="dash-custom-opt is-selected" data-value="" role="option" aria-selected="true">
                        <span class="dash-custom-opt-badge dash-action-tag--default">ALL</span>
                        <span class="dash-custom-opt-name">All Devices</span>
                        <span class="dash-custom-opt-check" aria-hidden="true">${getIcon("check", "dash-icon--xs")}</span>
                      </div>
                      <div class="dash-custom-opt" data-value="Desktop" role="option">
                        <span class="dash-custom-opt-badge dash-action-tag--create">DESK</span>
                        <span class="dash-custom-opt-name">Desktop Viewport</span>
                        <span class="dash-custom-opt-check" aria-hidden="true">${getIcon("check", "dash-icon--xs")}</span>
                      </div>
                      <div class="dash-custom-opt" data-value="Mobile" role="option">
                        <span class="dash-custom-opt-badge dash-action-tag--verify">MOBI</span>
                        <span class="dash-custom-opt-name">Mobile Device</span>
                        <span class="dash-custom-opt-check" aria-hidden="true">${getIcon("check", "dash-icon--xs")}</span>
                      </div>
                      <div class="dash-custom-opt" data-value="Tablet" role="option">
                        <span class="dash-custom-opt-badge dash-action-tag--delete">TAB</span>
                        <span class="dash-custom-opt-name">Tablet Viewport</span>
                        <span class="dash-custom-opt-check" aria-hidden="true">${getIcon("check", "dash-icon--xs")}</span>
                      </div>
                    </div>
                  </div>
                  <select id="sessionFilterDevice" class="sr-only" tabindex="-1" aria-hidden="true">
                    <option value="">All Devices</option>
                    <option value="Desktop">Desktop</option>
                    <option value="Mobile">Mobile</option>
                    <option value="Tablet">Tablet</option>
                  </select>
                </div>
              </div>
              <button type="button" id="sessionFilterResetBtn" class="dash-btn-telemetry dash-filter-reset-btn">
                ${getIcon("refresh", "dash-icon--xs")} <span>Reset</span>
              </button>
            </div>
            <div class="dash-analytics-table-wrap" style="margin-top:1rem;">
              <table class="dash-analytics-table" id="sessionsExplorerTable">
                <thead>
                  <tr>
                    <th>Session ID</th>
                    <th>Type</th>
                    <th>Visitor ID / User</th>
                    <th>Device & OS</th>
                    <th>Country</th>
                    <th>Pages Visited</th>
                    <th>Duration</th>
                    <th>Last Active</th>
                    <th>Inspect</th>
                  </tr>
                </thead>
                <tbody id="sessionsExplorerTableBody"></tbody>
              </table>
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:1rem; font:600 0.72rem var(--mono);">
              <span id="sessionPaginationInfo" style="color:rgba(255,253,249,0.6);">Showing 0 sessions</span>
              <div style="display:flex; gap:0.5rem;">
                <button type="button" id="sessionPrevPageBtn" class="dash-btn-telemetry">← Previous</button>
                <button type="button" id="sessionNextPageBtn" class="dash-btn-telemetry">Next →</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Retention Purge Dialog (Master Admin Only) -->
        <div id="analyticsRetentionModal" class="dash-modal" style="display:none;" hidden>
          <div class="dash-modal-backdrop" id="analyticsRetentionBackdrop"></div>
          <div class="dash-modal-dialog dash-retention-dialog">
            <div class="dash-modal-header">
              <div class="dash-modal-header-title">
                <span class="dash-modal-shield">${getIcon("shield", "dash-icon--sm")}</span>
                <h3 class="dash-modal-title">Data Retention & Privacy Policy</h3>
              </div>
              <button type="button" class="dash-modal-close-btn" id="retentionCloseTopBtn" aria-label="Close retention modal">✕</button>
            </div>
            
            <div class="dash-modal-body">
              <div class="dash-retention-notice-card">
                <div class="dash-retention-notice-icon">${getIcon("trash", "dash-icon--sm")}</div>
                <div class="dash-retention-notice-text">
                  <p class="dash-retention-desc">
                    In compliance with privacy and data protection standards, telemetry records and anonymous session trails older than the configured threshold can be permanently purged from the encrypted AES-256 database vault.
                  </p>
                  <span class="dash-retention-badge">AES-256 GCM ENCRYPTED PURGE</span>
                </div>
              </div>

              <div class="dash-retention-control-group">
                <label for="retentionDaysTrigger" class="dash-retention-label">Purge Records Older Than:</label>
                <div class="dash-retention-select-wrap">
                  <div class="dash-custom-select" id="retentionDaysDropdown">
                    <button type="button" class="dash-custom-select-trigger" id="retentionDaysTrigger" aria-haspopup="listbox" aria-expanded="false" aria-label="Select data retention window">
                      <span class="dash-custom-select-badge dash-action-tag--verify" id="retentionDaysTriggerBadge">30D</span>
                      <span class="dash-custom-select-label" id="retentionDaysTriggerLabel">30 Days (Standard Retention)</span>
                      <span class="dash-custom-select-arrow" aria-hidden="true">${getIcon("chevron", "dash-icon--xs")}</span>
                    </button>
                    <div class="dash-custom-select-menu" id="retentionDaysMenu" role="listbox" aria-label="Retention duration options" hidden>
                      <div class="dash-custom-select-scroll">
                        <div class="dash-custom-opt" data-value="7" role="option">
                          <span class="dash-custom-opt-badge dash-action-tag--delete">7D</span>
                          <span class="dash-custom-opt-name">7 Days (Aggressive Privacy Cycle)</span>
                          <span class="dash-custom-opt-check" aria-hidden="true">${getIcon("check", "dash-icon--xs")}</span>
                        </div>
                        <div class="dash-custom-opt" data-value="14" role="option">
                          <span class="dash-custom-opt-badge dash-action-tag--create">14D</span>
                          <span class="dash-custom-opt-name">14 Days (Bi-weekly Scrub)</span>
                          <span class="dash-custom-opt-check" aria-hidden="true">${getIcon("check", "dash-icon--xs")}</span>
                        </div>
                        <div class="dash-custom-opt is-selected" data-value="30" role="option" aria-selected="true">
                          <span class="dash-custom-opt-badge dash-action-tag--verify">30D</span>
                          <span class="dash-custom-opt-name">30 Days (Standard Retention)</span>
                          <span class="dash-custom-opt-check" aria-hidden="true">${getIcon("check", "dash-icon--xs")}</span>
                        </div>
                        <div class="dash-custom-opt" data-value="60" role="option">
                          <span class="dash-custom-opt-badge dash-action-tag--default">60D</span>
                          <span class="dash-custom-opt-name">60 Days (Extended Audit Trail)</span>
                          <span class="dash-custom-opt-check" aria-hidden="true">${getIcon("check", "dash-icon--xs")}</span>
                        </div>
                        <div class="dash-custom-opt" data-value="90" role="option">
                          <span class="dash-custom-opt-badge dash-action-tag--default">90D</span>
                          <span class="dash-custom-opt-name">90 Days (Quarterly Maximum)</span>
                          <span class="dash-custom-opt-check" aria-hidden="true">${getIcon("check", "dash-icon--xs")}</span>
                        </div>
                      </div>
                    </div>
                    <select id="retentionDaysSelect" class="sr-only" tabindex="-1" aria-hidden="true">
                      <option value="7">7</option>
                      <option value="14">14</option>
                      <option value="30" selected>30</option>
                      <option value="60">60</option>
                      <option value="90">90</option>
                    </select>
                  </div>
                </div>
                <p class="dash-retention-helper">
                  Telemetry and visitor logs older than this interval will be permanently wiped. Active registered teams remain unaffected.
                </p>
              </div>
            </div>

            <div class="dash-modal-footer">
              <button type="button" class="dash-btn-telemetry dash-modal-cancel-btn" id="retentionCancelBtn">Cancel</button>
              <button type="button" class="dash-btn-telemetry dash-btn-telemetry--danger dash-modal-confirm-btn" id="retentionConfirmBtn">
                ${getIcon("trash", "dash-icon--xs")}
                <span>Execute Secure Purge</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Session Detail Modal -->
        <div id="analyticsSessionDetailModal" class="dash-modal" style="display:none;" hidden>
          <div class="dash-modal-backdrop" id="sessionDetailBackdrop"></div>
          <div class="dash-modal-dialog dash-session-dialog">
            <div class="dash-modal-header">
              <div class="dash-modal-header-title">
                <span class="dash-modal-shield">${getIcon("eye", "dash-icon--sm")}</span>
                <div>
                  <h3 class="dash-modal-title" id="sessionDetailTitle">Session Dossier</h3>
                  <span class="mono-label" id="sessionDetailSub" style="color:rgba(255,253,249,0.6); font-size:0.65rem;"></span>
                </div>
              </div>
              <button type="button" class="dash-modal-close-btn" id="sessionDetailCloseBtn" aria-label="Close session detail">✕</button>
            </div>
            <div id="sessionDetailContent" class="dash-modal-body"></div>
            <div class="dash-modal-footer dash-dossier-footer">
              <div class="dash-dossier-footer-note">
                ${getIcon("shield", "dash-icon--xs")}
                <span>CONFIDENTIAL DOSSIER · E-SUMMIT TELEMETRY</span>
              </div>
              <button type="button" class="dash-btn-telemetry dash-modal-cancel-btn" id="sessionDetailFooterCloseBtn">
                ${getIcon("cross", "dash-icon--xs")} <span>Close Dossier</span> <span class="dash-kbd-hint">ESC</span>
              </button>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  function setupMasterAnalyticsController(main, session) {
    if (session.role !== "master_admin") return;

    let autoRefreshActive = true;
    let autoRefreshTimer = null;
    let activeSubview = "overview";
    let cachedOverview = null;
    let cachedAdminActivity = null;
    let cachedVisitors = null;
    let cachedDevices = null;
    let cachedGeography = null;
    let cachedSessions = null;
    let currentSessionPage = 1;

    function formatSeconds(sec) {
      const s = Math.round(Number(sec) || 0);
      if (s < 60) return `${s}s`;
      const mins = Math.floor(s / 60);
      const rem = s % 60;
      if (mins < 60) return `${mins}m ${rem}s`;
      const hrs = Math.floor(mins / 60);
      const remM = mins % 60;
      return `${hrs}h ${remM}m`;
    }

    const panel = main.querySelector("#analyticsDataPanel");
    if (!panel) return;

    const subnavButtons = panel.querySelectorAll(".dash-subnav-btn");
    const subviewPanels = {
      "overview": panel.querySelector("#subviewOverview"),
      "admin-activity": panel.querySelector("#subviewAdminActivity"),
      "visitors": panel.querySelector("#subviewVisitors"),
      "devices": panel.querySelector("#subviewDevices"),
      "geography": panel.querySelector("#subviewGeography"),
      "sessions": panel.querySelector("#subviewSessions"),
    };

    function switchSubview(targetView) {
      activeSubview = targetView;
      subnavButtons.forEach(btn => {
        const isTarget = btn.getAttribute("data-subview") === targetView;
        btn.classList.toggle("is-active", isTarget);
        if (isTarget && typeof btn.scrollIntoView === "function") {
          btn.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
        }
      });
      Object.entries(subviewPanels).forEach(([name, el]) => {
        if (!el) return;
        const isTarget = name === targetView;
        el.hidden = !isTarget;
        el.style.display = isTarget ? "block" : "none";
      });
      fetchCurrentSubview();
    }

    subnavButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        const view = btn.getAttribute("data-subview");
        if (view) switchSubview(view);
      });
    });

    // ── Data Fetching with Graceful Offline Handling ──
    async function apiGetSafe(endpoint) {
      try {
        const res = await Auth.apiFetch(endpoint);
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        return await res.json();
      } catch (err) {
        setOfflineState(true);
        throw err;
      }
    }

    function setOfflineState(isOffline) {
      const banner = panel.querySelector("#analyticsOfflineBanner");
      if (banner) {
        banner.hidden = !isOffline;
        banner.style.display = isOffline ? "flex" : "none";
      }
      const syncBadge = panel.querySelector("#analyticsLastSync");
      if (syncBadge) {
        syncBadge.textContent = isOffline ? "Gateway Offline" : `Synced ${new Date().toLocaleTimeString()}`;
        syncBadge.style.color = isOffline ? "#ff7e67" : "rgba(255,253,249,0.7)";
      }
    }

    async function fetchOverview() {
      try {
        const data = await apiGetSafe("/analytics/master/overview");
        setOfflineState(false);
        cachedOverview = data;
        renderOverview(data);
      } catch {}
    }

    async function fetchAdminActivity() {
      try {
        const adminQ = panel.querySelector("#adminFilterEmail")?.value || "";
        const actionQ = panel.querySelector("#adminFilterAction")?.value || "";
        const ipQ = panel.querySelector("#adminFilterIp")?.value || "";
        const queryParams = new URLSearchParams();
        if (adminQ) queryParams.set("admin", adminQ);
        if (actionQ) queryParams.set("action", actionQ);
        if (ipQ) queryParams.set("ip", ipQ);

        const data = await apiGetSafe(`/analytics/master/admin-activity?${queryParams.toString()}`);
        setOfflineState(false);
        cachedAdminActivity = data;
        renderAdminActivity(data);
      } catch {}
    }

    async function fetchVisitors() {
      try {
        const data = await apiGetSafe("/analytics/master/visitors");
        setOfflineState(false);
        cachedVisitors = data;
        renderVisitors(data);
      } catch {}
    }

    async function fetchDevices() {
      try {
        const data = await apiGetSafe("/analytics/master/devices");
        setOfflineState(false);
        cachedDevices = data;
        renderDevices(data);
      } catch {}
    }

    async function fetchGeography() {
      try {
        const data = await apiGetSafe("/analytics/master/geography");
        setOfflineState(false);
        cachedGeography = data;
        renderGeography(data);
      } catch {}
    }

    async function fetchSessions(page = 1) {
      try {
        currentSessionPage = page;
        const searchQ = panel.querySelector("#sessionSearchInput")?.value || "";
        const typeQ = panel.querySelector("#sessionFilterType")?.value || "";
        const devQ = panel.querySelector("#sessionFilterDevice")?.value || "";
        const queryParams = new URLSearchParams({ page: String(page), page_size: "20" });
        if (searchQ) queryParams.set("visitor_id", searchQ);
        if (typeQ) queryParams.set("session_type", typeQ);
        if (devQ) queryParams.set("device", devQ);

        const data = await apiGetSafe(`/analytics/master/sessions?${queryParams.toString()}`);
        setOfflineState(false);
        cachedSessions = data;
        renderSessions(data);
      } catch {}
    }

    function fetchCurrentSubview() {
      if (activeSubview === "overview") fetchOverview();
      else if (activeSubview === "admin-activity") fetchAdminActivity();
      else if (activeSubview === "visitors") fetchVisitors();
      else if (activeSubview === "devices") fetchDevices();
      else if (activeSubview === "geography") fetchGeography();
      else if (activeSubview === "sessions") fetchSessions(currentSessionPage);
    }

    function fetchAllTelemetry() {
      fetchOverview();
      if (activeSubview !== "overview") {
        fetchCurrentSubview();
      }
    }

    // ── Overview Rendering ──
    function renderOverview(data) {
      const kpiGrid = panel.querySelector("#analyticsKpiGrid");
      if (!kpiGrid || !data) return;

      kpiGrid.innerHTML = `
        <div class="dash-kpi-card">
          <div class="dash-kpi-card-header">
            <span>Active Administrators</span>
            <i class="pulse-dot" style="width:7px;height:7px;border-radius:50%;background:#4ade80;"></i>
          </div>
          <div class="dash-kpi-value dash-kpi-value--acid">${escapeHTML(data.active_admins_count)}</div>
          <div class="dash-kpi-footer">Live in dashboard now</div>
        </div>

        <div class="dash-kpi-card">
          <div class="dash-kpi-card-header">
            <span>Active Live Sessions</span>
            ${getIcon("activity", "dash-icon--xs")}
          </div>
          <div class="dash-kpi-value">${escapeHTML(data.active_sessions_count)}</div>
          <div class="dash-kpi-footer">Interacting within 15 min</div>
        </div>

        <div class="dash-kpi-card">
          <div class="dash-kpi-card-header">
            <span>Unique Visitors Today</span>
            ${getIcon("users", "dash-icon--xs")}
          </div>
          <div class="dash-kpi-value">${escapeHTML(data.visitors_today)}</div>
          <div class="dash-kpi-footer">${escapeHTML(data.total_visitors)} total all-time visitors</div>
        </div>

        <div class="dash-kpi-card">
          <div class="dash-kpi-card-header">
            <span>Registered Squads</span>
            ${getIcon("shield", "dash-icon--xs")}
          </div>
          <div class="dash-kpi-value dash-kpi-value--acid">${escapeHTML(data.total_registered_users)}</div>
          <div class="dash-kpi-footer">+${escapeHTML(data.new_registrations_today)} squads registered today</div>
        </div>

        <div class="dash-kpi-card">
          <div class="dash-kpi-card-header">
            <span>Conversion Rate</span>
            ${getIcon("zap", "dash-icon--xs")}
          </div>
          <div class="dash-kpi-value dash-kpi-value--acid">${escapeHTML(data.conversion_rate_percent)}%</div>
          <div class="dash-kpi-footer">Visitor to Registered Squad</div>
        </div>

        <div class="dash-kpi-card">
          <div class="dash-kpi-card-header">
            <span>Total Page Views</span>
            ${getIcon("eye", "dash-icon--xs")}
          </div>
          <div class="dash-kpi-value">${escapeHTML(data.total_pageviews)}</div>
          <div class="dash-kpi-footer">Across all landing & portal pages</div>
        </div>

        <div class="dash-kpi-card">
          <div class="dash-kpi-card-header">
            <span>Average Session Duration</span>
            ${getIcon("clock", "dash-icon--xs")}
          </div>
          <div class="dash-kpi-value">${escapeHTML(formatSeconds(data.avg_session_duration_seconds))}</div>
          <div class="dash-kpi-footer">Engaged visitor dwell time</div>
        </div>

        <div class="dash-kpi-card">
          <div class="dash-kpi-card-header">
            <span>Bounce Rate</span>
            ${getIcon("external", "dash-icon--xs")}
          </div>
          <div class="dash-kpi-value">${escapeHTML(data.bounce_rate_percent)}%</div>
          <div class="dash-kpi-footer">Single-page navigation exits</div>
        </div>
      `;

      // Render Hourly Chart
      const hourlyWrap = panel.querySelector("#analyticsHourlyChart");
      if (hourlyWrap && Array.isArray(data.hourly_trend)) {
        const maxSessions = Math.max(...data.hourly_trend.map(h => h.sessions), 1);
        hourlyWrap.innerHTML = data.hourly_trend.map(h => {
          const heightPct = Math.max(Math.round((h.sessions / maxSessions) * 100), 5);
          return `
            <div class="dash-bar-col" title="${escapeHTML(h.hour)}: ${escapeHTML(h.sessions)} sessions">
              <div class="dash-bar-fill" style="height: ${heightPct}%;"></div>
              <span class="dash-bar-label">${escapeHTML(h.hour.split(":")[0])}</span>
            </div>
          `;
        }).join("");
      }

      // Render Conversion Funnel
      const funnelWrap = panel.querySelector("#analyticsFunnelStages");
      const convRateLabel = panel.querySelector("#funnelConvRate");
      if (convRateLabel) convRateLabel.textContent = `${data.conversion_rate_percent}% Conversion`;
      if (funnelWrap && Array.isArray(data.funnel)) {
        funnelWrap.innerHTML = data.funnel.map((f, idx) => {
          return `
            <div class="dash-funnel-step">
              <span class="dash-funnel-step-name">${idx + 1}. ${escapeHTML(f.stage)}</span>
              <span class="dash-funnel-step-val">${escapeHTML(f.count)}</span>
            </div>
          `;
        }).join("");
      }

      // Render Top Pages & Exits
      renderMetersList(panel.querySelector("#analyticsTopPagesList"), data.top_pages, "views", "page");
      renderMetersList(panel.querySelector("#analyticsTopExitsList"), data.top_exits, "exits", "page");
    }

    function renderMetersList(container, items, countKey, labelKey) {
      if (!container) return;
      if (!Array.isArray(items) || items.length === 0) {
        container.innerHTML = '<p class="dash-empty-state" style="padding:1rem;">No telemetry recorded yet.</p>';
        return;
      }
      const maxCount = Math.max(...items.map(i => i[countKey]), 1);
      container.innerHTML = items.map(item => {
        const pct = Math.round((item[countKey] / maxCount) * 100);
        return `
          <div class="dash-meter-row">
            <span class="dash-meter-label" title="${escapeHTML(item[labelKey])}">${escapeHTML(item[labelKey])}</span>
            <div class="dash-meter-bar-container">
              <div class="dash-meter-bar" style="width: ${pct}%;"></div>
            </div>
            <span class="dash-meter-val">${escapeHTML(item[countKey])}</span>
          </div>
        `;
      }).join("");
    }

    // ── Admin Activity Rendering ──
    function renderAdminActivity(data) {
      if (!data) return;

      // Active Admins Count
      const activeCount = (data.roster || []).filter(r => r.status === "active").length;
      const countLabel = panel.querySelector("#activeAdminCountLabel");
      if (countLabel) countLabel.textContent = `${activeCount} ACTIVE NOW`;

      // Roster Grid
      const rosterGrid = panel.querySelector("#analyticsPresenceGrid");
      if (rosterGrid) {
        rosterGrid.innerHTML = (data.roster && data.roster.length) ? data.roster.map(admin => {
          const badgeClass = admin.status === "active" ? "dash-presence-badge--active" : admin.status === "idle" ? "dash-presence-badge--idle" : "dash-presence-badge--offline";
          return `
            <div class="dash-presence-card">
              <div class="dash-presence-top">
                <span class="dash-presence-badge ${badgeClass}">
                  <i class="pulse-dot" style="width:5px;height:5px;border-radius:50%;background:currentColor;"></i>
                  ${escapeHTML(admin.status)}
                </span>
                <span class="dash-pill-tag">${escapeHTML(admin.department || "Technical Team")}</span>
              </div>
              <div class="dash-presence-identity">
                <h4 class="dash-presence-name">${escapeHTML(admin.name || "Administrator")}</h4>
                <div class="dash-presence-email">${escapeHTML(admin.email)}</div>
              </div>
              <div class="dash-presence-meta">
                <div class="dash-presence-meta-item">
                  <span class="dash-presence-meta-label">Current Feature:</span>
                  <span class="dash-presence-meta-val">${escapeHTML(admin.current_page || "dashboard")}</span>
                </div>
                <div class="dash-presence-meta-item">
                  <span class="dash-presence-meta-label">Last Active:</span>
                  <span class="dash-presence-meta-val">${escapeHTML(formatRegistrationDateTime(admin.last_active))}</span>
                </div>
                <div class="dash-presence-meta-item">
                  <span class="dash-presence-meta-label">Client IP:</span>
                  <span class="dash-presence-meta-val dash-presence-ip">${escapeHTML(admin.ip || "unknown")}</span>
                </div>
              </div>
            </div>
          `;
        }).join("") : '<p class="dash-empty-state">No administrators found.</p>';
      }

      // Security Alerts
      const alertsWrap = panel.querySelector("#analyticsSecurityAlerts");
      if (alertsWrap) {
        alertsWrap.innerHTML = (data.security_alerts && data.security_alerts.length) ? data.security_alerts.map(a => `
          <div class="dash-alert-item">
            <div class="dash-alert-main">
              <span class="dash-alert-icon">${getIcon("alert-triangle", "dash-icon--sm")}</span>
              <div class="dash-alert-text">
                <span class="dash-alert-tag">[${escapeHTML(a.action)}]</span>
                <span class="dash-alert-desc">${escapeHTML(a.details || "Security defense triggered")}</span>
              </div>
            </div>
            <div class="dash-alert-meta">
              <span>${escapeHTML(a.ip)}</span>
              <span>•</span>
              <span>${escapeHTML(formatRegistrationDateTime(a.timestamp))}</span>
            </div>
          </div>
        `).join("") : '<p class="dash-empty-state" style="padding:1rem;">No suspicious security triggers detected.</p>';
      }

      // Activity Table
      const tbody = panel.querySelector("#adminActivityTableBody");
      if (tbody) {
        tbody.innerHTML = (data.activities && data.activities.length) ? data.activities.map(a => {
          let tagClass = "dash-action-tag--default";
          if (a.action.includes("LOGIN")) tagClass = a.status === "FAILED" ? "dash-action-tag--delete" : "dash-action-tag--login";
          else if (a.action.includes("DELETE")) tagClass = "dash-action-tag--delete";
          else if (a.action.includes("VERIFY")) tagClass = "dash-action-tag--verify";
          else if (a.action.includes("CREATE")) tagClass = "dash-action-tag--create";

          return `
            <tr>
              <td class="dash-cell-nowrap">${escapeHTML(formatRegistrationDateTime(a.timestamp))}</td>
              <td>
                <div class="dash-table-admin-name">${escapeHTML(a.admin_name || a.admin_email)}</div>
                <div class="dash-table-subtext">${escapeHTML(a.admin_email)}</div>
              </td>
              <td>
                <span class="dash-pill-tag">${escapeHTML(a.role)}</span>
                <div class="dash-table-subtext">${escapeHTML(a.department)}</div>
              </td>
              <td><span class="dash-action-tag ${tagClass}">${escapeHTML(a.action)}</span></td>
              <td><code class="dash-table-code">${escapeHTML(a.entity_id || a.entity_type || "—")}</code></td>
              <td><span class="dash-table-page-pill">${escapeHTML(a.page || "dashboard")}</span></td>
              <td>
                <div class="dash-table-ip">${escapeHTML(a.ip)}</div>
                <div class="dash-table-subtext">${escapeHTML(a.country || "Network")}</div>
              </td>
              <td>
                <span class="dash-status-pill dash-status-pill--${a.status === 'SUCCESS' ? 'success' : 'danger'}">
                  ${escapeHTML(a.status)}
                </span>
              </td>
            </tr>
          `;
        }).join("") : '<tr><td colspan="8" class="dash-empty-state" style="padding:2rem;">No matching admin activities recorded.</td></tr>';
      }
    }

    // ── Visitors & Users Rendering ──
    function renderVisitors(data) {
      if (!data) return;

      const anonStats = panel.querySelector("#anonVisitorsStats");
      if (anonStats) {
        anonStats.innerHTML = `
          <div style="display:flex; flex-direction:column; gap:0.75rem;">
            <div class="dash-meter-row">
              <span class="dash-meter-label">Total Anonymous Visitors</span>
              <span class="dash-meter-val">${escapeHTML(data.anonymous_visitors_count)}</span>
            </div>
            <div class="dash-meter-row">
              <span class="dash-meter-label">New Visitors (1st session)</span>
              <span class="dash-meter-val">${escapeHTML(data.new_visitors)}</span>
            </div>
            <div class="dash-meter-row">
              <span class="dash-meter-label">Returning Visitors (2+ sessions)</span>
              <span class="dash-meter-val">${escapeHTML(data.returning_visitors)}</span>
            </div>
          </div>
        `;
      }

      const regStats = panel.querySelector("#registeredUsersStats");
      if (regStats) {
        regStats.innerHTML = `
          <div style="display:flex; flex-direction:column; gap:0.75rem;">
            <div class="dash-meter-row">
              <span class="dash-meter-label">Registered Squad Accounts</span>
              <span class="dash-meter-val" style="color:var(--acid);">${escapeHTML(data.registered_users_count)}</span>
            </div>
            <div class="dash-meter-row">
              <span class="dash-meter-label">Authentication Status</span>
              <span class="dash-meter-val" style="color:#4ade80;">Active Vault</span>
            </div>
            <div class="dash-meter-row">
              <span class="dash-meter-label">Data Separation Integrity</span>
              <span class="dash-meter-val" style="color:#4ade80;">Enforced</span>
            </div>
          </div>
        `;
      }

      // Common Paths
      const pathsWrap = panel.querySelector("#analyticsNavPaths");
      if (pathsWrap && Array.isArray(data.common_navigation_paths)) {
        pathsWrap.innerHTML = data.common_navigation_paths.length ? data.common_navigation_paths.map(p => `
          <div class="dash-meter-row">
            <span class="dash-meter-label" title="${escapeHTML(p.path)}">${escapeHTML(p.path)}</span>
            <span class="dash-meter-val">${escapeHTML(p.count)} sessions</span>
          </div>
        `).join("") : '<p class="dash-empty-state">No navigation trails recorded yet.</p>';
      }

      // Duration Buckets
      renderMetersList(panel.querySelector("#analyticsDurationBuckets"), data.duration_distribution, "count", "range");
    }

    // ── Devices Rendering ──
    function renderDevices(data) {
      if (!data) return;
      renderMetersList(panel.querySelector("#deviceTypesList"), data.device_types, "count", "name");
      renderMetersList(panel.querySelector("#operatingSystemsList"), data.operating_systems, "count", "name");
      renderMetersList(panel.querySelector("#browsersList"), data.browsers, "count", "name");
      renderMetersList(panel.querySelector("#screenResolutionsList"), data.screen_resolutions, "count", "name");
    }

    // ── Geography Rendering ──
    function renderGeography(data) {
      if (!data) return;
      renderMetersList(panel.querySelector("#countriesList"), data.countries, "count", "name");
      renderMetersList(panel.querySelector("#citiesList"), data.cities, "count", "name");
      renderMetersList(panel.querySelector("#providersList"), data.network_providers, "count", "name");
      renderMetersList(panel.querySelector("#ipClassList"), data.network_classifications, "count", "name");
    }

    // ── Sessions Rendering ──
    function renderSessions(data) {
      if (!data) return;
      const tbody = panel.querySelector("#sessionsExplorerTableBody");
      const infoSpan = panel.querySelector("#sessionPaginationInfo");

      if (infoSpan) {
        infoSpan.textContent = `Showing ${data.sessions ? data.sessions.length : 0} of ${data.total || 0} sessions (Page ${data.page})`;
      }

      if (tbody) {
        tbody.innerHTML = (data.sessions && data.sessions.length) ? data.sessions.map(s => {
          const isReg = s.session_type === "registered_user";
          const isAdmin = s.session_type === "admin";
          const typeBadge = isReg
            ? '<span class="dash-pill-tag dash-pill-tag--acid">REGISTERED</span>'
            : isAdmin
              ? '<span class="dash-pill-tag" style="background:rgba(59,130,246,0.2);color:#60a5fa;">ADMIN</span>'
              : '<span class="dash-pill-tag">ANONYMOUS</span>';

          const devStr = s.device?.server_derived?.parsed_device_category || "Desktop";
          const osStr = s.device?.server_derived?.parsed_os_name || "Unknown";
          const userStr = s.user_id || s.visitor_id || "Anonymous";

          return `
            <tr>
              <td><code style="color:var(--acid);">${escapeHTML(s.session_id.slice(0, 14))}…</code></td>
              <td>${typeBadge}</td>
              <td title="${escapeHTML(userStr)}"><strong>${escapeHTML(userStr.slice(0, 18))}…</strong></td>
              <td>${escapeHTML(devStr)} · ${escapeHTML(osStr)}</td>
              <td>${escapeHTML(s.network?.country || "Network")}</td>
              <td>${escapeHTML(s.page_views_count || 0)} pages</td>
              <td>${escapeHTML(formatSeconds(s.duration_seconds))}</td>
              <td style="white-space:nowrap;">${escapeHTML(formatRegistrationDateTime(s.last_active_at))}</td>
              <td>
                <button type="button" class="dash-btn-telemetry inspect-session-btn" data-session-id="${escapeHTML(s.session_id)}">
                  ${getIcon("eye", "dash-icon--xs")} Inspect
                </button>
              </td>
            </tr>
          `;
        }).join("") : '<tr><td colspan="9" class="dash-empty-state" style="padding:2rem;">No matching sessions found.</td></tr>';

        // Attach inspect handlers
        tbody.querySelectorAll(".inspect-session-btn").forEach(btn => {
          btn.addEventListener("click", () => {
            const sid = btn.getAttribute("data-session-id");
            const sess = (data.sessions || []).find(s => s.session_id === sid);
            if (sess) showSessionModal(sess);
          });
        });
      }
    }

    // Relocate modal containers to document.body so they escape parent transforms & backdrop-filters
    const sessionModalElem = panel.querySelector("#analyticsSessionDetailModal");
    if (sessionModalElem && sessionModalElem.parentElement !== document.body) {
      document.getElementById("analyticsSessionDetailModal")?.remove();
      document.body.appendChild(sessionModalElem);
    }
    const retentionModalElem = panel.querySelector("#analyticsRetentionModal");
    if (retentionModalElem && retentionModalElem.parentElement !== document.body) {
      document.getElementById("analyticsRetentionModal")?.remove();
      document.body.appendChild(retentionModalElem);
    }

    function showSessionModal(sess) {
      let modal = document.getElementById("analyticsSessionDetailModal");
      const title = document.getElementById("sessionDetailTitle");
      const sub = document.getElementById("sessionDetailSub");
      const content = document.getElementById("sessionDetailContent");
      if (!modal || !content) return;

      if (modal.parentElement !== document.body) {
        document.body.appendChild(modal);
      }

      const sid = sess.session_id || "UNKNOWN_SESSION";
      const shortSid = sid.toUpperCase();
      if (title) title.textContent = `SESSION: ${shortSid}`;

      const durationStr = formatSeconds(sess.duration_seconds || 0);
      const sessType = sess.session_type || "anonymous_visitor";
      let typeBadgeClass = "dash-action-tag--login";
      let typeBadgeText = "ANON VISITOR";
      let avatarIcon = "radar";

      if (sessType === "admin") {
        typeBadgeClass = "dash-action-tag--verify";
        typeBadgeText = "ADMIN OFFICER";
        avatarIcon = "shield";
      } else if (sessType === "registered_user") {
        typeBadgeClass = "dash-action-tag--create";
        typeBadgeText = "REGISTERED SQUAD";
        avatarIcon = "users";
      }

      if (sub) sub.textContent = `TYPE: ${typeBadgeText} · DURATION: ${durationStr}`;

      const navPaths = sess.navigation_path || [];
      const navPipelineHTML = navPaths.length > 0
        ? navPaths.map((p, idx) => {
            const isLast = idx === navPaths.length - 1;
            return `
              <div class="dash-journey-node ${isLast ? "is-destination" : ""}">
                <span class="dash-journey-step">${String(idx + 1).padStart(2, "0")}</span>
                <div class="dash-journey-route">
                  <span class="dash-journey-path">${escapeHTML(p)}</span>
                  ${isLast ? `<span class="dash-journey-badge">LIVE NODE</span>` : ""}
                </div>
              </div>
              ${!isLast ? `<div class="dash-journey-connector">${getIcon("arrowRight", "dash-icon--xs")}</div>` : ""}
            `;
          }).join("")
        : `
          <div class="dash-journey-node is-destination">
            <span class="dash-journey-step">01</span>
            <div class="dash-journey-route">
              <span class="dash-journey-path">/ (Direct Gateway Entry)</span>
              <span class="dash-journey-badge">LIVE NODE</span>
            </div>
          </div>
        `;

      const screenW = sess.device?.browser_supplied?.screen?.width || "—";
      const screenH = sess.device?.browser_supplied?.screen?.height || "—";
      const dpr = sess.device?.browser_supplied?.screen?.pixel_ratio || 1;
      const vpW = sess.device?.browser_supplied?.viewport?.width || "—";
      const vpH = sess.device?.browser_supplied?.viewport?.height || "—";
      const tz = sess.device?.browser_supplied?.navigator?.timezone || "UTC";
      const lang = sess.device?.browser_supplied?.navigator?.language || "en-US";
      const cores = sess.device?.browser_supplied?.navigator?.hardware_concurrency || "Standard";
      const netType = (sess.device?.browser_supplied?.network_connection_api?.effective_type || "Standard Link").toUpperCase();
      const ipAddr = sess.network?.ip || "127.0.0.1";
      const geoCountry = sess.network?.country || "Local Network";
      const geoCity = sess.network?.city || "Local Node";
      const geoCode = sess.network?.country_code || "LAN";
      const deviceCat = sess.device?.server_derived?.parsed_device_category || "Desktop";
      const osName = sess.device?.server_derived?.parsed_os_name || "Client OS";
      const browserName = sess.device?.server_derived?.parsed_browser_name || "Browser";

      content.innerHTML = `
        <div class="dash-dossier-wrap">
          <!-- 1. Identity Hero Header Card -->
          <div class="dash-dossier-hero">
            <div class="dash-dossier-hero-main">
              <div class="dash-dossier-avatar">
                ${getIcon(avatarIcon, "dash-icon--md")}
              </div>
              <div class="dash-dossier-id-block">
                <div class="dash-dossier-title-row">
                  <span class="dash-dossier-type-badge ${typeBadgeClass}">${typeBadgeText}</span>
                  <span class="dash-dossier-status-pill">
                    <span class="pulse-dot"></span> Active Session
                  </span>
                </div>
                <div class="dash-dossier-key-val">
                  <span class="dash-dossier-code" title="${escapeHTML(sid)}">${escapeHTML(sid)}</span>
                  <button type="button" class="dash-dossier-copy-btn" data-copy="${escapeHTML(sid)}" title="Copy Session ID" aria-label="Copy Session ID">
                    ${getIcon("copy", "dash-icon--xs")}
                  </button>
                </div>
              </div>
            </div>
            <div class="dash-dossier-stats-chips">
              <div class="dash-dossier-chip">
                <span class="chip-lbl">TOTAL TIME</span>
                <span class="chip-val">${durationStr}</span>
              </div>
              <div class="dash-dossier-chip">
                <span class="chip-lbl">NAVIGATION</span>
                <span class="chip-val">${navPaths.length} Route${navPaths.length === 1 ? "" : "s"}</span>
              </div>
            </div>
          </div>

          <!-- 2. Client & Origin HUD Matrix -->
          <div class="dash-dossier-section">
            <div class="dash-dossier-section-head">
              <span class="dash-dossier-section-tag">HUD MATRIX</span>
              <h4 class="dash-dossier-section-title">Client Identity & Origin Node</h4>
            </div>
            <div class="dash-dossier-grid">
              <!-- Visitor Fingerprint -->
              <div class="dash-hud-card">
                <div class="dash-hud-card-header">
                  <span class="dash-hud-card-icon">${getIcon("fingerprint", "dash-icon--xs")}</span>
                  <span class="dash-hud-card-label">Visitor ID Fingerprint</span>
                </div>
                <div class="dash-hud-card-body">
                  <span class="dash-hud-val dash-hud-val--acid" title="${escapeHTML(sess.visitor_id || '')}">${escapeHTML(sess.visitor_id || "Unknown")}</span>
                  ${sess.visitor_id ? `
                    <button type="button" class="dash-dossier-copy-btn" data-copy="${escapeHTML(sess.visitor_id)}" title="Copy Visitor ID" aria-label="Copy Visitor ID">
                      ${getIcon("copy", "dash-icon--xs")}
                    </button>
                  ` : ""}
                </div>
              </div>

              <!-- Authenticated User -->
              <div class="dash-hud-card">
                <div class="dash-hud-card-header">
                  <span class="dash-hud-card-icon">${getIcon("user", "dash-icon--xs")}</span>
                  <span class="dash-hud-card-label">Authenticated Account</span>
                </div>
                <div class="dash-hud-card-body">
                  <span class="dash-hud-val" title="${escapeHTML(sess.user_id || 'Unregistered Visitor')}">${escapeHTML(sess.user_id || "Unregistered Visitor")}</span>
                  ${sess.user_id ? `
                    <button type="button" class="dash-dossier-copy-btn" data-copy="${escapeHTML(sess.user_id)}" title="Copy User ID" aria-label="Copy User ID">
                      ${getIcon("copy", "dash-icon--xs")}
                    </button>
                  ` : `<span class="dash-hud-subpill">ANON</span>`}
                </div>
              </div>

              <!-- Remote IP Node -->
              <div class="dash-hud-card">
                <div class="dash-hud-card-header">
                  <span class="dash-hud-card-icon">${getIcon("globe", "dash-icon--xs")}</span>
                  <span class="dash-hud-card-label">Remote IP Address</span>
                </div>
                <div class="dash-hud-card-body">
                  <span class="dash-hud-val" title="${escapeHTML(ipAddr)}">${escapeHTML(ipAddr)}</span>
                  <button type="button" class="dash-dossier-copy-btn" data-copy="${escapeHTML(ipAddr)}" title="Copy IP" aria-label="Copy IP">
                    ${getIcon("copy", "dash-icon--xs")}
                  </button>
                </div>
              </div>

              <!-- Geolocation -->
              <div class="dash-hud-card">
                <div class="dash-hud-card-header">
                  <span class="dash-hud-card-icon">${getIcon("mapPin", "dash-icon--xs")}</span>
                  <span class="dash-hud-card-label">Geographic Location</span>
                </div>
                <div class="dash-hud-card-body">
                  <span class="dash-hud-val" title="${escapeHTML(geoCountry)} / ${escapeHTML(geoCity)}">${escapeHTML(geoCountry)} / ${escapeHTML(geoCity)}</span>
                  <span class="dash-hud-subpill">${escapeHTML(geoCode)}</span>
                </div>
              </div>

              <!-- Device Factor & OS -->
              <div class="dash-hud-card">
                <div class="dash-hud-card-header">
                  <span class="dash-hud-card-icon">${getIcon("device", "dash-icon--xs")}</span>
                  <span class="dash-hud-card-label">Device & Operating System</span>
                </div>
                <div class="dash-hud-card-body">
                  <span class="dash-hud-val">${escapeHTML(deviceCat)}</span>
                  <span class="dash-hud-subpill">${escapeHTML(osName)}</span>
                </div>
              </div>

              <!-- Browser Client -->
              <div class="dash-hud-card">
                <div class="dash-hud-card-header">
                  <span class="dash-hud-card-icon">${getIcon("browser", "dash-icon--xs")}</span>
                  <span class="dash-hud-card-label">Browser Client Engine</span>
                </div>
                <div class="dash-hud-card-body">
                  <span class="dash-hud-val" title="${escapeHTML(browserName)}">${escapeHTML(browserName)}</span>
                  <span class="dash-hud-subpill">ENGINE</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 3. Navigation Path Pipeline Flow -->
          <div class="dash-dossier-section">
            <div class="dash-dossier-section-head">
              <span class="dash-dossier-section-tag">PIPELINE</span>
              <h4 class="dash-dossier-section-title">Navigation Path Sequence</h4>
            </div>
            <div class="dash-journey-pipeline">
              ${navPipelineHTML}
            </div>
          </div>

          <!-- 4. Browser Telemetry & Spec Matrix (Zero Horizontal Overflow) -->
          <div class="dash-dossier-section">
            <div class="dash-dossier-section-head">
              <span class="dash-dossier-section-tag">TELEMETRY</span>
              <h4 class="dash-dossier-section-title">Browser & Hardware Telemetry</h4>
            </div>
            <div class="dash-telemetry-spec-grid">
              <!-- Screen Resolution -->
              <div class="dash-spec-card">
                <div class="dash-spec-icon">${getIcon("monitor", "dash-icon--sm")}</div>
                <div class="dash-spec-info">
                  <span class="dash-spec-label">Screen Resolution</span>
                  <span class="dash-spec-value">${escapeHTML(screenW)} × ${escapeHTML(screenH)}</span>
                  <span class="dash-spec-hint">${escapeHTML(dpr)}x Pixel Density</span>
                </div>
              </div>

              <!-- Viewport Bounds -->
              <div class="dash-spec-card">
                <div class="dash-spec-icon">${getIcon("maximize", "dash-icon--sm")}</div>
                <div class="dash-spec-info">
                  <span class="dash-spec-label">Active Viewport</span>
                  <span class="dash-spec-value">${escapeHTML(vpW)} × ${escapeHTML(vpH)}</span>
                  <span class="dash-spec-hint">Render Surface</span>
                </div>
              </div>

              <!-- Logical CPU Cores -->
              <div class="dash-spec-card">
                <div class="dash-spec-icon">${getIcon("cpu", "dash-icon--sm")}</div>
                <div class="dash-spec-info">
                  <span class="dash-spec-label">Hardware Cores</span>
                  <span class="dash-spec-value">${escapeHTML(cores)}</span>
                  <span class="dash-spec-hint">Logical Processors</span>
                </div>
              </div>

              <!-- Network Connection Link -->
              <div class="dash-spec-card">
                <div class="dash-spec-icon">${getIcon("wifi", "dash-icon--sm")}</div>
                <div class="dash-spec-info">
                  <span class="dash-spec-label">Network Link</span>
                  <span class="dash-spec-value">${escapeHTML(netType)}</span>
                  <span class="dash-spec-hint">Effective Speed</span>
                </div>
              </div>

              <!-- Client Timezone -->
              <div class="dash-spec-card">
                <div class="dash-spec-icon">${getIcon("clock", "dash-icon--sm")}</div>
                <div class="dash-spec-info">
                  <span class="dash-spec-label">Timezone</span>
                  <span class="dash-spec-value" title="${escapeHTML(tz)}">${escapeHTML(tz)}</span>
                  <span class="dash-spec-hint">Client Clock</span>
                </div>
              </div>

              <!-- Locale / Language -->
              <div class="dash-spec-card">
                <div class="dash-spec-icon">${getIcon("globe", "dash-icon--sm")}</div>
                <div class="dash-spec-info">
                  <span class="dash-spec-label">Language / Locale</span>
                  <span class="dash-spec-value">${escapeHTML(lang)}</span>
                  <span class="dash-spec-hint">RFC 5646 Format</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;

      // Attach copy button click handlers
      content.querySelectorAll(".dash-dossier-copy-btn").forEach(btn => {
        btn.addEventListener("click", async (e) => {
          e.stopPropagation();
          const toCopy = btn.getAttribute("data-copy");
          if (!toCopy) return;
          try {
            await navigator.clipboard.writeText(toCopy);
            const orig = btn.innerHTML;
            btn.innerHTML = getIcon("check", "dash-icon--xs");
            btn.style.color = "#4ade80";
            btn.style.borderColor = "#4ade80";
            showToast(`Copied: ${toCopy.length > 24 ? toCopy.substring(0, 24) + "..." : toCopy}`);
            setTimeout(() => {
              btn.innerHTML = orig;
              btn.style.color = "";
              btn.style.borderColor = "";
            }, 1600);
          } catch {
            showToast("Copied text: " + toCopy);
          }
        });
      });

      modal.hidden = false;
      modal.style.display = "flex";
      document.body.style.overflow = "hidden";
    }

    // Modal close handlers
    const closeSessionModal = () => {
      const modal = document.getElementById("analyticsSessionDetailModal");
      if (modal) {
        modal.hidden = true;
        modal.style.display = "none";
        document.body.style.overflow = "";
      }
    };

    document.getElementById("sessionDetailCloseBtn")?.addEventListener("click", closeSessionModal);
    document.getElementById("sessionDetailFooterCloseBtn")?.addEventListener("click", closeSessionModal);
    document.getElementById("sessionDetailBackdrop")?.addEventListener("click", closeSessionModal);

    // ── Retention Purge Modal ──
    const closeRetentionModal = () => {
      const modal = document.getElementById("analyticsRetentionModal");
      if (modal) {
        modal.hidden = true;
        modal.style.display = "none";
        document.body.style.overflow = "";
      }
    };

    panel.querySelector("#analyticsRetentionBtn")?.addEventListener("click", () => {
      const modal = document.getElementById("analyticsRetentionModal");
      if (modal) {
        if (modal.parentElement !== document.body) document.body.appendChild(modal);
        modal.hidden = false;
        modal.style.display = "flex";
        document.body.style.overflow = "hidden";
      }
    });
    document.getElementById("retentionCancelBtn")?.addEventListener("click", closeRetentionModal);
    document.getElementById("retentionCloseTopBtn")?.addEventListener("click", closeRetentionModal);
    document.getElementById("analyticsRetentionBackdrop")?.addEventListener("click", closeRetentionModal);

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        closeSessionModal();
        closeRetentionModal();
      }
    });

    document.getElementById("retentionConfirmBtn")?.addEventListener("click", async () => {
      const days = parseInt(document.getElementById("retentionDaysSelect")?.value || "30", 10);
      try {
        const res = await Auth.apiFetch("/analytics/master/retention/purge", {
          method: "POST",
          body: JSON.stringify({ days: days })
        });
        const result = await res.json();
        closeRetentionModal();
        showToast(`Retention purge complete: removed ${result.purged_sessions || 0} sessions and ${result.purged_events || 0} events.`);
        fetchAllTelemetry();
      } catch {
        showToast("Retention purge failed", "error");
      }
    });

    // ── Unified Custom Dropdowns Controller ──
    function initCustomDropdown({ dropdownId, triggerId, menuId, selectId, onChange }) {
      const dropdown = document.getElementById(dropdownId);
      const trigger = document.getElementById(triggerId);
      const menu = document.getElementById(menuId);
      const hiddenSelect = document.getElementById(selectId);
      if (!dropdown || !trigger || !menu) {
        return { setVal: () => {}, toggleMenu: () => {} };
      }

      const triggerBadge = trigger.querySelector(".dash-custom-select-badge");
      const triggerLabel = trigger.querySelector(".dash-custom-select-label");
      const options = dropdown.querySelectorAll(".dash-custom-opt");

      function setVal(val, triggerChange = true) {
        options.forEach(opt => {
          const optVal = opt.getAttribute("data-value") || "";
          if (optVal === String(val)) {
            opt.classList.add("is-selected");
            opt.setAttribute("aria-selected", "true");
            const badge = opt.querySelector(".dash-custom-opt-badge");
            const name = opt.querySelector(".dash-custom-opt-name");
            if (triggerBadge && badge) {
              triggerBadge.textContent = badge.textContent.trim();
              const tagClass = Array.from(badge.classList).find(c => c.startsWith("dash-action-tag--")) || "dash-action-tag--default";
              triggerBadge.className = `dash-custom-select-badge ${tagClass}`;
            }
            if (triggerLabel && name) {
              triggerLabel.textContent = name.textContent.trim();
            }
          } else {
            opt.classList.remove("is-selected");
            opt.removeAttribute("aria-selected");
          }
        });

        if (hiddenSelect && hiddenSelect.value !== String(val)) {
          hiddenSelect.value = String(val);
          if (triggerChange) {
            hiddenSelect.dispatchEvent(new Event("change", { bubbles: true }));
          }
        }

        if (triggerChange && typeof onChange === "function") {
          onChange(val);
        }
      }

      function toggleMenu(open) {
        const isOpen = open !== undefined ? open : menu.hasAttribute("hidden");
        if (isOpen) {
          // Close other open custom dropdowns first
          document.querySelectorAll(".dash-custom-select.is-open").forEach(other => {
            if (other !== dropdown) {
              other.classList.remove("is-open");
              other.querySelector(".dash-custom-select-menu")?.setAttribute("hidden", "");
              other.querySelector(".dash-custom-select-trigger")?.setAttribute("aria-expanded", "false");
            }
          });

          dropdown.classList.add("is-open");
          menu.removeAttribute("hidden");
          trigger.setAttribute("aria-expanded", "true");
          const selectedOpt = dropdown.querySelector(".dash-custom-opt.is-selected");
          if (selectedOpt) {
            selectedOpt.scrollIntoView({ block: "nearest" });
          }
        } else {
          dropdown.classList.remove("is-open");
          menu.setAttribute("hidden", "");
          trigger.setAttribute("aria-expanded", "false");
        }
      }

      trigger.addEventListener("click", (e) => {
        e.stopPropagation();
        toggleMenu();
      });

      options.forEach(opt => {
        opt.addEventListener("click", (e) => {
          e.stopPropagation();
          const val = opt.getAttribute("data-value") || "";
          setVal(val, true);
          toggleMenu(false);
          trigger.focus();
        });
      });

      const outsideHandler = (e) => {
        if (!dropdown || !dropdown.isConnected) {
          document.removeEventListener("click", outsideHandler);
          return;
        }
        if (!dropdown.contains(e.target)) {
          toggleMenu(false);
        }
      };
      document.addEventListener("click", outsideHandler);

      dropdown.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
          toggleMenu(false);
          trigger.focus();
        }
      });

      return { setVal, toggleMenu };
    }

    const adminActionCtrl = initCustomDropdown({
      dropdownId: "adminActionDropdown",
      triggerId: "adminActionTrigger",
      menuId: "adminActionMenu",
      selectId: "adminFilterAction",
      onChange: () => fetchAdminActivity()
    });

    const sessionTypeCtrl = initCustomDropdown({
      dropdownId: "sessionTypeDropdown",
      triggerId: "sessionTypeTrigger",
      menuId: "sessionTypeMenu",
      selectId: "sessionFilterType",
      onChange: () => fetchSessions(1)
    });

    const sessionDeviceCtrl = initCustomDropdown({
      dropdownId: "sessionDeviceDropdown",
      triggerId: "sessionDeviceTrigger",
      menuId: "sessionDeviceMenu",
      selectId: "sessionFilterDevice",
      onChange: () => fetchSessions(1)
    });

    const retentionDaysCtrl = initCustomDropdown({
      dropdownId: "retentionDaysDropdown",
      triggerId: "retentionDaysTrigger",
      menuId: "retentionDaysMenu",
      selectId: "retentionDaysSelect"
    });

    // ── Filter Triggers ──
    panel.querySelector("#adminFilterEmail")?.addEventListener("input", () => fetchAdminActivity());
    panel.querySelector("#adminFilterAction")?.addEventListener("change", () => fetchAdminActivity());
    panel.querySelector("#adminFilterIp")?.addEventListener("input", () => fetchAdminActivity());
    panel.querySelector("#adminFilterResetBtn")?.addEventListener("click", () => {
      const e1 = panel.querySelector("#adminFilterEmail");
      const e3 = panel.querySelector("#adminFilterIp");
      if (e1) e1.value = "";
      if (e3) e3.value = "";
      adminActionCtrl.setVal("", false);
      fetchAdminActivity();
    });

    panel.querySelector("#sessionSearchInput")?.addEventListener("input", () => fetchSessions(1));
    panel.querySelector("#sessionFilterType")?.addEventListener("change", () => fetchSessions(1));
    panel.querySelector("#sessionFilterDevice")?.addEventListener("change", () => fetchSessions(1));
    panel.querySelector("#sessionFilterResetBtn")?.addEventListener("click", () => {
      const s1 = panel.querySelector("#sessionSearchInput");
      if (s1) s1.value = "";
      sessionTypeCtrl.setVal("", false);
      sessionDeviceCtrl.setVal("", false);
      fetchSessions(1);
    });

    panel.querySelector("#sessionPrevPageBtn")?.addEventListener("click", () => {
      if (currentSessionPage > 1) fetchSessions(currentSessionPage - 1);
    });
    panel.querySelector("#sessionNextPageBtn")?.addEventListener("click", () => {
      fetchSessions(currentSessionPage + 1);
    });

    // ── Live SSE Telemetry Stream & Controls ──
    let analyticsEventSource = null;

    function connectAnalyticsStream() {
      if (analyticsEventSource) {
        analyticsEventSource.close();
        analyticsEventSource = null;
      }
      if (!autoRefreshActive) return;

      const token = typeof Auth !== "undefined" && typeof Auth.getToken === "function" ? Auth.getToken() : "";
      if (!token) return;

      try {
        const streamUrl = `${API_BASE}/analytics/master/stream?token=${encodeURIComponent(token)}`;
        analyticsEventSource = new EventSource(streamUrl);

        analyticsEventSource.onopen = () => {
          syncBadge.textContent = "Live SSE Stream";
          syncBadge.classList.add("pulse-pill");
          banner.style.display = "none";
          banner.hidden = true;
        };

        analyticsEventSource.onmessage = (event) => {
          try {
            const streamData = JSON.parse(event.data);
            if (streamData.type === "master_telemetry_sync") {
              if (streamData.server_time) {
                const d = new Date(streamData.server_time);
                syncBadge.textContent = `Live SSE · ${d.toLocaleTimeString()}`;
              }
              if (streamData.overview) {
                renderOverview(streamData.overview);
              }
              if (currentSubview === "admin_activity") {
                renderAdminActivity({
                  roster: streamData.roster || [],
                  security_alerts: streamData.security_alerts || [],
                  activities: streamData.activities || []
                });
              }
            }
          } catch {}
        };

        analyticsEventSource.onerror = () => {
          syncBadge.textContent = "SSE Reconnecting…";
          syncBadge.classList.remove("pulse-pill");
        };
      } catch {}
    }

    function disconnectAnalyticsStream() {
      if (analyticsEventSource) {
        analyticsEventSource.close();
        analyticsEventSource = null;
      }
      syncBadge.classList.remove("pulse-pill");
    }

    const autoBtn = panel.querySelector("#analyticsAutoRefreshBtn");
    const autoLabel = panel.querySelector("#analyticsAutoRefreshLabel");
    autoBtn?.addEventListener("click", () => {
      autoRefreshActive = !autoRefreshActive;
      if (autoLabel) autoLabel.textContent = autoRefreshActive ? "Live SSE: ON" : "Live SSE: OFF";
      autoBtn.classList.toggle("dash-btn-telemetry--active", autoRefreshActive);
      if (autoRefreshActive) {
        connectAnalyticsStream();
        showToast("Live SSE telemetry stream connected");
      } else {
        disconnectAnalyticsStream();
        showToast("Live SSE telemetry paused");
      }
    });

    panel.querySelector("#analyticsManualRefreshBtn")?.addEventListener("click", () => {
      showToast("Syncing telemetry vault…");
      fetchAllTelemetry();
    });

    panel.querySelector("#analyticsOfflineRetryBtn")?.addEventListener("click", () => {
      fetchAllTelemetry();
      connectAnalyticsStream();
    });

    // Handle tab visibility changes to pause/resume SSE
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        disconnectAnalyticsStream();
      } else if (panel.classList.contains("is-active") && autoRefreshActive) {
        connectAnalyticsStream();
      }
    }, { passive: true });

    // Initial load handler
    window.__initMasterAnalytics = () => {
      fetchAllTelemetry();
      connectAnalyticsStream();
    };
  }

  // ── Tab Management ──
  function setupDashboardTabs() {
    const tabList = main.querySelector(".dash-data-tabs");
    if (!tabList) return;

    const tabs = [...tabList.querySelectorAll('[role="tab"]')];
    const panels = {
      teams: main.querySelector("#teamDataPanel"),
      admin: main.querySelector("#adminDataPanel"),
      analytics: main.querySelector("#analyticsDataPanel")
    };

    const activate = (view) => {
      const selectedTab = tabs.find((tab) => tab.dataset.dashTab === view);
      const selectedPanel = panels[view];
      if (!selectedTab || !selectedPanel) return;

      tabList.dataset.active = view;
      tabs.forEach((tab) => {
        const selected = tab === selectedTab;
        tab.setAttribute("aria-selected", String(selected));
        tab.tabIndex = selected ? 0 : -1;
      });
      if (typeof selectedTab.scrollIntoView === "function") {
        selectedTab.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
      }
      Object.entries(panels).forEach(([key, panel]) => {
        if (!panel) return;
        const selected = key === view;
        panel.hidden = !selected;
        panel.classList.toggle("is-active", selected);
      });
      if (view === "analytics" && typeof window.__initMasterAnalytics === "function") {
        window.__initMasterAnalytics();
      }
    };

    tabs.forEach((tab, index) => {
      tab.addEventListener("click", () => activate(tab.dataset.dashTab));
      tab.addEventListener("keydown", (event) => {
        let nextIndex = index;
        if (event.key === "ArrowRight" || event.key === "ArrowDown") nextIndex = (index + 1) % tabs.length;
        else if (event.key === "ArrowLeft" || event.key === "ArrowUp") nextIndex = (index - 1 + tabs.length) % tabs.length;
        else if (event.key === "Home") nextIndex = 0;
        else if (event.key === "End") nextIndex = tabs.length - 1;
        else return;
        event.preventDefault();
        const nextTab = tabs[nextIndex];
        activate(nextTab.dataset.dashTab);
        nextTab.focus();
      });
    });
    activate("teams");
  }

  // ── Render Team Row (With Desktop Hover Peek Intel & Full Dossier Expansion) ──
  function renderTeamRow(team, canDelete, isMasterAdmin) {
    const members = Array.isArray(team.members) ? team.members : [];
    const memberCount = members.length;
    const leadMember = members[0];
    const allCodes = members.map(m => m.verification_code || "").join(" ");
    const allNames = members.map(m => m.name || "").join(" ");
    const searchable = `${team.group_id} ${team.team_name} ${team.track} ${team.college} ${allCodes} ${allNames}`.toLowerCase();
    const groupId = String(team.group_id || "Not assigned");
    const panelId = `team-${groupId.replace(/[^a-zA-Z0-9_-]/g, "") || "record"}`;

    // Prominent Attendee Photo Previews (up to 3 members shown clearly on the right)
    const previewAvatarsHTML = members.slice(0, 3).map((m, idx) => {
      const fallback = getAvatarFallback(m.name, "%23171512", "%23d3e83d");
      const fullUrl = m.photo_url ? getApiAssetUrl(m.photo_url) : "";
      const srcUrl = fullUrl || fallback;
      const roleLabel = idx === 0 ? "Team Lead" : (m.role || "Participant");
      return `
        <img class="dash-preview-photo"
             src="${escapeHTML(srcUrl)}"
             alt="${escapeHTML(m.name || 'Attendee')}"
             title="${escapeHTML(m.name || 'Attendee')} • ${escapeHTML(roleLabel)}"
             loading="lazy"
             decoding="async"
             onerror="this.onerror=null;this.src='${fallback}';">
      `;
    }).join("");

    const extraMembers = members.length > 3 ? members.length - 3 : 0;

    return `
      <article class="dash-team-row" data-track="${escapeHTML(team.track || '')}" data-searchable="${escapeHTML(searchable)}">
        <div class="dash-team-row-top">
          ${isMasterAdmin ? `
            <label class="dash-team-selector" title="Select ${escapeHTML(team.team_name || 'team')} for bulk actions">
              <input class="dash-team-select" type="checkbox" value="${escapeHTML(groupId)}" aria-label="Select ${escapeHTML(team.team_name || 'team')}">
            </label>
          ` : ""}

          <button class="dash-team-row-header" type="button" aria-expanded="false" aria-controls="${escapeHTML(panelId)}">
            <!-- Col 1: ID & Status -->
            <div class="dash-team-id-cell">
              <div class="dash-team-id-group">
                <span class="dash-team-id-badge">${escapeHTML(groupId)}</span>
                <span class="dash-team-verify-pill"><i class="pulse-dot"></i> Confirmed</span>
              </div>
              <span class="dash-team-reg-stamp" title="Registration Date & Time">
                ${getIcon("clock", "dash-icon--xs")} <span>${escapeHTML(formatCompactDateTime(team.created_at))}</span>
              </span>
            </div>

            <!-- Col 2: Identity & University -->
            <div class="dash-team-title-cell">
              <strong class="dash-team-name">${escapeHTML(team.team_name || "Untitled squad")}</strong>
              <span class="dash-team-college-sub">
                ${getIcon("users", "dash-icon--xs")}
                <span>${escapeHTML(team.college || "Institution Not Specified")}</span>
              </span>
            </div>

            <!-- Col 3: Event Track -->
            <div class="dash-team-track-cell">
              <span class="dash-team-track-badge">${escapeHTML(team.track || "General Track")}</span>
            </div>

            <!-- Col 4: Lead Officer (Desktop) -->
            <div class="dash-team-lead-cell">
              <span class="dash-lead-kicker">TEAM LEAD</span>
              <strong class="dash-lead-name">${escapeHTML(leadMember ? leadMember.name : "Single Attendee")}</strong>
            </div>

            <!-- Col 5: Prominent Photos Preview (Right Side) -->
            <div class="dash-team-previews-cell">
              <div class="dash-preview-avatars">
                ${previewAvatarsHTML}
                ${extraMembers > 0 ? `<span class="dash-preview-more">+${extraMembers}</span>` : ""}
              </div>
              <div class="dash-preview-meta">
                <span class="dash-preview-count">${memberCount} ${memberCount === 1 ? 'attendee' : 'attendees'}</span>
                <span class="dash-preview-sub">Pass Preview</span>
              </div>
            </div>

            <!-- Col 6: Expand Chevron -->
            <span class="dash-team-chevron" aria-hidden="true">${getIcon("chevron", "dash-icon--sm")}</span>
          </button>
        </div>

        <!-- Full Expanded Dossier View -->
        <div class="dash-team-row-body" id="${escapeHTML(panelId)}">
          <div class="dash-team-toolbar">
            <span>${isMasterAdmin ? "Master Administrator Inspection • Encrypted Records" : "Staff Inspection View"}</span>
            <span>${memberCount} registered participant${memberCount === 1 ? '' : 's'}</span>
          </div>

          <div class="dash-team-facts">
            <div class="dash-team-fact-tile">
              <span class="dash-fact-label">Institution / College</span>
              <strong>${escapeHTML(team.college || "Not provided")}</strong>
            </div>
            <div class="dash-team-fact-tile">
              <span class="dash-fact-label">Event Track</span>
              <strong>${escapeHTML(team.track || "General")}</strong>
            </div>
            <div class="dash-team-fact-tile">
              <span class="dash-fact-label">Registration Timestamp</span>
              <strong style="color: var(--oxide);">${escapeHTML(formatRegistrationDateTime(team.created_at))}</strong>
            </div>
            <div class="dash-team-fact-tile">
              <span class="dash-fact-label">Group Access Status</span>
              <strong style="color: #118a47;">Authenticated & Active</strong>
            </div>
          </div>

          <div class="dash-team-roster-heading">
            <span>Attendee Roster</span>
            <span>Digital Passes / Venue Check-In</span>
          </div>

          <div class="dash-roster-grid--compact">
            ${members.map((member, index) => {
              const fallback = getAvatarFallback(member.name, "%231a1814", "%23e9e1d2");
              const fullUrl = member.photo_url ? getApiAssetUrl(member.photo_url) : "";
              const srcUrl = fullUrl || fallback;
              const code = member.verification_code || "8492-3019-4821";

              return `
              <article class="dash-member-card-sm ${index === 0 ? 'dash-member-card-sm--leader' : ''}">
                <div class="dash-member-card-sm-top">
                  <span class="dash-member-index">${index === 0 ? "★ Team Lead" : `Member ${String(index + 1).padStart(2, "0")}`}</span>
                  <span class="dash-member-status">
                    <i class="pulse-dot" style="width:5px;height:5px;display:inline-block;border-radius:50%;background:#118a47;"></i>
                    Registered
                  </span>
                </div>

                <div class="dash-member-profile">
                  <div class="dash-member-photo-frame">
                    <img src="${escapeHTML(srcUrl)}"
                         alt="Portrait of ${escapeHTML(member.name || "team member")}"
                         loading="lazy"
                         decoding="async"
                         onerror="this.onerror=null;this.src='${fallback}';">
                  </div>
                  <div class="dash-member-identity">
                    <h3>${escapeHTML(member.name || "Not provided")}</h3>
                    <p>${escapeHTML(member.role || "Participant")}</p>
                    <span>${member.college_id ? `ID: ${escapeHTML(member.college_id)}` : "College ID: Pending"}</span>
                  </div>
                </div>

                <div class="dash-member-contact">
                  <div class="dash-member-contact-item">
                    <div class="dash-member-contact-info">
                      ${getIcon("mail", "dash-icon--xs")}
                      <span class="contact-type">Inst:</span>
                      <strong>${escapeHTML(member.email || "Not provided")}</strong>
                    </div>
                    ${member.email ? `<button type="button" class="dash-contact-copy-btn" data-copy-text="${escapeHTML(member.email)}" aria-label="Copy email">${getIcon("copy", "dash-icon--xs")}</button>` : ""}
                  </div>

                  <div class="dash-member-contact-item">
                    <div class="dash-member-contact-info">
                      ${getIcon("mail", "dash-icon--xs")}
                      <span class="contact-type">Pers:</span>
                      <strong>${escapeHTML(member.personal_email || "Not provided")}</strong>
                    </div>
                    ${member.personal_email ? `<button type="button" class="dash-contact-copy-btn" data-copy-text="${escapeHTML(member.personal_email)}" aria-label="Copy personal email">${getIcon("copy", "dash-icon--xs")}</button>` : ""}
                  </div>

                  <div class="dash-member-contact-item">
                    <div class="dash-member-contact-info">
                      ${getIcon("phone", "dash-icon--xs")}
                      <span class="contact-type">Phone:</span>
                      <strong>${escapeHTML(member.phone || "Not provided")}</strong>
                    </div>
                    ${member.phone ? `<button type="button" class="dash-contact-copy-btn" data-copy-text="${escapeHTML(member.phone)}" aria-label="Copy phone">${getIcon("copy", "dash-icon--xs")}</button>` : ""}
                  </div>
                </div>

                <div class="dash-secret-id">
                  <div class="dash-secret-id-info">
                    <div class="secret-label-row">
                      ${getIcon("shield", "dash-icon--xs")}
                      <span class="secret-label">Staff Verification Code</span>
                    </div>
                    <code class="secret-code">${escapeHTML(code)}</code>
                  </div>
                  <button type="button" class="dash-code-copy-btn" data-copy-code="${escapeHTML(code)}" aria-label="Copy verification code">
                    ${getIcon("copy", "dash-icon--xs")} <span>Copy</span>
                  </button>
                </div>

                <button type="button" class="dash-download-pass" id="downloadIdCardBtn_${groupId}_${index}">
                  ${getIcon("download", "dash-icon--sm")} Download pass PNG
                </button>
              </article>
            `; }).join("") || '<p class="dash-empty-state">No attendees added to this team.</p>'}
          </div>

          ${canDelete ? `
          <div class="dash-team-actions">
            <button class="dash-delete-team" data-group-id="${escapeHTML(groupId)}">
              ${getIcon("trash", "dash-icon--xs")} Delete squad
            </button>
          </div>
          ` : ""}
        </div>
      </article>
    `;
  }
});
