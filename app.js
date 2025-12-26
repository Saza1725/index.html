document.addEventListener("DOMContentLoaded", () => {

  const quoteEl = document.getElementById("quote");
  const personalEl = document.getElementById("personalQuote");
  const morningBtn = document.getElementById("morningBtn");
  const noonBtn = document.getElementById("noonBtn");
  const eveningBtn = document.getElementById("eveningBtn");
  const yearCountdownEl = document.getElementById("yearCountdown");

  const menuButton = document.getElementById("menuButton");
  const menu = document.getElementById("menu");
  const homeLink = document.getElementById("homeLink");
  const personalLink = document.getElementById("personalLink");
  const archiveLink = document.getElementById("archiveLink");

  const personalOverlay = document.getElementById("personalOverlay");
  const personalContent = document.getElementById("personalContent");
  const closePersonalBtn = document.getElementById("closePersonalBtn");

  const archiveOverlay = document.getElementById("archiveOverlay");
  const archiveList = document.getElementById("archiveList");
  const closeArchiveBtn = document.getElementById("closeArchiveBtn");

  let menuOpen = false;
  let quotesData = null;

  // ===== MENU SLIDE =====
  menuButton.onclick = () => {
    menu.style.right = menuOpen ? "-260px" : "0";
    menuOpen = !menuOpen;
  };
  [homeLink, archiveLink, personalLink].forEach(link => {
    link.onclick = () => {
      menu.style.right = "-260px";
      menuOpen = false;
    };
  });

  // ===== PERSÖNLICHER BEREICH =====
  const personalText = `
    <h2>Mein persönlicher Bereich</h2>
    <p>Das hier ist mein persönlicher Text.<br>Nur ich als Ersteller ändere ihn.</p>
    <ul>
      <li>✔ unveränderbar</li>
      <li>✔ strukturiert</li>
      <li>✔ nur vom Ersteller gepflegt</li>
    </ul>
  `;
  personalLink.onclick = () => {
    personalContent.innerHTML = personalText;
    personalOverlay.style.display = "flex";
  };
  closePersonalBtn.onclick = () => personalOverlay.style.display = "none";

  // ===== ZITATE LADEN =====
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

  // ===== HILFSFUNKTIONEN =====
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

  // ===== TAGESZITAT + AUTOMATISCHES ARCHIV =====
  function showDailyQuote() {
    if (!quotesData) return;
    const index = getDayOfYear() % quotesData.daily.length;
    const text = quotesData.daily[index];
    quoteEl.innerText = text;
    saveDailyQuoteToArchive(text);
  }
  function saveDailyQuoteToArchive(text) {
    const now = new Date();
    const startDate = new Date(2025, 11, 1);
    const endDate = new Date(2026, 11, 31);
    if (now < startDate || now > endDate) return;

    const dateStr = now.toLocaleDateString("de-DE");
    const monthKey = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}`;
    let archive = JSON.parse(localStorage.getItem("archive")) || {};

    // nur die 12 Monate erstellen
    for (let y = 2025; y <= 2026; y++) {
      for (let m = 12; m <= 12; m++) { } // Platzhalter nur Dez
    }
    const allowedMonths = [];
    for (let y = 2025; y <= 2026; y++) {
      for (let m = 1; m <= 12; m++) {
        allowedMonths.push(`${y}-${String(m).padStart(2,"0")}`);
      }
    }
    if (!allowedMonths.includes(monthKey)) return;

    if (!archive[monthKey]) archive[monthKey] = [];
    if (!archive[monthKey].some(e => e.date === dateStr)) {
      archive[monthKey].push({ date: dateStr, text });
      localStorage.setItem("archive", JSON.stringify(archive));
    }
  }

  // ===== ARCHIV-OVERLAY + MONATSÜBERSICHT =====
  archiveLink.onclick = () => openArchive();

  function openArchive() {
    archiveOverlay.style.display = "flex";
    archiveList.innerHTML = `<h2>Archiv</h2>`;

    const archive = JSON.parse(localStorage.getItem("archive")) || {};

    // Erstelle Monate von Dez 2025 bis Dez 2026, falls nicht vorhanden
    for (let y = 2025; y <= 2026; y++) {
      for (let m = 1; m <= 12; m++) {
        const key = `${y}-${String(m).padStart(2,"0")}`;
        if (!archive[key]) archive[key] = [];
      }
    }
    localStorage.setItem("archive", JSON.stringify(archive));

    // Monatsbuttons anzeigen
    Object.keys(archive).sort().forEach(key => {
      const monthDiv = document.createElement("div");
      monthDiv.className = "archiveMonth";
      monthDiv.innerHTML = `<button class="monthBtn" data-month="${key}">▶ ${new Date(key+"-01").toLocaleDateString("de-DE",{month:"long",year:"numeric"})}</button>`;
      archiveList.appendChild(monthDiv);
    });

    // Monat anklickbar
    document.querySelectorAll(".monthBtn").forEach(btn => {
      btn.onclick = () => {
        const monthKey = btn.getAttribute("data-month");
        showMonthDetail(monthKey);
      };
    });
  }

  function showMonthDetail(monthKey) {
    archiveList.innerHTML = `
      <button id="backBtn" style="padding:5px 10px;">← Zurück</button>
      <h3>${new Date(monthKey+"-01").toLocaleDateString("de-DE",{month:"long",year:"numeric"})}</h3>
    `;
    const archive = JSON.parse(localStorage.getItem("archive")) || {};
    archive[monthKey].forEach(e => {
      const div = document.createElement("div");
      div.className = "archiveItem";
      div.innerHTML = `<div class="date">${e.date}</div>${e.text}`;
      archiveList.appendChild(div);
    });
    document.getElementById("backBtn").onclick = openArchive;
  }

  closeArchiveBtn.onclick = () => archiveOverlay.style.display = "none";

  // ===== PERSÖNLICHE ZITATE =====
  morningBtn.onclick = () => showPersonalQuote("morning");
  noonBtn.onclick = () => showPersonalQuote("noon");
  eveningBtn.onclick = () => showPersonalQuote("evening");

  function showPersonalQuote(type) {
    personalEl.innerText = quotesData.personal[type][getDayOfYear() % quotesData.personal[type].length];
    personalEl.style.display = "block";
  }

  // ===== BUTTON STATUS =====
  function updateButtons() {
    const h = new Date().getHours();
    morningBtn.disabled = !(h >= 6 && h < 12);
    noonBtn.disabled = !(h >= 12 && h < 18);
    eveningBtn.disabled = !(h >= 18 || h < 6);
  }

  // ===== COUNTDOWN =====
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
    yearCountdownEl.innerText = `Noch ${d} Tage ${h} Std ${m} Min ${s} Sek bis Jahresende`;
  }

  // ===== START =====
  updateHeader();
  updateButtons();
  updateYearCountdown();
  showDailyQuote();
  setInterval(() => {
    updateHeader();
    updateButtons();
    updateYearCountdown();
  }, 1000);

});