"use strict";

/**
 * Auth Module — JWT Session Authentication
 * 
 * Security: Token is stored in tab-scoped sessionStorage.
 * Never written to localStorage or long-term disk cookies.
 * Tab close = session automatically destroyed = re-login required.
 */
const Auth = (() => {
  const SESSION_KEY = "esummit_jwt_token";
  const LOGOUT_EVENT_KEY = "esummit_logout_event";
  const logoutChannel = "BroadcastChannel" in window
    ? new BroadcastChannel("esummit-auth")
    : null;

  function _getToken() {
    return sessionStorage.getItem(SESSION_KEY);
  }

  function _setToken(token) {
    if (token) {
      sessionStorage.setItem(SESSION_KEY, token);
    } else {
      sessionStorage.removeItem(SESSION_KEY);
    }
  }

  function _notifyOtherPagesOfLogout() {
    logoutChannel?.postMessage({ type: "logout" });
    try {
      // This stores no credential. It is only a short-lived signal for tabs
      // that do not support BroadcastChannel.
      localStorage.setItem(LOGOUT_EVENT_KEY, String(Date.now()));
      localStorage.removeItem(LOGOUT_EVENT_KEY);
    } catch {
      // Private browsing can disable storage; the current page still logs out.
    }
  }

  function _clearRemoteSession() {
    _setToken(null);
    window.dispatchEvent(new Event("esummit:logout"));
  }

  logoutChannel?.addEventListener("message", (event) => {
    if (event.data?.type === "logout") _clearRemoteSession();
  });

  window.addEventListener("storage", (event) => {
    if (event.key === LOGOUT_EVENT_KEY && event.newValue) _clearRemoteSession();
  });

  window.addEventListener("esummit:logout", () => {
    // A logout issued in another open tab must not leave a protected page
    // visible with stale content.
    if (!window.location.pathname.endsWith("index.html") && window.location.pathname !== "/") {
      window.location.replace("index.html");
    }
  });

  function _decodePayload(token) {
    try {
      const payload = token.split(".")[1];
      const decoded = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
      return JSON.parse(decoded);
    } catch {
      return null;
    }
  }

  function _isExpired(payload) {
    if (!payload || !payload.exp) return true;
    return Date.now() >= payload.exp * 1000;
  }

  return {
    /**
     * Login with credentials.
     * @param {"team"|"admin"} role
     * @param {Object} credentials
     * @returns {Promise<{success: boolean, error?: string}>}
     */
    async login(role, credentials) {
      try {
        const endpoint = role === "admin"
          ? `${API_BASE}/auth/login/admin`
          : `${API_BASE}/auth/login/team`;

        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(credentials),
        });

        const data = await res.json();

        if (!res.ok) {
          return { success: false, error: data.detail || "Authentication failed." };
        }

        _setToken(data.token);
        return { success: true };
      } catch (err) {
        return {
          success: false,
          error: "Server unreachable. Please verify the backend is running.",
        };
      }
    },

    /** Clear this session, notify open E-Summit tabs, then return home. */
    logout() {
      _setToken(null);
      _notifyOtherPagesOfLogout();
      window.location.href = "index.html";
    },

    /** Get raw JWT token for API calls. */
    getToken() {
      const token = _getToken();
      if (!token) return null;
      const payload = _decodePayload(token);
      if (_isExpired(payload)) {
        _setToken(null);
        return null;
      }
      return token;
    },

    /** Get decoded session payload. */
    getSession() {
      const token = this.getToken();
      if (!token) return null;
      return _decodePayload(token);
    },

    /** Check if user is authenticated with a valid token. */
    isAuthenticated() {
      return this.getToken() !== null;
    },

    /**
     * Confirm the locally stored token with the API on every page landing.
     * A network outage does not destroy an otherwise valid local session;
     * an explicit 401/403 does.
     */
    async validateSession() {
      const localSession = this.getSession();
      const token = this.getToken();
      if (!localSession || !token) return null;

      try {
        const response = await fetch(`${API_BASE}/auth/session`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) {
          if (response.status === 401 || response.status === 403) _setToken(null);
          // Only an explicit authentication rejection invalidates a local
          // session. This keeps an otherwise successful login working while
          // a laptop API is restarting or still running an older build.
          return response.status === 401 || response.status === 403
            ? null
            : localSession;
        }
        return { ...localSession, ...(await response.json()) };
      } catch {
        return localSession;
      }
    },

    /**
     * Guard: require authentication with a specific role.
     * Redirects to login.html if not authenticated or wrong role.
     * @param {"team"|"admin"|"master_admin"} requiredRole
     */
    requireAuth(requiredRole) {
      const session = this.getSession();
      if (!session) {
        window.location.href = "login.html";
        return false;
      }
      if (requiredRole === "admin" && session.role !== "admin" && session.role !== "master_admin") {
        window.location.href = "login.html";
        return false;
      }
      if (requiredRole === "master_admin" && session.role !== "master_admin") {
        window.location.href = "login.html";
        return false;
      }
      return true;
    },

    /**
     * Wrapper around fetch() that injects the JWT Authorization header.
     * @param {string} url - API endpoint path (appended to API_BASE)
     * @param {RequestInit} opts - fetch options
     * @returns {Promise<Response>}
     */
    async apiFetch(url, opts = {}) {
      const token = this.getToken();
      if (!token) {
        this.logout();
        throw new Error("No valid session.");
      }

      const headers = {
        ...(opts.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
        Authorization: `Bearer ${token}`,
        ...(opts.headers || {}),
      };

      const res = await fetch(`${API_BASE}${url}`, { ...opts, headers });

      if (res.status === 401) {
        this.logout();
        throw new Error("Session expired.");
      }

      return res;
    },
  };
})();
