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
        "%cE-Summit 2026 Active Defense%c\nAll administrative sessions, API requests, and asset queries are cryptographically signed, IP-bound, and monitored against unauthorized inspection.",
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
              </div>
              <div class="dash-team-desk-timestamp" title="Official verified registration timestamp">
                ${getIcon("calendar", "dash-icon--xs")}
                <span>Registered: <strong>${escapeHTML(regTimeFull)}</strong></span>
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
              <div class="dash-team-metric-item">
                <span class="metric-lbl">Event Track</span>
                <strong class="metric-val">${escapeHTML(team.track || "General")}</strong>
              </div>
              <div class="dash-team-metric-item">
                <span class="metric-lbl">Attendees</span>
                <strong class="metric-val">${members.length} Confirmed</strong>
              </div>
              <div class="dash-team-metric-item dash-team-metric-item--date">
                <span class="metric-lbl">Registration Date</span>
                <strong class="metric-val">${escapeHTML(regTimeFull)}</strong>
              </div>
            </div>
          </header>

          <!-- Venue Digital Passes Bar -->
          <div class="dash-team-passes-banner">
            <div class="dash-team-passes-title-group">
              <span class="dash-section-kicker">VENUE ACCESS CREDENTIALS</span>
              <h2 class="dash-team-passes-title">Attendee Digital Passes (${members.length})</h2>
            </div>
          </div>

          <!-- Attendee Passes Grid -->
          <div class="dash-roster-grid">
            ${members.map((member, index) => renderDigitalIdCardHTML(team, member, index)).join("") || '<p class="dash-empty-state">No attendees attached to this team yet.</p>'}
          </div>

          <!-- Venue Check-In Security Advisory -->
          <aside class="dash-passes-desk-notice" role="note">
            <span class="dash-passes-desk-notice-badge">SECURITY PROTOCOL</span>
            <div class="dash-passes-desk-notice-content">
              ${getIcon("shield", "dash-icon--xs")}
              <span>Keep downloaded passes on attendees' phones for instant check-in at the security desk.</span>
            </div>
          </aside>
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
          <div class="dash-secret-id-copy">
            <span class="secret-label">Staff Verification Code</span>
            <strong class="secret-code">${escapeHTML(code)}</strong>
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
        </div>
      `;

      setupDashboardTabs();
      registerLazyPhotos(main);

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

  // ── Tab Management ──
  function setupDashboardTabs() {
    const tabList = main.querySelector(".dash-data-tabs");
    if (!tabList) return;

    const tabs = [...tabList.querySelectorAll('[role="tab"]')];
    const panels = {
      teams: main.querySelector("#teamDataPanel"),
      admin: main.querySelector("#adminDataPanel")
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
      Object.entries(panels).forEach(([key, panel]) => {
        if (!panel) return;
        const selected = key === view;
        panel.hidden = !selected;
        panel.classList.toggle("is-active", selected);
      });
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
              <span class="dash-team-id-badge">${escapeHTML(groupId)}</span>
              <span class="dash-team-verify-pill"><i class="pulse-dot"></i> Confirmed</span>
              <span class="dash-team-reg-stamp" title="Registration Date & Time">
                ${getIcon("clock", "dash-icon--xs")} ${escapeHTML(formatCompactDateTime(team.created_at))}
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
                  <div class="dash-secret-id-copy">
                    <span class="secret-label">Staff verification code</span>
                    <strong class="secret-code">${escapeHTML(code)}</strong>
                  </div>
                  <button type="button" class="dash-code-copy-btn" data-copy-code="${escapeHTML(code)}" aria-label="Copy code">
                    ${getIcon("copy", "dash-icon--xs")} Copy
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
