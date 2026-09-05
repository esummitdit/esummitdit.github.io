"use strict";

/**
 * Dashboard — Departmental Permissions, Digital ID Passes & Canvas PNG Downloader
 */
document.addEventListener("DOMContentLoaded", async () => {
  const main = document.getElementById("dashMain");
  const roleBadge = document.getElementById("dashRoleBadge");
  const logoutBtn = document.getElementById("logoutBtn");

  // ── Auth Guard ──
  const session = await Auth.validateSession();
  if (!session) {
    window.location.replace("login.html");
    return;
  }

  logoutBtn.addEventListener("click", () => Auth.logout());

  // Check if first-time admin needs to change temporary password
  if (session.must_change_password) {
    showMandatoryPasswordChangeModal();
    return;
  }

  if (session.role === "team") {
    roleBadge.textContent = "TEAM PORTAL";
    roleBadge.classList.add("badge--team");
    renderTeamDashboard(session);
  } else if (session.role === "master_admin" || session.role === "admin" || session.role === "event_coordinator" || session.role === "team_manager") {
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
    main.innerHTML = `
      <div class="dash-container" style="max-width: 520px; margin-top: 3rem;">
        <div class="registration-success-card" style="border-left: 4px solid var(--accent); padding: 2rem;">
          <h2 style="margin:0 0 0.5rem; font-size: 1.4rem;">Password Change Required</h2>
          <p style="margin:0 0 1.5rem; font-size: 0.9rem; color: var(--muted-ink);">
            You are logged in with a temporary password. Please set your new permanent password below.
          </p>
          <form id="changePasswordForm">
            <div class="field-group" style="margin-bottom: 1rem;">
              <label for="oldPw">Current Temporary Password</label>
              <input id="oldPw" type="password" required placeholder="••••••••" style="width:100%;">
            </div>
            <div class="field-group" style="margin-bottom: 1.5rem;">
              <label for="newPw">New Secure Password</label>
              <input id="newPw" type="password" required minlength="6" placeholder="At least 6 characters" style="width:100%;">
            </div>
            <div id="changePwError" class="login-error" style="margin-bottom:1rem;" role="alert"></div>
            <button class="button button--ink" type="submit" style="width:100%; justify-content:center;">
              Set New Password & Continue <span aria-hidden="true">→</span>
            </button>
          </form>
        </div>
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
          alert("Password changed successfully! Please log in with your new password.");
          Auth.logout();
        } else {
          errEl.textContent = data.detail || "Failed to update password.";
        }
      } catch {
        errEl.textContent = "Server unreachable. Please try again.";
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
      main.innerHTML = `
        <div class="dash-container">
          <section class="dash-team-overview" aria-labelledby="team-overview-title">
            <div class="dash-overview-header">
              <div class="dash-group-id-display">
                <span class="mono-label">E-SUMMIT 2026 / TEAM PORTAL</span>
                <h1 id="team-overview-title" class="dash-team-name">${team.team_name}</h1>
                <span class="dash-group-id">${team.group_id}</span>
              </div>
              <div class="dash-status-pill">
                <span class="pulse-dot"></span>
                <span>Registration confirmed</span>
              </div>
            </div>
            <div class="dash-overview-details">
              <div class="dash-detail">
                <span class="mono-label">EVENT TRACK</span>
                <span class="dash-detail-value">${team.track}</span>
              </div>
              <div class="dash-detail">
                <span class="mono-label">INSTITUTION</span>
                <span class="dash-detail-value">${team.college}</span>
              </div>
            </div>
            <div class="dash-arrival-note">
              <span aria-hidden="true">01</span>
              <p><strong>Before you arrive:</strong> download each attendee pass and keep the verification code ready for the check-in desk.</p>
            </div>
          </section>

          <section aria-labelledby="passes-title">
          <div class="dash-section-head dash-section-head--passes">
            <span class="step-num">${String(team.members.length).padStart(2, "0")}</span>
            <div>
              <h2 id="passes-title" class="dash-section-title">Your attendee passes</h2>
              <p class="section-hint">Each pass belongs to one person. Download it before arrival; staff will verify the code at check-in.</p>
            </div>
          </div>

          <div class="dash-roster-grid">
            ${team.members.map((m, i) => renderDigitalIdCardHTML(team, m, i)).join('')}
          </div>
          </section>
        </div>
      `;

      // Attach Canvas Download Listeners to Digital ID Pass Cards
      team.members.forEach((m, i) => {
        const downloadBtn = document.getElementById(`downloadIdCardBtn_${i}`);
        if (downloadBtn) {
          downloadBtn.addEventListener("click", () => downloadDigitalIdCardPNG(team, m, i));
        }
      });

    } catch (err) {
      main.innerHTML = `
        <div class="dash-container">
          <div class="dash-error-card">
            <h2>Unable to Load Dashboard</h2>
            <p>${err.message}</p>
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
            <h3>${member.name || 'Team Member'}</h3>
            <span class="dash-pass-role">${member.role || 'Participant'}</span>
          </div>
          <img class="dash-pass-photo" src="${photo}" alt="Portrait of ${member.name || 'team member'}" onerror="this.src='https://ui-avatars.com/api/?name=User&background=1a1814&color=e9e1d2'">
        </div>

        <dl class="dash-pass-facts">
          <div>
            <dt>Group ID</dt><dd>${team.group_id}</dd>
          </div>
          <div>
            <dt>Event track</dt><dd>${team.track}</dd>
          </div>
        </dl>

        <div class="dash-pass-contact">
          <div>✉ <strong>Inst Email:</strong> ${member.email || 'N/A'}</div>
          <div>✉ <strong>Personal:</strong> ${member.personal_email || 'N/A'}</div>
          <div>📞 <strong>Phone:</strong> ${member.phone || 'N/A'}</div>
          ${member.college_id ? `<div>🪪 <strong>College ID:</strong> ${member.college_id}</div>` : ''}
        </div>

        <!-- 12-Digit Verification Security Code -->
        <div class="dash-verification-code" aria-label="Staff verification code ${code}">
          <span>Staff verification code</span><strong>${code}</strong>
        </div>

        <button type="button" class="button button--secondary dash-download-pass" id="downloadIdCardBtn_${index}" aria-label="Download ${member.name || 'team member'}'s ID pass as PNG">
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
      const isTechOrMaster = session.role === "master_admin" || userDept === "Technical Team";
      main.setAttribute("aria-busy", "false");

      main.innerHTML = `
        <div class="dash-container">
          <!-- Department Access Notice Bar -->
          <div style="background: var(--paper); border: 2px solid var(--ink); border-radius: 8px; padding: 0.85rem 1.25rem; margin-bottom: 1.5rem; display: flex; justify-content: space-between; align-items: center;">
            <div>
              <span class="mono-label" style="color: var(--accent);">LOGGED IN DEPARTMENT</span>
              <strong style="display: block; font-size: 1.05rem;">${userDept.toUpperCase()}</strong>
            </div>
            <div class="mono-label" style="padding: 0.25rem 0.6rem; border-radius: 4px; background: ${isTechOrMaster ? '#d32f2f' : '#1a1814'}; color: #fff;">
              ${isTechOrMaster ? 'FULL CONTROLS ACTIVE' : 'READ-ONLY INSPECTION VIEW'}
            </div>
          </div>

          <!-- Stats Row -->
          <div class="dash-stats-row">
            <div class="dash-stat-card">
              <span class="dash-stat-value">${stats.total_teams}</span>
              <span class="mono-label">TEAMS</span>
            </div>
            <div class="dash-stat-card">
              <span class="dash-stat-value">${stats.total_participants}</span>
              <span class="mono-label">PARTICIPANTS</span>
            </div>
            <div class="dash-stat-card">
              <span class="dash-stat-value">${stats.total_tracks}</span>
              <span class="mono-label">EVENT TRACKS</span>
            </div>
          </div>

          <!-- Teams Section -->
          <div class="dash-section-head">
            <span class="step-num">★</span>
            <div>
              <h2 class="dash-section-title">All Registered Teams & Staff 12-Digit Pass Verification</h2>
              <p class="section-hint">Inspect team details and verify 12-digit security codes against attendee ID cards.</p>
            </div>
          </div>

          <div class="dash-search-bar">
            <label class="sr-only" for="teamSearchInput">Search registered teams</label>
            <input type="search" id="teamSearchInput" placeholder="Search by team name, group ID, or member verification code…" class="dash-search-input">
          </div>

          ${isTechOrMaster ? `
          <div class="dash-csv-tools" aria-label="Team CSV tools">
            <div>
              <strong>Team data CSV</strong>
              <p>Export every team and member field, edit it directly, then import the CSV to update the vault.</p>
            </div>
            <div class="dash-csv-actions">
              <button type="button" class="button button--secondary" id="exportTeamsCsvBtn">Export CSV ↓</button>
              ${session.role === 'master_admin' ? `
                <label class="button button--ink" for="importTeamsCsvInput">Import edited CSV ↑</label>
                <input id="importTeamsCsvInput" class="sr-only" type="file" accept=".csv,text/csv">
              ` : ''}
            </div>
          </div>
          ` : ''}

          ${session.role === 'master_admin' ? `
          <div class="dash-danger-tools" aria-label="Master admin team deletion tools">
            <button type="button" class="button button--secondary" id="selectAllTeamsBtn">Select all teams</button>
            <button type="button" class="button button--secondary" id="deleteSelectedTeamsBtn">Delete selected</button>
            <button type="button" class="button button--ink" id="deleteAllTeamsBtn">Delete every team</button>
          </div>
          ` : ''}

          <div class="dash-teams-list" id="teamsListContainer">
            ${teams.length ? teams.map(t => renderTeamRow(t, session.role === 'master_admin', session.role === 'master_admin')).join('') : '<p style="padding: 2rem; text-align: center; color: var(--muted-ink); font-family: var(--mono);">No teams registered yet.</p>'}
          </div>

          ${session.role === 'master_admin' ? `
          <!-- Admin Management (Master Only) -->
          <div class="dash-section-head" style="margin-top: 3rem;">
            <span class="step-num">⚙</span>
            <div>
              <h2 class="dash-section-title">Admin Department & Account Management</h2>
              <p class="section-hint">Register Outlook IDs for event staff, assign department roles, and issue pre-generated temporary passwords.</p>
            </div>
          </div>

          <div class="dash-admin-mgmt" id="adminMgmtContainer">
            <button class="button button--ink" id="createAdminBtn" type="button">
              + Register Department Admin Outlook ID <span aria-hidden="true">→</span>
            </button>
            <div id="adminAccountsList" class="dash-admin-list" style="margin-top: 1rem;"></div>
          </div>
          ` : ''}
        </div>
      `;

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
        searchInput.addEventListener("input", () => {
          const query = searchInput.value.toLowerCase();
          const container = document.getElementById("teamsListContainer");
          container.querySelectorAll(".dash-team-row").forEach(row => {
            const text = row.dataset.searchable || "";
            row.style.display = text.includes(query) ? "" : "none";
          });
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
            alert("Server unreachable.");
          }
        });
      });

      if (session.role === "master_admin") {
        const teamsContainer = document.getElementById("teamsListContainer");
        const selectedTeamIds = () => [...teamsContainer.querySelectorAll(".dash-team-select:checked")].map(input => input.value);
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

        document.getElementById("deleteSelectedTeamsBtn")?.addEventListener("click", () => deleteSelectedTeams(selectedTeamIds()));
        document.getElementById("deleteAllTeamsBtn")?.addEventListener("click", () => deleteSelectedTeams(teams.map(team => team.group_id)));
        document.getElementById("selectAllTeamsBtn")?.addEventListener("click", () => {
          teamsContainer.querySelectorAll(".dash-team-select").forEach(input => { input.checked = true; });
        });
      }

      // ── Master Admin: Register Admin Outlook ID & Assign Department ──
      const createAdminBtn = document.getElementById("createAdminBtn");
      if (createAdminBtn) {
        createAdminBtn.addEventListener("click", async () => {
          const name = prompt("Enter Admin Full Name (e.g. Juhi Sharma):");
          if (!name || !name.trim()) return;

          const email = prompt("Enter Admin Outlook Email ID (e.g. 10000xxxxx@dit.edu.in):");
          if (!email || !email.trim()) return;

          const dept = prompt(
            "Assign Official Department:\n1. Technical Team\n2. Design Team\n3. PR & Sponsorship Team\n4. Content & Anchoring Team",
            "Technical Team"
          );
          if (!dept) return;

          const customPw = prompt("Set a custom temporary password (or leave blank to auto-generate):", "");

          try {
            const res = await Auth.apiFetch("/admin/accounts", {
              method: "POST",
              body: JSON.stringify({
                name: name.trim(),
                email: email.trim(),
                department: dept.trim(),
                role: "admin",
                password: customPw ? customPw.trim() : null
              }),
            });
            const data = await res.json();
            if (res.ok) {
              alert(`✅ Department Admin Registered Successfully!\n\nName: ${data.name}\nEmail: ${data.email}\nDepartment: ${data.department}\nTemporary Password: ${data.temp_password}\n\nPass this temporary password to the admin. They will be forced to set their permanent password upon first login.`);
              location.reload();
            } else {
              alert(`Error: ${data.detail || 'Failed to create admin account.'}`);
            }
          } catch {
            alert("Server unreachable.");
          }
        });

        // Load admin accounts list
        Auth.apiFetch("/admin/accounts").then(async res => {
          if (!res.ok) return;
          const admins = await res.json();
          const list = document.getElementById("adminAccountsList");
          list.innerHTML = admins.map(a => `
            <div class="dash-admin-row" style="display:flex; justify-content:space-between; align-items:center; padding:0.85rem 1rem; margin-bottom:0.5rem; background:rgba(255,255,255,0.5); border:1px solid rgba(26,24,20,0.12); border-radius:8px;">
              <div>
                <strong style="display:block;">${a.name || 'Admin Member'}</strong>
                <span class="dash-admin-email" style="font-family:var(--mono); font-size:0.85rem;">${a.email}</span>
                <span class="dash-admin-role-tag" style="margin-left:0.5rem; font-size:0.72rem; text-transform:uppercase; padding:0.15rem 0.5rem; background:var(--ink); color:var(--paper); border-radius:4px; font-family:var(--mono);">${a.department || 'Technical Team'}</span>
                ${a.must_change_password ? '<span style="font-size:0.72rem; color:var(--oxide); margin-left:0.5rem; font-family:var(--mono);">⚠️ TEMP PW ACTIVE</span>' : '<span style="font-size:0.72rem; color:green; margin-left:0.5rem; font-family:var(--mono);">✓ ACTIVE</span>'}
              </div>
              ${a.role !== 'master_admin' ? `<button class="dash-remove-admin" data-email="${a.email}" style="padding:0.35rem 0.75rem; background:#d32f2f; color:#fff; border:none; border-radius:4px; font-size:0.78rem; cursor:pointer;">Remove Admin</button>` : '<span class="mono-label" style="color:var(--muted-ink);">MASTER (NON-VOLATILE)</span>'}
            </div>
          `).join('');

          list.querySelectorAll(".dash-remove-admin").forEach(btn => {
            btn.addEventListener("click", async () => {
              if (!confirm(`Remove admin ${btn.dataset.email}?`)) return;
              const res = await Auth.apiFetch(`/admin/accounts/${encodeURIComponent(btn.dataset.email)}`, { method: "DELETE" });
              if (res.ok) btn.closest(".dash-admin-row").remove();
            });
          });
        }).catch(() => {});
      }

    } catch (err) {
      main.innerHTML = `
        <div class="dash-container">
          <div class="dash-error-card">
            <h2>Unable to Load Admin Panel</h2>
            <p>${err.message}</p>
            <a class="button button--ink" href="login.html">Back to Login <span aria-hidden="true">→</span></a>
          </div>
        </div>
      `;
    }
  }

  function renderTeamRow(team, canDelete, isMasterAdmin) {
    const memberCount = team.members ? team.members.length : 0;
    const allCodes = (team.members || []).map(m => m.verification_code || '').join(' ');
    const searchable = `${team.group_id} ${team.team_name} ${team.track} ${team.college} ${allCodes}`.toLowerCase();

    return `
      <div class="dash-team-row" data-searchable="${searchable}">
        <button class="dash-team-row-header" type="button" aria-expanded="false" aria-controls="team-${team.group_id}">
          <span class="dash-team-id mono-label">${team.group_id}</span>
          <span class="dash-team-name">${team.team_name}</span>
          <span class="dash-team-track">${team.track}</span>
          <span class="dash-team-count">${memberCount} ${memberCount === 1 ? 'member' : 'members'}</span>
          <span class="dash-team-chevron">▾</span>
        </button>
        <div class="dash-team-row-body" id="team-${team.group_id}">
          <div class="dash-team-toolbar">
            ${isMasterAdmin ? `<label class="dash-team-select-label"><input class="dash-team-select" type="checkbox" value="${team.group_id}"> Select for bulk actions</label>` : '<span class="dash-team-readonly">STAFF INSPECTION VIEW</span>'}
            <span class="dash-team-toolbar-note">${memberCount} ${memberCount === 1 ? 'registered participant' : 'registered participants'}</span>
          </div>
          <div class="dash-team-facts">
            <div><span class="dash-fact-label">Institution</span><strong>${team.college || 'Not provided'}</strong></div>
            <div><span class="dash-fact-label">Event track</span><strong>${team.track || 'Not provided'}</strong></div>
            <div><span class="dash-fact-label">Group access</span><strong>Portal credentials active</strong></div>
          </div>
          <div class="dash-team-roster-heading"><span>ATTENDEE ROSTER</span><span>SECRET IDs / CHECK-IN</span></div>
          <div class="dash-roster-grid dash-roster-grid--compact">
            ${(team.members || []).map((m, i) => `
              <article class="dash-member-card-sm ${i === 0 ? 'dash-member-card-sm--leader' : ''}">
                <div class="dash-member-card-sm-top">
                  <span class="dash-member-index">${i === 0 ? '★ TEAM LEAD' : `MEMBER ${String(i + 1).padStart(2, '0')}`}</span>
                  <span class="dash-member-status">VERIFIED</span>
                </div>
                <div class="dash-member-profile">
                  <div class="dash-member-photo-frame">
                    <img src="${getApiAssetUrl(m.photo_url) || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.name || 'Member')}&background=1a1814&color=e9e1d2&bold=true`}" alt="${m.name || 'Member'} portrait" onerror="this.onerror=null;this.src='https://ui-avatars.com/api/?name=Member&background=1a1814&color=e9e1d2&bold=true';">
                  </div>
                  <div class="dash-member-identity">
                    <h3>${m.name || 'N/A'}</h3>
                    <p>${m.role || 'Participant'}</p>
                    <span>${m.college_id ? `College ID ${m.college_id}` : 'College ID not provided'}</span>
                  </div>
                </div>
                <div class="dash-member-contact">
                  <div><span>Institutional email</span><strong>${m.email || 'Not provided'}</strong></div>
                  <div><span>Personal email</span><strong>${m.personal_email || 'Not provided'}</strong></div>
                  <div><span>Phone / WhatsApp</span><strong>${m.phone || 'Not provided'}</strong></div>
                </div>
                <div class="dash-secret-id">
                  <span>STAFF SECRET ID</span>
                  <strong>${m.verification_code || 'Not assigned'}</strong>
                </div>
                ${m.note ? `<p class="dash-member-note"><span>Member note</span>${m.note}</p>` : ''}
              </article>
            `).join('')}
          </div>
          ${canDelete ? `
          <div class="dash-team-actions">
            <button class="dash-delete-team" data-group-id="${team.group_id}">Delete Team</button>
          </div>
          ` : ''}
        </div>
      </div>
    `;
  }
});
