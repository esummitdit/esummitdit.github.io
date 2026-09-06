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

  function applyScaling() {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    if (viewportWidth <= 1024) {
      root.style.zoom = "1";
      root.style.setProperty("--real-vh", `${viewportHeight}px`);
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
      debugPanel.innerHTML = `<strong>Viewport</strong><span>${window.innerWidth} × ${window.innerHeight}</span><strong>Scale</strong><span>${zoom}</span><strong>Pixel ratio</strong><span>${window.devicePixelRatio}</span>`;
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
