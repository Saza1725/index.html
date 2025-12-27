document.addEventListener("DOMContentLoaded", () => {

  /* ================== DOM ================== */
  const morningBtn = document.getElementById("morningBtn");
  const noonBtn = document.getElementById("noonBtn");
  const eveningBtn = document.getElementById("eveningBtn");

  const menuButton = document.getElementById("menuButton");
  const menu = document.getElementById("menu");
  const homeLink = document.getElementById("homeLink");
  const personalLink = document.getElementById("personalLink");
  const archiveLink = document.getElementById("archiveLink");
  const infoLink = document.getElementById("infoLink");

  const personalOverlay = document.getElementById("personalOverlay");
  const closePersonalBtn = document.getElementById("closePersonalBtn");
  const personalContent = document.getElementById("personalContent");

  const archiveOverlay = document.getElementById("archiveOverlay");
  const monthDetail = document.getElementById("monthDetail");
  const closeArchiveBtn = document.getElementById("closeArchiveBtn");

  const infoOverlay = document.getElementById("infoOverlay");
  const infoContent = document.getElementById("infoContent");

  const yearCountdownEl = document.getElementById("yearCountdown");

  let menuOpen = false;
  let quotesData = null;
  let personalNotes = [];
  let personalWeeklyQuote = "";

  /* ================== MENU ================== */
  menuButton.onclick = () => {
    menu.style.right = menuOpen ? "-260px" : "0";
    menuOpen = !menuOpen;
  };

  [homeLink, personalLink, archiveLink, infoLink].forEach(link => {
    link.onclick = () => {
      menu.style.right = "-260px";
      menuOpen = false;
    };
  });

  /* ================== INFO OVERLAY ================== */
  function showInfo() {
    infoOverlay.style.display = "flex";
    infoOverlay.classList.remove("slideOut");
    infoOverlay.classList.remove("slideIn");
    void infoOverlay.offsetWidth;
    infoOverlay.classList.add("slideIn");
  }

  infoLink.onclick = showInfo;

  infoContent.onclick = () => {
    infoOverlay.classList.remove("slideIn");
    infoOverlay.classList.add("slideOut");
    setTimeout(() => {
      infoOverlay.style.display = "none";
      infoOverlay.classList.remove("slideOut");
    }, 600);
  };

  showInfo();

  /* ================== HEADER ================== */
  function getCategory() {
    const h = new Date().getHours();
    return h >= 6 && h < 12 ? "Morgen" : h < 18 ? "Mittag" : "Abend";
  }

  function updateHeader() {
    const now = new Date();
    const days = ["So","Mo","Di","Mi","Do","Fr","Sa"];
    document.getElementById("daytime").innerText = getCategory();
    document.getElementById("weekday").innerText = days[now.getDay()];
    document.getElementById("date").innerText = now.toLocaleDateString("de-DE");
    document.getElementById("time").innerText = now.toLocaleTimeString("de-DE");
  }

  function updateYearCountdown() {
    const now = new Date();
    const end = new Date(now.getFullYear(),11,31,23,59,59);
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
    const start = new Date(now.getFullYear(),0,0);
    return Math.floor((now-start)/86400000);
  }

  function showPersonalQuote(type) {
    if (!quotesData) return;
    const list = quotesData.personal[type];
    alert(list[getDayOfYear() % list.length]);
  }

  morningBtn.onclick = () => showPersonalQuote("morning");
  noonBtn.onclick = () => showPersonalQuote("noon");
  eveningBtn.onclick = () => showPersonalQuote("evening");

  /* ================== PERSÖNLICH ================== */
  personalLink.onclick = () => {
    personalOverlay.style.display = "flex";
    renderPersonal();
  };

  closePersonalBtn.onclick = () => {
    personalOverlay.style.display = "none";
  };

  function renderPersonal() {
    personalContent.innerHTML = "";

    const notes = document.createElement("div");
    notes.innerHTML = "<h3>Meine Notizen</h3>";
    personalNotes.forEach(n => {
      const d = document.createElement("div");
      d.className = "note";
      d.innerText = n;
      notes.appendChild(d);
    });
    personalContent.appendChild(notes);

    const quote = document.createElement("div");
    quote.innerHTML = "<h3>Zitat der Woche</h3>";
    if (personalWeeklyQuote) {
      const d = document.createElement("div");
      d.className = "quoteBox";
      d.innerText = personalWeeklyQuote;
      quote.appendChild(d);
    }
    personalContent.appendChild(quote);
  }

  fetch("notes.json")
    .then(res => res.json())
    .then(data => personalNotes = data.notes || []);

  fetch("weeklyQuote.json")
    .then(res => res.json())
    .then(data => personalWeeklyQuote = data.weeklyQuote || "");

  /* ================== ARCHIV ================== */
  archiveLink.onclick = () => {
    archiveOverlay.style.display = "flex";
    showArchive();
  };

  closeArchiveBtn.onclick = () => {
    archiveOverlay.style.display = "none";
  };

  function showArchive() {
    if (!quotesData) return;
    monthDetail.innerHTML = "";

    const daily = document.createElement("div");
    daily.innerHTML = "<h3>Tägliche Zitate</h3>";
    quotesData.daily.forEach(q => {
      const d = document.createElement("div");
      d.className = "archiveItem";
      d.innerText = q;
      daily.appendChild(d);
    });
    monthDetail.appendChild(daily);

    const personal = document.createElement("div");
    personal.innerHTML = "<h3>Persönliche Zitate</h3>";
    ["morning","noon","evening"].forEach(t => {
      quotesData.personal[t].forEach(q => {
        const d = document.createElement("div");
        d.className = "archiveItem";
        d.innerText = `${t}: ${q}`;
        personal.appendChild(d);
      });
    });
    monthDetail.appendChild(personal);
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