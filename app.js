/*
 * GreenShot — App (PWA)
 * Lógica da interface: navegação entre telas, gamificação (XP/tokens/nível),
 * ecossistema 3D, fluxo de registrar ação, mercado de impacto e tema.
 */
(() => {
  "use strict";
  const $ = (s, ctx = document) => ctx.querySelector(s);
  const $$ = (s, ctx = document) => Array.from(ctx.querySelectorAll(s));

  const state = {
    xp: 680,
    xpMax: 1000,
    tokens: 860,
    level: 7,
    screen: "splash",
    ecosystemProgress: 30,
  };

  /* ---------- clock ---------- */
  function tickClock() {
    const d = new Date();
    const label = d.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
    $$("#clock").forEach((el) => (el.textContent = label));
  }
  tickClock();
  setInterval(tickClock, 30000);

  /* ---------- theme ---------- */
  function setTheme(t) {
    document.body.setAttribute("data-theme", t);
    const on = t === "dark";
    $("#profileThemeSwitch") &&
      $("#profileThemeSwitch").classList.toggle("is-on", on);
  }
  $("#themeBtn").addEventListener("click", () => {
    const next =
      document.body.getAttribute("data-theme") === "dark" ? "light" : "dark";
    setTheme(next);
  });
  $("#profileThemeSwitch").addEventListener("click", function () {
    const next =
      document.body.getAttribute("data-theme") === "dark" ? "light" : "dark";
    setTheme(next);
  });
  $$(".switch").forEach((sw) => {
    if (sw.id === "profileThemeSwitch") return;
    sw.addEventListener("click", () => sw.classList.toggle("is-on"));
  });

  /* ---------- navigation ---------- */
  function goTo(name) {
    $$(".screen").forEach((s) => s.classList.remove("is-active"));
    const target = $("#screen-" + name);
    if (!target) return;
    target.classList.add("is-active");
    $("#appBody") && ($("#appBody").scrollTop = 0);
    $("#appViewport").scrollTop = 0;
    state.screen = name;
    const navKey = target.dataset.nav;
    $("#tabbar").style.display = navKey && navKey !== "none" ? "flex" : "none";
    $$(".tab").forEach((t) =>
      t.classList.toggle("is-active", t.dataset.go === navKey),
    );
    if (name === "dashboard") animateXp();
    if (name === "ecosystem") ensureEcoEngine();
    closeNotif();
  }
  document.addEventListener("click", (e) => {
    const trigger = e.target.closest("[data-go]");
    if (trigger) goTo(trigger.dataset.go);
  });

  /* ---------- splash -> onboarding ---------- */
  function leaveSplash() {
    goTo("onboarding");
  }
  setTimeout(leaveSplash, 2600);
  $("#screen-splash").addEventListener("click", leaveSplash);

  /* splash particles */
  (function () {
    const c = $("#splashParticles");
    const ctx = c.getContext("2d");
    function size() {
      c.width = c.clientWidth;
      c.height = c.clientHeight;
    }
    size();
    const pts = Array.from({ length: 34 }, () => ({
      x: Math.random() * c.width,
      y: Math.random() * c.height,
      r: Math.random() * 1.6 + 0.6,
      s: Math.random() * 0.4 + 0.1,
      a: Math.random() * 0.5 + 0.3,
    }));
    function loop() {
      ctx.clearRect(0, 0, c.width, c.height);
      pts.forEach((p) => {
        p.y -= p.s;
        if (p.y < -5) {
          p.y = c.height + 5;
          p.x = Math.random() * c.width;
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(52,211,153,${p.a})`;
        ctx.fill();
      });
      requestAnimationFrame(loop);
    }
    loop();
    window.addEventListener("resize", size);
  })();

  /* ---------- onboarding ---------- */
  let obIndex = 0;
  const slides = $$(".ob-slide");
  const dots = $$(".ob-dot");
  function renderOb() {
    slides.forEach((s, i) => s.classList.toggle("is-active", i === obIndex));
    dots.forEach((d, i) => d.classList.toggle("is-active", i === obIndex));
    $("#obNextBtn").textContent =
      obIndex === slides.length - 1 ? "Começar Jornada" : "Próximo";
  }
  $("#obNextBtn").addEventListener("click", () => {
    if (obIndex < slides.length - 1) {
      obIndex++;
      renderOb();
    } else goTo("login");
  });
  renderOb();

  /* ---------- login ---------- */
  $("#loginForm").addEventListener("submit", (e) => {
    e.preventDefault();
    goTo("dashboard");
  });

  /* ---------- dashboard xp bar ---------- */
  function animateXp() {
    const pct = Math.min(100, (state.xp / state.xpMax) * 100);
    requestAnimationFrame(() => {
      $("#xpFill").style.width = pct + "%";
    });
    $("#statXp").textContent = (state.xp / 1000).toFixed(1) + "k";
    $("#statTokens").textContent = state.tokens;
    $("#marketTokens").textContent = state.tokens;
    $("#dashLevel").textContent = state.level;
  }

  /* ---------- notifications ---------- */
  function closeNotif() {
    $("#notifPanel").classList.remove("is-open");
  }
  $("#notifBtn").addEventListener("click", (e) => {
    e.stopPropagation();
    $("#notifPanel").classList.toggle("is-open");
  });
  document.addEventListener("click", (e) => {
    if (!e.target.closest("#notifPanel") && !e.target.closest("#notifBtn"))
      closeNotif();
  });

  /* ---------- toast ---------- */
  let toastT;
  function showToast(msg) {
    const t = $("#toast");
    t.textContent = msg;
    t.classList.add("is-shown");
    clearTimeout(toastT);
    toastT = setTimeout(() => t.classList.remove("is-shown"), 2200);
  }

  /* ---------- ecossistema 3D (Three.js) ---------- */
  let ecoEngine = null;
  const ecoStageIcons = ["🏜️", "🌱", "🏛️", "🌳", "⛰️"];
  const ecoAnimalCounts = { 0: 1, 1: 2, 2: 3, 3: 4, 4: 5 };

  function ensureEcoEngine() {
    if (!ecoEngine) {
      ecoEngine = new GreenShotEcosystem3D($("#ecoCanvas"), {
        initialProgress: state.ecosystemProgress,
      });
      requestAnimationFrame(() => $("#ecoLoading").classList.add("is-hidden"));
    } else {
      ecoEngine._onResize();
    }
    updateEcoUI();
  }

  function bumpEcosystemProgress(amount) {
    state.ecosystemProgress = Math.max(
      0,
      Math.min(100, state.ecosystemProgress + amount),
    );
    if (ecoEngine) ecoEngine.setProgress(state.ecosystemProgress);
    updateEcoUI();
  }

  function updateEcoUI() {
    const stage = ecoEngine ? ecoEngine.getStage() : GREENSHOT_ECO_STAGES[0];
    $("#ecoStageChip").textContent = `${ecoStageIcons[stage.id]} ${stage.name}`;
    $("#ecoStageName").textContent = stage.name;
    $("#ecoTrees").textContent = stage.treeCount;
    $("#ecoAnimals").textContent = ecoAnimalCounts[stage.id];
    $("#ecoSpeciesChip").textContent =
      `🐦 ${ecoAnimalCounts[stage.id]} espécies`;
    $("#ecoProgressFill").style.width = state.ecosystemProgress + "%";
    $("#ecoProgressSlider").value = state.ecosystemProgress;
    $("#ecoProgressLabel") &&
      ($("#ecoProgressLabel").textContent =
        Math.round(state.ecosystemProgress) + "%");
    $("#forestStage").setAttribute("data-stage", stage.id);
    $$("#ecoStageBadges .badge-cell").forEach((cell) => {
      cell.classList.toggle("unlocked", Number(cell.dataset.stage) <= stage.id);
    });
  }

  $("#ecoProgressSlider").addEventListener("input", (e) => {
    state.ecosystemProgress = Number(e.target.value);
    if (ecoEngine) ecoEngine.setProgress(state.ecosystemProgress);
    updateEcoUI();
  });

  /* ---------- academy subtabs ---------- */
  $$(".subtab").forEach((tab) => {
    tab.addEventListener("click", () => {
      $$(".subtab").forEach((t) => t.classList.remove("is-active"));
      tab.classList.add("is-active");
      const sub = tab.dataset.sub;
      $("#subTrilhas").style.display = sub === "trilhas" ? "flex" : "none";
      $("#subDesafios").style.display = sub === "desafios" ? "flex" : "none";
    });
  });
  $("#startQuizBtn").addEventListener("click", () =>
    showToast("Quiz iniciado — boa sorte! 🎓"),
  );

  /* ---------- market invest ---------- */
  $$(".invest-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const cost = parseInt(btn.dataset.cost, 10);
      if (state.tokens < cost) {
        showToast("Tokens insuficientes");
        return;
      }
      state.tokens -= cost;
      $("#marketTokens").textContent = state.tokens;
      $("#statTokens").textContent = state.tokens;
      bumpEcosystemProgress(3);
      showToast(`Investimento de ${cost} tokens confirmado 🌍`);
    });
  });

  /* ---------- register action sheet ---------- */
  let chosenAct = null,
    chosenProof = null;
  function openSheet() {
    $("#sheetOverlay").classList.add("is-open");
    $("#sheetStep1").style.display = "flex";
    $("#sheetStep2").style.display = "none";
    $("#sheetStep3").style.display = "none";
    chosenAct = null;
    chosenProof = null;
    $$(".act-item").forEach((a) => a.classList.remove("is-selected"));
    $$(".proof-opt").forEach((a) => a.classList.remove("is-selected"));
    $("#toStep2").disabled = true;
    $("#submitAction").disabled = true;
  }
  $("#openRegisterAction").addEventListener("click", openSheet);
  $("#closeSheet").addEventListener("click", () =>
    $("#sheetOverlay").classList.remove("is-open"),
  );
  $("#sheetOverlay").addEventListener("click", (e) => {
    if (e.target.id === "sheetOverlay")
      $("#sheetOverlay").classList.remove("is-open");
  });

  $$(".act-item").forEach((item) =>
    item.addEventListener("click", () => {
      $$(".act-item").forEach((a) => a.classList.remove("is-selected"));
      item.classList.add("is-selected");
      chosenAct = item.dataset.act;
      $("#toStep2").disabled = false;
    }),
  );
  $("#toStep2").addEventListener("click", () => {
    $("#sheetStep1").style.display = "none";
    $("#sheetStep2").style.display = "flex";
  });
  $("#backStep1").addEventListener("click", () => {
    $("#sheetStep2").style.display = "none";
    $("#sheetStep1").style.display = "flex";
  });

  $$(".proof-opt").forEach((item) =>
    item.addEventListener("click", () => {
      $$(".proof-opt").forEach((a) => a.classList.remove("is-selected"));
      item.classList.add("is-selected");
      chosenProof = item.dataset.proof;
      $("#submitAction").disabled = false;
    }),
  );
  $("#submitAction").addEventListener("click", () => {
    $("#sheetStep2").style.display = "none";
    $("#sheetStep3").style.display = "block";
    state.xp += 35;
    state.tokens += 20;
  });
  $("#finishAction").addEventListener("click", () => {
    $("#sheetOverlay").classList.remove("is-open");
    animateXp();
    bumpEcosystemProgress(6);
    showToast("Ação registrada com sucesso 🎉");
  });

  /* ---------- restart demo ---------- */
  $("#restartBtn").addEventListener("click", () => {
    obIndex = 0;
    renderOb();
    goTo("splash");
    setTimeout(leaveSplash, 2600);
  });

  $("#tabbar").style.display = "none";
})();

/* =========================================================
   PWA — service worker, instalação e status offline
   ========================================================= */
(() => {
  "use strict";

  /* ---------- registra o service worker ---------- */
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./service-worker.js").catch((err) => {
        console.warn("Falha ao registrar o service worker:", err);
      });
    });
  }

  /* ---------- banner de instalação (Add to Home Screen) ---------- */
  let deferredPrompt = null;
  const installBanner = document.getElementById("installBanner");
  const installBtn = document.getElementById("installBtn");
  const closeInstallBtn = document.getElementById("closeInstallBtn");

  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;
    const dismissed = localStorage.getItem("greenshot-install-dismissed");
    if (!dismissed && installBanner) installBanner.classList.add("is-shown");
  });

  if (installBtn) {
    installBtn.addEventListener("click", async () => {
      if (!deferredPrompt) return;
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      deferredPrompt = null;
      installBanner.classList.remove("is-shown");
    });
  }

  if (closeInstallBtn) {
    closeInstallBtn.addEventListener("click", () => {
      installBanner.classList.remove("is-shown");
      localStorage.setItem("greenshot-install-dismissed", "1");
    });
  }

  window.addEventListener("appinstalled", () => {
    if (installBanner) installBanner.classList.remove("is-shown");
    deferredPrompt = null;
  });

  /* ---------- indicador de conexão offline ---------- */
  const offlineBanner = document.getElementById("offlineBanner");
  function updateOnlineStatus() {
    if (!offlineBanner) return;
    offlineBanner.classList.toggle("is-shown", !navigator.onLine);
  }
  window.addEventListener("online", updateOnlineStatus);
  window.addEventListener("offline", updateOnlineStatus);
  updateOnlineStatus();
})();
