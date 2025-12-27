document.addEventListener("DOMContentLoaded", () => {

  const morningBtn = document.getElementById("morningBtn");
  const noonBtn = document.getElementById("noonBtn");
  const eveningBtn = document.getElementById("eveningBtn");

  const menuButton = document.getElementById("menuButton");
  const menu = document.getElementById("menu");

  const homeLink = document.getElementById("homeLink");
  const personalLink = document.getElementById("personalLink");
  const archiveLink = document.getElementById("archiveLink");
  const infoLink = document.getElementById("infoLink");

  const infoOverlay = document.getElementById("infoOverlay");
  const infoContent = document.getElementById("infoContent");

  const personalOverlay = document.getElementById("personalOverlay");
  const closePersonalBtn = document.getElementById("closePersonalBtn");
  const personalContent = document.getElementById("personalContent");

  const archiveOverlay = document.getElementById("archiveOverlay");
  const closeArchiveBtn = document.getElementById("closeArchiveBtn");
  const monthDetail = document.getElementById("monthDetail");

  const yearCountdownEl = document.getElementById("yearCountdown");

  let menuOpen = false;
  let quotesData = null;
  let personalNotes = [];
  let personalWeeklyQuote = "";

  /* MENU */
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

  /* INFO OVERLAY */
  function showInfo() {
    infoOverlay.style.display = "flex";
    infoOverlay.classList.remove("slideOut");
    infoOverlay.classList.add("slideIn");
  }

  function hideInfo() {
    infoOverlay.classList.remove("slideIn");
    infoOverlay.classList.add("slideOut");
    setTimeout(() => infoOverlay.style.display = "none", 600);
  }

  infoContent.onclick = hideInfo;
  infoLink.onclick = showInfo;
  showInfo();

  /* HEADER */
  function getCategory() {
    const h = new Date().getHours();
    return h < 12 ? "Morgen" : h < 18 ? "Mittag" : "Abend";
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
    const end = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
    const diff = end - now;
    if (diff <= 0) return;
    const s = Math.floor(diff / 1000);
    const d = Math.floor(s / 86400);
    const h = Math.floor((s % 86400) / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    yearCountdownEl.innerText =
      `Noch ${d} Tage ${h} Std ${m} Min ${sec} Sek bis Jahresende`;
  }

  function updateButtons() {
    const h = new Date().getHours();
    morningBtn.disabled = !(h >= 6 && h < 12);
    noonBtn.disabled = !(h >= 12 && h < 18);
    eveningBtn.disabled = !(h >= 18 || h < 6);
  }

  /* ZITATE */
  fetch("quotes.json")
    .then(r => r.json())
    .then(d => quotesData = d);

  function getDayOfYear() {
    const now = new Date();
    const start = new Date(now.getFullYear(),0,0);
    return Math.floor((now-start)/86400000);
  }

  function showPersonalQuote(type) {
    if (!quotesData) return;
    alert(quotesData.personal[type][getDayOfYear() % quotesData.personal[type].length]);
  }

  morningBtn.onclick = () => showPersonalQuote("morning");
  noonBtn.onclick = () => showPersonalQuote("noon");
  eveningBtn.onclick = () => showPersonalQuote("evening");

  /* PERSONAL */
  personalLink.onclick = () => {
    personalOverlay.style.display = "block";
    renderPersonal();
  };
  closePersonalBtn.onclick = () => personalOverlay.style.display = "none";

  function renderPersonal() {
    personalContent.innerHTML = `
      <div class="personalSection">
        <h3>Meine Notizen</h3>
        ${personalNotes.map(n => `<div class="note">${n}</div>`).join("") || "<p>Keine Notizen</p>"}
      </div>
      <div class="personalSection">
        <h3>Zitat der Woche</h3>
        ${personalWeeklyQuote ? `<div class="quoteBox">${personalWeeklyQuote}</div>` : "<p>Kein Zitat</p>"}
      </div>
    `;
  }

  fetch("notes.json").then(r=>r.json()).then(d=>personalNotes=d.notes||[]);
  fetch("weeklyQuote.json").then(r=>r.json()).then(d=>personalWeeklyQuote=d.weeklyQuote||"");

  /* ARCHIV */
  archiveLink.onclick = () => {
    archiveOverlay.style.display = "block";
    if (!quotesData) return;
    monthDetail.innerHTML = `
      <h3>Tägliche Zitate</h3>
      ${quotesData.daily.map(q=>`<div class="archiveItem">${q}</div>`).join("")}
      <h3>Persönliche Zitate</h3>
      ${["morning","noon","evening"].flatMap(t =>
        quotesData.personal[t].map(q=>`<div class="archiveItem">${t}: ${q}</div>`)
      ).join("")}
    `;
  };
  closeArchiveBtn.onclick = () => archiveOverlay.style.display = "none";

  updateHeader();
  updateButtons();
  updateYearCountdown();
  setInterval(() => {
    updateHeader();
    updateButtons();
    updateYearCountdown();
  }, 1000);
});