document.addEventListener("DOMContentLoaded", () => {

  const quoteEl = document.getElementById("quote");
  const personalEl = document.getElementById("personalQuote");
  const morningBtn = document.getElementById("morningBtn");
  const noonBtn = document.getElementById("noonBtn");
  const eveningBtn = document.getElementById("eveningBtn");
  const menuButton = document.getElementById("menuButton");

  const archiveOverlay = document.getElementById("archiveOverlay");
  const archiveList = document.getElementById("archiveList");
  const closeArchiveBtn = document.getElementById("closeArchiveBtn");

  const yearCountdownEl = document.getElementById("yearCountdown");

  let quotesData = null;

  // =====================
  // ZITATE LADEN
  // =====================
  fetch("quotes.json")
    .then(res => {
      if (!res.ok) throw new Error("quotes.json nicht gefunden");
      return res.json();
    })
    .then(data => {
      quotesData = data;
      showDailyQuote();
    })
    .catch(err => {
      console.error(err);
      quoteEl.innerText = "Fehler beim Laden der Zitate";
    });

  // =====================
  // HILFSFUNKTIONEN
  // =====================
  function getDayOfYear() {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    return Math.floor((now - start) / 86400000);
  }

  function getCategory() {
    const h = new Date().getHours();
    if (h >= 6 && h < 12) return "morning";
    if (h >= 12 && h < 18) return "noon";
    return "evening";
  }

  function updateHeader() {
    const now = new Date();
    const days = ["So","Mo","Di","Mi","Do","Fr","Sa"];

    document.getElementById("daytime").innerText =
      getCategory() === "morning" ? "Morgen" :
      getCategory() === "noon" ? "Mittag" : "Abend";

    document.getElementById("weekday").innerText = days[now.getDay()];
    document.getElementById("date").innerText = now.toLocaleDateString("de-DE");
    document.getElementById("time").innerText = now.toLocaleTimeString("de-DE");
  }

  // =====================
  // TAGESZITAT + ARCHIV (MONATLICH)
  // =====================
  function showDailyQuote() {
    if (!quotesData) return;

    const index = getDayOfYear() % quotesData.daily.length;
    const text = quotesData.daily[index];
    quoteEl.innerText = text;

    saveDailyQuoteToArchive(text);
  }

  function saveDailyQuoteToArchive(text) {
    const now = new Date();
    const startDate = new Date(2025, 11, 27);
    if (now < startDate) return;

    const dateStr = now.toLocaleDateString("de-DE");
    const monthKey = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}`;

    let archive = JSON.parse(localStorage.getItem("archive")) || {};

    if (!archive[monthKey]) archive[monthKey] = [];

    if (!archive[monthKey].some(e => e.date === dateStr)) {
      archive[monthKey].push({ date: dateStr, text });
      localStorage.setItem("archive", JSON.stringify(archive));
    }
  }

  // =====================
  // ARCHIV ANZEIGEN
  // =====================
  function openArchive() {
    archiveOverlay.style.display = "flex";
    archiveList.innerHTML = "";

    const archive = JSON.parse(localStorage.getItem("archive")) || {};
    const months = Object.keys(archive).sort().reverse();

    months.forEach(key => {
      const title = document.createElement("h3");
      title.innerText = new Date(key + "-01")
        .toLocaleDateString("de-DE", { month: "long", year: "numeric" });
      archiveList.appendChild(title);

      archive[key].forEach(e => {
        const div = document.createElement("div");
        div.className = "archiveItem";
        div.innerHTML = `<div class="date">${e.date}</div>${e.text}`;
        archiveList.appendChild(div);
      });
    });
  }

  function closeArchive() {
    archiveOverlay.style.display = "none";
  }

  // =====================
  // BUTTONS
  // =====================
  function updateButtons() {
    const h = new Date().getHours();
    morningBtn.disabled = !(h >= 6 && h < 12);
    noonBtn.disabled = !(h >= 12 && h < 18);
    eveningBtn.disabled = !(h >= 18 || h < 6);
  }

  morningBtn.onclick = () => {
    personalEl.innerText =
      quotesData.personal.morning[getDayOfYear() % quotesData.personal.morning.length];
    personalEl.style.display = "block";
  };

  noonBtn.onclick = () => {
    personalEl.innerText =
      quotesData.personal.noon[getDayOfYear() % quotesData.personal.noon.length];
    personalEl.style.display = "block";
  };

  eveningBtn.onclick = () => {
    personalEl.innerText =
      quotesData.personal.evening[getDayOfYear() % quotesData.personal.evening.length];
    personalEl.style.display = "block";
  };

  menuButton.onclick = openArchive;
  closeArchiveBtn.onclick = closeArchive;

  // =====================
  // COUNTDOWN
  // =====================
  function updateYearCountdown() {
    const now = new Date();
    const end = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
    const diff = end - now;
    if (diff < 0) return;

    const sec = Math.floor(diff / 1000);
    const d = Math.floor(sec / 86400);
    const h = Math.floor((sec % 86400) / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;

    yearCountdownEl.innerText =
      `Noch ${d} Tage ${h} Std ${m} Min ${s} Sek bis Jahresende`;
  }

  // =====================
  // START
  // =====================
  updateHeader();
  updateButtons();
  updateYearCountdown();

  setInterval(() => {
    updateHeader();
    updateButtons();
    updateYearCountdown();
  }, 1000);
});