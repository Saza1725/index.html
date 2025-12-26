document.addEventListener("DOMContentLoaded", () => {

  // ======= DOM ELEMENTE =======
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
  const monthsContainer = document.getElementById("monthsContainer");
  const monthDetail = document.getElementById("monthDetail");
  const backBtn = document.getElementById("backBtn");
  const closeArchiveBtn = document.getElementById("closeArchiveBtn");

  let menuOpen = false;
  let quotesData = null;

  // ======= MENU SLIDE =======
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

  // ======= PERSÖNLICHER BEREICH =======
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

  // ======= ZITATE LADEN =======
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

  // ======= HILFSFUNKTIONEN =======
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

  // ======= TAGESZITAT + AUTOMATISCHES ARCHIV =======
  function showDailyQuote() {
    if (!quotesData) return;
    const index = getDayOfYear() % quotesData.daily.length;
    const text = quotesData.daily[index];
    quoteEl.innerText = text;
    saveDailyQuoteToArchive(text);
  }

  function saveDailyQuoteToArchive(text) {
    const now = new Date();
    const startDate = new Date(2025, 11, 27); // 27.12.2025
    const endDate = new Date(2026, 11, 31);   // 31.12.2026
    if (now < startDate || now > endDate) return;

    const dateStr = now.toLocaleDateString("de-DE");
    const monthKey = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}`;

    let archive = JSON.parse(localStorage.getItem("archive")) || {};

    // Alle Monate vorbereiten
    for(let m=12; m<=12; m++) {
      const key2025 = `2025-${String(m).padStart(2,'0')}`;
      if(!archive[key2025]) archive[key2025] = [];
    }
    for(let m=1; m<=12; m++) {
      const key2026 = `2026-${String(m).padStart(2,'0')}`;
      if(!archive[key2026]) archive[key2026] = [];
    }

    if(!archive[monthKey].some(e => e.date === dateStr)) {
      archive[monthKey].push({ date: dateStr, text });
      localStorage.setItem("archive", JSON.stringify(archive));
    }
  }

  // ======= ARCHIV-OVERLAY MIT MONATSÜBERSICHT =======
  archiveLink.onclick = openArchive;

  function openArchive() {
    archiveOverlay.style.display = "flex";
    backBtn.style.display = "none";
    monthDetail.innerHTML = "";
    monthsContainer.innerHTML = "";

    const archive = JSON.parse(localStorage.getItem("archive")) || {};

    // Monatsbuttons erstellen (Dez 2025 – Dez 2026)
    const months = [];
    for(let m=12; m<=12; m++) months.push(`2025-${String(m).padStart(2,'0')}`);
    for(let m=1; m<=12; m++) months.push(`2026-${String(m).padStart(2,'0')}`);

    months.forEach(key => {
      const btn = document.createElement("button");
      const d = new Date(key+"-01");
      btn.innerText = d.toLocaleDateString("de-DE", { month:'long', year:'numeric' });
      btn.onclick = () => showMonthDetail(key);
      btn.style.margin="5px";
      monthsContainer.appendChild(btn);
    });
  }

  function showMonthDetail(monthKey) {
    const archive = JSON.parse(localStorage.getItem("archive")) || {};
    const monthData = archive[monthKey] || [];
    monthsContainer.style.display = "none";
    backBtn.style.display = "inline-block";

    monthDetail.innerHTML = `<h3>${new Date(monthKey+'-01').toLocaleDateString('de-DE', {month:'long', year:'numeric'})}</h3>`;

    if(monthData.length === 0) {
      monthDetail.innerHTML += "<p>Keine Zitate für diesen Monat.</p>";
    } else {
      monthData.forEach(e => {
        const div = document.createElement("div");
        div.className = "archiveItem";
        div.innerHTML = `<div class="date">${e.date}</div>${e.text}`;
        monthDetail.appendChild(div);
      });
    }
  }

  backBtn.onclick = () => {
    monthDetail.innerHTML = "";
    monthsContainer.style.display = "flex";
    backBtn.style.display = "none";
  }

  closeArchiveBtn.onclick = () => archiveOverlay.style.display = "none";

  // ======= PERSÖNLICHE ZITATE BUTTONS =======
  morningBtn.onclick = () => showPersonalQuote("morning");
  noonBtn.onclick = () => showPersonalQuote("noon");
  eveningBtn.onclick = () => showPersonalQuote("evening");

  function showPersonalQuote(type) {
    personalEl.innerText = quotesData.personal[type][getDayOfYear() % quotesData.personal[type].length];
    personalEl.style.display = "block";
  }

  // ======= BUTTON STATUS =======
  function updateButtons() {
    const h = new Date().getHours();
    morningBtn.disabled = !(h >= 6 && h < 12);
    noonBtn.disabled = !(h >= 12 && h < 18);
    eveningBtn.disabled = !(h >= 18 || h < 6);
  }

  // ======= COUNTDOWN =======
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

  // ======= START =======
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