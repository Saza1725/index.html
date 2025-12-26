/***********************
 * BASIS-ELEMENTE
 ***********************/
const menuButton = document.getElementById("menuButton");
const menu = document.getElementById("menu");
const homeLink = document.getElementById("homeLink");
const archiveLink = document.getElementById("archiveLink");

const daytimeEl = document.getElementById("daytime");
const weekdayEl = document.getElementById("weekday");
const dateEl = document.getElementById("date");
const timeEl = document.getElementById("time");

const quoteEl = document.getElementById("quote");
const personalQuoteEl = document.getElementById("personalQuote");

const morningBtn = document.getElementById("morningBtn");
const noonBtn = document.getElementById("noonBtn");
const eveningBtn = document.getElementById("eveningBtn");

const archiveSection = document.getElementById("archive");
const mainSection = document.getElementById("main");
const countdownEl = document.getElementById("countdown");

/***********************
 * BASISDATEN (TEMP)
 * wird später durch JSON ersetzt
 ***********************/
let dailyQuotes = [];

fetch("quotes.json")
  .then(res => res.json())
  .then(data => {
    dailyQuotes = data;
    showDailyQuote();
  })
  .catch(() => {
    quoteEl.innerText = "Zitat konnte nicht geladen werden.";
  });
];

const personalQuotes = {
  morning: "Heute startest du für dich.",
  noon: "Falsche Menschen kosten Energie – bleib bei dir.",
  evening: "Du hast genug getan. Ruhe ist verdient."
};

/***********************
 * HILFSFUNKTIONEN
 ***********************/
function getDayOfYear() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now - start;
  return Math.floor(diff / 86400000);
}

function getCategory() {
  const h = new Date().getHours();
  if (h >= 6 && h < 12) return "morning";
  if (h >= 12 && h < 18) return "noon";
  return "evening";
}

/***********************
 * HEADER (Datum & Zeit)
 ***********************/
function updateHeader() {
  const now = new Date();
  const days = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];

  const cat = getCategory();
  daytimeEl.innerText =
    cat === "morning" ? "Morgen" :
    cat === "noon" ? "Mittag" : "Abend";

  weekdayEl.innerText = days[now.getDay()];
  dateEl.innerText = now.toLocaleDateString("de-DE");
  timeEl.innerText = now.toLocaleTimeString("de-DE");
}

/***********************
 * TAGESZITAT (STABIL)
 ***********************/
function showDailyQuote() {
  if (dailyQuotes.length === 0) return;

  const todayKey = "dailyQuote_" + new Date().toDateString();
  let quote = localStorage.getItem(todayKey);

  if (!quote) {
    const index = getDayOfYear() % dailyQuotes.length;
    quote = dailyQuotes[index];
    localStorage.setItem(todayKey, quote);
  }

  quoteEl.innerText = quote;

  // INS ARCHIV SPEICHERN
  saveToArchive(quote);
}
}/***********************
 * ARCHIV – SPEICHERN
 ***********************/
function saveToArchive(quoteText) {
  const today = new Date().toLocaleDateString("de-DE");
  let archive = JSON.parse(localStorage.getItem("quoteArchive")) || [];

  // Schon gespeichert? → nichts tun
  if (archive.some(item => item.date === today)) return;

  archive.unshift({
    date: today,
    text: quoteText
  });

  localStorage.setItem("quoteArchive", JSON.stringify(archive));
}

/***********************
 * BUTTON-LOGIK
 ***********************/
function updateButtons() {
  const h = new Date().getHours();

  morningBtn.disabled = !(h >= 6 && h < 12);
  noonBtn.disabled = !(h >= 12 && h < 18);
  eveningBtn.disabled = !(h >= 18 || h < 6);
}

function showPersonalQuote(type) {
  personalQuoteEl.innerText = personalQuotes[type];
  personalQuoteEl.style.display = "block";
}

/***********************
 * COUNTDOWN (JAHRESENDE)
 ***********************/
function updateCountdown() {
  const now = new Date();
  const end = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
  const diff = end - now;

  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);

  countdownEl.innerText =
    `Noch ${days} Tage und ${hours} Stunden bis Jahresende`;
}

/***********************
 * MENÜ
 ***********************/
let menuOpen = false;

function toggleMenu() {
  menu.style.right = menuOpen ? "-260px" : "0";
  menuOpen = !menuOpen;
}

/***********************
 * NAVIGATION
 ***********************/
archiveLink.onclick = (e) => {
  e.preventDefault();
  mainSection.style.display = "none";
  archiveSection.style.display = "block";
  showArchive();
  toggleMenu();
};

homeLink.onclick = (e) => {
  e.preventDefault();
  archiveSection.style.display = "none";
  mainSection.style.display = "block";
  toggleMenu();
};
};/***********************
 * ARCHIV ANZEIGEN
 ***********************/
function showArchive() {
  const list = document.getElementById("archiveList");
  list.innerHTML = "";

  const archive = JSON.parse(localStorage.getItem("quoteArchive")) || [];

  if (archive.length === 0) {
    list.innerHTML = "<p>Noch keine Zitate gespeichert.</p>";
    return;
  }

  archive.forEach(item => {
    const div = document.createElement("div");
    div.className = "archiveItem";
    div.innerHTML = `
      <div class="archiveDate">${item.date}</div>
      <div>${item.text}</div>
    `;
    list.appendChild(div);
  });
}

archiveLink.onclick = (e) => {
  e.preventDefault();
  mainSection.style.display = "none";
  archiveSection.style.display = "block";
  toggleMenu();
};

/***********************
 * EVENTS
 ***********************/
menuButton.onclick = toggleMenu;
morningBtn.onclick = () => showPersonalQuote("morning");
noonBtn.onclick = () => showPersonalQuote("noon");
eveningBtn.onclick = () => showPersonalQuote("evening");

/***********************
 * START
 ***********************/
updateHeader();
showDailyQuote();
updateButtons();
updateCountdown();

setInterval(() => {
  updateHeader();
  updateButtons();
  updateCountdown();
}, 1000);
