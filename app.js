document.addEventListener("DOMContentLoaded", () => {

  /* ================== DOM ================== */
  const quoteEl = document.getElementById("quote");
  const personalQuoteEl = document.getElementById("personalQuote");

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
  const closePersonalBtn = document.getElementById("closePersonalBtn");

  const notesEl = document.getElementById("personalNotesContent");
  const weeklyQuoteContent = document.getElementById("weeklyQuoteContent");

  const archiveOverlay = document.getElementById("archiveOverlay");
  const monthsContainer = document.getElementById("monthsContainer");
  const monthDetail = document.getElementById("monthDetail");
  const backBtn = document.getElementById("backBtn");
  const closeArchiveBtn = document.getElementById("closeArchiveBtn");

  /* ================== STATE ================== */
  let menuOpen = false;
  let quotesData = null;
  let personalNotes = [];
  let personalWeeklyQuote = "";
  
  const weeklyQuoteContent = document.getElementById("weeklyQuoteContent");

function updateWeeklyQuoteUI() {
  if (!weeklyQuoteContent) return;

  if (personalWeeklyQuote && personalWeeklyQuote.trim() !== "") {
    weeklyQuoteContent.innerHTML =
      `<div class="archiveItem">${personalWeeklyQuote}</div>`;
  } else {
    weeklyQuoteContent.innerHTML =
      "<p>Kein Wochenzitat vorhanden.</p>";
  }
}

  /* ================== MENU ================== */
  menuButton.onclick = () => {
    menu.style.right = menuOpen ? "-260px" : "0";
    menuOpen = !menuOpen;
  };

  [homeLink, personalLink, archiveLink].forEach(link => {
    link.onclick = () => {
      menu.style.right = "-260px";
      menuOpen = false;
    };
  });

  /* ================== HEADER ================== */
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

  /* ================== COUNTDOWN ================== */
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

  /* ================== ZITATE ================== */
  fetch("quotes.json")
    .then(res => res.json())
    .then(data => {
      quotesData = data;
      showDailyQuote();
    })
    .catch(() => {
      quoteEl.innerText = "Zitate konnten nicht geladen werden.";
    });

  function getDayOfYear() {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    return Math.floor((now - start) / 86400000);
  }

  function showDailyQuote() {
    if (!quotesData) return;
    const index = getDayOfYear() % quotesData.daily.length;
    quoteEl.innerText = quotesData.daily[index];
  }

  /* ================== ZEITBUTTONS ================== */
  morningBtn.onclick = () => showPersonalQuote("morning");
  noonBtn.onclick = () => showPersonalQuote("noon");
  eveningBtn.onclick = () => showPersonalQuote("evening");

  function showPersonalQuote(type) {
    if (!quotesData) return;
    const list = quotesData.personal[type];
    personalQuoteEl.innerText =
      list[getDayOfYear() % list.length];
    personalQuoteEl.style.display = "block";
  }

  function updateButtons() {
    const h = new Date().getHours();
    morningBtn.disabled = !(h >= 6 && h < 12);
    noonBtn.disabled = !(h >= 12 && h < 18);
    eveningBtn.disabled = !(h >= 18 || h < 6);
  }

  /* ================== PERSÖNLICHER BEREICH ================== */
  personalLink.onclick = () => {
    personalOverlay.style.display = "flex";
    renderPersonal();
  };

  closePersonalBtn.onclick = () => {
    personalOverlay.style.display = "none";
  };

  function showPersonalContent() {
  personalContent.innerHTML = "<h2>Persönlicher Bereich</h2>";

  // NOTIZEN
  personalContent.innerHTML += "<h3>Meine Notizen</h3>";
  if (personalNotes.length === 0) {
    personalContent.innerHTML += "<p>Keine Notizen vorhanden.</p>";
  } else {
    personalNotes.forEach(n => {
      personalContent.innerHTML += `<div class="archiveItem">${n}</div>`;
    });
  }

  // WOCHENZITAT
  personalContent.innerHTML += "<h3>Zitat der Woche</h3>";
  if (personalWeeklyQuote) {
    personalContent.innerHTML +=
      `<div class="archiveItem">${personalWeeklyQuote}</div>`;
  } else {
    personalContent.innerHTML +=
      "<p>Kein Wochenzitat vorhanden.</p>";
  }
}
 

  /* ================== NOTIZEN ================== */
  fetch("notes.json")
    .then(res => res.json())
    .then(data => {
      personalNotes = data.notes || [];
    })
    .catch(() => {
      personalNotes = [];
    });

  /* ================== WOCHENZITAT ================== */
  fetch("weeklyQuote.json")
  .then(res => {
    if (!res.ok) throw new Error("weeklyQuote.json fehlt");
    return res.json();
  })
  .then(data => {
    personalWeeklyQuote = data.text || "";
    updateWeeklyQuoteUI();
  })
  .catch(() => {
    personalWeeklyQuote = "";
    updateWeeklyQuoteUI();
  });

  /* ================== ARCHIV ================== */
  const months = [];
  for (let y = 2025; y <= 2026; y++) {
    const start = y === 2025 ? 12 : 1;
    for (let m = start; m <= 12; m++) {
      months.push({ year: y, month: m });
    }
  }

  function showMonths() {
    monthsContainer.innerHTML = "";
    monthDetail.style.display = "none";
    backBtn.style.display = "none";

    months.forEach(({ year, month }) => {
      const btn = document.createElement("button");
      btn.innerText = new Date(year, month - 1, 1)
        .toLocaleDateString("de-DE", { month: "long", year: "numeric" });
      btn.onclick = () => showMonthDetail(year, month);
      monthsContainer.appendChild(btn);
    });
  }

  function showMonthDetail(year, month) {
    monthsContainer.innerHTML = "";
    backBtn.style.display = "block";
    monthDetail.style.display = "block";
    monthDetail.innerHTML =
      `<h3>${new Date(year, month - 1, 1)
        .toLocaleDateString("de-DE", { month: "long", year: "numeric" })}</h3>
       <p>Archiv-Funktion vorbereitet.</p>`;
  }

  archiveLink.onclick = () => {
    archiveOverlay.style.display = "flex";
    showMonths();
  };

  closeArchiveBtn.onclick = () => {
    archiveOverlay.style.display = "none";
  };

  backBtn.onclick = showMonths;

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