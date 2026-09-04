"use strict";

/**
 * Dashboard — Departmental Permissions, Digital ID Passes & Canvas PNG Downloader
 */
document.addEventListener("DOMContentLoaded", () => {
  const main = document.getElementById("dashMain");
  const roleBadge = document.getElementById("dashRoleBadge");
  const logoutBtn = document.getElementById("logoutBtn");

  // ── Auth Guard ──
  if (!Auth.isAuthenticated()) {
    window.location.href = "login.html";
    return;
  }

  const session = Auth.getSession();
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

      main.innerHTML = `
        <div class="dash-container">
          <!-- Team Overview Card -->
          <div class="dash-team-overview">
            <div class="dash-overview-header">
              <div class="dash-group-id-display">
                <span class="mono-label">OFFICIAL GROUP ID</span>
                <span class="dash-group-id">${team.group_id}</span>
              </div>
              <div class="dash-status-pill">
                <span class="pulse-dot"></span>
                <span>REGISTERED</span>
              </div>
            </div>
            <div class="dash-overview-details">
              <div class="dash-detail">
                <span class="mono-label">TEAM NAME</span>
                <span class="dash-detail-value">${team.team_name}</span>
              </div>
              <div class="dash-detail">
                <span class="mono-label">EVENT TRACK</span>
                <span class="dash-detail-value">${team.track}</span>
              </div>
              <div class="dash-detail">
                <span class="mono-label">INSTITUTION</span>
                <span class="dash-detail-value">${team.college}</span>
              </div>
            </div>
          </div>

          <!-- Team Roster & Digital ID Passes -->
          <div class="dash-section-head">
            <span class="step-num">${String(team.members.length).padStart(2, "0")}</span>
            <div>
              <h2 class="dash-section-title">Team Roster & Official Digital Pass Cards</h2>
              <p class="section-hint">Download your official Digital ID Card below. Show this 12-digit code to event staff for instant entry verification.</p>
            </div>
          </div>

          <div class="dash-roster-grid">
            ${team.members.map((m, i) => renderDigitalIdCardHTML(team, m, i)).join('')}
          </div>
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
    const photo = member.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name || 'User')}&background=1a1814&color=e9e1d2&bold=true`;
    const code = member.verification_code || "8492-3019-4821";

    return `
      <div class="dash-member-card ${isLeader ? 'dash-member-card--leader' : ''}" style="border: 2px solid var(--ink); border-radius: 12px; padding: 1.5rem; background: var(--paper); box-shadow: 4px 4px 0 var(--ink); margin-bottom: 1.5rem;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem; border-bottom: 2px solid rgba(26,24,20,0.1); padding-bottom: 0.75rem;">
          <div>
            <span class="mono-label" style="font-size: 0.7rem; letter-spacing: 0.08em; color: var(--accent);">E-SUMMIT 2026 // OFFICIAL PASS</span>
            <h3 style="margin: 0.2rem 0 0; font-size: 1.2rem; font-weight: 800;">${member.name || 'Team Member'}</h3>
            <span style="font-size: 0.8rem; color: var(--muted-ink); font-family: var(--mono);">${member.role || 'Participant'}</span>
          </div>
          <img src="${photo}" alt="${member.name}" style="width: 54px; height: 54px; border-radius: 8px; border: 2px solid var(--ink); object-fit: cover;" onerror="this.src='https://ui-avatars.com/api/?name=User&background=1a1814&color=e9e1d2'">
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-bottom: 0.8rem;">
          <div>
            <span class="mono-label">GROUP ID</span>
            <p style="margin: 0; font-family: var(--mono); font-weight: 700; font-size: 1rem;">${team.group_id}</p>
          </div>
          <div>
            <span class="mono-label">EVENT TRACK</span>
            <p style="margin: 0; font-size: 0.85rem; font-weight: 600;">${team.track}</p>
          </div>
        </div>

        <div style="font-size: 0.78rem; font-family: var(--mono); color: var(--ink); margin-bottom: 1rem; line-height: 1.5; background: rgba(26,24,20,0.04); padding: 0.65rem 0.85rem; border-radius: 8px;">
          <div>✉ <strong>Inst Email:</strong> ${member.email || 'N/A'}</div>
          <div>✉ <strong>Personal:</strong> ${member.personal_email || 'N/A'}</div>
          <div>📞 <strong>Phone:</strong> ${member.phone || 'N/A'}</div>
          ${member.college_id ? `<div>🪪 <strong>College ID:</strong> ${member.college_id}</div>` : ''}
        </div>

        <!-- 12-Digit Verification Security Code -->
        <div style="background: var(--ink); color: var(--paper); padding: 0.75rem 1rem; border-radius: 6px; margin-bottom: 1rem; text-align: center;">
          <span style="display: block; font-size: 0.65rem; letter-spacing: 0.1em; color: rgba(233,225,210,0.7); margin-bottom: 0.2rem;">STAFF VERIFICATION CODE</span>
          <span style="font-family: var(--mono); font-weight: 700; font-size: 1.15rem; letter-spacing: 0.15em; color: #ffeb3b;">${code}</span>
        </div>

        <button type="button" class="button button--secondary" id="downloadIdCardBtn_${index}" style="width: 100%; justify-content: center; font-size: 0.85rem;">
          Download ID Card (PNG) 📥
        </button>
      </div>
    `;
  }

  // ═══════════════════════════════════════
  //  HTML5 CANVAS DIGITAL ID CARD GENERATOR
  // ═══════════════════════════════════════
  function downloadDigitalIdCardPNG(team, member, index) {
    const canvas = document.createElement("canvas");
    canvas.width = 640;
    canvas.height = 380;
    const ctx = canvas.getContext("2d");

    // Background
    ctx.fillStyle = "#e9e1d2";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Border
    ctx.lineWidth = 6;
    ctx.strokeStyle = "#1a1814";
    ctx.strokeRect(12, 12, canvas.width - 24, canvas.height - 24);

    // Top Header Bar
    ctx.fillStyle = "#1a1814";
    ctx.fillRect(12, 12, canvas.width - 24, 54);

    ctx.fillStyle = "#e9e1d2";
    ctx.font = "bold 20px Archivo, sans-serif";
    ctx.fillText("E—SUMMIT 26 // DIGITAL ID PASS", 30, 46);

    ctx.fillStyle = "#d32f2f";
    ctx.fillRect(canvas.width - 150, 24, 120, 30);
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 12px DM Mono, monospace";
    ctx.fillText("VERIFIED PASS", canvas.width - 140, 44);

    // Member Info
    ctx.fillStyle = "#1a1814";
    ctx.font = "bold 26px Archivo, sans-serif";
    ctx.fillText(member.name || "Participant", 30, 115);

    ctx.fillStyle = "#55524c";
    ctx.font = "16px DM Mono, monospace";
    ctx.fillText(`ROLE: ${member.role || "Participant"}`, 30, 142);

    ctx.font = "14px Archivo, sans-serif";
    ctx.fillText(`TEAM: ${team.team_name}`, 30, 175);
    ctx.fillText(`TRACK: ${team.track}`, 30, 198);
    ctx.fillText(`COLLEGE: ${team.college}`, 30, 221);

    // Group ID Badge
    ctx.fillStyle = "#1a1814";
    ctx.fillRect(30, 242, 160, 36);
    ctx.fillStyle = "#e9e1d2";
    ctx.font = "bold 16px DM Mono, monospace";
    ctx.fillText(`ID: ${team.group_id}`, 45, 266);

    // 12-Digit Verification Box
    ctx.fillStyle = "#1a1814";
    ctx.fillRect(30, 295, canvas.width - 60, 54);

    ctx.fillStyle = "#e9e1d2";
    ctx.font = "10px DM Mono, monospace";
    ctx.fillText("STAFF VERIFICATION CODE", 45, 312);

    ctx.fillStyle = "#ffeb3b";
    ctx.font = "bold 22px DM Mono, monospace";
    ctx.fillText(member.verification_code || "8492-3019-4821", 45, 338);

    // Trigger PNG Download
    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ID_Pass_${team.group_id}_${(member.name || "Member").replace(/\s+/g, "_")}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
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
            <input type="text" id="teamSearchInput" placeholder="Search by team name, group ID, or member verification code…" class="dash-search-input">
          </div>

          <div class="dash-teams-list" id="teamsListContainer">
            ${teams.length ? teams.map(t => renderTeamRow(t, isTechOrMaster)).join('') : '<p style="padding: 2rem; text-align: center; color: var(--muted-ink); font-family: var(--mono);">No teams registered yet.</p>'}
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
          row.classList.toggle("is-expanded");
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

  function renderTeamRow(team, canDelete) {
    const memberCount = team.members ? team.members.length : 0;
    const allCodes = (team.members || []).map(m => m.verification_code || '').join(' ');
    const searchable = `${team.group_id} ${team.team_name} ${team.track} ${team.college} ${allCodes}`.toLowerCase();

    return `
      <div class="dash-team-row" data-searchable="${searchable}">
        <div class="dash-team-row-header">
          <span class="dash-team-id mono-label">${team.group_id}</span>
          <span class="dash-team-name">${team.team_name}</span>
          <span class="dash-team-track">${team.track}</span>
          <span class="dash-team-count">${memberCount} ${memberCount === 1 ? 'member' : 'members'}</span>
          <span class="dash-team-chevron">▾</span>
        </div>
        <div class="dash-team-row-body">
          <div class="dash-team-meta">
            <span><strong>Institution:</strong> ${team.college}</span>
          </div>
          <div class="dash-roster-grid dash-roster-grid--compact" style="grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1rem; margin-top: 1rem;">
            ${(team.members || []).map((m, i) => `
              <div class="dash-member-card-sm" style="border:1px solid rgba(26,24,20,0.15); padding:0.85rem; border-radius:8px; background:#fff;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem;">
                  <span class="mono-label">${i === 0 ? '★ LEADER' : `MEMBER 0${i + 1}`}</span>
                  ${m.photo_url ? `<img src="${m.photo_url}" style="width:28px; height:28px; border-radius:50%; object-fit:cover; border:1px solid var(--ink);">` : ''}
                </div>
                <strong style="display:block; font-size:0.95rem;">${m.name || 'N/A'}</strong>
                <span class="dash-sm-detail" style="font-size:0.8rem; color:var(--muted-ink);">${m.email || 'N/A'}</span>
                <span class="dash-sm-detail" style="font-size:0.8rem;">Role: ${m.role || 'Participant'}</span>
                <!-- Staff Verification Code Box -->
                <div style="margin-top:0.5rem; padding:0.4rem 0.6rem; background:#1a1814; color:#ffeb3b; border-radius:4px; font-family:var(--mono); font-size:0.85rem; font-weight:700; text-align:center;">
                  ${m.verification_code || '8492-3019-4821'}
                </div>
              </div>
            `).join('')}
          </div>
          ${canDelete ? `
          <div class="dash-team-actions" style="margin-top: 1rem;">
            <button class="dash-delete-team" data-group-id="${team.group_id}">Delete Team</button>
          </div>
          ` : ''}
        </div>
      </div>
    `;
  }
});
