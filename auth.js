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

    /** Clear session and redirect to login. */
    logout() {
      _setToken(null);
      window.location.href = "login.html";
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
        "Content-Type": "application/json",
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
