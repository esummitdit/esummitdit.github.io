/**
 * E-Summit 2026 — Privacy-Conscious Client Telemetry & Analytics Engine
 *
 * Implements privacy-respecting browser analytics, safe session management,
 * and transparent device intelligence using standard Web APIs only.
 * No covert fingerprinting, no battery scraping, no unauthorized GPS requests.
 */
"use strict";

(function () {
  const VISITOR_STORAGE_KEY = "esummit_analytics_vid";
  const SESSION_STORAGE_KEY = "esummit_analytics_sid";
  const OPT_OUT_STORAGE_KEY = "esummit_analytics_optout";
  const NOTICE_DISMISSED_KEY = "esummit_analytics_notice_ack";

  // Generate safe opaque random IDs
  function generateOpaqueId(prefix) {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return `${prefix}_${crypto.randomUUID().replace(/-/g, "").slice(0, 16)}`;
    }
    const rand = Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10);
    return `${prefix}_${rand}`;
  }

  // Safe Storage access (handles Private Browsing sandboxes)
  const StorageSafe = {
    get(type, key) {
      try {
        const store = type === "local" ? window.localStorage : window.sessionStorage;
        return store ? store.getItem(key) : null;
      } catch {
        return null;
      }
    },
    set(type, key, value) {
      try {
        const store = type === "local" ? window.localStorage : window.sessionStorage;
        if (store) store.setItem(key, value);
      } catch {}
    },
    remove(type, key) {
      try {
        const store = type === "local" ? window.localStorage : window.sessionStorage;
        if (store) store.removeItem(key);
      } catch {}
    }
  };

  let inMemoryVisitorId = null;
  let inMemorySessionId = null;

  function getVisitorId() {
    if (isOptedOut()) return "opted_out";
    let vid = StorageSafe.get("local", VISITOR_STORAGE_KEY);
    if (!vid) {
      vid = inMemoryVisitorId || generateOpaqueId("v");
      StorageSafe.set("local", VISITOR_STORAGE_KEY, vid);
      inMemoryVisitorId = vid;
    }
    return vid;
  }

  function getSessionId() {
    let sid = StorageSafe.get("session", SESSION_STORAGE_KEY);
    if (!sid) {
      sid = inMemorySessionId || generateOpaqueId("s");
      StorageSafe.set("session", SESSION_STORAGE_KEY, sid);
      inMemorySessionId = sid;
    }
    return sid;
  }

  function isOptedOut() {
    return StorageSafe.get("local", OPT_OUT_STORAGE_KEY) === "1";
  }

  // Device & Display Telemetry (Standard browser APIs only)
  function gatherDeviceTelemetry() {
    const nav = window.navigator || {};
    const scr = window.screen || {};
    const conn = nav.connection || nav.mozConnection || nav.webkitConnection || null;

    let orientationType = "unknown";
    try {
      orientationType = (scr.orientation && scr.orientation.type) || (window.innerWidth > window.innerHeight ? "landscape" : "portrait");
    } catch {}

    const viewport = {
      width: window.innerWidth || null,
      height: window.innerHeight || null
    };

    const screen = {
      width: scr.width || null,
      height: scr.height || null,
      availWidth: scr.availWidth || null,
      availHeight: scr.availHeight || null,
      colorDepth: scr.colorDepth || null,
      pixelRatio: window.devicePixelRatio || 1.0,
      orientation: orientationType
    };

    let timeZone = "UTC";
    try {
      timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
    } catch {}

    const navigatorInfo = {
      language: nav.language || "en",
      languages: Array.isArray(nav.languages) ? Array.from(nav.languages).slice(0, 5) : [],
      timeZone: timeZone,
      platform: nav.platform || "unknown",
      hardwareConcurrency: typeof nav.hardwareConcurrency === "number" ? nav.hardwareConcurrency : null,
      deviceMemory: typeof nav.deviceMemory === "number" ? nav.deviceMemory : null,
      maxTouchPoints: typeof nav.maxTouchPoints === "number" ? nav.maxTouchPoints : 0,
      cookieEnabled: Boolean(nav.cookieEnabled)
    };

    let connectionInfo = null;
    if (conn) {
      connectionInfo = {
        effectiveType: conn.effectiveType || null,
        downlink: typeof conn.downlink === "number" ? conn.downlink : null,
        rtt: typeof conn.rtt === "number" ? conn.rtt : null,
        saveData: Boolean(conn.saveData)
      };
    }

    const privacyStatus = {
      doNotTrack: nav.doNotTrack || window.doNotTrack || null,
      storageAvailable: (function () {
        try {
          const testKey = "__es_test__";
          localStorage.setItem(testKey, testKey);
          localStorage.removeItem(testKey);
          return true;
        } catch {
          return false;
        }
      })(),
      cookiesEnabled: Boolean(nav.cookieEnabled),
      memoryAvailable: typeof nav.deviceMemory === "number",
      connectionApiAvailable: Boolean(conn)
    };

    return {
      viewport: viewport,
      screen: screen,
      navigator: navigatorInfo,
      connection: connectionInfo,
      privacy_status: privacyStatus,
      user_agent: nav.userAgent || "",
      page_url: window.location.href,
      pathname: window.location.pathname + window.location.hash,
      referrer: document.referrer || "",
      page_title: document.title || ""
    };
  }

  // Session duration tracker
  const sessionStartTime = Date.now();
  let pageStartTime = Date.now();
  let accumulatedPageSeconds = 0;

  function getPageDurationSeconds() {
    const currentActiveSeconds = (Date.now() - pageStartTime) / 1000;
    return Math.round((accumulatedPageSeconds + currentActiveSeconds) * 10) / 10;
  }

  // Event dispatcher with debounced batching & Beacon fallback
  let eventQueue = [];
  let flushTimer = null;

  function getApiEndpoint() {
    const origin = (typeof API_ORIGIN !== "undefined" && API_ORIGIN)
      ? API_ORIGIN
      : (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
        ? "http://127.0.0.1:3000"
        : "https://apiesummitdit.shitijhalder.in";
    return `${origin}/api/analytics/events`;
  }

  function getAuthHeader() {
    try {
      if (typeof Auth !== "undefined" && typeof Auth.getToken === "function") {
        const token = Auth.getToken();
        if (token) return { Authorization: `Bearer ${token}` };
      }
    } catch {}
    return {};
  }

  function flushQueue() {
    if (flushTimer) {
      clearTimeout(flushTimer);
      flushTimer = null;
    }
    if (eventQueue.length === 0 || isOptedOut()) return;

    const eventsToSend = [...eventQueue];
    eventQueue = [];

    const payload = {
      visitor_id: getVisitorId(),
      session_id: getSessionId(),
      events: eventsToSend,
      device: gatherDeviceTelemetry()
    };

    const endpoint = getApiEndpoint();
    const headers = {
      "Content-Type": "application/json",
      ...getAuthHeader()
    };

    fetch(endpoint, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(payload),
      keepalive: true
    }).catch(() => {
      // Gracefully silent on network drop / backend offline
    });
  }

  function scheduleFlush() {
    if (!flushTimer) {
      flushTimer = setTimeout(flushQueue, 6000);
    }
  }

  function trackEvent(eventType, extraData = {}) {
    if (isOptedOut()) return;
    const ev = {
      event_type: eventType,
      visitor_id: getVisitorId(),
      session_id: getSessionId(),
      page: window.location.pathname + window.location.hash,
      referrer: document.referrer || "",
      duration_seconds: getPageDurationSeconds(),
      timestamp: new Date().toISOString(),
      device: gatherDeviceTelemetry(),
      data: extraData
    };

    eventQueue.push(ev);
    if (eventQueue.length >= 10) {
      flushQueue();
    } else {
      scheduleFlush();
    }
  }

  // Life-cycle triggers
  function initLifecycleTracking() {
    // 1. Initial Pageview
    trackEvent("pageview", { title: document.title });

    // 2. Visibility / Tab switch tracking
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        accumulatedPageSeconds += (Date.now() - pageStartTime) / 1000;
        trackEvent("visibility_hidden", { duration_seconds: getPageDurationSeconds() });
        scheduleFlush();
      } else {
        pageStartTime = Date.now();
        trackEvent("visibility_visible");
      }
    }, { passive: true });

    // 3. Page unload beacon
    window.addEventListener("pagehide", () => {
      accumulatedPageSeconds += (Date.now() - pageStartTime) / 1000;
      if (eventQueue.length > 0) {
        const payload = JSON.stringify({
          visitor_id: getVisitorId(),
          session_id: getSessionId(),
          events: [...eventQueue, {
            event_type: "session_exit",
            visitor_id: getVisitorId(),
            session_id: getSessionId(),
            duration_seconds: getPageDurationSeconds(),
            page: window.location.pathname + window.location.hash
          }],
          device: gatherDeviceTelemetry()
        });

        if (navigator.sendBeacon) {
          try {
            const blob = new Blob([payload], { type: "application/json" });
            navigator.sendBeacon(getApiEndpoint(), blob);
          } catch {}
        }
      }
    }, { passive: true });

    // 4. In-page hash/route navigation
    window.addEventListener("hashchange", () => {
      trackEvent("navigation", {
        hash: window.location.hash,
        page: window.location.pathname + window.location.hash
      });
    }, { passive: true });
  }

  // Periodic admin presence heartbeat (only if logged in as admin)
  function initAdminHeartbeat() {
    setInterval(() => {
      try {
        if (typeof Auth === "undefined") return;
        const session = Auth.getSession();
        if (!session || !["master_admin", "admin", "event_coordinator", "team_manager", "event_head"].includes(session.role)) {
          return;
        }

        const token = Auth.getToken();
        if (!token) return;

        const endpoint = (typeof API_ORIGIN !== "undefined" && API_ORIGIN ? API_ORIGIN : "http://127.0.0.1:3000") + "/api/analytics/admin/heartbeat";
        fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({
            session_id: getSessionId(),
            current_page: window.location.pathname + window.location.hash,
            feature: document.querySelector(".dash-data-tab[aria-selected='true']")?.getAttribute("data-dash-tab") || "",
            is_visible: !document.hidden
          })
        }).catch(() => {});
      } catch {}
    }, 30000);
  }

  // Non-intrusive footer privacy and transparency controls (index.html only)
  function initFooterPrivacyControls() {
    function setup() {
      const toggleBtn = document.getElementById("footerPrivacyToggle");
      const modal = document.getElementById("footerPrivacyModal");
      const backdrop = document.getElementById("footerPrivacyBackdrop");
      const closeBtn = document.getElementById("footerPrivacyClose");
      const doneBtn = document.getElementById("footerPrivacyDoneBtn");
      const resetBtn = document.getElementById("footerResetVidBtn");
      const idDisplay = document.getElementById("footerVisitorIdDisplay");

      if (!toggleBtn || !modal) return;

      const openModal = () => {
        if (idDisplay) idDisplay.textContent = getVisitorId();
        modal.removeAttribute("hidden");
        modal.setAttribute("aria-hidden", "false");
        toggleBtn.setAttribute("aria-expanded", "true");
        document.body.style.overflow = "hidden";
      };

      const closeModal = () => {
        modal.setAttribute("hidden", "");
        modal.setAttribute("aria-hidden", "true");
        toggleBtn.setAttribute("aria-expanded", "false");
        document.body.style.overflow = "";
      };

      toggleBtn.addEventListener("click", openModal);
      closeBtn?.addEventListener("click", closeModal);
      doneBtn?.addEventListener("click", closeModal);
      backdrop?.addEventListener("click", closeModal);

      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && !modal.hasAttribute("hidden")) {
          closeModal();
        }
      });

      resetBtn?.addEventListener("click", () => {
        window.ESummitAnalytics.resetIdentifier();
        if (idDisplay) idDisplay.textContent = getVisitorId();
        resetBtn.textContent = "Identifier Reset ✓";
        resetBtn.disabled = true;
        setTimeout(() => {
          resetBtn.textContent = "Reset My ID";
          resetBtn.disabled = false;
        }, 1800);
      });
    }

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", setup);
    } else {
      setup();
    }
  }

  // Public API Export
  window.ESummitAnalytics = {
    getVisitorId: getVisitorId,
    getSessionId: getSessionId,
    trackEvent: trackEvent,
    resetIdentifier: function () {
      StorageSafe.remove("local", VISITOR_STORAGE_KEY);
      inMemoryVisitorId = generateOpaqueId("v");
      StorageSafe.set("local", VISITOR_STORAGE_KEY, inMemoryVisitorId);
      trackEvent("visitor_id_reset", { new_id: inMemoryVisitorId });
    },
    optOut: function () {
      StorageSafe.set("local", OPT_OUT_STORAGE_KEY, "1");
      StorageSafe.remove("local", VISITOR_STORAGE_KEY);
      eventQueue = [];
    },
    optIn: function () {
      StorageSafe.remove("local", OPT_OUT_STORAGE_KEY);
      getVisitorId();
      trackEvent("visitor_opt_in");
    },
    isOptedOut: isOptedOut,
    flush: flushQueue
  };

  // Start telemetry immediately
  initLifecycleTracking();
  initAdminHeartbeat();
  initFooterPrivacyControls();
})();
