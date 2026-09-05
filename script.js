"use strict";

document.documentElement.classList.add("js");

function getApiBase() {
  if (typeof API_BASE !== "undefined" && API_BASE) return API_BASE;
  if (window.location.origin.includes(":3000")) return "/api";
  return "http://localhost:3000/api";
}

const scrollMemoryKey = `e-summit:scroll:${window.location.pathname}`;

function saveScrollPosition() {
  try {
    sessionStorage.setItem(scrollMemoryKey, String(Math.round(window.scrollY)));
  } catch {
    // Storage can be unavailable in private or restricted browsing contexts.
  }
}

if ("scrollRestoration" in history) history.scrollRestoration = "manual";

let isScrollWriteQueued = false;
window.addEventListener("scroll", () => {
  if (isScrollWriteQueued) return;
  isScrollWriteQueued = true;
  requestAnimationFrame(() => {
    saveScrollPosition();
    isScrollWriteQueued = false;
  });
}, { passive: true });
window.addEventListener("pagehide", saveScrollPosition, { passive: true });
window.addEventListener("beforeunload", saveScrollPosition, { passive: true });

document.addEventListener("DOMContentLoaded", () => {
  // Let the browser restore its scroll position before deciding whether the
  // opening sequence belongs on this load.
  requestAnimationFrame(() => requestAnimationFrame(initializePage));
});

function initializePage() {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const restoredScrollPosition = restoreReloadPosition();
  const restoredAwayFromTop = document.documentElement.classList.contains("skip-opening") || restoredScrollPosition;
  const loadingOverlay = document.getElementById("loadingOverlay");
  const loadingCanvasContainer = document.getElementById("loadingCanvasContainer");
  const loadingBranding = document.getElementById("loadingBranding");
  const heroCanvasContainer = document.getElementById("three-canvas-container");
  const sceneState = initSculpture(heroCanvasContainer, reduceMotion);

  if (sceneState && loadingCanvasContainer && !restoredAwayFromTop) {
    document.body.classList.add("is-loading");
    runOpeningSequence(sceneState, loadingCanvasContainer, heroCanvasContainer, loadingOverlay, loadingBranding, reduceMotion);
  } else if (loadingOverlay) {
    loadingOverlay.remove();
  }

  setUpRevealObserver(reduceMotion, restoredAwayFromTop);
  if (restoredAwayFromTop) document.body.classList.add("is-restored");
  setUpSculptureControl(sceneState, reduceMotion);
  void setUpSessionAwareHomepage();
  setUpRegistrationForm();
  setUpFaqAccordion();
}

async function setUpSessionAwareHomepage() {
  const session = typeof Auth !== "undefined" ? await Auth.validateSession() : null;
  if (!session) return;

  const isTeam = session.role === "team";
  const dashboardHref = "dashboard.html";
  const sessionLink = document.getElementById("sessionLink");
  const primaryAction = document.getElementById("primaryHeaderAction");
  const lockedNotice = document.getElementById("registrationLockedNotice");
  const registrationForm = document.getElementById("registrationForm");
  const label = isTeam
    ? session.team_name || session.group_id || "Team portal"
    : session.name || session.email || "Administrator";

  if (sessionLink) {
    sessionLink.href = dashboardHref;
    const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    icon.setAttribute("viewBox", "0 0 24 24");
    icon.setAttribute("width", "15");
    icon.setAttribute("height", "15");
    icon.setAttribute("fill", "none");
    icon.setAttribute("stroke", "currentColor");
    icon.setAttribute("stroke-width", "2");
    icon.setAttribute("stroke-linecap", "round");
    icon.setAttribute("stroke-linejoin", "round");
    icon.setAttribute("aria-hidden", "true");
    icon.innerHTML = isTeam
      ? '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>'
      : '<rect x="3" y="11" width="18" height="10" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/><circle cx="12" cy="16" r="1"/>';
    sessionLink.replaceChildren(icon, document.createTextNode(label));
    sessionLink.classList.add("header-login--active");
    sessionLink.setAttribute("aria-label", `Open ${label}`);
  }

  if (primaryAction) {
    primaryAction.href = "#top";
    primaryAction.textContent = "Sign out";
    primaryAction.setAttribute("aria-label", "Sign out of E-Summit");
    primaryAction.addEventListener("click", (event) => {
      event.preventDefault();
      Auth.logout();
    });
  }

  document.querySelectorAll('a[href="#registration"]').forEach((link) => {
    link.href = dashboardHref;
    link.textContent = isTeam ? "Open team portal →" : "Open admin portal →";
  });

  if (registrationForm) {
    registrationForm.dataset.registrationLocked = "true";
    registrationForm.hidden = true;
  }

  if (lockedNotice) {
    lockedNotice.hidden = false;
    lockedNotice.innerHTML = `
      <p class="eyebrow">SIGNED IN / ${isTeam ? "TEAM ACCOUNT" : "ADMIN ACCOUNT"}</p>
      <h3>${isTeam ? "Your team is already registered." : "You are signed in as an administrator."}</h3>
      <p>${isTeam
        ? "Registration is closed for this session. Your team details and credentials are available in the portal."
        : "Registration is closed while you are in an administrator session. Use the portal to manage the summit."}</p>
      <a class="button button--ink" href="${dashboardHref}">${isTeam ? "Open team portal" : "Open admin portal"} <span aria-hidden="true">→</span></a>
    `;
  }
}

window.addEventListener("esummit:logout", () => {
  // Each open page returns to its signed-out state without retaining a token.
  if (window.location.pathname.endsWith("dashboard.html") || window.location.pathname.endsWith("login.html")) {
    window.location.replace("index.html");
  } else {
    window.location.reload();
  }
});

function restoreReloadPosition() {
  const navigation = performance.getEntriesByType("navigation")[0];
  const isReturnLoad = navigation?.type === "reload" || navigation?.type === "back_forward";
  const hasAnchor = Boolean(window.location.hash);
  let savedScroll = 0;

  try {
    savedScroll = Number(sessionStorage.getItem(scrollMemoryKey)) || 0;
  } catch {
    // The browser's own scroll restoration still works without session storage.
  }

  if (!hasAnchor && isReturnLoad && savedScroll > 8 && window.scrollY < 8) {
    const root = document.documentElement;
    const previousScrollBehavior = root.style.scrollBehavior;
    root.style.scrollBehavior = "auto";
    window.scrollTo({ top: savedScroll, left: 0 });
    requestAnimationFrame(() => {
      root.style.scrollBehavior = previousScrollBehavior;
    });
  }

  return hasAnchor || window.scrollY > 8 || (isReturnLoad && savedScroll > 8);
}

function initSculpture(container, reduceMotion) {
  if (!container || !window.THREE) return null;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 100);
  camera.position.z = 5.8;
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  const sculpture = new THREE.Group();
  scene.add(sculpture);
  const geometry = new THREE.IcosahedronGeometry(2.05, 2);
  const originalPositions = new Float32Array(geometry.attributes.position.array);
  const surface = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({
    color: 0xd84b2d, wireframe: true, transparent: true, opacity: 0.76
  }));
  sculpture.add(surface);
  sculpture.add(new THREE.Points(geometry, new THREE.PointsMaterial({
    color: 0x1a1814, size: 0.035, transparent: true, opacity: 0.9
  })));

  // The supplied shape study is adapted to the existing shared geometry so
  // the wireframe, points and opening sequence remain one continuous object.
  const createMorphTargets = (source) => {
    const withinFrame = (x, y, z) => {
      const length = Math.hypot(x, y, z) || 1;
      const maximum = 2.04;
      const scale = length > maximum ? maximum / length : 1;
      return [x * scale, y * scale, z * scale];
    };
    const targetFrom = (project) => {
      const target = new Float32Array(source.length);
      for (let i = 0; i < source.length; i += 3) {
        const length = Math.hypot(source[i], source[i + 1], source[i + 2]) || 1;
        const nx = source[i] / length;
        const ny = source[i + 1] / length;
        const nz = source[i + 2] / length;
        const [x, y, z] = withinFrame(...project(nx, ny, nz));
        target[i] = x;
        target[i + 1] = y;
        target[i + 2] = z;
      }
      return target;
    };

    return [
      targetFrom((x, y, z) => { const s = 2.04 / (Math.abs(x) + Math.abs(y) + Math.abs(z)); return [x * s, y * s, z * s]; }),
      targetFrom((x, y, z) => { const s = 1.18 / Math.max(Math.abs(x), Math.abs(y), Math.abs(z), 0.01); return [x * s, y * s, z * s]; }),
      targetFrom((x, y, z) => { const r = 1.62 + 0.26 * Math.abs(Math.sin(x * 6) * Math.cos(y * 6) * Math.sin(z * 6)); return [x * r, y * r, z * r]; }),
      targetFrom((x, y, z) => { const r = 1.64 + 0.22 * Math.abs(x * y + y * z + z * x); return [x * r, y * r, z * r]; }),
      targetFrom((x, y, z) => { const r = Math.hypot(x, z) || 1; return [x / r * 1.5, y * 1.42, z / r * 1.5]; }),
      targetFrom((x, y, z) => { const r = Math.hypot(x, z) || 1; return [x / r * 1.48, y * 0.28, z / r * 1.48]; }),
      targetFrom((x, y, z) => { const r = Math.hypot(x, z) || 1; const radius = 1.1 + Math.abs(y) * 0.62; return [x / r * radius, y * 1.5, z / r * radius]; }),
      targetFrom((x, y, z) => { const r = 1.5 + 0.33 * Math.abs(Math.sin(x * 7) * Math.cos(y * 7) * Math.sin(z * 7)); return [x * r, y * r, z * r]; }),
      targetFrom((x, y, z) => { const base = 1.52 - Math.max(y, 0) * 0.72; return [x * base, y * 1.45 + 0.08, z * base]; }),
      targetFrom((x, y, z) => { const r = 1.58 + Math.sin(x * 6) * Math.cos(y * 6) * Math.sin(z * 6) * 0.22; return [x * r, y * r, z * r]; }),
      targetFrom((x, y, z) => { const r = Math.hypot(x, z) || 1; return [x / r * 1.65, y * 0.3, z / r * 1.65]; }),
      targetFrom((x, y, z) => { const angle = Math.atan2(z, x) + y * Math.PI; const radius = 1.42 + Math.abs(y) * 0.12; return [Math.cos(angle) * radius, y * 1.35, Math.sin(angle) * radius]; })
    ];
  };
  const morphTargets = createMorphTargets(originalPositions);
  const formStudy = {
    active: false,
    phase: -1,
    phaseStartedAt: 0,
    source: originalPositions,
    resolve: null
  };

  const orbit = new THREE.Mesh(
    new THREE.TorusGeometry(2.32, 0.007, 8, 96),
    new THREE.MeshBasicMaterial({ color: 0x1a1814, transparent: true, opacity: 0.22 })
  );
  orbit.rotation.x = Math.PI * 0.43;
  orbit.rotation.y = Math.PI * 0.12;
  sculpture.add(orbit);

  const pointer = { x: 0, y: 0 };
  const scaleTarget = new THREE.Vector3(1, 1, 1);
  let launchTarget = 0;
  let launchIntensity = 0;
  window.addEventListener("pointermove", (event) => {
    pointer.x = event.clientX / window.innerWidth - 0.5;
    pointer.y = event.clientY / window.innerHeight - 0.5;
  }, { passive: true });

  function resize(parent = renderer.domElement.parentElement) {
    if (!parent) return;
    const { width, height } = parent.getBoundingClientRect();
    if (!width || !height) return;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
  }

  const easeInOutQuint = (progress) => progress < 0.5
    ? 16 * progress ** 5
    : 1 - ((-2 * progress + 2) ** 5) / 2;

  function updateFormStudy(time) {
    if (!formStudy.active) return;

    const spinDuration = 900;
    const morphDuration = 1125;
    const returnDuration = 1550;
    const isSpinPhase = formStudy.phase === -1;
    const isReturnPhase = formStudy.phase === morphTargets.length;
    const duration = isSpinPhase ? spinDuration : isReturnPhase ? returnDuration : morphDuration;
    const progress = Math.min(1, (time - formStudy.phaseStartedAt) / duration);

    if (!isSpinPhase) {
      const target = isReturnPhase ? originalPositions : morphTargets[formStudy.phase];
      const eased = easeInOutQuint(progress);
      const positions = geometry.attributes.position.array;
      for (let i = 0; i < positions.length; i += 1) {
        positions[i] = formStudy.source[i] + (target[i] - formStudy.source[i]) * eased;
      }
      geometry.attributes.position.needsUpdate = true;
    }

    const pulse = Math.sin(progress * Math.PI);
    sculpture.scale.lerp(scaleTarget.setScalar(1 + pulse * (isSpinPhase ? 0.08 : 0.055)), 0.16);
    surface.material.opacity = 0.76 + pulse * 0.15;

    if (progress < 1) return;

    if (isSpinPhase) {
      formStudy.phase = 0;
      formStudy.source = new Float32Array(geometry.attributes.position.array);
    } else if (isReturnPhase) {
      geometry.attributes.position.array.set(originalPositions);
      geometry.attributes.position.needsUpdate = true;
      surface.material.opacity = 0.76;
      formStudy.active = false;
      formStudy.phase = -1;
      const resolve = formStudy.resolve;
      formStudy.resolve = null;
      resolve?.();
      return;
    } else {
      formStudy.phase += 1;
      formStudy.source = new Float32Array(geometry.attributes.position.array);
    }
    formStudy.phaseStartedAt = time;
  }

  function playFormStudy() {
    if (formStudy.active) return null;
    if (reduceMotion) return Promise.resolve();

    formStudy.active = true;
    formStudy.phase = -1;
    formStudy.phaseStartedAt = performance.now();
    formStudy.source = new Float32Array(geometry.attributes.position.array);
    return new Promise((resolve) => {
      formStudy.resolve = resolve;
    });
  }

  function render(time = 0) {
    if (!reduceMotion) {
      const t = time * 0.00045;
      // The launch intensity is eased, rather than switching animation states.
      // That keeps the geometry's transform continuous as the canvas changes parent.
      launchIntensity += (launchTarget - launchIntensity) * 0.045;
      const studyVelocity = formStudy.active ? 1 : 0;
      sculpture.rotation.y += 0.0023 + launchIntensity * 0.0097 + pointer.x * 0.0008 + studyVelocity * 0.018;
      sculpture.rotation.x += 0.00075 + launchIntensity * 0.00325 + pointer.y * 0.0004 + studyVelocity * 0.007;
      sculpture.rotation.z += Math.sin(t * 3.2) * (0.00045 + launchIntensity * 0.00175);

      if (formStudy.active) {
        updateFormStudy(time);
      } else {
        const breathing = 1 + Math.sin(t * 2.5) * (0.018 + launchIntensity * 0.022);
        sculpture.scale.lerp(scaleTarget.setScalar(breathing), 0.1);
      }
      orbit.rotation.z -= 0.001 + launchIntensity * 0.007;
    }
    renderer.render(scene, camera);
    requestAnimationFrame(render);
  }

  const handleResize = () => resize();
  window.addEventListener("resize", handleResize, { passive: true });
  document.addEventListener("fullscreenchange", handleResize, { passive: true });
  resize(container);
  render();
  return {
    renderer,
    resize,
    setLaunching(value) { launchTarget = value ? 1 : 0; },
    playFormStudy
  };
}

function setUpSculptureControl(sceneState, reduceMotion) {
  const trigger = document.getElementById("shapeStudyButton");
  if (!trigger || !sceneState) return;

  trigger.addEventListener("click", async () => {
    const study = sceneState.playFormStudy();
    if (!study || reduceMotion) return;

    trigger.disabled = true;
    trigger.setAttribute("aria-label", "Form in motion");
    trigger.firstChild.textContent = "Form in motion ";
    await study;
    trigger.disabled = false;
    trigger.setAttribute("aria-label", "Set the form in motion");
    trigger.firstChild.textContent = "Set the form in motion ";
  });
}

function runOpeningSequence(sceneState, loadingContainer, heroContainer, overlay, loadingBranding, reduceMotion) {
  const canvas = sceneState.renderer.domElement;
  const transitionDuration = 1650;

  function measureLaunch() {
    const target = heroContainer.getBoundingClientRect();
    const finalHeadline = document.getElementById("hero-title").getBoundingClientRect();
    const targetAspect = target.width / target.height || 1;
    const isNarrowLayout = window.matchMedia("(max-width: 850px)").matches;

    if (loadingBranding) {
      const labelHeight = 28;
      Object.assign(loadingBranding.style, {
        left: `${finalHeadline.left}px`,
        top: `${Math.max(24, finalHeadline.top - labelHeight)}px`,
        width: isNarrowLayout
          ? `${Math.min(finalHeadline.width, window.innerWidth - 32)}px`
          : "fit-content"
      });
    }

    const brandingBounds = loadingBranding?.getBoundingClientRect();
    const openingTitle = loadingBranding?.querySelector(".loading-title");
    const titleRange = document.createRange();
    if (openingTitle) titleRange.selectNodeContents(openingTitle);
    const titleRects = openingTitle ? Array.from(titleRange.getClientRects()) : [];
    const titleBounds = titleRects.length
      ? {
          left: Math.min(...titleRects.map((rect) => rect.left)),
          right: Math.max(...titleRects.map((rect) => rect.right)),
          top: Math.min(...titleRects.map((rect) => rect.top)),
          bottom: Math.max(...titleRects.map((rect) => rect.bottom))
        }
      : brandingBounds;
    if (titleBounds) {
      titleBounds.width = titleBounds.right - titleBounds.left;
      titleBounds.height = titleBounds.bottom - titleBounds.top;
    }

    const maxHeight = Math.min(window.innerHeight * (isNarrowLayout ? 0.38 : 0.84), isNarrowLayout ? 360 : 760);
    const maxWidth = Math.min(
      window.innerWidth * (isNarrowLayout ? 0.78 : 0.5),
      maxHeight * targetAspect,
      isNarrowLayout ? 360 : 760
    );
    const widthNeededForTitleHalf = titleBounds
      ? Math.max(titleBounds.width * 0.96, titleBounds.height * targetAspect * 1.54)
      : 360;
    const width = isNarrowLayout
      ? Math.max(220, Math.min(maxWidth, maxHeight * targetAspect))
      : Math.max(300, Math.min(widthNeededForTitleHalf, maxWidth));
    const height = width / targetAspect;

    // On desktop the sculpture begins just inside the title's right half.
    // On narrow screens it deliberately starts below the title instead.
    const titleMidpoint = titleBounds ? titleBounds.left + titleBounds.width / 2 : 0;
    const titleRightSide = titleBounds ? titleMidpoint + titleBounds.width * 0.09 : 0;
    const centerX = !isNarrowLayout && titleBounds
      ? Math.min(
          window.innerWidth - 16 - width / 2,
          Math.max(16 + width / 2, titleRightSide + width / 2)
        )
      : window.innerWidth * 0.5;
    const centerY = isNarrowLayout && brandingBounds
      ? Math.max(window.innerHeight * 0.52, brandingBounds.bottom + height / 2 + 24)
      : titleBounds
        ? titleBounds.top + titleBounds.height / 2
        : window.innerHeight * 0.52;

    Object.assign(loadingContainer.style, {
      left: `${centerX - width / 2}px`,
      top: `${centerY - height / 2}px`,
      width: `${width}px`,
      height: `${height}px`,
      transform: "translate3d(0, 0, 0) scale(1)"
    });
    sceneState.resize(loadingContainer);

    return { target, width, centerX, centerY };
  }

  const moveCanvasHome = () => {
    heroContainer.appendChild(canvas);
    loadingContainer.style.transition = "none";
    loadingContainer.style.transform = "";
    sceneState.resize(heroContainer);
    sceneState.setLaunching(false);
    if (overlay) overlay.remove();
    document.body.classList.remove("is-loading", "is-launching");
  };

  requestAnimationFrame(() => {
    const launch = measureLaunch();
    loadingContainer.appendChild(canvas);
    sceneState.resize(loadingContainer);
    if (overlay) overlay.classList.add("is-ready");

    if (reduceMotion) {
      moveCanvasHome();
      return;
    }

    window.setTimeout(() => {
      sceneState.setLaunching(true);
      document.body.classList.add("is-launching");
      if (overlay) overlay.classList.add("is-launching");
      loadingContainer.style.transition = "none";
      const startedAt = performance.now();

      // The target is measured every frame. If the user scrolls during the
      // opening, the sculpture follows the moving hero frame instead of
      // completing a path calculated from an old scroll position.
      const animateLaunch = (now) => {
        const progress = Math.min(1, (now - startedAt) / transitionDuration);
        const eased = 1 - Math.pow(1 - progress, 4);
        const currentLaunch = measureLaunch();
        const target = heroContainer.getBoundingClientRect();
        const targetCenterX = target.left + target.width / 2;
        const targetCenterY = target.top + target.height / 2;
        const translateX = (targetCenterX - currentLaunch.centerX) * eased;
        const translateY = (targetCenterY - currentLaunch.centerY) * eased;
        const targetScale = target.width / currentLaunch.width;
        const scale = 1 + (targetScale - 1) * eased;

        loadingContainer.style.transform = `translate3d(${translateX}px, ${translateY}px, 0) scale(${scale})`;
        if (progress < 1) {
          requestAnimationFrame(animateLaunch);
        } else {
          moveCanvasHome();
        }
      };
      requestAnimationFrame(animateLaunch);
    }, 1450);
  });
}

function setUpRevealObserver(reduceMotion, revealImmediately = false) {
  const items = Array.from(document.querySelectorAll(".reveal"));
  const groupCounts = new Map();

  items.forEach((item) => {
    const group = item.closest(".hero, .manifesto, section") || item.parentElement;
    const itemIndex = groupCounts.get(group) || 0;
    groupCounts.set(group, itemIndex + 1);
    item.style.setProperty("--reveal-delay", `${Math.min(itemIndex * 80, 400)}ms`);
  });

  if (revealImmediately) {
    document.documentElement.classList.add("is-restoring");
    items.forEach((item) => item.classList.add("is-visible"));
    requestAnimationFrame(() => document.documentElement.classList.remove("is-restoring"));
    return;
  }

  if (reduceMotion || !("IntersectionObserver" in window)) {
    items.forEach((item) => item.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver((entries, observerInstance) => {
    entries
      .filter((entry) => entry.isIntersecting)
      .sort((first, second) => first.boundingClientRect.top - second.boundingClientRect.top)
      .forEach((entry) => {
        entry.target.classList.add("is-visible");
        observerInstance.unobserve(entry.target);
      });
  }, { threshold: 0.08, rootMargin: "0px 0px -8%" });
  items.forEach((item) => observer.observe(item));
}

function setUpCustomSelects() {
  const selectElements = document.querySelectorAll("#registrationForm select");
  selectElements.forEach((selectEl) => {
    if (selectEl.dataset.customized) return;
    selectEl.dataset.customized = "true";

    const wrapper = document.createElement("div");
    wrapper.className = "custom-select-wrapper";

    const trigger = document.createElement("button");
    trigger.type = "button";
    trigger.className = "custom-select-trigger";

    const updateTriggerText = () => {
      const selectedOption = selectEl.options[selectEl.selectedIndex];
      const text = selectedOption ? selectedOption.text : "Select option";
      const isPlaceholder = !selectedOption || !selectedOption.value;
      trigger.innerHTML = `<span class="select-label" style="${isPlaceholder ? 'color: var(--muted-ink);' : 'color: var(--ink);'}">${text}</span><span class="select-chevron">▾</span>`;
    };
    updateTriggerText();

    const optionsContainer = document.createElement("div");
    optionsContainer.className = "custom-select-options";

    const buildOptions = () => {
      optionsContainer.innerHTML = "";
      Array.from(selectEl.options).forEach((opt) => {
        if (opt.disabled && !opt.value) return;
        const item = document.createElement("div");
        item.className = `custom-option ${opt.selected ? "is-selected" : ""}`;
        item.dataset.value = opt.value;
        item.textContent = opt.text;

        item.addEventListener("click", (e) => {
          e.stopPropagation();
          selectEl.value = opt.value;
          selectEl.dispatchEvent(new Event("change", { bubbles: true }));
          updateTriggerText();
          optionsContainer.querySelectorAll(".custom-option").forEach(o => o.classList.remove("is-selected"));
          item.classList.add("is-selected");
          wrapper.classList.remove("is-open");
        });

        optionsContainer.appendChild(item);
      });
    };
    buildOptions();

    trigger.addEventListener("click", (e) => {
      e.stopPropagation();
      document.querySelectorAll(".custom-select-wrapper").forEach(w => {
        if (w !== wrapper) w.classList.remove("is-open");
      });
      wrapper.classList.toggle("is-open");
    });

    selectEl.addEventListener("change", () => {
      updateTriggerText();
      buildOptions();
    });

    wrapper.appendChild(trigger);
    wrapper.appendChild(optionsContainer);

    selectEl.style.display = "none";
    selectEl.parentNode.insertBefore(wrapper, selectEl);
  });

  document.addEventListener("click", () => {
    document.querySelectorAll(".custom-select-wrapper").forEach(w => w.classList.remove("is-open"));
  });
}

function setUpRegistrationForm() {
  const form = document.getElementById("registrationForm");
  const status = document.getElementById("formStatus");
  const teamSizeSelect = document.getElementById("teamSize");
  const rosterGrid = document.getElementById("teamRosterGrid");
  const registrationOrbit = document.querySelector(".registration-orbit");
  const registrationCompanion = document.querySelector(".registration-companion");
  const rosterMemoryBar = document.getElementById("rosterMemoryBar");
  if (!form || !status || !teamSizeSelect || !rosterGrid) return;
  if (form.dataset.registrationLocked === "true") return;

  setUpCustomSelects();

  let rosterData = [
    { id: 1, name: "", email: "", phone: "", role: "Team Leader / Primary Contact", isLeader: true }
  ];
  let removedCache = [];

  function saveCurrentInputsToState() {
    rosterData.forEach((member) => {
      const nameInput = document.getElementById(`member_${member.id}_name`);
      const emailInput = document.getElementById(`member_${member.id}_email`);
      const personalEmailInput = document.getElementById(`member_${member.id}_personal_email`);
      const collegeIdInput = document.getElementById(`member_${member.id}_college_id`);
      const phoneInput = document.getElementById(`member_${member.id}_phone`);
      const roleInput = document.getElementById(`member_${member.id}_role`);
      const noteInput = document.getElementById(`member_${member.id}_note`);
      if (nameInput) member.name = nameInput.value;
      if (emailInput) member.email = emailInput.value;
      if (personalEmailInput) member.personal_email = personalEmailInput.value;
      if (collegeIdInput) member.college_id = collegeIdInput.value;
      if (phoneInput) member.phone = phoneInput.value;
      if (roleInput) member.role = roleInput.value;
      if (noteInput) member.note = noteInput.value;
    });
  }
  window._saveCurrentInputsToState = saveCurrentInputsToState;

  if (registrationOrbit) {
    const companionMessage = registrationCompanion?.querySelector(".companion-message");
    const updateOrbit = () => {
      const completedFields = [...form.querySelectorAll("input, select, textarea")]
        .filter((field) => field.type !== "file" && field.value.trim()).length;
      const state = completedFields >= 8 ? "ready" : completedFields > 0 ? "moving" : "start";
      registrationOrbit.classList.toggle("is-progressing", completedFields > 0);
      registrationOrbit.classList.toggle("is-complete", completedFields >= 8);
      registrationCompanion?.setAttribute("data-companion-state", state);
      if (companionMessage) {
        companionMessage.textContent = state === "ready"
          ? "That’s the whole crew. Ready when you are!"
          : state === "moving"
            ? "Lovely. Your team is taking shape."
            : "Start anywhere. I’ll keep watch.";
      }
    };
    form.addEventListener("input", updateOrbit);
    form.addEventListener("change", updateOrbit);
    updateOrbit();
  }

  function updateMemoryBar() {
    if (!rosterMemoryBar) return;
    if (removedCache.length === 0) {
      rosterMemoryBar.style.display = "none";
      rosterMemoryBar.innerHTML = "";
      return;
    }

    rosterMemoryBar.style.display = "flex";
    const lastRemoved = removedCache[removedCache.length - 1];
    const nameLabel = lastRemoved.name ? lastRemoved.name : `Member ${lastRemoved.id}`;

    rosterMemoryBar.innerHTML = `
      <div class="memory-info">
        <span class="memory-icon">💡</span>
        <span>Removed <strong>${nameLabel}</strong> from stack. All typed info cached in memory!</span>
      </div>
      <button type="button" class="restore-btn" id="restoreMemberBtn">
        <span class="restore-icon">↩</span> Restore ${nameLabel}
      </button>
    `;

    document.getElementById("restoreMemberBtn")?.addEventListener("click", () => {
      restoreLastRemovedMember();
    });
  }

  function renderRosterStack() {
    saveCurrentInputsToState();
    rosterGrid.innerHTML = "";

    rosterData.forEach((member, index) => {
      const isLeader = index === 0;
      const card = document.createElement("div");
      card.className = `member-card ${isLeader ? "member-card--leader" : ""}`;
      card.dataset.memberId = member.id;

      card.innerHTML = `
        <div class="member-card-header">
          <div class="member-title-group">
            <span class="member-card-title">${isLeader ? "MEMBER 01 — TEAM LEADER" : `MEMBER 0${index + 1} — PARTICIPANT`}</span>
          </div>
          <div class="member-actions">
            <span class="member-role-badge ${isLeader ? "badge--leader" : "badge--member"}">
              ${isLeader ? "● PRIMARY LEAD" : `MEMBER 0${index + 1}`}
            </span>
            ${!isLeader ? `<button type="button" class="remove-card-btn" data-id="${member.id}" title="Remove Member">✕</button>` : ""}
          </div>
        </div>
        <div class="field-group field-group--split">
          <div>
            <label for="member_${member.id}_name">${isLeader ? "Leader Full Name" : "Participant Name"}</label>
            <input id="member_${member.id}_name" name="member_${member.id}_name" autocomplete="name" placeholder="Full name" value="${member.name || ''}" required>
          </div>
          <div>
            <label for="member_${member.id}_college_id">College Roll No / Student ID (Optional)</label>
            <input id="member_${member.id}_college_id" name="member_${member.id}_college_id" placeholder="e.g. 2001010045 (if available)" value="${member.college_id || ''}">
          </div>
        </div>
        <div class="field-group field-group--split">
          <div>
            <label for="member_${member.id}_email">College / Institutional Email</label>
            <input id="member_${member.id}_email" type="email" name="member_${member.id}_email" autocomplete="email" placeholder="10000xxxxx@dit.edu.in" value="${member.email || ''}" required>
          </div>
          <div>
            <label for="member_${member.id}_personal_email">Personal Email ID (Mandatory)</label>
            <input id="member_${member.id}_personal_email" type="email" name="member_${member.id}_personal_email" autocomplete="email" placeholder="name@gmail.com" value="${member.personal_email || ''}" required>
          </div>
        </div>
        <div class="field-group field-group--split">
          <div>
            <label for="member_${member.id}_phone">Phone / WhatsApp</label>
            <input id="member_${member.id}_phone" type="tel" name="member_${member.id}_phone" autocomplete="tel" placeholder="+91 00000 XXXXX" value="${member.phone || ''}" required>
          </div>
          <div>
            <label for="member_${member.id}_role">Team Role / Specialty</label>
            <input id="member_${member.id}_role" name="member_${member.id}_role" placeholder="${isLeader ? 'e.g. Lead Developer' : 'e.g. Designer / Pitcher'}" value="${member.role || ''}" required>
          </div>
        </div>
        <div class="field-group">
          <label for="member_${member.id}_file">Upload photo from your device</label>
          <div class="custom-photo-upload-container">
            <input id="member_${member.id}_file" type="file" accept="image/jpeg,image/png,image/webp,image/gif" class="member-photo-file-input hidden-file-input" data-id="${member.id}">
            <button type="button" class="custom-upload-btn" onclick="document.getElementById('member_${member.id}_file').click()">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
              </svg>
              <span>Upload photo from your device</span>
            </button>
            <div id="member_${member.id}_preview_wrap" class="custom-photo-preview-avatar">
              ${member.photo_url
                ? `<img src="${getApiAssetUrl(member.photo_url)}" style="width:100%; height:100%; object-fit:cover;">`
                : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                     <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                     <circle cx="12" cy="7" r="4"></circle>
                   </svg>`
              }
            </div>
          </div>
          <span style="font-size:0.7rem; color:var(--muted-ink); margin-top:0.35rem; display:block;">Max 6.9MB. Photos are automatically sanitized & stripped of metadata on upload.</span>
        </div>
        <div class="field-group">
          <label for="member_${member.id}_note">Member Note / Personal Details</label>
          <textarea id="member_${member.id}_note" name="member_${member.id}_note" rows="2" class="member-note-textarea" placeholder="${isLeader ? 'e.g. Primary team contact, GitHub/Portfolio, or notes for CIIES organizers' : 'e.g. Skills (React/Python), GitHub link, or personal note to share'}">${member.note || ''}</textarea>
        </div>
      `;

      rosterGrid.appendChild(card);

      const previewWrap = card.querySelector(`#member_${member.id}_preview_wrap`);
      if (previewWrap) {
        previewWrap.style.cursor = "pointer";
        previewWrap.addEventListener("click", () => {
          openSpotlightModal(member);
        });
      }
    });

    // Attach File Preview & Zoom/Crop Listeners
    rosterGrid.querySelectorAll(".member-photo-file-input").forEach((fileInput) => {
      fileInput.addEventListener("change", (e) => {
        const file = e.target.files[0];
        const memberId = parseInt(fileInput.dataset.id, 10);
        const memberObj = rosterData.find(m => m.id === memberId);
        const previewWrap = document.getElementById(`member_${memberId}_preview_wrap`);

        if (!file) return;

        // 6.9 MB Limit Check (6.9 * 1024 * 1024 = 7,235,174 bytes)
        const maxBytes = 6.9 * 1024 * 1024;
        if (file.size > maxBytes) {
          alert(`File size error: "${file.name}" is ${(file.size / (1024*1024)).toFixed(2)}MB. The maximum allowed limit is 6.9 MB.`);
          fileInput.value = "";
          return;
        }

        // Open Interactive Zoom & Crop Modal
        openCropZoomModal(file, (croppedBlob, previewDataUrl) => {
          if (memberObj) {
            memberObj._pendingFile = croppedBlob;
            memberObj._pendingPreview = previewDataUrl;
          }
          if (previewWrap) {
            previewWrap.innerHTML = `<img src="${previewDataUrl}" style="width:100%; height:100%; object-fit:cover;">`;
          }
        });
      });
    });

    rosterGrid.querySelectorAll(".member-note-textarea").forEach((textarea) => {
      const autoExpand = () => {
        textarea.style.height = "auto";
        const scrollH = textarea.scrollHeight;
        const targetHeight = Math.min(150, Math.max(52, scrollH));
        textarea.style.height = targetHeight + "px";
        textarea.style.overflowY = scrollH > 150 ? "auto" : "hidden";
      };
      autoExpand();
      textarea.addEventListener("input", autoExpand);
    });

    rosterGrid.querySelectorAll(".remove-card-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const idToRemove = parseInt(btn.dataset.id, 10);
        removeMemberById(idToRemove);
      });
    });

    if (rosterData.length < 6) {
      const addCard = document.createElement("div");
      addCard.className = "add-member-card";
      addCard.innerHTML = `
        <button type="button" class="add-member-trigger" id="addMemberCardBtn">
          <span class="plus-icon">+</span>
          <span class="add-text">Add Team Member (${rosterData.length + 1}/6)</span>
        </button>
      `;
      rosterGrid.appendChild(addCard);

      addCard.querySelector("#addMemberCardBtn")?.addEventListener("click", () => {
        addNewMember();
      });
    }

    if (teamSizeSelect.value != rosterData.length) {
      teamSizeSelect.value = rosterData.length;
      teamSizeSelect.dispatchEvent(new Event("change"));
    }

    updateMemoryBar();
  }

  function addNewMember() {
    if (rosterData.length >= 6) return;
    saveCurrentInputsToState();
    const newId = rosterData.length + 1;
    rosterData.push({ id: newId, name: "", email: "", personal_email: "", college_id: "", phone: "", role: "", photo_url: "", isLeader: false });
    renderRosterStack();
  }

  function removeMemberById(id) {
    if (rosterData.length <= 1) return;
    saveCurrentInputsToState();
    const targetIdx = rosterData.findIndex(m => m.id === id);
    if (targetIdx !== -1) {
      const removedObj = rosterData.splice(targetIdx, 1)[0];
      removedCache.push(removedObj);
      renderRosterStack();
    }
  }

  function restoreLastRemovedMember() {
    if (removedCache.length === 0) return;
    if (rosterData.length >= 6) return;
    saveCurrentInputsToState();
    const restoredObj = removedCache.pop();
    restoredObj.id = rosterData.length + 1;
    rosterData.push(restoredObj);
    renderRosterStack();
  }

  teamSizeSelect.addEventListener("change", (e) => {
    const targetCount = parseInt(e.target.value, 10) || 1;
    saveCurrentInputsToState();

    while (rosterData.length < targetCount && rosterData.length < 6) {
      if (removedCache.length > 0) {
        const restoredObj = removedCache.pop();
        restoredObj.id = rosterData.length + 1;
        rosterData.push(restoredObj);
      } else {
        rosterData.push({ id: rosterData.length + 1, name: "", email: "", personal_email: "", college_id: "", phone: "", role: "", photo_url: "", isLeader: false });
      }
    }
    while (rosterData.length > targetCount && rosterData.length > 1) {
      const removedObj = rosterData.pop();
      removedCache.push(removedObj);
    }

    renderRosterStack();
  });

  rosterData = [
    { id: 1, name: "", email: "", personal_email: "", college_id: "", phone: "", role: "Team Leader / Primary Contact", photo_url: "", isLeader: true }
  ];
  renderRosterStack();

  // Helper: Live Progress Bar Controller
  function updateProgress(percent, statusMsg) {
    const submitBtn = form.querySelector("button[type='submit']");
    let progressWrap = document.getElementById("submitProgressWrapper");
    if (!progressWrap) {
      progressWrap = document.createElement("div");
      progressWrap.id = "submitProgressWrapper";
      progressWrap.className = "submit-progress-wrapper";
      progressWrap.innerHTML = `
        <div id="submitProgressFill" class="submit-progress-fill"></div>
        <span id="submitProgressText" class="submit-progress-text"></span>
      `;
      submitBtn.parentNode.insertBefore(progressWrap, submitBtn);
    }
    submitBtn.style.display = "none";
    progressWrap.style.display = "block";
    const fill = document.getElementById("submitProgressFill");
    const text = document.getElementById("submitProgressText");
    if (fill) fill.style.width = `${percent}%`;
    if (text) {
      text.textContent = `${statusMsg} (${percent}%)`;
      if (percent > 45) text.classList.add("is-active");
      else text.classList.remove("is-active");
    }
  }

  function resetProgress() {
    const submitBtn = form.querySelector("button[type='submit']");
    const progressWrap = document.getElementById("submitProgressWrapper");
    if (progressWrap) progressWrap.style.display = "none";
    if (submitBtn) {
      submitBtn.style.display = "inline-flex";
      submitBtn.disabled = false;
      submitBtn.innerHTML = "Submit Group Registration →";
    }
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    saveCurrentInputsToState();
    const formData = new FormData(form);
    const rawData = Object.fromEntries(formData.entries());

    if (rawData.teamPassword !== rawData.teamPasswordConfirm) {
      alert("Team passwords do not match. Please verify.");
      return;
    }

    updateProgress(10, "Initializing team registration...");

    // Count pending photos for progress bar step calculations
    const pendingPhotos = rosterData.filter(m => m._pendingFile);
    const totalSteps = pendingPhotos.length + 2;
    let currentStep = 0;

    // 1. Upload & sanitize member photos with progress fill
    for (let i = 0; i < rosterData.length; i++) {
      const m = rosterData[i];
      if (m._pendingFile) {
        currentStep++;
        const pct = Math.round((currentStep / totalSteps) * 75);
        updateProgress(pct, `Sanitizing Photo ${currentStep} of ${pendingPhotos.length}...`);

        const pFormData = new FormData();
        pFormData.append("file", m._pendingFile);
        const apiBase = getApiBase();
        try {
          const pRes = await fetch(`${apiBase}/teams/upload-photo`, {
            method: "POST",
            body: pFormData
          });
          const rawText = await pRes.text();
          let pData = {};
          try {
            pData = JSON.parse(rawText);
          } catch {
            pData = { detail: rawText || `Server returned status ${pRes.status}` };
          }

          if (pRes.ok && pData.photo_url) {
            m.photo_url = pData.photo_url;
          } else {
            alert(`Photo upload error for member ${i + 1}: ${pData.detail || 'Upload failed.'}`);
            resetProgress();
            return;
          }
        } catch (uploadErr) {
          console.error("Photo upload network error:", uploadErr);
          alert(`Network error uploading photo for member ${i + 1}: ${uploadErr.message}`);
          resetProgress();
          return;
        }
      }
    }

    updateProgress(85, "Encrypting & saving team credentials...");

    const payload = {
      team_name: rawData.teamName || "Your Group",
      track: rawData.trackSelect || "E-Summit Event Track",
      college: rawData.college || "DIT University",
      password: rawData.teamPassword,
      security_question: rawData.securityQuestion,
      security_answer: rawData.securityAnswer,
      members: rosterData.map(m => ({
        name: m.name || "",
        email: m.email || "",
        personal_email: m.personal_email || "",
        college_id: m.college_id || "",
        phone: m.phone || "",
        role: m.role || "Participant",
        note: m.note || "",
        photo_url: m.photo_url || ""
      }))
    };

    let assignedGroupId = null;

    try {
      const apiEndpoint = `${getApiBase()}/teams/register`;
      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || "Registration could not be saved.");
      }
      const resData = await response.json();
      assignedGroupId = resData.group_id;
    } catch (err) {
      console.error("Registration request failed:", err);
      alert(`Registration was not saved. ${err.message || "Please try again."}`);
      resetProgress();
      return;
    }

    updateProgress(100, "Registration Complete!");

    const teamName = payload.team_name;
    const track = payload.track;
    const college = payload.college;

    // The server renames temporary uploads to their official Group ID path.
    // Keep the local crop visible immediately, then point future loads at the
    // official path returned by the registration response.
    rosterData.forEach((member, index) => {
      if (!member.photo_url) return;
      const extension = member.photo_url.split(".").pop();
      member.photo_url = `/api/teams/photos/${assignedGroupId}_member_${index + 1}.${extension}`;
    });

    let membersListHtml = "";
    payload.members.forEach((m, idx) => {
      membersListHtml += `
        <div style="margin-bottom:0.75rem;padding:0.85rem;background:rgba(255,255,255,0.7);border-radius:12px;border:1px solid rgba(26,24,20,0.12);display:flex;gap:1rem;align-items:center;">
          <div style="width:48px;height:48px;border-radius:50%;border:2px solid var(--ink);overflow:hidden;flex-shrink:0;background:#eee;">
            <img src="${m._pendingPreview || getApiAssetUrl(m.photo_url) || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(m.name || 'Member') + '&background=1a1814&color=e9e1d2'}" alt="${m.name || 'Member'} photo" style="width:100%;height:100%;object-fit:cover;">
          </div>
          <div style="flex:1;">
            <div style="font-weight:700;font-size:0.95rem;">${idx === 0 ? "★ Leader: " : `Member ${idx + 1}: `}${m.name || "N/A"} <span style="font-size:0.75rem;color:var(--oxide);font-family:var(--mono);">(${m.role})</span></div>
            <div style="font-size:0.78rem;color:var(--muted-ink);font-family:var(--mono);margin-top:0.2rem;">✉ Inst: ${m.email || "N/A"} &nbsp;|&nbsp; Personal: ${m.personal_email || "N/A"}</div>
            <div style="font-size:0.78rem;color:var(--muted-ink);font-family:var(--mono);">📞 ${m.phone || "N/A"}${m.college_id ? ` &nbsp;|&nbsp; 🪪 ID: ${m.college_id}` : ""}</div>
          </div>
        </div>
      `;
    });

    status.innerHTML = `
      <div class="registration-success-card registration-success-card--green">
        <div class="success-header" style="display:flex;align-items:center;gap:1rem;border-bottom:2px dashed rgba(26,24,20,0.15);padding-bottom:1rem;">
          <div class="success-icon success-icon--green">✓</div>
          <div>
            <h3 style="margin:0;font-size:1.3rem;font-weight:800;">Team Registration Successful!</h3>
            <p class="success-group-id">ASSIGNED TEAM GROUP ID: ${assignedGroupId}</p>
          </div>
        </div>
        
        <div style="margin-top:1.2rem;">
          <p style="margin:0 0 0.8rem;font-size:0.92rem;"><strong>Team:</strong> ${teamName} &nbsp;|&nbsp; <strong>Track:</strong> ${track} &nbsp;|&nbsp; <strong>College:</strong> ${college}</p>
          <div style="font-weight:700;font-family:var(--mono);font-size:0.75rem;text-transform:uppercase;color:var(--ink);margin-bottom:0.6rem;">Expanded Registered Roster (${payload.members.length} Members):</div>
          ${membersListHtml}
        </div>

        <div style="margin-top:1.5rem;padding-top:1rem;border-top:1px solid rgba(26,24,20,0.12);display:flex;flex-direction:column;gap:0.75rem;text-align:center;">
          <p class="success-save-note">Registration saved. Keep your Group ID safe for portal login.</p>
          <div style="display:flex;gap:1rem;justify-content:center;">
            <button type="button" class="button button--ink" id="downloadAllIdCardsBtn" style="flex:1;justify-content:center;">Download virtual ID cards ↓</button>
            <a class="button button--ink" href="login.html" style="flex:1;justify-content:center;text-decoration:none;">Login Now →</a>
          </div>
        </div>
      </div>
    `;

    document.getElementById("downloadAllIdCardsBtn")?.addEventListener("click", () => {
      payload.members.forEach((member, index) => downloadRegistrationIdCardPNG({
        group_id: assignedGroupId,
        team_name: teamName,
        track,
        college
      }, { ...member, photo_url: rosterData[index].photo_url, _pendingPreview: rosterData[index]._pendingPreview }, index));
    });
  });
}

function downloadRegistrationIdCardPNG(team, member, index) {
  const canvas = document.createElement("canvas");
  canvas.width = 1200;
  canvas.height = 760;
  const context = canvas.getContext("2d");
  const background = context.createLinearGradient(0, 0, 1200, 760);
  background.addColorStop(0, "#1a1814");
  background.addColorStop(1, "#30291f");
  context.fillStyle = background;
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "#d3e83d";
  context.fillRect(0, 0, 1200, 18);
  context.fillStyle = "#e9e1d2";
  context.font = "700 28px monospace";
  context.fillText("E-SUMMIT 2026 / OFFICIAL VIRTUAL ID", 64, 86);
  context.font = "800 58px Archivo, Arial, sans-serif";
  context.fillText(member.name || "TEAM MEMBER", 64, 180);
  context.fillStyle = "#d84b2d";
  context.font = "700 24px monospace";
  context.fillText(member.role || "PARTICIPANT", 64, 224);
  context.fillStyle = "#e9e1d2";
  context.font = "500 25px monospace";
  context.fillText(`GROUP ID  ${team.group_id}`, 64, 310);
  context.fillText(`TRACK     ${team.track}`, 64, 358);
  context.fillText(`COLLEGE   ${team.college}`, 64, 406);
  context.fillText(`MEMBER    ${String(index + 1).padStart(2, "0")}`, 64, 454);
  context.fillStyle = "#d3e83d";
  context.font = "700 22px monospace";
  context.fillText("KEEP THIS PASS FOR CHECK-IN", 64, 660);

  const imageSource = member._pendingPreview || getApiAssetUrl(member.photo_url);
  if (imageSource) {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => {
      context.save();
      context.beginPath();
      context.arc(1010, 300, 125, 0, Math.PI * 2);
      context.clip();
      context.drawImage(image, 885, 175, 250, 250);
      context.restore();
      context.strokeStyle = "#d3e83d";
      context.lineWidth = 8;
      context.beginPath();
      context.arc(1010, 300, 129, 0, Math.PI * 2);
      context.stroke();
      canvas.toBlob((blob) => triggerPNGDownload(blob, `${team.group_id}-${member.name || `member-${index + 1}`}-virtual-id.png`), "image/png");
    };
    image.onerror = () => canvas.toBlob((blob) => triggerPNGDownload(blob, `${team.group_id}-member-${index + 1}-virtual-id.png`), "image/png");
    image.src = imageSource;
    return;
  }
  canvas.toBlob((blob) => triggerPNGDownload(blob, `${team.group_id}-member-${index + 1}-virtual-id.png`), "image/png");
}

function triggerPNGDownload(blob, filename) {
  if (!blob) return;
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename.replace(/[^a-z0-9._-]+/gi, "-");
  link.click();
  setTimeout(() => URL.revokeObjectURL(link.href), 1000);
}

// ════════════════════════════════════════════════════════════════
//  SPOTLIGHT IMAGE ENLARGE MODAL & PHOTO CROP/ZOOM CONTROLLER
// ════════════════════════════════════════════════════════════════

function openSpotlightModal(member) {
  // Sync live input values from DOM into state before rendering spotlight
  if (typeof saveCurrentInputsToState === "function") {
    saveCurrentInputsToState();
  } else if (typeof window._saveCurrentInputsToState === "function") {
    window._saveCurrentInputsToState();
  }

  const nameVal = member.name || document.getElementById(`member_${member.id}_name`)?.value || 'Team Member';
  const emailVal = member.email || document.getElementById(`member_${member.id}_email`)?.value || 'N/A';
  const personalEmailVal = member.personal_email || document.getElementById(`member_${member.id}_personal_email`)?.value || 'N/A';
  const phoneVal = member.phone || document.getElementById(`member_${member.id}_phone`)?.value || 'N/A';
  const collegeIdVal = member.college_id || document.getElementById(`member_${member.id}_college_id`)?.value || '';
  const noteVal = member.note || document.getElementById(`member_${member.id}_note`)?.value || '';

  let modal = document.getElementById("spotlightModalOverlay");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "spotlightModalOverlay";
    modal.className = "photo-modal-overlay";
    document.body.appendChild(modal);
  }

  const photo = getApiAssetUrl(member.photo_url) || member._pendingPreview || `https://ui-avatars.com/api/?name=${encodeURIComponent(nameVal)}&background=1a1814&color=e9e1d2&bold=true`;

  modal.innerHTML = `
    <div class="spotlight-card">
      <div class="spotlight-img-frame" title="Spotlight Member Photo">
        <img src="${photo}" alt="${nameVal}">
      </div>
      <div>
        <h3 class="spotlight-name">${nameVal}</h3>
        <span class="spotlight-role">${member.role || 'Team Member'}</span>
      </div>
      <div class="spotlight-details">
        <div class="spotlight-detail-item">
          <span class="spotlight-detail-label">Inst. Email</span>
          <span class="spotlight-detail-val">${emailVal}</span>
        </div>
        <div class="spotlight-detail-item">
          <span class="spotlight-detail-label">Personal Email</span>
          <span class="spotlight-detail-val">${personalEmailVal}</span>
        </div>
        <div class="spotlight-detail-item">
          <span class="spotlight-detail-label">Phone / WhatsApp</span>
          <span class="spotlight-detail-val">${phoneVal}</span>
        </div>
        ${collegeIdVal ? `
        <div class="spotlight-detail-item">
          <span class="spotlight-detail-label">College ID</span>
          <span class="spotlight-detail-val">${collegeIdVal}</span>
        </div>` : ''}
        ${noteVal ? `
        <div style="margin-top:0.4rem;padding-top:0.4rem;border-top:1px dashed rgba(255,255,255,0.15);font-size:0.75rem;color:rgba(255,255,255,0.85);">
          <strong>Note:</strong> ${noteVal}
        </div>` : ''}
      </div>
      <button type="button" class="button button--secondary" id="closeSpotlightBtn" style="width:100%;justify-content:center;background:rgba(255,255,255,0.12);color:#ffffff;border-color:rgba(255,255,255,0.25);">
        Close Spotlight ✕
      </button>
    </div>
  `;

  requestAnimationFrame(() => modal.classList.add("is-open"));

  const close = () => {
    modal.classList.remove("is-open");
  };

  document.getElementById("closeSpotlightBtn")?.addEventListener("click", close);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) close();
  });
}

function openCropZoomModal(file, onConfirmCallback) {
  let modal = document.getElementById("photoCropModalOverlay");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "photoCropModalOverlay";
    modal.className = "photo-modal-overlay";
    document.body.appendChild(modal);
  }

  modal.innerHTML = `
    <div class="photo-crop-card">
      <div class="crop-header">
        <h3>Zoom & Position Member Photo</h3>
        <button type="button" class="crop-close-btn" id="cancelCropBtn">✕</button>
      </div>
      <div class="crop-viewport-wrap" id="cropViewportWrap">
        <canvas id="cropCanvas" width="260" height="260"></canvas>
      </div>
      <div class="crop-controls">
        <div class="crop-slider-label">
          <span>Zoom Level</span>
          <span id="zoomValText">100%</span>
        </div>
        <input type="range" id="cropZoomSlider" class="crop-slider" min="1" max="3" step="0.05" value="1">
      </div>
      <div class="crop-actions">
        <button type="button" class="button button--secondary" id="cancelCropBtn2" style="flex:1;justify-content:center;">Cancel</button>
        <button type="button" class="button button--ink" id="confirmCropBtn" style="flex:1;justify-content:center;">Apply Photo ✓</button>
      </div>
    </div>
  `;

  const canvas = document.getElementById("cropCanvas");
  const ctx = canvas.getContext("2d");
  const zoomSlider = document.getElementById("cropZoomSlider");
  const zoomValText = document.getElementById("zoomValText");
  const viewport = document.getElementById("cropViewportWrap");

  let img = new Image();
  let zoomScale = 1.0;
  let offsetX = 0;
  let offsetY = 0;
  let isDragging = false;
  let startX = 0;
  let startY = 0;

  const reader = new FileReader();
  reader.onload = (e) => {
    img.onload = () => {
      zoomScale = 1.0;
      offsetX = 0;
      offsetY = 0;
      draw();
      modal.classList.add("is-open");
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);

  function draw() {
    if (!img.width || !img.height) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const baseScale = Math.max(canvas.width / img.width, canvas.height / img.height);
    const drawW = img.width * baseScale * zoomScale;
    const drawH = img.height * baseScale * zoomScale;
    const x = (canvas.width - drawW) / 2 + offsetX;
    const y = (canvas.height - drawH) / 2 + offsetY;

    ctx.drawImage(img, x, y, drawW, drawH);
  }

  zoomSlider.addEventListener("input", (e) => {
    zoomScale = parseFloat(e.target.value);
    zoomValText.textContent = `${Math.round(zoomScale * 100)}%`;
    draw();
  });

  const onDragStart = (clientX, clientY) => {
    isDragging = true;
    startX = clientX - offsetX;
    startY = clientY - offsetY;
  };

  const onDragMove = (clientX, clientY) => {
    if (!isDragging) return;
    offsetX = clientX - startX;
    offsetY = clientY - startY;
    draw();
  };

  const onDragEnd = () => { isDragging = false; };

  viewport.addEventListener("mousedown", (e) => onDragStart(e.clientX, e.clientY));
  window.addEventListener("mousemove", (e) => onDragMove(e.clientX, e.clientY));
  window.addEventListener("mouseup", onDragEnd);

  viewport.addEventListener("touchstart", (e) => {
    if (e.touches.length === 1) onDragStart(e.touches[0].clientX, e.touches[0].clientY);
  }, { passive: true });
  window.addEventListener("touchmove", (e) => {
    if (e.touches.length === 1) onDragMove(e.touches[0].clientX, e.touches[0].clientY);
  }, { passive: true });
  window.addEventListener("touchend", onDragEnd);

  const closeModal = () => {
    modal.classList.remove("is-open");
  };

  document.getElementById("cancelCropBtn")?.addEventListener("click", closeModal);
  document.getElementById("cancelCropBtn2")?.addEventListener("click", closeModal);

  document.getElementById("confirmCropBtn")?.addEventListener("click", () => {
    canvas.toBlob((blob) => {
      const croppedFile = new File([blob], file.name, { type: "image/jpeg" });
      const previewDataUrl = canvas.toDataURL("image/jpeg");
      onConfirmCallback(croppedFile, previewDataUrl);
      closeModal();
    }, "image/jpeg", 0.92);
  });
}

// Global Escape Key Listener for Modals
window.addEventListener("keydown", (e) => {
  if (e.key === "Escape" || e.key === "Esc") {
    document.querySelectorAll(".photo-modal-overlay.is-open").forEach((modal) => {
      modal.classList.remove("is-open");
    });
  }
});

function setUpFaqAccordion() {
  const items = document.querySelectorAll(".faq-item");
  if (!items.length) return;
  items.forEach((item) => {
    item.addEventListener("toggle", () => {
      if (item.open) {
        items.forEach((other) => {
          if (other !== item && other.open) other.open = false;
        });
      }
    });
  });
}
