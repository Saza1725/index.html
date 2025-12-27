document.addEventListener("DOMContentLoaded", () => {

  /* ================== DOM ================== */
  const morningBtn = document.getElementById("morningBtn");
  const noonBtn = document.getElementById("noonBtn");
  const eveningBtn = document.getElementById("eveningBtn");

  const menuButton = document.getElementById("menuButton");
  const menu = document.getElementById("menu");
  const homeLink = document.getElementById("homeLink");
  const infoLink = document.getElementById("infoLink");
  const personalLink = document.getElementById("personalLink");
  const archiveLink = document.getElementById("archiveLink");

  const infoOverlay = document.getElementById("infoOverlay");
  const personalOverlay = document.getElementById("personalOverlay");
  const archiveOverlay = document.getElementById("archiveOverlay");

  const personalContent = document.getElementById("personalContent");
  const closePersonalBtn = document.getElementById("closePersonalBtn");
  const closeArchiveBtn = document.getElementById("closeArchiveBtn");

  const yearCountdownEl = document.getElementById("yearCountdown");

  let menuOpen = false;
  let quotesData = null;
  let personalNotes = [];
  let personalWeeklyQuote = "";

  /* ================== HILFSFUNKTIONEN ================== */
  function closeMenu() {
    menu.style.right = "-260px";
    menuOpen = false;
  }

  function closeAllOverlays() {
    infoOverlay.style.display = "none";
    personalOverlay.style.display = "none";
    archiveOverlay.style.display = "none";
  }

  /* ================== MENU ================== */
  menuButton.onclick = () => {
    menu.style.right = menuOpen ? "-260px" : "0";
    menuOpen = !menuOpen;
  };

  homeLink.onclick = () => {
    closeAllOverlays();
    closeMenu();
  };

  /* ================== INFO ================== */
  function showInfo() {
    closeAllOverlays();
    closeMenu();
    infoOverlay.style.display = "flex";
    infoOverlay.classList.remove("slideIn");
    void infoOverlay.offsetWidth;
    infoOverlay.classList.add("slideIn");
  }

  infoLink.onclick = showInfo;
  document.getElementById("infoContent").onclick = () => {
    infoOverlay.style.display = "none";
  };

  showInfo(); // beim Laden

  /* ================== HEADER + COUNTDOWN ================== */
  function getCategory() {
    const h = new Date().getHours();
    return h >= 6 && h < 12 ? "Morgen" : h < 18 ? "Mittag" : "Abend";
  }

  function updateHeader() {
    const now = new Date();
    const days = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];
    document.getElementById("daytime").innerText = getCategory();
    document.getElementById("weekday").innerText = days[now.getDay()];
    document.getElementById("date").innerText = now.toLocaleDateString("de-DE");
    document.getElementById("time").innerText = now.toLocaleTimeString("de-DE");
  }

  function updateYearCountdown() {
    const now = new Date();
    const end = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
    const diff = end - now;
    if (diff <= 0) return;
    const sec = Math.floor(diff / 1000);
    const d = Math.floor(sec / 86400);
    const h = Math.floor((sec % 86400) / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    yearCountdownEl.innerText =
      `Noch ${d} Tage ${h} Std ${m} Min ${s} Sek bis Jahresende`;
  }

  /* ================== BUTTONS ================== */
  function updateButtons() {
    const h = new Date().getHours();
    morningBtn.disabled = !(h >= 6 && h < 12);
    noonBtn.disabled = !(h >= 12 && h < 18);
    eveningBtn.disabled = !(h >= 18 || h < 6);
  }

  /* ================== ZITATE ================== */
  fetch("quotes.json")
    .then(res => res.json())
    .then(data => quotesData = data);

  function getDayOfYear() {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    return Math.floor((now - start) / 86400000);
  }

  function showPersonalQuote(type) {
    if (!quotesData) return;
    alert(quotesData.personal[type][getDayOfYear() % quotesData.personal[type].length]);
  }

  morningBtn.onclick = () => showPersonalQuote("morning");
  noonBtn.onclick = () => showPersonalQuote("noon");
  eveningBtn.onclick = () => showPersonalQuote("evening");

  /* ================== PERSÖNLICH ================== */
  personalLink.onclick = () => {
    closeAllOverlays();
    closeMenu();
    personalOverlay.style.display = "flex";
    renderPersonal();
  };

  closePersonalBtn.onclick = () => {
    personalOverlay.style.display = "none";
  };

  function renderPersonal() {
    personalContent.innerHTML = "";

    const notesSection = document.createElement("div");
    notesSection.innerHTML = "<h3>Meine Notizen</h3>";
    personalNotes.forEach(n => {
      const div = document.createElement("div");
      div.className = "note";
      div.innerText = n;
      notesSection.appendChild(div);
    });
    personalContent.appendChild(notesSection);

    const quoteSection = document.createElement("div");
    quoteSection.innerHTML = "<h3>Zitat der Woche</h3>";
    if (personalWeeklyQuote) {
      const div = document.createElement("div");
      div.className = "quoteBox";
      div.innerText = personalWeeklyQuote;
      quoteSection.appendChild(div);
    }
    personalContent.appendChild(quoteSection);
  }

  fetch("notes.json")
    .then(res => res.json())
    .then(data => personalNotes = data.notes || []);

  fetch("weeklyQuote.json")
    .then(res => res.json())
    .then(data => personalWeeklyQuote = data.weeklyQuote || "");

  /* ================== ARCHIV ================== */
  archiveLink.onclick = () => {
    closeAllOverlays();
    closeMenu();
    archiveOverlay.style.display = "flex";
    renderArchive();
  };

  closeArchiveBtn.onclick = () => {
    archiveOverlay.style.display = "none";
  };

  function renderArchive() {
    const container = document.getElementById("monthDetail");
    container.innerHTML = "";

    const daily = document.createElement("div");
    daily.innerHTML = "<h3>Tägliche Zitate</h3>";
    quotesData.daily.forEach(q => {
      const div = document.createElement("div");
      div.className = "archiveItem";
      div.innerText = q;
      daily.appendChild(div);
    });

    const personal = document.createElement("div");
    personal.innerHTML = "<h3>Persönliche Zitate</h3>";
    ["morning", "noon", "evening"].forEach(t => {
      quotesData.personal[t].forEach(q => {
        const div = document.createElement("div");
        div.className = "archiveItem";
        div.innerText = `${t}: ${q}`;
        personal.appendChild(div);
      });
    });

    container.appendChild(daily);
    container.appendChild(personal);
  }

  /* ================== START ================== */
  updateHeader();
  updateButtons();
  updateYearCountdown();
  setInterval(() => {
    updateHeader();
    updateButtons();
    updateYearCountdown();
  }, 1000);

});