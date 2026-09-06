"use strict";

/**
 * Dashboard — Departmental Permissions, Digital ID Passes & Canvas PNG Downloader
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

  const dismissOpening = () => {
    if (!opening) return;
    opening.classList.add("is-leaving");
    window.setTimeout(() => opening.remove(), 620);
  };

  setupServerStatus(liveStatus);

  // ── Auth Guard ──
  const session = await Auth.validateSession();
  if (!session) {
    window.location.replace("login.html");
    return;
  }
  window.setTimeout(dismissOpening, 850);

  logoutBtn.addEventListener("click", () => Auth.logout());

  // ── Privacy Shield for Unattended Screen / Shoulder Surfing ──
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
    // Block F12 Developer Tools
    if (e.key === "F12") {
      e.preventDefault();
      return false;
    }
    // Block Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C (Inspect Element)
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && ["I", "i", "J", "j", "C", "c"].includes(e.key)) {
      e.preventDefault();
      return false;
    }
    // Block Ctrl+U (View Source)
    if ((e.ctrlKey || e.metaKey) && ["U", "u"].includes(e.key)) {
      e.preventDefault();
      return false;
    }
  });

  // Periodically sanitize developer console
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

  // Authenticated In-Memory Photo Blob Loader
  const _photoBlobMap = new Map();
  async function hydrateSecurePhotos(container = document) {
    const photoImgs = container.querySelectorAll("img[data-asset-url]");
    for (const img of photoImgs) {
      const assetUrl = img.getAttribute("data-asset-url");
      if (!assetUrl) continue;
      if (_photoBlobMap.has(assetUrl)) {
        img.src = _photoBlobMap.get(assetUrl);
        continue;
      }
      try {
        const fullUrl = getApiAssetUrl(assetUrl);
        const res = await fetch(fullUrl, {
          headers: { Authorization: `Bearer ${Auth.getToken()}` }
        });
        if (res.ok) {
          const blob = await res.blob();
          const blobUrl = URL.createObjectURL(blob);
          _photoBlobMap.set(assetUrl, blobUrl);
          img.src = blobUrl;
        }
      } catch {}
    }
  }

  // Check if first-time admin needs to change temporary password
  if (session.must_change_password) {
    showMandatoryPasswordChangeModal();
    return;
  }

  if (session.role === "team") {
    if (openingNote) openingNote.textContent = "Welcome back. Your team desk is ready.";
    roleBadge.textContent = "TEAM PORTAL";
    roleBadge.classList.add("badge--team");
    renderTeamDashboard(session);
  } else if (session.role === "master_admin" || session.role === "admin" || session.role === "event_coordinator" || session.role === "team_manager" || session.role === "event_head") {
    if (openingNote) openingNote.textContent = session.role === "master_admin"
      ? "Welcome back. The admin desk is ready."
      : session.role === "event_head"
        ? "Welcome back. The event overview is ready."
      : "Welcome back. The staff desk is open.";
    const deptStr = session.department ? session.department.toUpperCase() : "ADMIN";
    roleBadge.textContent = session.role === "master_admin" ? "MASTER ADMIN" : `DEPT: ${deptStr}`;
    roleBadge.classList.add("badge--admin");
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
              <p>Your administrator password is now active. You are not logged in automatically.</p>
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
            Auth.logout("login.html");
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
  //  TEAM MEMBER DASHBOARD & DIGITAL ID PASS
  // ═══════════════════════════════════════
  async function renderTeamDashboard(session) {
    try {
      const res = await Auth.apiFetch(`/teams/${session.group_id}`);
      if (!res.ok) throw new Error("Failed to load team data.");
      const team = await res.json();

      main.setAttribute("aria-busy", "false");
      const members = Array.isArray(team.members) ? team.members : [];
      main.innerHTML = `
        <div class="dash-container dash-team-portal">
          <section class="dash-portal-intro" aria-labelledby="team-overview-title">
            <div class="dash-portal-intro-copy">
              <p class="dash-eyebrow">E-SUMMIT 2026 / TEAM DESK</p>
              <h1 id="team-overview-title">${escapeHTML(team.team_name || "Your team")}</h1>
              <p>Everything your team needs for a smooth check-in is here.</p>
            </div>
            <div class="dash-status-pill"><span class="pulse-dot" aria-hidden="true"></span><span>Registration confirmed</span></div>
          </section>

          <section class="dash-team-summary" aria-label="Team summary">
            <div class="dash-summary-item dash-summary-item--id"><span>Group ID</span><strong>${escapeHTML(team.group_id || "—")}</strong></div>
            <div class="dash-summary-item"><span>Event track</span><strong>${escapeHTML(team.track || "Not assigned")}</strong></div>
            <div class="dash-summary-item"><span>Institution</span><strong>${escapeHTML(team.college || "Not provided")}</strong></div>
            <div class="dash-summary-item"><span>Attendees</span><strong>${members.length}</strong></div>
          </section>

          <section class="dash-content-section" aria-labelledby="passes-title">
            <div class="dash-section-head dash-section-head--passes">
              <span class="step-num" aria-hidden="true">${String(members.length).padStart(2, "0")}</span>
              <div>
                <p class="dash-eyebrow">Digital entry passes</p>
                <h2 id="passes-title" class="dash-section-title">Your attendee passes</h2>
                <p class="section-hint">Download a pass for each attendee before arrival. Event staff will use its verification code at check-in.</p>
              </div>
            </div>
            <p class="dash-arrival-note"><span aria-hidden="true">↳</span><span>Keep the downloaded pass ready on the attendee’s phone. It works even without a signal once saved.</span></p>
            <div class="dash-roster-grid">
              ${members.map((member, index) => renderDigitalIdCardHTML(team, member, index)).join("") || '<p class="dash-empty-state">No attendees are attached to this team yet.</p>'}
            </div>
          </section>
        </div>
      `;

      // Attach Canvas Download Listeners to Digital ID Pass Cards
      members.forEach((m, i) => {
        const downloadBtn = document.getElementById(`downloadIdCardBtn_${i}`);
        if (downloadBtn) {
          downloadBtn.addEventListener("click", () => downloadDigitalIdCardPNG(team, m, i));
        }
      });

      // Hydrate photos with in-memory secure blobs
      hydrateSecurePhotos(main);

    } catch (err) {
      main.setAttribute("aria-busy", "false");
      main.innerHTML = `
        <div class="dash-container">
          <div class="dash-error-card" role="alert">
            <h2>Unable to Load Dashboard</h2>
            <p>${escapeHTML(err.message || "Please try again.")}</p>
            <a class="button button--ink" href="login.html">Back to Login <span aria-hidden="true">→</span></a>
          </div>
        </div>
      `;
    }
  }

  function renderDigitalIdCardHTML(team, member, index) {
    const isLeader = index === 0;
    const photo = getApiAssetUrl(member.photo_url) || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name || 'User')}&background=1a1814&color=e9e1d2&bold=true`;
    const code = member.verification_code || "8492-3019-4821";

    return `
      <article class="dash-member-card ${isLeader ? 'dash-member-card--leader' : ''}">
        <div class="dash-pass-header">
          <div>
            <span class="dash-pass-kicker">${isLeader ? 'TEAM LEAD / OFFICIAL PASS' : 'E-SUMMIT 2026 / OFFICIAL PASS'}</span>
            <h3>${escapeHTML(member.name || "Team member")}</h3>
            <span class="dash-pass-role">${escapeHTML(member.role || "Participant")}</span>
          </div>
          <img class="dash-pass-photo" src="${escapeHTML(photo)}" data-asset-url="${escapeHTML(member.photo_url || '')}" alt="Portrait of ${escapeHTML(member.name || "team member")}" onerror="this.onerror=null;this.src='https://ui-avatars.com/api/?name=User&background=1a1814&color=e9e1d2'">
        </div>

        <dl class="dash-pass-facts">
          <div>
            <dt>Group ID</dt><dd>${escapeHTML(team.group_id || "—")}</dd>
          </div>
          <div>
            <dt>Event track</dt><dd>${escapeHTML(team.track || "Not assigned")}</dd>
          </div>
        </dl>

        <div class="dash-pass-contact">
          <div><span aria-hidden="true">✉</span><strong>Institutional email</strong><span>${escapeHTML(member.email || "Not provided")}</span></div>
          <div><span aria-hidden="true">✉</span><strong>Personal email</strong><span>${escapeHTML(member.personal_email || "Not provided")}</span></div>
          <div><span aria-hidden="true">☎</span><strong>Phone</strong><span>${escapeHTML(member.phone || "Not provided")}</span></div>
          ${member.college_id ? `<div><span aria-hidden="true">#</span><strong>College ID</strong><span>${escapeHTML(member.college_id)}</span></div>` : ""}
        </div>

        <!-- 12-Digit Verification Security Code -->
        <div class="dash-verification-code" aria-label="Staff verification code ${escapeHTML(code)}">
          <span>Staff verification code</span><strong>${escapeHTML(code)}</strong>
        </div>

        <button type="button" class="button button--secondary dash-download-pass" id="downloadIdCardBtn_${index}" aria-label="Download ${escapeHTML(member.name || "team member")} ID pass as PNG">
          Download pass <span aria-hidden="true">↓</span>
        </button>
      </article>
    `;
  }

  // ═══════════════════════════════════════
  //  HTML5 CANVAS DIGITAL ID CARD GENERATOR
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
    ctx.fillText(`TEAM      ${team.team_name}`, 72, 344);
    ctx.fillText(`GROUP ID  ${team.group_id}`, 72, 390);
    ctx.fillText(`TRACK     ${team.track}`, 72, 436);
    ctx.fillText(`COLLEGE   ${team.college}`, 72, 482);
    ctx.fillText(`MEMBER    ${String(index + 1).padStart(2, "0")} / ${(team.members || []).length}`, 72, 528);
    ctx.fillText(`EMAIL     ${member.email || "-"}`, 72, 574);
    ctx.fillText(`PHONE     ${member.phone || "-"}`, 72, 620);
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
      image.src = getApiAssetUrl(member.photo_url) || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name || "Member")}&background=1a1814&color=e9e1d2`;
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
    }, "image/png");
  }

  // ═══════════════════════════════════════
  //  ADMIN DASHBOARD & DEPARTMENT PERMISSIONS
  // ═══════════════════════════════════════
  async function renderAdminDashboard(session) {
    try {
      const [statsRes, teamsRes] = await Promise.all([
        Auth.apiFetch("/admin/stats"),
        Auth.apiFetch("/admin/teams"),
      ]);

      if (!statsRes.ok || !teamsRes.ok) throw new Error("Failed to load admin data.");

      const stats = await statsRes.json();
      const teams = await teamsRes.json();

      const userDept = session.department || "Technical Team";
      const isTechOrMaster = session.role === "master_admin" || (userDept === "Technical Team" && session.role !== "event_head");
      const canExportTeams = isTechOrMaster || session.role === "event_head";
      main.setAttribute("aria-busy", "false");

      const accessMode = session.role === "master_admin"
        ? "Master controls"
        : isTechOrMaster
          ? "Team operations"
          : "Read-only inspection";
      main.innerHTML = `
        <div class="dash-container dash-admin-portal">
          <section class="dash-admin-context" aria-labelledby="admin-desk-title">
            <div><p class="dash-eyebrow">Event operations</p><h1 id="admin-desk-title">Dashboard</h1></div>
            <p class="dash-admin-context-meta"><strong>${escapeHTML(userDept)}</strong><span>${escapeHTML(accessMode)}</span></p>
          </section>

          <div class="dash-data-tabs" role="tablist" aria-label="Dashboard data views" data-active="teams">
            <button id="teamDataTab" class="dash-data-tab" type="button" role="tab" aria-selected="true" aria-controls="teamDataPanel" data-dash-tab="teams"><span aria-hidden="true">01</span> Team data</button>
            <button id="adminDataTab" class="dash-data-tab" type="button" role="tab" aria-selected="false" aria-controls="adminDataPanel" data-dash-tab="admin" tabindex="-1"><span aria-hidden="true">02</span> Admin data</button>
          </div>

          <section id="teamDataPanel" class="dash-data-panel" role="tabpanel" aria-labelledby="teamDataTab" tabindex="-1">
            <div class="dash-panel-heading">
              <div>
                <p class="dash-eyebrow">Live registration directory</p>
                <h2>Team data</h2>
                <p>Search every team, inspect attendee details, and confirm the code shown on a pass.</p>
              </div>
              <span class="dash-result-count" id="teamResultCount" aria-live="polite">${teams.length} ${teams.length === 1 ? "team" : "teams"}</span>
            </div>

            <div class="dash-stats-row" aria-label="Registration summary">
              <div class="dash-stat-card"><span class="dash-stat-value">${escapeHTML(stats.total_teams)}</span><span>Registered teams</span></div>
              <div class="dash-stat-card"><span class="dash-stat-value">${escapeHTML(stats.total_participants)}</span><span>Participants</span></div>
              <div class="dash-stat-card"><span class="dash-stat-value">${escapeHTML(stats.total_tracks)}</span><span>Event tracks</span></div>
            </div>

            <div class="dash-search-bar">
              <label for="teamSearchInput">Find a team or attendee</label>
              <div class="dash-search-control"><span aria-hidden="true">⌕</span><input type="search" id="teamSearchInput" autocomplete="off" placeholder="Search teams, IDs or pass codes"><button id="clearTeamSearch" class="dash-search-clear" type="button" aria-label="Clear team search" hidden>Clear</button></div>
            </div>

            ${canExportTeams ? `
            <div class="dash-csv-tools" aria-label="Team CSV tools">
              <div><strong>Data export</strong><p>Download the live team directory, or import an edited CSV if you are the master admin.</p></div>
              <div class="dash-csv-actions">
                <button type="button" class="button button--secondary" id="exportTeamsCsvBtn">Export CSV <span aria-hidden="true">↓</span></button>
                ${session.role === "master_admin" ? `<label class="button button--accent" for="importTeamsCsvInput">Import CSV <span aria-hidden="true">↑</span></label><input id="importTeamsCsvInput" class="sr-only" type="file" accept=".csv,text/csv">` : ""}
              </div>
            </div>` : ""}

            ${session.role === "master_admin" ? `
            <section class="dash-team-bulk-actions" aria-labelledby="bulk-team-actions-title">
              <div><p id="bulk-team-actions-title">Bulk team actions</p><span id="selectedTeamsCount" aria-live="polite">0 selected</span></div>
              <div class="dash-bulk-action-buttons">
                <button type="button" class="button button--secondary" id="selectAllTeamsBtn">Select all</button>
                <button type="button" class="button button--secondary" id="clearSelectedTeamsBtn" disabled>Clear</button>
                <button type="button" class="button button--danger" id="deleteSelectedTeamsBtn" disabled>Delete selected</button>
              </div>
              <details class="dash-delete-all-disclosure">
                <summary>More deletion options <span aria-hidden="true">⌄</span></summary>
                <div><p>This permanently removes every team and its uploaded member photos.</p><button type="button" class="dash-delete-all-btn" id="deleteAllTeamsBtn">Delete every team</button></div>
              </details>
            </section>` : ""}

            <div class="dash-teams-list" id="teamsListContainer">
              ${teams.length ? teams.map((team) => renderTeamRow(team, session.role === "master_admin", session.role === "master_admin")).join("") : '<p class="dash-empty-state">No teams are registered yet.</p>'}
            </div>
            <p class="dash-empty-state" id="teamSearchEmpty" role="status" hidden>No teams match that search.</p>
          </section>

          <section id="adminDataPanel" class="dash-data-panel" role="tabpanel" aria-labelledby="adminDataTab" tabindex="-1" hidden>
            <div class="dash-panel-heading dash-panel-heading--compact"><div><p class="dash-eyebrow">Account</p><h2>Admin data</h2></div></div>
            <dl class="dash-admin-account">
              <div><dt>Signed in as</dt><dd>${escapeHTML(userDept)}<span>${escapeHTML(session.role.replace(/_/g, " "))}</span></dd></div>
              <div><dt>Access</dt><dd>${escapeHTML(accessMode)}</dd></div>
            </dl>

            ${session.role === "master_admin" ? `
            <section class="dash-staff-directory" aria-labelledby="active-staff-title">
              <div class="dash-staff-directory-head"><div><p class="dash-eyebrow">Directory</p><h3 id="active-staff-title">Active staff</h3></div><span id="adminCountBadge" class="dash-count-badge" aria-label="0 active staff">0</span></div>
              <div id="adminAccountsList" class="dash-staff-list"></div>
            </section>

            <details class="dash-staff-access-disclosure">
              <summary><span><small>Staff access</small><strong>Invite a staff member</strong></span><span class="dash-disclosure-icon" aria-hidden="true">⌄</span></summary>
              <div class="dash-staff-access-body">
                <form class="dash-admin-invite-form" id="adminInviteForm">
                  <div class="dash-invite-form-head"><span>New staff invite</span><span class="dash-invite-lock">Private</span></div>
                  <div class="dash-invite-fields">
                    <div class="field-group"><label for="inviteName">Full name</label><input id="inviteName" required autocomplete="name" placeholder="e.g. Ananya Rao"></div>
                    <div class="field-group"><label for="inviteEmail">Institution email</label><input id="inviteEmail" type="email" required autocomplete="email" placeholder="name@dit.edu.in"></div>
                    <div class="field-group"><label for="inviteDepartment">Department</label><select id="inviteDepartment" required><option value="Technical Team">Technical Team</option><option value="Event Operations">Event Operations</option><option value="Academic & Faculty Council">Academic & Faculty Council</option><option value="Design Team">Design Team</option><option value="PR & Sponsorship Team">PR & Sponsorship Team</option><option value="Content & Anchoring Team">Content & Anchoring Team</option></select></div>
                    <div class="field-group"><label for="inviteRole">Access role</label><select id="inviteRole" required><option value="admin">Department admin</option><option value="event_coordinator">Event coordinator</option><option value="team_manager">Team manager</option><option value="event_head">Event head / faculty read-only</option></select></div>
                    <div class="field-group"><label for="invitePassword">Temporary password <span>optional</span></label><input id="invitePassword" type="password" minlength="6" placeholder="Generated if empty" autocomplete="new-password"></div>
                  </div>
                  <p id="adminInviteStatus" class="dash-inline-status" role="status"></p>
                  <button class="button button--ink" type="submit">Create secure invite <span aria-hidden="true">→</span></button>
                </form>
              </div>
            </details>` : ""}
          </section>
        </div>
      `;

      setupDashboardTabs();
      hydrateSecurePhotos(main);

      document.getElementById("exportTeamsCsvBtn")?.addEventListener("click", async () => {
        const response = await Auth.apiFetch("/teams/admin/csv");
        if (!response.ok) {
          alert("Unable to export team CSV.");
          return;
        }
        const blob = await response.blob();
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "esummit-teams.csv";
        link.click();
        setTimeout(() => URL.revokeObjectURL(link.href), 1000);
      });

      document.getElementById("importTeamsCsvInput")?.addEventListener("change", async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;
        if (!confirm("Import this CSV and replace the current team records?")) return;
        const body = new FormData();
        body.append("file", file);
        const response = await Auth.apiFetch("/teams/admin/csv", { method: "POST", body });
        const result = await response.json().catch(() => ({}));
        if (!response.ok) {
          alert(result.detail || "Unable to import team CSV.");
          return;
        }
        alert(`Imported ${result.teams} team record(s). The dashboard will refresh.`);
        window.location.reload();
      });

      // ── Search ──
      const searchInput = document.getElementById("teamSearchInput");
      if (searchInput) {
        const clearSearchButton = document.getElementById("clearTeamSearch");
        const filterTeams = () => {
          const query = searchInput.value.toLowerCase();
          const container = document.getElementById("teamsListContainer");
          let visibleRows = 0;
          container.querySelectorAll(".dash-team-row").forEach(row => {
            const text = row.dataset.searchable || "";
            const isMatch = text.includes(query);
            row.hidden = !isMatch;
            if (isMatch) visibleRows += 1;
          });
          document.getElementById("teamResultCount").textContent = `${visibleRows} ${visibleRows === 1 ? "team" : "teams"}`;
          document.getElementById("teamSearchEmpty").hidden = visibleRows !== 0;
          clearSearchButton.hidden = !query;
        };
        searchInput.addEventListener("input", filterTeams);
        clearSearchButton?.addEventListener("click", () => {
          searchInput.value = "";
          filterTeams();
          searchInput.focus();
        });
      }

      // ── Expand/Collapse Rows ──
      document.querySelectorAll(".dash-team-row-header").forEach(header => {
        header.addEventListener("click", () => {
          const row = header.closest(".dash-team-row");
          const expanded = row.classList.toggle("is-expanded");
          header.setAttribute("aria-expanded", String(expanded));
        });
      });

      // ── Delete Team (Technical Team & Master Admin only) ──
      document.querySelectorAll(".dash-delete-team").forEach(btn => {
        btn.addEventListener("click", async (e) => {
          e.stopPropagation();
          const groupId = btn.dataset.groupId;
          if (!confirm(`Delete team ${groupId}? This action cannot be undone.`)) return;

          try {
            const res = await Auth.apiFetch(`/admin/teams/${groupId}`, { method: "DELETE" });
            if (res.ok) {
              btn.closest(".dash-team-row").remove();
            } else {
              const err = await res.json();
              alert(err.detail || "Failed to delete team.");
            }
          } catch {
            alert("The team change couldn't be saved right now. Please try again later or contact the technical team.");
          }
        });
      });

      if (session.role === "master_admin") {
        const teamsContainer = document.getElementById("teamsListContainer");
        const selectedTeamIds = () => [...teamsContainer.querySelectorAll(".dash-team-select:checked")].map(input => input.value);
        const selectedTeamsCount = document.getElementById("selectedTeamsCount");
        const deleteSelectedButton = document.getElementById("deleteSelectedTeamsBtn");
        const clearSelectedButton = document.getElementById("clearSelectedTeamsBtn");
        const updateBulkActions = () => {
          const selectedCount = selectedTeamIds().length;
          selectedTeamsCount.textContent = `${selectedCount} selected`;
          deleteSelectedButton.disabled = selectedCount === 0;
          clearSelectedButton.disabled = selectedCount === 0;
        };
        const deleteSelectedTeams = async (ids) => {
          if (!ids.length) {
            alert("Select at least one team first.");
            return;
          }
          const label = ids.length === teams.length ? "ALL registered teams" : `${ids.length} selected team(s)`;
          if (!confirm(`First confirmation: permanently delete ${label}, including member photos?`)) return;
          const typed = prompt('Second confirmation: type DELETE TEAMS to continue.');
          if (typed !== "DELETE TEAMS") return;

          const response = await Auth.apiFetch("/admin/teams/bulk-delete", {
            method: "POST",
            body: JSON.stringify({ group_ids: ids, confirmation: typed })
          });
          const result = await response.json().catch(() => ({}));
          if (!response.ok) {
            alert(result.detail || "Unable to delete selected teams.");
            return;
          }
          alert(`Deleted ${result.deleted.length} team record(s).`);
          window.location.reload();
        };

        deleteSelectedButton?.addEventListener("click", () => deleteSelectedTeams(selectedTeamIds()));
        document.getElementById("deleteAllTeamsBtn")?.addEventListener("click", () => deleteSelectedTeams(teams.map(team => team.group_id)));
        document.getElementById("selectAllTeamsBtn")?.addEventListener("click", () => {
          teamsContainer.querySelectorAll(".dash-team-select").forEach(input => { input.checked = true; });
          updateBulkActions();
        });
        clearSelectedButton?.addEventListener("click", () => {
          teamsContainer.querySelectorAll(".dash-team-select").forEach(input => { input.checked = false; });
          updateBulkActions();
        });
        teamsContainer.querySelectorAll(".dash-team-select").forEach((input) => input.addEventListener("change", updateBulkActions));
        updateBulkActions();
      }

      // ── Master Admin: Structured staff invite ──
      const inviteForm = document.getElementById("adminInviteForm");
      if (inviteForm) {
        const loadAdminAccounts = async () => {
          const res = await Auth.apiFetch("/admin/accounts");
          if (!res.ok) return;
          const admins = await res.json();
          const list = document.getElementById("adminAccountsList");
          const countBadge = document.getElementById("adminCountBadge");
          countBadge.textContent = admins.length;
          countBadge.setAttribute("aria-label", `${admins.length} active staff`);
          const humanize = (value) => String(value || "Not assigned")
            .replace(/_/g, " ")
            .replace(/\b\w/g, (character) => character.toUpperCase());
          const staffName = (value) => String(value || "Admin member")
            .replace(/\s*\((?:master\s*)?admin\)\s*$/i, "")
            .trim() || "Admin member";
          const initials = (value) => staffName(value).split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();

          list.innerHTML = admins.length ? admins.map((admin) => {
            const name = staffName(admin.name);
            const email = String(admin.email || "");
            const role = humanize(admin.role || "admin");
            const department = humanize(admin.department || "Technical Team");
            const isMaster = admin.role === "master_admin";
            const state = admin.must_change_password ? "Invite pending" : "Active";
            return `
              <article class="dash-staff-card">
                <div class="dash-staff-avatar" aria-hidden="true">${escapeHTML(initials(admin.name))}</div>
                <div class="dash-staff-card-main">
                  <h4>${escapeHTML(name)}</h4>
                  <p>${escapeHTML(role)} <span aria-hidden="true">·</span> ${escapeHTML(department)}</p>
                  ${email ? `<a class="dash-staff-email" href="mailto:${escapeHTML(email)}" title="${escapeHTML(email)}">${escapeHTML(email)}</a>` : '<span class="dash-staff-email">No email assigned</span>'}
                </div>
                <div class="dash-staff-card-side">
                  <span class="dash-staff-presence ${admin.must_change_password ? "is-pending" : "is-active"}">${state}</span>
                  ${isMaster ? '<span class="dash-staff-protected">Protected</span>' : `<button class="dash-remove-admin" data-email="${escapeHTML(email)}" type="button">Remove</button>`}
                </div>
              </article>
            `;
          }).join("") : '<p class="dash-empty-state">No staff accounts are active.</p>';

          list.querySelectorAll(".dash-remove-admin").forEach(btn => {
            btn.addEventListener("click", async () => {
              if (!confirm(`Remove admin ${btn.dataset.email}?`)) return;
              const res = await Auth.apiFetch(`/admin/accounts/${encodeURIComponent(btn.dataset.email)}`, { method: "DELETE" });
              if (res.ok) {
                btn.closest(".dash-staff-card").remove();
                const remaining = list.querySelectorAll(".dash-staff-card").length;
                countBadge.textContent = remaining;
                countBadge.setAttribute("aria-label", `${remaining} active staff`);
                if (!remaining) list.innerHTML = '<p class="dash-empty-state">No staff accounts are active.</p>';
              }
            });
          });
        };

        inviteForm.addEventListener("submit", async (event) => {
          event.preventDefault();
          const status = document.getElementById("adminInviteStatus");
          status.classList.remove("is-error");
          status.textContent = "Creating secure invite…";
          try {
            const res = await Auth.apiFetch("/admin/accounts", { method: "POST", body: JSON.stringify({
              name: document.getElementById("inviteName").value.trim(),
              email: document.getElementById("inviteEmail").value.trim(),
              department: document.getElementById("inviteDepartment").value,
              role: document.getElementById("inviteRole").value,
              password: document.getElementById("invitePassword").value || null
            }) });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) { status.classList.add("is-error"); status.textContent = data.detail || "Invite could not be created."; return; }
            status.textContent = `Invite created. Temporary password: ${data.temp_password}`;
            inviteForm.reset();
            await loadAdminAccounts();
          } catch {
            status.classList.add("is-error");
            status.textContent = "The invite couldn't be saved right now. Please try again later or contact the technical team.";
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
            <p>${escapeHTML(err.message || "Please try again.")}</p>
            <a class="button button--ink" href="login.html">Back to Login <span aria-hidden="true">→</span></a>
          </div>
        </div>
      `;
    }
  }

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

  function renderTeamRow(team, canDelete, isMasterAdmin) {
    const memberCount = team.members ? team.members.length : 0;
    const allCodes = (team.members || []).map(m => m.verification_code || '').join(' ');
    const searchable = `${team.group_id} ${team.team_name} ${team.track} ${team.college} ${allCodes}`.toLowerCase();
    const groupId = String(team.group_id || "Not assigned");
    const panelId = `team-${groupId.replace(/[^a-zA-Z0-9_-]/g, "") || "record"}`;

    return `
      <article class="dash-team-row" data-searchable="${escapeHTML(searchable)}">
        <div class="dash-team-row-top">
          ${isMasterAdmin ? `<label class="dash-team-selector"><input class="dash-team-select" type="checkbox" value="${escapeHTML(groupId)}" aria-label="Select ${escapeHTML(team.team_name || "team")}"><span aria-hidden="true">✓</span></label>` : ""}
          <button class="dash-team-row-header" type="button" aria-expanded="false" aria-controls="${escapeHTML(panelId)}">
            <span class="dash-team-id mono-label">${escapeHTML(groupId)}</span>
            <span class="dash-team-name">${escapeHTML(team.team_name || "Untitled team")}</span>
            <span class="dash-team-track">${escapeHTML(team.track || "Track pending")}</span>
            <span class="dash-team-count">${memberCount} ${memberCount === 1 ? 'member' : 'members'}</span>
            <span class="dash-team-chevron" aria-hidden="true">▾</span>
          </button>
        </div>
        <div class="dash-team-row-body" id="${escapeHTML(panelId)}">
          <div class="dash-team-toolbar">
            <span class="dash-team-readonly">${isMasterAdmin ? "Selected records can be deleted from the bulk toolbar." : "Staff inspection view"}</span>
            <span class="dash-team-toolbar-note">${memberCount} ${memberCount === 1 ? 'registered participant' : 'registered participants'}</span>
          </div>
          <div class="dash-team-facts">
            <div><span class="dash-fact-label">Institution</span><strong>${escapeHTML(team.college || "Not provided")}</strong></div>
            <div><span class="dash-fact-label">Event track</span><strong>${escapeHTML(team.track || "Not provided")}</strong></div>
            <div><span class="dash-fact-label">Group access</span><strong>Portal credentials active</strong></div>
          </div>
          <div class="dash-team-roster-heading"><span>Attendee roster</span><span>Pass IDs / check-in</span></div>
          <div class="dash-roster-grid dash-roster-grid--compact">
            ${(team.members || []).map((member, index) => {
              const photo = getApiAssetUrl(member.photo_url) || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name || "Member")}&background=1a1814&color=e9e1d2&bold=true`;
              return `
              <article class="dash-member-card-sm ${index === 0 ? 'dash-member-card-sm--leader' : ''}">
                <div class="dash-member-card-sm-top">
                  <span class="dash-member-index">${index === 0 ? "★ Team lead" : `Member ${String(index + 1).padStart(2, "0")}`}</span>
                  <span class="dash-member-status">Registered</span>
                </div>
                <div class="dash-member-profile">
                  <div class="dash-member-photo-frame">
                    <img src="${escapeHTML(photo)}" data-asset-url="${escapeHTML(member.photo_url || '')}" alt="Portrait of ${escapeHTML(member.name || "team member")}" onerror="this.onerror=null;this.src='https://ui-avatars.com/api/?name=Member&background=1a1814&color=e9e1d2&bold=true';">
                  </div>
                  <div class="dash-member-identity">
                    <h3>${escapeHTML(member.name || "Not provided")}</h3>
                    <p>${escapeHTML(member.role || "Participant")}</p>
                    <span>${member.college_id ? `College ID ${escapeHTML(member.college_id)}` : "College ID not provided"}</span>
                  </div>
                </div>
                <div class="dash-member-contact">
                  <div><span>Institutional email</span><strong>${escapeHTML(member.email || "Not provided")}</strong></div>
                  <div><span>Personal email</span><strong>${escapeHTML(member.personal_email || "Not provided")}</strong></div>
                  <div><span>Phone / WhatsApp</span><strong>${escapeHTML(member.phone || "Not provided")}</strong></div>
                </div>
                <div class="dash-secret-id">
                  <span>Staff verification code</span>
                  <strong>${escapeHTML(member.verification_code || "Not assigned")}</strong>
                </div>
                ${member.note ? `<p class="dash-member-note"><span>Member note</span>${escapeHTML(member.note)}</p>` : ""}
              </article>
            `; }).join("") || '<p class="dash-empty-state">No attendees added to this team.</p>'}
          </div>
          ${canDelete ? `
          <div class="dash-team-actions">
            <button class="dash-delete-team" data-group-id="${escapeHTML(groupId)}">Delete team</button>
          </div>
          ` : ""}
        </div>
      </article>
    `;
  }
});
