console.log("fetch test gestartet");

fetch("quotes.json")
  .then(res => {
    console.log("Response ok:", res.ok);
    return res.json();
  })
  .then(data => {
    console.log("Daten geladen:", data);
  })
  .catch(err => console.error("Fehler beim Laden der Zitate:", err));

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

  const personalOverlay = document.getElementById("personalOverlay");
  const personalContent = document.getElementById("personalContent");
  const closePersonalBtn = document.getElementById("closePersonalBtn");

  const yearCountdownEl = document.getElementById("yearCountdown");

  const homeLink = document.getElementById("homeLink");
  const personalLink = document.getElementById("personalLink");
  const archiveLink = document.getElementById("archiveLink");

  const personalText = `
<h2>Mein persönlicher Bereich</h2>
<p>Das hier ist mein persönlicher Text. Nur ich als Ersteller ändere ihn.</p>
<p>Gedanken, Regeln, Motivation, Vision – alles bleibt hier fest bestehen.</p>
<ul>
  <li>✔ unveränderbar</li>
  <li>✔ strukturiert</li>
  <li>✔ nur vom Ersteller gepflegt</li>
</ul>
`;

function initArchiveMonths() {
  let archive = JSON.parse(localStorage.getItem("archive")) || {};

  const start = new Date(2025, 11, 27); // 27.12.2025
  const end = new Date(2026, 11, 31);   // 31.12.2026

  let current = new Date(start.getFullYear(), start.getMonth(), 1);

  while (current <= end) {
    const key = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, "0")}`;
    if (!archive[key]) archive[key] = [];
    current.setMonth(current.getMonth() + 1);
  }

  localStorage.setItem("archive", JSON.stringify(archive));
}

initArchiveMonths();

  let quotesData = null;

  // =====================
  // ZITATE LADEN
  // =====================
  fetch("quotes.json")
    .then(res => res.json())
    .then(data => {
      quotesData = data;
      showDailyQuote();
    })
    .catch(() => {
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
  
  function formatMonthName(key) {
  const [year, month] = key.split("-");
  const date = new Date(year, month - 1);
  return date.toLocaleDateString("de-DE", { month: "long", year: "numeric" });
}

  // =====================
  // TAGESZITAT
  // =====================
  function showDailyQuote() {
    if (!quotesData) return;
    const index = getDayOfYear() % quotesData.daily.length;
    const text = quotesData.daily[index];
    quoteEl.innerText = text;
    saveToArchive("Tageszitat", text);
  }

  // =====================
  // PERSÖNLICHE ZITATE
  // =====================
  function showPersonal(type) {
    const list = quotesData.personal[type];
    const q = list[getDayOfYear() % list.length];
    personalEl.innerText = q;
    personalEl.style.display = "block";
    saveDailyQuoteToArchive(text);
  }

  // =====================
  // ARCHIV
  // =====================
  function saveDailyQuoteToArchive(text) {
  const now = new Date();
  const startDate = new Date(2025, 11, 27);
  if (now < startDate) return;

  const dateStr = now.toLocaleDateString("de-DE");
  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  let archive = JSON.parse(localStorage.getItem("archive")) || {};
  if (!archive[monthKey]) archive[monthKey] = [];

  if (!archive[monthKey].some(e => e.date === dateStr)) {
    archive[monthKey].push({ date: dateStr, text });
    localStorage.setItem("archive", JSON.stringify(archive));
  }
}

  function openArchive() {
  archiveOverlay.style.display = "flex";
  archiveList.innerHTML = "";

  const archive = JSON.parse(localStorage.getItem("archive")) || {};
  const months = Object.keys(archive).sort().reverse();

  let currentYear = "";

  months.forEach(monthKey => {
    const year = monthKey.split("-")[0];

    if (year !== currentYear) {
      const y = document.createElement("h2");
      y.innerText = year;
      y.style.marginTop = "25px";
      archiveList.appendChild(y);
      currentYear = year;
    }

    const monthTitle = document.createElement("h3");
    monthTitle.innerText = formatMonthName(monthKey);
    archiveList.appendChild(monthTitle);

    if (archive[monthKey].length === 0) {
      const empty = document.createElement("div");
      empty.style.opacity = "0.5";
      empty.innerText = "– noch keine Einträge –";
      archiveList.appendChild(empty);
    } else {
      archive[monthKey].forEach(entry => {
        const div = document.createElement("div");
        div.className = "archiveItem";
        div.innerHTML = `<div class="date">${entry.date}</div>${entry.text}`;
        archiveList.appendChild(div);
      });
    }
  });
  
  document.getElementById("archiveSearch").addEventListener("input", function () {
  const query = this.value.trim();
  document.querySelectorAll(".archiveItem").forEach(item => {
    item.style.display = item.innerText.includes(query) ? "block" : "none";
  });
});
}

  // =====================
  // PERSÖNLICHES OVERLAY
  // =====================
  function openPersonal() {
    personalContent.innerHTML = personalText;
    personalOverlay.style.display = "flex";
  }

  function closePersonal() {
    personalOverlay.style.display = "none";
  }

  // =====================
  // MENÜ LINKS
  // =====================
  let menuOpen = false;
  menuButton.onclick = () => {
    const menu = document.getElementById("menu");
    menu.style.right = menuOpen ? "-260px" : "0";
    menuOpen = !menuOpen;
  };

  homeLink.onclick = () => {
    document.getElementById("menu").style.right = "-260px";
    personalOverlay.style.display = "none";
    archiveOverlay.style.display = "none";
  };

  personalLink.onclick = () => {
    openPersonal();
    document.getElementById("menu").style.right = "-260px";
  };

  archiveLink.onclick = () => {
    openArchive();
    document.getElementById("menu").style.right = "-260px";
  };

  closeArchiveBtn.onclick = closeArchive;
  closePersonalBtn.onclick = closePersonal;

  // =====================
  // BUTTONS
  // =====================
  function updateButtons() {
    const h = new Date().getHours();
    morningBtn.disabled = !(h >= 6 && h < 12);
    noonBtn.disabled = !(h >= 12 && h < 18);
    eveningBtn.disabled = !(h >= 18 || h < 6);
  }

  morningBtn.onclick = () => showPersonal("morning");
  noonBtn.onclick = () => showPersonal("noon");
  eveningBtn.onclick = () => showPersonal("evening");

  // =====================
  // JAHRESCOUNTDOWN
  // =====================
  function updateYearCountdown() {
    const now = new Date();
    const end = new Date(now.getFullYear(), 11, 31, 23, 59, 59);

    let diff = end - now;
    if (diff < 0) return;

    const totalSeconds = Math.floor(diff / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    yearCountdownEl.innerText =
      `Noch ${days} Tage ${hours} Std ${minutes} Min ${seconds} Sek bis Jahresende`;
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