"use strict";

// Clean any '.html' extension from URL bar across all pages immediately
if (typeof window !== "undefined" && window.location) {
  const pathname = window.location.pathname;
  if (pathname.endsWith(".html")) {
    let cleanPath = pathname.replace(/\.html$/, "");
    if (cleanPath.endsWith("/index")) {
      cleanPath = cleanPath.slice(0, -5) || "/";
    }
    window.history.replaceState(null, "", cleanPath + window.location.search + window.location.hash);
  }
}

// Keep large desktop layouts at a predictable visual scale while leaving
// tablet and phone breakpoints entirely under their responsive CSS.
(() => {
  const REFERENCE_WIDTH = 1920;
  const MIN_ZOOM = 0.6;
  const MAX_ZOOM = 1;
  const root = document.documentElement;

  // Browser zoom is an accessibility choice. CSS zoom compounds with it and
  // can leave a page positioned for a much larger virtual viewport. Detect
  // desktop browser zoom from the browser frame ratio and let responsive CSS
  // own the layout at those magnifications.
  function isBrowserZoomed() {
    if (!window.outerWidth || !window.innerWidth) return false;
    return (window.outerWidth / window.innerWidth) > 1.25;
  }

  function applyScaling() {
    // Only index.html with the complex absolute stage animation uses custom viewport scaling;
    // application pages (login, dashboard) must remain 100% under standard responsive CSS.
    if (window.location.pathname.includes("login") || window.location.pathname.includes("dashboard") || document.body?.classList.contains("login-body") || document.body?.classList.contains("dash-body")) {
      root.style.zoom = "";
      return;
    }

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const browserZoomed = isBrowserZoomed();

    root.classList.toggle("browser-zoom-context", browserZoomed);

    if (viewportWidth <= 1024 || browserZoomed) {
      root.style.zoom = "1";
      root.style.setProperty("--real-vh", `${viewportHeight}px`);
      // The opening animation uses absolute measurements. Skipping it for a
      // high browser zoom avoids a distorted, empty intermediate stage while
      // preserving the desktop scaling system at normal zoom.
      if (browserZoomed) root.classList.add("skip-opening");
      return;
    }

    const zoomLevel = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, viewportWidth / REFERENCE_WIDTH));
    root.style.zoom = String(zoomLevel);
    root.style.setProperty("--real-vh", `${viewportHeight / zoomLevel}px`);
  }

  function createDebugPanel() {
    if (document.getElementById("viewport-debug")) return;

    const debugPanel = document.createElement("aside");
    debugPanel.id = "viewport-debug";
    debugPanel.className = "viewport-debug";
    debugPanel.hidden = true;
    debugPanel.setAttribute("aria-live", "polite");
    debugPanel.setAttribute("aria-label", "Viewport diagnostics");
    document.body.append(debugPanel);

    const updateDebugPanel = () => {
      const zoom = root.style.zoom || "1";
      const browserScale = isBrowserZoomed() ? "browser zoom" : "normal";
      debugPanel.innerHTML = `<strong>Viewport</strong><span>${window.innerWidth} × ${window.innerHeight}</span><strong>Scale</strong><span>${zoom}</span><strong>Browser</strong><span>${browserScale}</span><strong>Pixel ratio</strong><span>${window.devicePixelRatio}</span>`;
    };

    updateDebugPanel();
    window.addEventListener("resize", updateDebugPanel, { passive: true });
    document.addEventListener("keydown", (event) => {
      if (!event.ctrlKey || !event.shiftKey || event.key.toLowerCase() !== "d") return;
      event.preventDefault();
      debugPanel.hidden = !debugPanel.hidden;
      if (!debugPanel.hidden) updateDebugPanel();
    });
  }

  applyScaling();

  let resizeTimeout;
  window.addEventListener("resize", () => {
    window.clearTimeout(resizeTimeout);
    resizeTimeout = window.setTimeout(applyScaling, 100);
  }, { passive: true });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", createDebugPanel, { once: true });
  } else {
    createDebugPanel();
  }
})();
