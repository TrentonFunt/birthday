/* global CONTENT */

const STORAGE_KEY = "birthdayQuest:v1";
const RISE_KEYFRAMES = `
@keyframes riseIn{
  from{ opacity:0; transform: translateY(12px) scale(.98); }
  to{ opacity:1; transform: translateY(0) scale(1); }
}
@keyframes photoPop{
  from{ opacity:0.75; transform: scale(0.94); }
  to{ opacity:1; transform: scale(1); }
}
@keyframes confettiFall{
  to{ transform: translateY(110vh) rotate(640deg); opacity:0.35; }
}
@keyframes heartFloat{
  0%{ transform: translateY(10px) scale(0.45) rotate(-8deg); opacity:0; }
  15%{ opacity:0.98; }
  100%{ transform: translateY(-220px) scale(1.05) rotate(8deg); opacity:0; }
}
`;

let celebrationPending = false;
let voucherRevealTimer = null;
let photosSlideTimer = null;
let finalPhasePauseTimer = null;

function clearPhotosSlideTimer() {
  if (photosSlideTimer) {
    window.clearTimeout(photosSlideTimer);
    photosSlideTimer = null;
  }
}

function clearFinalPhasePauseTimer() {
  if (finalPhasePauseTimer) {
    window.clearTimeout(finalPhasePauseTimer);
    finalPhasePauseTimer = null;
  }
}

let betweenVideosTimer = null;
let birthdayBgAudio = null;
let birthdayBgAudioStopTimer = null;
let birthdayAudioEmbedHost = null;
let bgMusicPreloadStarted = false;

function clearBetweenVideosTimer() {
  if (betweenVideosTimer) {
    window.clearTimeout(betweenVideosTimer);
    betweenVideosTimer = null;
  }
}

function clearBirthdayBgAudioStopTimer() {
  if (birthdayBgAudioStopTimer) {
    window.clearTimeout(birthdayBgAudioStopTimer);
    birthdayBgAudioStopTimer = null;
  }
}

function stopBirthdayBackgroundAudio() {
  clearBirthdayBgAudioStopTimer();
  if (birthdayBgAudio) {
    birthdayBgAudio.pause();
    try {
      birthdayBgAudio.currentTime = 0;
    } catch (_) {}
  }
  if (birthdayAudioEmbedHost) {
    const frame = birthdayAudioEmbedHost.querySelector("iframe");
    if (frame) frame.setAttribute("src", "about:blank");
    birthdayAudioEmbedHost.remove();
    birthdayAudioEmbedHost = null;
  }
}

function preloadBackgroundMusicOnGate() {
  if (state.unlocked) return;
  const gate = CONTENT.gate || {};
  const src = typeof gate.backgroundAudioSrc === "string" ? gate.backgroundAudioSrc.trim() : "";
  if (!src || bgMusicPreloadStarted) return;
  bgMusicPreloadStarted = true;
  if (!birthdayBgAudio) {
    birthdayBgAudio = new Audio();
    birthdayBgAudio.preload = "auto";
    birthdayBgAudio.loop = true;
    birthdayBgAudio.setAttribute("playsinline", "");
  }
  if (birthdayBgAudio.src !== src) {
    birthdayBgAudio.src = src;
  }
  birthdayBgAudio.volume = typeof gate.backgroundAudioVolume === "number" ? gate.backgroundAudioVolume : 0.6;
  try {
    birthdayBgAudio.load();
  } catch (_) {}
}

function startBirthdayBackgroundAudioFromUserGesture() {
  const gate = CONTENT.gate || {};
  const src = typeof gate.backgroundAudioSrc === "string" ? gate.backgroundAudioSrc.trim() : "";
  if (src) {
    if (!birthdayBgAudio) {
      birthdayBgAudio = new Audio();
      birthdayBgAudio.preload = "auto";
      birthdayBgAudio.loop = true;
      birthdayBgAudio.setAttribute("playsinline", "");
    }
    if (birthdayBgAudio.src !== src) {
      birthdayBgAudio.src = src;
      try {
        birthdayBgAudio.load();
      } catch (_) {}
    }
    birthdayBgAudio.volume = typeof gate.backgroundAudioVolume === "number" ? gate.backgroundAudioVolume : 0.6;
    birthdayBgAudio.play().catch(() => {});
    return;
  }
  const embedUrl =
    typeof gate.backgroundAudioEmbedUrl === "string" ? gate.backgroundAudioEmbedUrl.trim() : "";
  if (!embedUrl) return;
  if (!birthdayAudioEmbedHost) {
    birthdayAudioEmbedHost = document.createElement("div");
    birthdayAudioEmbedHost.className =
      "birthday-audio-embed fixed bottom-2 right-2 z-[5] h-[57px] w-[51px] overflow-hidden rounded-lg opacity-[0.38] pointer-events-none shadow-lg";
    birthdayAudioEmbedHost.setAttribute("aria-hidden", "true");
    const iframe = document.createElement("iframe");
    iframe.setAttribute("title", "Background music");
    iframe.style.cssText =
      "display:block;border:0;width:204px;height:204px;transform:scale(0.25);transform-origin:top left;";
    iframe.setAttribute("allow", "autoplay");
    birthdayAudioEmbedHost.appendChild(iframe);
    document.body.appendChild(birthdayAudioEmbedHost);
  }
  const frame = birthdayAudioEmbedHost.querySelector("iframe");
  if (frame && !frame.getAttribute("src")) {
    frame.setAttribute("src", embedUrl);
  }
}

function scheduleBirthdayBackgroundAudioStopAfterReveal() {
  clearBirthdayBgAudioStopTimer();
  const tailMs = 5000;
  birthdayBgAudioStopTimer = window.setTimeout(() => {
    birthdayBgAudioStopTimer = null;
    stopBirthdayBackgroundAudio();
  }, tailMs);
}

function ensureKeyframes() {
  if (document.getElementById("birthdayQuestKeyframes")) return;
  const style = document.createElement("style");
  style.id = "birthdayQuestKeyframes";
  style.textContent = RISE_KEYFRAMES;
  document.head.appendChild(style);
}

const STAGGER_STEP_MS = 76;

function applyStagger(node, index) {
  if (!node || !node.style) return node;
  node.classList.add("opacity-0", "animate-[riseIn_440ms_cubic-bezier(0.22,1,0.36,1)_forwards]");
  node.style.animationDelay = `${index * STAGGER_STEP_MS}ms`;
  return node;
}

const VOUCHER_REVEAL_DELAY_MS = 2000;

function launchCelebration() {
  const layer = document.createElement("div");
  layer.setAttribute("role", "presentation");
  layer.className = "celebration-burst fixed inset-0 z-[9998] pointer-events-none overflow-hidden";
  layer.style.setProperty("-webkit-mask-image", "none");
  layer.style.setProperty("mask-image", "none");

  const flash = document.createElement("div");
  flash.style.cssText =
    "position:absolute;inset:0;background:radial-gradient(circle at 50% 40%,rgba(238,210,204,0.45),transparent 55%);opacity:0;animation:celebrationFlash 0.9s ease-out forwards;";
  layer.appendChild(flash);

  if (!document.getElementById("birthdayCelebrationExtraKeyframes")) {
    const st = document.createElement("style");
    st.id = "birthdayCelebrationExtraKeyframes";
    st.textContent =
      "@keyframes celebrationFlash{0%{opacity:0}25%{opacity:1}100%{opacity:0}}";
    document.head.appendChild(st);
  }

  const coral = "232,153,141";
  const cream = "238,210,204";
  const sage = "108,154,139";

  for (let i = 0; i < 56; i++) {
    const p = document.createElement("div");
    const w = 5 + Math.floor(Math.random() * 8);
    const h = 7 + Math.floor(Math.random() * 10);
    const left = Math.random() * 100;
    const delay = Math.random() * 0.45;
    const dur = 2.4 + Math.random() * 1.35;
    const rot = Math.floor(Math.random() * 360);
    const palette = [coral, cream, sage];
    const rgb = palette[i % palette.length];
    const rounded = Math.random() > 0.4;
    p.style.cssText = [
      "position:absolute",
      `left:${left}vw`,
      "top:-24px",
      `width:${w}px`,
      `height:${h}px`,
      rounded ? "border-radius:2px" : "border-radius:9999px",
      `background:rgba(${rgb},${0.8 + Math.random() * 0.18})`,
      `opacity:0.98`,
      `transform:rotate(${rot}deg)`,
      `animation:confettiFall ${dur}s linear ${delay}s forwards`,
      "box-shadow:0 0 10px rgba(255,255,255,0.12)",
    ].join(";");
    layer.appendChild(p);
  }

  const heartChars = ["\u2665", "\u2764", "\u2726"];
  for (let i = 0; i < 20; i++) {
    const h = document.createElement("div");
    const left = 8 + Math.random() * 84;
    const delay = 0.08 + Math.random() * 0.65;
    const dur = 2.4 + Math.random() * 0.95;
    const size = 26 + Math.floor(Math.random() * 22);
    h.textContent = heartChars[i % heartChars.length];
    h.style.cssText = [
      "position:absolute",
      `left:${left}%`,
      "bottom:8vh",
      `font-size:${size}px`,
      "line-height:1",
      "font-weight:700",
      "color:rgba(232,153,141,0.92)",
      "text-shadow:0 2px 8px rgba(0,0,0,0.25)",
      `animation:heartFloat ${dur}s ease-out ${delay}s forwards`,
    ].join(";");
    layer.appendChild(h);
  }

  document.body.appendChild(layer);
  const removeMs = 6800;
  window.setTimeout(() => layer.remove(), removeMs);
}

function renderCardStickers() {
  const layer = el("div", {
    class:
      "pointer-events-none absolute inset-0 z-[1] overflow-hidden rounded-[1.75rem]",
    "aria-hidden": "true",
  });

  const heart = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  heart.setAttribute("viewBox", "0 0 24 24");
  heart.setAttribute("class", "absolute -left-0.5 top-10 h-6 w-6 sm:h-8 sm:w-8 -rotate-[14deg] text-[var(--c-bright)] opacity-[0.72] drop-shadow-sm");
  heart.innerHTML =
    '<path fill="currentColor" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>';

  const star = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  star.setAttribute("viewBox", "0 0 24 24");
  star.setAttribute("class", "absolute bottom-24 right-1 h-5 w-5 sm:h-7 sm:w-7 rotate-[16deg] text-[var(--c-neutral)] opacity-[0.65] drop-shadow-sm");
  star.innerHTML = '<path fill="currentColor" d="M12 2l2.47 7.61h8l-6.47 4.7 2.47 7.61L12 17.23l-6.47 4.7 2.47-7.61-6.47-4.7h8L12 2z"/>';

  layer.appendChild(heart);
  layer.appendChild(star);
  return layer;
}

function safeParse(json) {
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
}

const LOVE_CODE_SESSION_KEY = "birthdayQuest:loveCodeShown";

function defaultState() {
  return {
    unlocked: false,
    current: "gate",
    completed: {
      intro: false,
      photos: false,
      note1: false,
      level2: false,
      note2: false,
      level3: false,
      final: false,
    },
    level2: {
      idx: 0,
      correct: 0,
      answered: {},
    },
    photos: {
      idx: 0,
      done: false,
    },
    level3: {
      checked: [false, false, false],
    },
    final: {
      ticketVisible: false,
      videoIdx: 0,
      momentsClaimed: false,
      videosComplete: false,
      codeComplete: false,
    },
  };
}

function mergeState(saved) {
  const base = defaultState();
  if (!saved || typeof saved !== "object") return base;

  const savedFinal = saved.final || {};
  const { revealed: _legacyRevealed, ...savedFinalRest } = savedFinal;
  const ticketVisible = Boolean(
    savedFinal.ticketVisible === true || savedFinal.revealed === true
  );
  let loveDoneSession = false;
  try {
    loveDoneSession = sessionStorage.getItem(LOVE_CODE_SESSION_KEY) === "1";
  } catch (_) {
    loveDoneSession = false;
  }
  const codeComplete = Boolean(
    savedFinal.codeComplete === true || ticketVisible || loveDoneSession
  );
  const videosComplete = Boolean(
    savedFinal.videosComplete === true || ticketVisible || codeComplete
  );
  const momentsClaimed = Boolean(
    savedFinal.momentsClaimed === true ||
      ticketVisible ||
      (typeof savedFinal.videoIdx === "number" && savedFinal.videoIdx > 0) ||
      savedFinal.videosComplete === true ||
      codeComplete
  );

  return {
    ...base,
    ...saved,
    completed: { ...base.completed, ...(saved.completed || {}) },
    level2: { ...base.level2, ...(saved.level2 || {}) },
    photos: { ...base.photos, ...(saved.photos || {}) },
    level3: { ...base.level3, ...(saved.level3 || {}) },
    final: {
      ...base.final,
      ...savedFinalRest,
      ticketVisible,
      momentsClaimed,
      videosComplete,
      codeComplete,
      videoIdx:
        typeof savedFinal.videoIdx === "number"
          ? savedFinal.videoIdx
          : base.final.videoIdx,
    },
  };
}

function getInitialState() {
  const saved = safeParse(localStorage.getItem(STORAGE_KEY) || "");
  return mergeState(saved);
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function format(template, vars) {
  return String(template).replace(/\{(\w+)\}/g, (_, k) => (vars[k] ?? `{${k}}`));
}

function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v === null || v === undefined) continue;
    if (k === "class") node.className = v;
    else if (k === "text") node.textContent = v;
    else if (k === "html") node.innerHTML = v;
    else if (k.startsWith("on") && typeof v === "function") {
      node.addEventListener(k.slice(2).toLowerCase(), v);
    } else if (k === "disabled" && typeof v === "boolean") {
      node.disabled = v;
    } else if (k === "checked" && typeof v === "boolean") {
      node.checked = v;
    } else {
      node.setAttribute(k, String(v));
    }
  }
  for (const c of Array.isArray(children) ? children : [children]) {
    if (c === null || c === undefined) continue;
    node.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
  }
  return node;
}

const LOVE_CSHARP_LINES = [
  "using System;",
  "",
  "class BirthdayLove",
  "{",
  "    static void Main()",
  "    {",
  '        Console.WriteLine("I LOVE YOU");',
  "    }",
  "}",
];

function mountLoveCodeBlock(onComplete) {
  const root = document.getElementById("love-code-root");
  if (!root) return;
  const preSrc = root.querySelector(".love-code-src");
  const preOut = root.querySelector(".love-code-term");
  if (!preSrc || !preOut) return;

  function fireComplete() {
    if (typeof onComplete === "function") onComplete();
  }

  if (sessionStorage.getItem(LOVE_CODE_SESSION_KEY) === "1") {
    preSrc.textContent = LOVE_CSHARP_LINES.join("\n");
    preOut.textContent = "I LOVE YOU";
    window.requestAnimationFrame(fireComplete);
    return;
  }

  const full = LOVE_CSHARP_LINES.join("\n");
  let i = 0;
  function typeSource() {
    if (i <= full.length) {
      preSrc.textContent = full.slice(0, i);
      i += 1;
      const ch = full[i - 1] || "";
      const delay = ch === "\n" ? 88 : ch === " " ? 24 : 15;
      window.setTimeout(typeSource, delay);
    } else {
      window.setTimeout(typeOutput, 480);
    }
  }
  function typeOutput() {
    const msg = "I LOVE YOU";
    let j = 0;
    function t() {
      if (j <= msg.length) {
        preOut.textContent = msg.slice(0, j);
        j += 1;
        window.setTimeout(t, 105);
      } else {
        sessionStorage.setItem(LOVE_CODE_SESSION_KEY, "1");
        fireComplete();
      }
    }
    t();
  }
  window.setTimeout(typeSource, 100);
}

function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n));
}

function screensAfterUnlock() {
  return ["intro", "photos", "note1", "level2", "note2", "level3", "final"];
}

function screenLabel(id) {
  const labels = {
    intro: "Welcome",
    photos: "Level 1",
    note1: "Note",
    level2: "Level 2",
    note2: "Note",
    level3: "Level 3",
    final: "Reward",
  };
  return labels[id] || "";
}

function progressInfo() {
  if (!state.unlocked) return { show: false, label: "", pct: 0 };
  const order = screensAfterUnlock();
  const idx = Math.max(0, order.indexOf(state.current));
  const total = order.length;
  const step = clamp(idx + 1, 1, total);
  return {
    show: true,
    label: screenLabel(state.current),
    pct: (step / total) * 100,
  };
}

function canGoBack() {
  if (!state.unlocked) return false;
  const order = screensAfterUnlock();
  const idx = order.indexOf(state.current);
  return idx > 0;
}

function goTo(screenId) {
  state.current = screenId;
  saveState();
  render();
}

function nextScreenId() {
  const order = screensAfterUnlock();
  const idx = order.indexOf(state.current);
  if (idx === -1) return "intro";
  return order[Math.min(order.length - 1, idx + 1)];
}

function prevScreenId() {
  const order = screensAfterUnlock();
  const idx = order.indexOf(state.current);
  if (idx <= 0) return order[0];
  return order[idx - 1];
}

function resetQuest() {
  celebrationPending = false;
  clearPhotosSlideTimer();
  clearFinalPhasePauseTimer();
  clearBetweenVideosTimer();
  stopBirthdayBackgroundAudio();
  birthdayBgAudio = null;
  bgMusicPreloadStarted = false;
  if (voucherRevealTimer) {
    window.clearTimeout(voucherRevealTimer);
    voucherRevealTimer = null;
  }
  sessionStorage.removeItem(LOVE_CODE_SESSION_KEY);
  localStorage.removeItem(STORAGE_KEY);
  state = getInitialState();
  render();
}

function markCompleted(id) {
  if (state.completed[id] === true) return;
  state.completed[id] = true;
  saveState();
}

function shouldUnlockNextForCurrent() {
  switch (state.current) {
    case "intro":
      return true;
    case "photos":
      return state.photos.done === true;
    case "note1":
      return true;
    case "level2": {
      const { minCorrect } = CONTENT.screens.level2;
      return state.level2.correct >= minCorrect;
    }
    case "note2":
      return true;
    case "level3":
      return state.level3.checked.every(Boolean);
    case "final":
      return true;
    default:
      return false;
  }
}

function renderNote(noteId) {
  const cfg = CONTENT.screens[noteId];
  const btn = el(
    "button",
    {
      class:
        "inline-flex items-center justify-center rounded-2xl border border-[var(--c-bright)]/40 bg-transparent px-5 py-3 font-semibold tracking-wide text-[var(--c-neutral)] hover:border-[var(--c-bright)]/70 hover:bg-[var(--c-bright)]/12 active:translate-y-px",
      type: "button",
      onClick: () => {
        markCompleted(noteId);
        goTo(nextScreenId());
      },
    },
    cfg.ctaText || "Next"
  );

  const wrap = el("div", { class: "grid gap-4" }, []);
  let i = 0;
  wrap.appendChild(applyStagger(el("h2", { class: "text-2xl sm:text-3xl md:text-4xl font-bold leading-tight tracking-wide text-[var(--c-neutral)]", text: cfg.title }), i++));
  wrap.appendChild(applyStagger(el("p", { class: "text-sm sm:text-base leading-relaxed text-[var(--c-neutral)]/80", text: cfg.body }), i++));
  wrap.appendChild(applyStagger(el("div", { class: "flex flex-wrap items-center gap-3" }, [btn]), i++));
  return wrap;
}

function renderTopbar() {
  const p = progressInfo();
  const left = el("div", { class: "flex items-center gap-2 sm:gap-2.5 shrink-0" }, [
    el("div", {
      class:
        "font-display text-[10px] sm:text-[11px] font-semibold leading-none px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-full border border-[var(--c-neutral)]/35 uppercase tracking-[0.18em] text-[var(--c-neutral)]",
      text: CONTENT.brand.badgeText,
    }),
    el("div", { class: "hidden sm:block font-bold text-sm text-[var(--c-neutral)]/95 tracking-wide", text: CONTENT.brand.title }),
  ]);

  const bar = el("div", {
    class:
      "quest-progress-track h-2 sm:h-2.5 w-full max-w-[180px] sm:max-w-[320px] rounded-full bg-black/15 border border-[var(--c-bright)]/25 overflow-hidden transition-opacity",
  });
  bar.appendChild(
    el("div", {
      class: "h-full bg-[var(--c-bright)] shadow-[inset_0_0_0_1px_rgba(255,255,255,.14)] transition-[width] duration-500 ease-out",
      style: `width:${p.pct}%;`,
    })
  );

  const right = el("div", { class: "flex items-center gap-2 sm:gap-3 flex-1 justify-end min-w-0" }, [
    el("div", {
      class:
        "font-mono text-[10px] sm:text-[11px] text-[var(--c-neutral)]/70 whitespace-nowrap uppercase tracking-[0.12em]",
      text: p.show ? p.label : "",
    }),
    bar,
  ]);

  if (!p.show) {
    bar.style.opacity = "0";
  }

  return el(
    "div",
    {
      class:
        "relative z-[2] flex items-center justify-between gap-2 sm:gap-4 px-3 sm:px-5 pt-3 sm:pt-5 pb-3 sm:pb-4 border-b border-[var(--c-bright)]/20",
    },
    [left, right]
  );
}

function renderGate() {
  const gate = CONTENT.gate;
  const input = el("input", {
    class:
        "w-full rounded-2xl border border-[var(--c-bright)]/35 bg-black/10 px-4 py-3 text-[var(--c-neutral)] outline-none focus:border-[var(--c-bright)]/60 focus:ring-4 focus:ring-[var(--c-bright)]/25",
    type: "password",
    autocomplete: "off",
    inputmode: "numeric",
    placeholder: gate.passcodeLabel,
  });

  const msg = el("div", { class: "text-[13px] text-[var(--c-neutral)]/60" }, gate.passcodeHint);
  const status = el("div", { class: "text-[13px] text-[var(--c-neutral)]/60", "aria-live": "polite" }, "");

  function attempt() {
    const val = input.value.trim();
    if (val === gate.passcode) {
      state.unlocked = true;
      state.current = "intro";
      saveState();
      status.textContent = gate.successText;
      startBirthdayBackgroundAudioFromUserGesture();
      setTimeout(() => render(), 350);
      return;
    }
    status.textContent = "Nope. Try again.";
  }

  const actions = el("div", { class: "flex flex-wrap items-center gap-3" }, [
    el(
      "button",
      {
        class:
          "inline-flex items-center justify-center rounded-2xl border border-[var(--c-bright)]/40 bg-transparent px-4 py-3 font-semibold tracking-wide text-[var(--c-neutral)] hover:border-[var(--c-bright)]/70 hover:bg-[var(--c-bright)]/12 active:translate-y-px disabled:opacity-50",
        onClick: attempt,
        type: "button",
      },
      "Unlock"
    ),
    el("div", { class: "flex-1" }),
    el(
      "button",
      {
        class:
          "inline-flex items-center justify-center rounded-2xl border border-rose-200/15 bg-rose-500/10 px-4 py-3 font-semibold tracking-wide text-[var(--c-neutral)] hover:border-rose-200/25 hover:bg-rose-500/15 active:translate-y-px",
        onClick: resetQuest,
        type: "button",
      },
      "Reset"
    ),
  ]);

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") attempt();
  });

  const wrap = el("div", { class: "grid gap-4" }, []);
  let si = 0;
  wrap.appendChild(
    applyStagger(el("h1", { class: "text-2xl sm:text-3xl md:text-4xl font-bold leading-tight tracking-wide text-[var(--c-neutral)]", text: "Private entrance" }), si++)
  );
  wrap.appendChild(
    applyStagger(
      el("p", {
        class: "text-sm sm:text-base leading-relaxed text-[var(--c-neutral)]/80",
        text: "Enter the secret passcode to unlock the quest!!",
      }),
      si++
    )
  );
  wrap.appendChild(applyStagger(el("div", { class: "space-y-2" }, [input, msg]), si++));
  wrap.appendChild(applyStagger(status, si++));
  wrap.appendChild(applyStagger(actions, si++));
  return wrap;
}

function renderIntro() {
  const { intro } = CONTENT.screens;
  const vars = { name: CONTENT.person.name };
  const pills = el(
    "div",
    { class: "flex flex-wrap items-center gap-3" },
    intro.pills.map((p) =>
      el("div", { class: "inline-flex items-center gap-2 rounded-full border border-dashed border-[var(--c-bright)]/35 px-3 py-2 text-[13px] text-[var(--c-neutral)]/85", text: p })
    )
  );

  const btn = el(
    "button",
    {
      class:
        "inline-flex items-center justify-center rounded-2xl border border-[var(--c-bright)]/40 bg-transparent px-5 py-3 font-semibold tracking-wide text-[var(--c-neutral)] hover:border-[var(--c-bright)]/70 hover:bg-[var(--c-bright)]/12 active:translate-y-px",
      type: "button",
      onClick: () => {
        markCompleted("intro");
        goTo("photos");
      },
    },
    intro.ctaText
  );

  const wrap = el("div", { class: "grid gap-4" }, []);
  let si = 0;
  wrap.appendChild(
    applyStagger(el("h1", { class: "text-2xl sm:text-3xl md:text-4xl font-bold leading-tight tracking-wide text-[var(--c-neutral)]", text: format(intro.title, vars) }), si++)
  );
  wrap.appendChild(applyStagger(el("p", { class: "text-sm sm:text-base leading-relaxed text-[var(--c-neutral)]/80", text: intro.subtitle }), si++));
  wrap.appendChild(applyStagger(pills, si++));
  wrap.appendChild(applyStagger(el("div", { class: "flex flex-wrap items-center gap-3" }, [btn]), si++));
  wrap.appendChild(
    applyStagger(el("div", { class: "text-[13px] text-[var(--c-neutral)]/60", text: `— from ${CONTENT.person.from}` }), si++)
  );
  return wrap;
}

function renderPhotos() {
  const cfg = CONTENT.screens.photos;
  const cards = Array.isArray(cfg.cards) ? cfg.cards : [];
  const idx = clamp(state.photos.idx || 0, 0, Math.max(0, cards.length - 1));
  const card = cards[idx] || { src: "", alt: "Photo", caption: "" };

  const media = el("div", { class: "bg-black/20 flex items-center justify-center" });
  if (card.src) {
    media.appendChild(
      el("img", {
        src: card.src,
        alt: card.alt || "Photo",
        class: "w-full max-h-[50vh] object-contain",
        loading: "lazy",
        decoding: "async",
      })
    );
  } else {
    media.appendChild(el("div", { class: "py-16 text-[var(--c-neutral)]/60 text-sm" }, "Add photos in content.js"));
  }

  const footer = el("div", { class: "px-3 py-3 sm:p-4 flex items-end justify-between gap-2 sm:gap-3" }, [
    el("div", { class: "min-w-0" }, [
      el("div", { class: "text-[12px] sm:text-[13px] text-[var(--c-neutral)]/60", text: `Photo ${cards.length ? idx + 1 : 0}/${cards.length}` }),
      el("div", { class: "text-base sm:text-lg font-bold tracking-wide text-[var(--c-neutral)] truncate", text: card.caption || "Tap to continue" }),
    ]),
    el("div", { class: "text-[12px] sm:text-[13px] text-[var(--c-neutral)]/60 shrink-0" }, state.photos.done ? "Done" : "Tap"),
  ]);

  const photoMotion = "animate-[photoPop_520ms_cubic-bezier(0.22,1,0.36,1)_both]";

  let stage;
  if (state.photos.done) {
    stage = el("div", {
      class: `w-full overflow-hidden rounded-2xl ${photoMotion}`,
    });
    stage.appendChild(media);
    stage.appendChild(footer);
  } else {
    stage = el("button", {
      type: "button",
      class: `w-full text-left overflow-hidden rounded-2xl active:translate-y-px transition-transform duration-200 ${photoMotion}`,
      onClick: () => {
        const next = idx + 1;
        if (next < cards.length) {
          state.photos.idx = next;
          saveState();
          render();
          return;
        }
        state.photos.done = true;
        markCompleted("photos");
        saveState();
        render();
      },
      "aria-label": "Next photo",
    });
    stage.appendChild(media);
    stage.appendChild(footer);
  }

  const doneHint = state.photos.done
    ? el("div", { class: "text-[13px] text-emerald-200/70" }, "Album complete.")
    : el("div", { class: "text-[13px] text-[var(--c-neutral)]/60" }, "Tap the card for the next photo.");

  const nextBtn = state.photos.done
    ? el(
        "button",
        {
          class:
            "inline-flex items-center justify-center rounded-2xl border border-[var(--c-bright)]/40 bg-transparent px-5 py-3 font-semibold tracking-wide text-[var(--c-neutral)] hover:border-[var(--c-bright)]/70 hover:bg-[var(--c-bright)]/12 active:translate-y-px",
          type: "button",
          onClick: () => {
            markCompleted("photos");
            goTo(nextScreenId());
          },
        },
        "Next"
      )
    : null;

  const wrap = el("div", { class: "grid gap-4" }, []);
  let si = 0;
  wrap.appendChild(applyStagger(el("h2", { class: "text-2xl sm:text-3xl md:text-4xl font-bold leading-tight tracking-wide text-[var(--c-neutral)]", text: cfg.title }), si++));
  wrap.appendChild(applyStagger(el("p", { class: "text-sm sm:text-base leading-relaxed text-[var(--c-neutral)]/80", text: cfg.subtitle }), si++));
  wrap.appendChild(applyStagger(stage, si++));
  wrap.appendChild(applyStagger(doneHint, si++));
  if (nextBtn) wrap.appendChild(applyStagger(el("div", { class: "flex flex-wrap items-center gap-3" }, [nextBtn]), si++));

  return wrap;
}

function shuffled(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function renderLevel2() {
  const cfg = CONTENT.screens.level2;

  if (!state.level2.order) {
    state.level2.order = shuffled(cfg.questions.map((_, i) => i));
    saveState();
  }

  const order = state.level2.order;
  const qIdx = clamp(state.level2.idx, 0, order.length - 1);
  const q = cfg.questions[order[qIdx]];

  const vars = { minCorrect: cfg.minCorrect };
  const displayScore = Math.min(state.level2.correct, cfg.minCorrect);
  const status = el("div", {
    class:
      "inline-flex items-center gap-2 rounded-full border border-dashed border-[var(--c-bright)]/35 px-3 py-2 text-[13px] text-[var(--c-neutral)]/85",
    text: `Score: ${displayScore} / ${cfg.minCorrect}`,
  });

  const feedback = el("div", { class: "text-[13px] text-[var(--c-neutral)]/60" }, "");

  const answeredKey = String(order[qIdx]);
  const already = state.level2.answered[answeredKey];

  function styleChosen(btn, isCorrect) {
    if (isCorrect) {
      btn.classList.add(
        "!border-[var(--c-neutral)]/35",
        "!bg-[var(--c-neutral)]/12",
        "!text-[var(--c-neutral)]"
      );
    } else {
      btn.classList.add(
        "!border-[var(--c-bright)]/40",
        "!bg-[var(--c-bright)]/10",
        "!text-[var(--c-neutral)]"
      );
    }
  }

  function styleUnchosen(btn) {
    btn.classList.add("!opacity-38");
  }

  const choiceBaseClass =
    "w-full text-left inline-flex items-center justify-start rounded-xl border border-transparent px-4 py-3.5 font-semibold tracking-wide text-[var(--c-neutral)] transition-colors duration-200 ease-out hover:bg-[var(--c-bright)]/10 active:translate-y-px disabled:cursor-not-allowed";

  const choices = el(
    "div",
    { class: "grid gap-2.5" },
    q.choices.map((c, i) => {
      const btn = el(
        "button",
        {
          class: choiceBaseClass,
          type: "button",
          disabled: Boolean(already),
          onClick: () => {
            const isCorrect = i === q.correctIndex;
            state.level2.answered[answeredKey] = { chosen: i, correct: isCorrect };
            if (isCorrect) state.level2.correct += 1;
            saveState();
            const grid = btn.parentElement;
            if (grid) {
              for (const child of grid.children) {
                if (child !== btn && child.tagName === "BUTTON") styleUnchosen(child);
              }
            }
            styleChosen(btn, isCorrect);
            feedback.textContent = isCorrect ? "Correct." : "Not quite.";
            status.textContent = `Score: ${Math.min(state.level2.correct, cfg.minCorrect)} / ${cfg.minCorrect}`;
            nextQBtn.disabled = false;
            if (shouldUnlockNextForCurrent()) {
              markCompleted("level2");
              finishBtn.disabled = false;
            }
          },
        },
        c
      );

      if (already) {
        const isChosen = already.chosen === i;
        if (isChosen) {
          styleChosen(btn, already.correct);
        } else {
          styleUnchosen(btn);
        }
      }

      return btn;
    })
  );

  const nextQBtn = el(
    "button",
    {
      class:
        "inline-flex items-center justify-center rounded-2xl border border-[var(--c-bright)]/40 bg-transparent px-4 py-3 font-semibold tracking-wide text-[var(--c-neutral)] hover:border-[var(--c-bright)]/70 hover:bg-[var(--c-bright)]/12 active:translate-y-px disabled:opacity-50 disabled:cursor-not-allowed",
      type: "button",
      disabled: !already,
      onClick: () => {
        state.level2.idx = clamp(state.level2.idx + 1, 0, order.length - 1);
        saveState();
        render();
      },
    },
    qIdx === order.length - 1 ? "Stay" : "Next question"
  );

  const finishBtn = el(
    "button",
    {
      class:
        "inline-flex items-center justify-center rounded-2xl border border-[var(--c-bright)]/40 bg-transparent px-4 py-3 font-semibold tracking-wide text-[var(--c-neutral)] hover:border-[var(--c-bright)]/70 hover:bg-[var(--c-bright)]/12 active:translate-y-px disabled:opacity-50 disabled:cursor-not-allowed",
      type: "button",
      disabled: !shouldUnlockNextForCurrent(),
      onClick: () => goTo("note2"),
    },
    "Continue"
  );

  const quizBlock = el("div", { class: "grid gap-3" }, [
    el("p", { class: "font-bold m-0 text-base", text: q.q }),
    choices,
    feedback,
    el("div", { class: "flex flex-wrap items-center gap-3" }, [nextQBtn, el("div", { class: "flex-1" }), finishBtn]),
  ]);

  const wrap = el("div", { class: "grid gap-4" }, []);
  let si = 0;
  wrap.appendChild(applyStagger(el("h2", { class: "text-2xl sm:text-3xl md:text-4xl font-bold leading-tight tracking-wide text-[var(--c-neutral)]", text: cfg.title }), si++));
  wrap.appendChild(applyStagger(el("p", { class: "text-sm sm:text-base leading-relaxed text-[var(--c-neutral)]/80", text: format(cfg.subtitle, vars) }), si++));
  wrap.appendChild(applyStagger(el("div", { class: "flex flex-wrap items-center gap-3" }, [status]), si++));
  wrap.appendChild(applyStagger(quizBlock, si++));
  wrap.appendChild(
    applyStagger(el("div", { class: "text-[13px] text-[var(--c-neutral)]/60", text: "Tip: this quiz is rigged in your favor." }), si++)
  );
  return wrap;
}

function renderLevel3() {
  const cfg = CONTENT.screens.level3;
  const checked = state.level3.checked.slice(0, cfg.items.length);

  function updateNext() {
    nextBtn.disabled = !checked.every(Boolean);
    state.level3.checked = checked;
    saveState();
    if (checked.every(Boolean)) markCompleted("level3");
  }

  const list = el(
    "div",
    { class: "grid gap-2.5" },
    cfg.items.map((text, i) => {
      const input = el("input", {
        type: "checkbox",
        checked: Boolean(checked[i]),
        onChange: (e) => {
          checked[i] = Boolean(e.target.checked);
          updateNext();
        },
      });
      input.className = "mt-1 h-4 w-4 accent-[var(--c-bright)]";

      return el("label", { class: "flex gap-3 items-start rounded-xl px-1 py-2 cursor-pointer hover:bg-[var(--c-bright)]/10 transition-colors" }, [
        input,
        el("div", { class: "text-[var(--c-neutral)]/90" }, [el("div", { text })]),
      ]);
    })
  );

  const nextBtn = el(
    "button",
    {
      class:
        "inline-flex items-center justify-center rounded-2xl border border-[var(--c-bright)]/40 bg-transparent px-5 py-3 font-semibold tracking-wide text-[var(--c-neutral)] hover:border-[var(--c-bright)]/70 hover:bg-[var(--c-bright)]/12 active:translate-y-px disabled:opacity-50 disabled:cursor-not-allowed",
      type: "button",
      disabled: !checked.every(Boolean),
      onClick: () => goTo("final"),
    },
    "Unlock final"
  );

  const wrap = el("div", { class: "grid gap-4" }, []);
  let si = 0;
  wrap.appendChild(applyStagger(el("h2", { class: "text-2xl sm:text-3xl md:text-4xl font-bold leading-tight tracking-wide text-[var(--c-neutral)]", text: cfg.title }), si++));
  wrap.appendChild(applyStagger(el("p", { class: "text-sm sm:text-base leading-relaxed text-[var(--c-neutral)]/80", text: cfg.subtitle }), si++));
  wrap.appendChild(applyStagger(list, si++));
  wrap.appendChild(applyStagger(el("div", { class: "flex flex-wrap items-center gap-3" }, [nextBtn]), si++));
  return wrap;
}

function renderFinal() {
  const cfg = CONTENT.screens.final;
  const ticketVisible = Boolean(state.final.ticketVisible);
  const momentsClaimed = Boolean(state.final.momentsClaimed);
  const videosComplete = Boolean(state.final.videosComplete);
  const codeComplete = Boolean(state.final.codeComplete);
  const ticketSrc = cfg.voucherTicketSrc || cfg.voucherImageSrc;
  const coverSrc = cfg.voucherImageSrc;
  const videoList = Array.isArray(cfg.videos) ? cfg.videos : [];
  const pauseAfterVideosMs =
    typeof cfg.pauseAfterVideosMs === "number" ? Math.max(0, cfg.pauseAfterVideosMs) : 1800;
  const pauseAfterCodeMs =
    typeof cfg.pauseAfterCodeMs === "number" ? Math.max(0, cfg.pauseAfterCodeMs) : 1800;
  const pauseBetweenVideosMs =
    typeof cfg.pauseBetweenVideosMs === "number" ? Math.max(0, cfg.pauseBetweenVideosMs) : 1200;

  function finishVideosPhase() {
    state.final.videosComplete = true;
    if (videoList.length > 0) {
      state.final.videoIdx = Math.min(
        state.final.videoIdx,
        Math.max(0, videoList.length - 1)
      );
    }
    saveState();
    render();
  }

  function scheduleFinishVideosPhase() {
    clearFinalPhasePauseTimer();
    if (pauseAfterVideosMs === 0) {
      finishVideosPhase();
      return;
    }
    finalPhasePauseTimer = window.setTimeout(() => {
      finalPhasePauseTimer = null;
      finishVideosPhase();
    }, pauseAfterVideosMs);
  }

  function revealVoucherFromCover() {
    if (state.final.ticketVisible || voucherRevealTimer) return;
    celebrationPending = true;
    saveState();
    render();
    voucherRevealTimer = window.setTimeout(() => {
      voucherRevealTimer = null;
      state.final.ticketVisible = true;
      markCompleted("final");
      saveState();
      scheduleBirthdayBackgroundAudioStopAfterReveal();
      render();
    }, VOUCHER_REVEAL_DELAY_MS);
  }

  const videoWrap = el("div", { class: "overflow-hidden rounded-xl" });

  function mountVideosOnce() {
    if (videoWrap.childNodes.length > 0) return;
    clearBetweenVideosTimer();
    const list = videoList;
    const vIdx = clamp(state.final.videoIdx || 0, 0, Math.max(0, list.length - 1));
    const v = list[vIdx];
    if (!v?.src) {
      videoWrap.appendChild(
        el("div", { class: "grid gap-4 p-4 sm:p-5" }, [
          el("div", {
            class: "text-[var(--c-neutral)]/60 text-sm",
            text: "Add Cloudinary video URLs in content.js to show them here.",
          }),
          el(
            "button",
            {
              class:
                "inline-flex justify-center rounded-2xl border border-[var(--c-bright)]/50 bg-[var(--c-bright)]/14 px-4 py-2.5 font-semibold text-[var(--c-neutral)] hover:border-[var(--c-bright)]/70",
              type: "button",
              onClick: () => scheduleFinishVideosPhase(),
            },
            cfg.continueAfterVideosCta || "Continue"
          ),
        ])
      );
      return;
    }

    const header = el("div", { class: "px-3 py-2 sm:px-4 sm:py-2.5 flex items-center justify-between gap-2 bg-black/20" }, [
      el("div", { class: "text-xs sm:text-sm font-semibold text-[var(--c-neutral)] truncate" }, v.title || `Video ${vIdx + 1}`),
      el("div", { class: "font-mono text-[11px] sm:text-[12px] text-[var(--c-bright)]/75 tabular-nums shrink-0" }, `${String(vIdx + 1).padStart(2, "0")} / ${String(list.length).padStart(2, "0")}`),
    ]);

    const poster = v.posterSrc || v.imageSrc;
    const video = el("video", {
      controls: "controls",
      playsinline: "playsinline",
      preload: "auto",
      autoplay: "autoplay",
      muted: true,
      src: v.src,
      title: v.title || "Video",
      ...(poster ? { poster: poster } : {}),
    });
    video.className = "w-full max-h-[50vh] block bg-black";
    video.defaultMuted = true;
    video.muted = true;

    video.addEventListener("loadeddata", () => {
      video.play().catch(() => {});
    });

    video.addEventListener("ended", () => {
      const next = vIdx + 1;
      if (next >= list.length) {
        scheduleFinishVideosPhase();
        return;
      }
      clearBetweenVideosTimer();
      if (pauseBetweenVideosMs === 0) {
        state.final.videoIdx = next;
        saveState();
        render();
        return;
      }
      betweenVideosTimer = window.setTimeout(() => {
        betweenVideosTimer = null;
        state.final.videoIdx = next;
        saveState();
        render();
      }, pauseBetweenVideosMs);
    });

    const btnClass =
      "inline-flex items-center justify-center rounded-xl sm:rounded-2xl border border-[var(--c-bright)]/40 bg-transparent px-3 py-1.5 sm:px-4 sm:py-2 text-sm sm:text-base font-semibold tracking-wide text-[var(--c-neutral)] hover:border-[var(--c-bright)]/70 hover:bg-[var(--c-bright)]/12 active:translate-y-px disabled:opacity-50 disabled:cursor-not-allowed";

    const prevBtn = el(
      "button",
      {
        class: btnClass,
        type: "button",
        disabled: vIdx === 0,
        onClick: () => {
          clearBetweenVideosTimer();
          state.final.videoIdx = Math.max(0, vIdx - 1);
          saveState();
          render();
        },
      },
      "Prev"
    );
    const isLast = list.length > 0 && vIdx >= list.length - 1;
    const advanceBtn = isLast
      ? el(
          "button",
          {
            class:
              "inline-flex items-center justify-center rounded-xl sm:rounded-2xl border border-[var(--c-bright)]/55 bg-[var(--c-bright)]/14 px-3 py-1.5 sm:px-4 sm:py-2 text-sm sm:text-base font-semibold tracking-wide text-[var(--c-neutral)] hover:border-[var(--c-bright)]/75 hover:bg-[var(--c-bright)]/22 active:translate-y-px",
            type: "button",
            onClick: () => scheduleFinishVideosPhase(),
          },
          cfg.continueAfterVideosCta || "Continue"
        )
      : el(
          "button",
          {
            class: btnClass,
            type: "button",
            onClick: () => {
              clearBetweenVideosTimer();
              state.final.videoIdx = Math.min(list.length - 1, vIdx + 1);
              saveState();
              render();
            },
          },
          "Next"
        );
    const controls = el("div", { class: "px-3 py-2 sm:px-4 sm:py-2.5 flex flex-wrap items-center gap-2 sm:gap-3 bg-black/15" }, [
      prevBtn,
      advanceBtn,
      el("div", { class: "flex-1 min-w-[2rem]" }),
    ]);

    videoWrap.appendChild(header);
    videoWrap.appendChild(video);
    videoWrap.appendChild(controls);
  }

  const loveWrap = el("div", {
    class: "rounded-2xl border border-[var(--c-neutral)]/15 bg-black/30 px-4 py-3",
    id: "love-code-root",
  });
  loveWrap.appendChild(
    el("div", {
      class: "mb-2 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--c-bright)]/90",
      text: "Program.cs · C#",
    })
  );
  loveWrap.appendChild(
    el("pre", {
      class:
        "love-code-src mb-0 max-h-[240px] overflow-x-auto whitespace-pre font-mono text-[11px] leading-relaxed text-[var(--c-neutral)]/88 sm:text-[12px]",
      text: "",
    })
  );
  loveWrap.appendChild(
    el("div", {
      class: "mt-3 border-t border-[var(--c-neutral)]/10 pt-2 font-mono text-[11px] text-[var(--c-neutral)]/50",
      text: "$ dotnet run",
    })
  );
  loveWrap.appendChild(
    el("pre", {
      class:
        "love-code-term mb-0 mt-1 min-h-[1.35rem] font-mono text-[14px] font-semibold tracking-wide text-[var(--c-bright)]",
      text: "",
    })
  );

  const voucherCard = el("div", {
    class: "overflow-hidden rounded-2xl shadow-[0_24px_80px_rgba(0,0,0,.30)]",
  });

  const voucherMedia = el("div", {
    class: "relative aspect-video w-full overflow-hidden bg-black/30",
  });

  if (ticketVisible && ticketSrc) {
    voucherMedia.appendChild(
      el("img", {
        src: ticketSrc,
        alt: cfg.voucherTicketAlt || cfg.voucherImageAlt || "Voucher",
        class: "absolute inset-0 h-full w-full object-cover object-center",
        loading: "lazy",
        decoding: "async",
      })
    );
  } else if (!ticketVisible && coverSrc) {
    voucherMedia.appendChild(
      el("img", {
        src: coverSrc,
        alt: cfg.voucherImageAlt || "Voucher cover",
        class: "absolute inset-0 h-full w-full object-cover object-center transition group-hover:brightness-95",
        loading: "lazy",
        decoding: "async",
      })
    );
  } else {
    voucherMedia.appendChild(
      el("div", {
        class:
          "flex min-h-[12rem] items-center justify-center px-4 py-12 text-center text-[var(--c-neutral)]/60 text-sm",
        text: "Add voucher images in content.js",
      })
    );
  }

  const revealCta = cfg.voucherRevealCta || "Click to reveal your voucher";

  let voucherTop;
  if (!ticketVisible && coverSrc) {
    voucherTop = el(
      "button",
      {
        type: "button",
        class:
          "group relative w-full cursor-pointer overflow-hidden rounded-2xl border-2 border-transparent p-0 text-left transition hover:border-[var(--c-bright)]/45 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--c-bright)]",
        onClick: revealVoucherFromCover,
        "aria-label": revealCta,
      },
      []
    );
    voucherTop.appendChild(voucherMedia);
    voucherTop.appendChild(
      el(
        "div",
        {
          class:
            "pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-3 pb-2.5 pt-12 sm:px-4 sm:pb-4 sm:pt-24",
        },
        [
          el("div", {
            class:
              "inline-flex max-w-full items-center justify-center rounded-full bg-[var(--c-bright)] px-3 py-2 text-center text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--c-dark)] shadow-lg sm:px-4 sm:text-xs",
            text: revealCta,
          }),
        ]
      )
    );
  } else {
    voucherTop = voucherMedia;
  }

  voucherCard.appendChild(voucherTop);

  const signature = el("div", { class: "flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 sm:gap-3 border-t border-[var(--c-neutral)]/10 px-3 py-3 sm:px-4 sm:py-4" }, [
    el("div", {}, [
      el("div", { class: "text-[12px] sm:text-[13px] text-[var(--c-neutral)]/60", text: cfg.voucherLabel || "Voucher" }),
      el("div", {
        class: "text-base sm:text-lg font-bold tracking-wide text-[var(--c-neutral)]",
        text: cfg.voucherTitle || "Game voucher",
      }),
    ]),
    el("div", { class: "sm:text-right" }, [
      el("div", { class: "text-[12px] sm:text-[13px] text-[var(--c-neutral)]/60", text: cfg.givenByLabel || "Given by" }),
      el("div", { class: "font-display text-xs tracking-widest text-[var(--c-neutral)]/90", text: cfg.givenByName || "" }),
    ]),
  ]);
  voucherCard.appendChild(signature);

  const resetBtn = el(
    "button",
    {
      class:
        "inline-flex items-center justify-center rounded-2xl border border-rose-300/25 bg-rose-500/10 px-5 py-3 font-semibold tracking-wide text-[var(--c-neutral)] hover:border-rose-300/40 hover:bg-rose-500/15 active:translate-y-px",
      type: "button",
      onClick: resetQuest,
    },
    cfg.resetButton
  );

  const momentsTitle = cfg.momentsTitle || "Moments of us I cherish";
  const momentsSubtitle =
    cfg.momentsSubtitle || "A tucked-away playlist. Claim it when you’re ready — then roll into your loot.";
  const momentsKicker = cfg.momentsKicker || "Side quest";
  const claimMomentsBtn = el(
    "button",
    {
      class:
        "inline-flex items-center justify-center gap-2 rounded-2xl border border-[var(--c-bright)]/50 bg-[var(--c-bright)]/18 px-5 py-3 font-semibold tracking-wide text-[var(--c-neutral)] shadow-[0_0_24px_-4px_color-mix(in_srgb,var(--c-bright)_35%,transparent)] hover:border-[var(--c-bright)]/70 hover:bg-[var(--c-bright)]/26 active:translate-y-px",
      type: "button",
      onClick: () => {
        state.final.momentsClaimed = true;
        saveState();
        render();
      },
    },
    [
      el("span", { class: "font-mono text-[11px] text-[var(--c-bright)]/90", text: "[▶]" }),
      ` ${cfg.momentsClaimCta || "Claim these moments"}`,
    ]
  );

  const momentsGateCard = el(
    "div",
    {
      class:
        "rounded-2xl bg-black/15 px-4 py-5 sm:px-5 sm:py-6",
    },
    [
      el("div", { class: "hq-kicker mb-3", text: momentsKicker }),
      el("h3", {
        class: "text-xl sm:text-2xl font-bold leading-snug tracking-wide text-[var(--c-neutral)]",
        text: momentsTitle,
      }),
      el("p", { class: "mt-2 text-sm sm:text-base leading-relaxed text-[var(--c-neutral)]/78", text: momentsSubtitle }),
      el("div", { class: "mt-5 flex flex-wrap items-center gap-3" }, [claimMomentsBtn]),
    ]
  );

  const momentsPlaylistShell = el(
    "div",
    {
      class: "rounded-2xl overflow-hidden bg-black/15",
    },
    [
      el("div", { class: "bg-black/20 px-4 py-3 sm:px-5" }, [
        el("div", { class: "hq-kicker mb-1.5", text: cfg.momentsPlaylistKicker || "Playlist unlocked" }),
        el("div", {
          class: "font-display text-base sm:text-lg font-semibold text-[var(--c-neutral)]",
          text: cfg.momentsPlaylistTitle || momentsTitle,
        }),
      ]),
      videoWrap,
    ]
  );

  const lovePhaseShell = el("div", { class: "grid gap-3" }, [
    el("div", { class: "border-b border-[var(--c-bright)]/15 pb-3" }, [
      el("div", { class: "hq-kicker mb-1.5", text: cfg.codePhaseKicker || "Next up" }),
      el("div", {
        class: "font-display text-base sm:text-lg font-semibold text-[var(--c-neutral)]",
        text: cfg.codePhaseTitle || "Something small I wrote",
      }),
    ]),
    loveWrap,
  ]);

  const phaseSubtitle = !momentsClaimed
    ? cfg.subtitle
    : !videosComplete
      ? cfg.phaseSubtitleVideos ?? cfg.subtitle
      : !codeComplete
        ? cfg.phaseSubtitleCode ?? cfg.subtitle
        : !ticketVisible
          ? cfg.phaseSubtitleVoucher ?? cfg.subtitle
          : cfg.phaseSubtitleDone ?? cfg.subtitle;

  const root = el("div", { class: "grid gap-4" }, []);
  let si = 0;
  root.appendChild(applyStagger(el("h2", { class: "text-2xl sm:text-3xl md:text-4xl font-bold leading-tight tracking-wide text-[var(--c-neutral)]", text: cfg.title }), si++));
  root.appendChild(
    applyStagger(el("p", { class: "text-sm sm:text-base leading-relaxed text-[var(--c-neutral)]/80", text: phaseSubtitle }), si++)
  );
  if (!momentsClaimed) {
    root.appendChild(applyStagger(momentsGateCard, si++));
  } else if (!videosComplete) {
    root.appendChild(applyStagger(momentsPlaylistShell, si++));
  } else if (!codeComplete) {
    root.appendChild(applyStagger(lovePhaseShell, si++));
  } else {
    root.appendChild(applyStagger(voucherCard, si++));
  }

  root.appendChild(applyStagger(el("div", { class: "flex flex-wrap items-center gap-3" }, [resetBtn]), si++));

  if (momentsClaimed && !videosComplete) {
    window.setTimeout(mountVideosOnce, 0);
  }
  if (momentsClaimed && videosComplete && !codeComplete) {
    window.setTimeout(() => {
      mountLoveCodeBlock(() => {
        clearFinalPhasePauseTimer();
        if (pauseAfterCodeMs === 0) {
          state.final.codeComplete = true;
          saveState();
          render();
          return;
        }
        finalPhasePauseTimer = window.setTimeout(() => {
          finalPhasePauseTimer = null;
          state.final.codeComplete = true;
          saveState();
          render();
        }, pauseAfterCodeMs);
      });
    }, 60);
  }
  return root;
}

function renderScreen() {
  if (!state.unlocked) return renderGate();

  switch (state.current) {
    case "intro":
      return renderIntro();
    case "photos":
      return renderPhotos();
    case "note1":
      return renderNote("note1");
    case "level2":
      return renderLevel2();
    case "note2":
      return renderNote("note2");
    case "level3":
      return renderLevel3();
    case "final":
      return renderFinal();
    default:
      state.current = "intro";
      saveState();
      return renderIntro();
  }
}

function renderNavRow() {
  if (!state.unlocked) return null;
  if (!canGoBack()) return null;

  const backBtn = el(
    "button",
    {
      class:
        "inline-flex items-center justify-center rounded-2xl border border-[var(--c-bright)]/40 bg-transparent px-5 py-3 font-semibold tracking-wide text-[var(--c-neutral)] hover:border-[var(--c-bright)]/70 hover:bg-[var(--c-bright)]/12 active:translate-y-px disabled:opacity-50 disabled:cursor-not-allowed",
      type: "button",
      onClick: () => goTo(prevScreenId()),
    },
    "Back"
  );

  return el("div", { class: "flex flex-wrap items-center gap-3" }, [backBtn]);
}

function render() {
  const app = document.getElementById("app");
  if (!app) return;

  if (!state.unlocked) {
    preloadBackgroundMusicOnGate();
  }

  document.title = `Happy Birthday — ${CONTENT.person.name}`;

  const card = el("div", {
    class: "birthday-card relative w-full max-w-[980px] overflow-hidden rounded-[1.75rem] backdrop-blur-md",
  });
  card.appendChild(el("div", { class: "birthday-card-accent shrink-0", "aria-hidden": "true" }));
  card.appendChild(renderCardStickers());
  card.appendChild(renderTopbar());

  const content = el("div", { class: "relative z-[2] px-3.5 py-4 sm:px-6 sm:py-6" });
  if (state.current !== "photos") {
    clearPhotosSlideTimer();
  }
  if (state.current !== "final") {
    clearFinalPhasePauseTimer();
    clearBetweenVideosTimer();
  }
  content.appendChild(renderScreen());

  const nav = renderNavRow();
  if (nav) content.appendChild(el("div", { style: "height:10px" }));
  if (nav) content.appendChild(nav);

  card.appendChild(content);

  app.innerHTML = "";
  app.appendChild(card);

  if (celebrationPending && state.current === "final") {
    celebrationPending = false;
    requestAnimationFrame(() => launchCelebration());
  }
}

let state = getInitialState();

// If we have an unlocked state but an invalid current screen, fix it.
if (state.unlocked && !screensAfterUnlock().includes(state.current)) {
  state.current = "intro";
  saveState();
}
if (!state.unlocked) {
  state.current = "gate";
  saveState();
}

ensureKeyframes();
render();

