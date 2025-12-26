console.log("fetch test gestartet");

fetch("quotes.json")
  .then(res => {
    console.log("Response ok:", res.ok); // true = Datei erreichbar
    return res.json();
  })
  .then(data => {
    console.log("Daten geladen:", data); // zeigt die Inhalte der JSON
  })
  .catch(err => console.error("Fehler beim Laden der Zitate:", err));

document.addEventListener("DOMContentLoaded", () => {

  const quoteEl = document.getElementById("quote");
  const personalEl = document.getElementById("personalQuote");
  const morningBtn = document.getElementById("morningBtn");
  const noonBtn = document.getElementById("noonBtn");
  const eveningBtn = document.getElementById("eveningBtn");
  const archiveOverlay = document.getElementById("archiveOverlay");
  const archiveList = document.getElementById("archiveList");
  const closeArchiveBtn = document.getElementById("closeArchiveBtn");
  const menuButton = document.getElementById("menuButton");

  let quotesData = null;

  fetch("quotes.json")
    .then(res => res.json())
    .then(data => {
      quotesData = data;
      showDailyQuote();
    })
    .catch(() => quoteEl.innerText = "Fehler beim Laden");

  // ⬇️ alle Funktionen hier (getDayOfYear, showDailyQuote, etc.)

  closeArchiveBtn.onclick = closeArchive;
});


// Zitate laden
fetch("quotes.json")
  .then(res => res.json())
  .then(data => {
    quotesData = data;
    showDailyQuote();
  })
  .catch(err => {
    console.error("Fehler beim Laden der Zitate:", err);
    quoteEl.innerText = "Fehler beim Laden der Zitate";
  });

// ===================
// Hilfsfunktionen
// ===================
function getDayOfYear() {
  const now = new Date();
  const start = new Date(now.getFullYear(),0,0);
  return Math.floor((now-start)/86400000);
}

function getCategory() {
  const h = new Date().getHours();
  if(h >= 6 && h < 12) return "morning";
  if(h >= 12 && h < 18) return "noon";
  return "evening";
}

function updateHeader() {
  const now = new Date();
  const days = ["So","Mo","Di","Mi","Do","Fr","Sa"];
  document.getElementById("daytime").innerText = getCategory()==="morning"?"Morgen":getCategory()==="noon"?"Mittag":"Abend";
  document.getElementById("weekday").innerText = days[now.getDay()];
  document.getElementById("date").innerText = now.toLocaleDateString("de-DE");
  document.getElementById("time").innerText = now.toLocaleTimeString("de-DE");
}

// Tageszitat
function showDailyQuote() {
  if(!quotesData) return;
  const index = getDayOfYear() % quotesData.daily.length;
  quoteEl.innerText = quotesData.daily[index];
  saveToArchive("daily", quotesData.daily[index]);
}

// Persönliche Zitate
function showPersonal(cat) {
  if (!quotesData) return;

  const dayIndex = getDayOfYear();
  const list = quotesData.personal[cat];
  const q = list[dayIndex % list.length];

  personalEl.innerText = q;
  personalEl.style.display = "block";

  saveToArchive(cat, q);
}

// Archiv speichern
function saveToArchive(type, text) {
  const today = new Date().toLocaleDateString("de-DE");
  let archive = JSON.parse(localStorage.getItem("archive")) || [];

  // Prüfen: existiert dieser Eintrag heute schon?
  const exists = archive.some(
    item => item.date === today && item.type === type
  );

  if (!exists) {
    archive.unshift({ date: today, type, text });
    localStorage.setItem("archive", JSON.stringify(archive));
  }
}

// Archiv anzeigen
function openArchive() {
  archiveSection.style.display = "block";
  archiveList.innerHTML = "";
  const archive = JSON.parse(localStorage.getItem("archive")) || [];
  archive.forEach(item => {
    const div = document.createElement("div");
    div.className = "archiveItem";
    div.innerHTML = `<div>${item.date} · ${item.type}</div>${item.text}`;
    archiveList.appendChild(div);
  });
}

document.addEventListener("DOMContentLoaded", () => {

  // 👉 DEIN KOMPLETTER JS-CODE KOMMT HIER REIN

});

const closeArchiveBtn = document.getElementById("closeArchiveBtn");

  const archive = JSON.parse(localStorage.getItem("archive")) || [];

  archive.forEach(item => {
    const div = document.createElement("div");
    div.className = "archiveItem";
    div.innerHTML = `
      <div class="date">${item.date} · ${item.type}</div>
      <div>${item.text}</div>
    `;
    archiveList.appendChild(div);
  });
}

function closeArchive() {
  archiveOverlay.style.display = "none";
}


// Buttons aktivieren je nach Tageszeit
function updateButtons() {
  const h = new Date().getHours();
  morningBtn.disabled = !(h>=6 && h<12);
  noonBtn.disabled = !(h>=12 && h<18);
  eveningBtn.disabled = !(h>=18 || h<6);
}

// Menü-Button (rechts oben)
let menuOpen = false;
menuButton.onclick = () => {
  document.getElementById("menu").style.right = menuOpen ? "-260px" : "0";
  menuOpen = !menuOpen;
};

// Menü-Links
document.getElementById("archiveLink").onclick = () => {
  openArchive();
  document.getElementById("menu").style.right = "-260px";
};

document.getElementById("homeLink").onclick = () => {
  closeArchive();
  document.getElementById("menu").style.right = "-260px";
};

closeArchiveBtn.onclick = closeArchive;


// Start & Intervalle
updateHeader();
showDailyQuote();
updateButtons();
setInterval(()=>{
  updateHeader();
  updateButtons();
},1000);

morningBtn.onclick = () => showPersonal("morning");
noonBtn.onclick = () => showPersonal("noon");
eveningBtn.onclick = () => showPersonal("evening");


function updateYearCountdown() {
  const now = new Date();
  const end = new Date(now.getFullYear(), 11, 31, 23, 59, 59); // 31. Dez 23:59:59

  let diff = end - now; // Millisekunden
  if(diff < 0) return; // Jahr vorbei

  const totalDays = Math.floor(diff / (1000 * 60 * 60 * 24));

  // Monate ungefähr berechnen (30 Tage pro Monat)
  const months = Math.floor(totalDays / 30);
  const days = totalDays % 30;

  const hours = Math.floor(diff / (1000 * 60 * 60)) % 24;
  const minutes = Math.floor(diff / (1000 * 60)) % 60;
  const seconds = Math.floor(diff / 1000) % 60;

  document.getElementById("yearCountdown").innerText =
    `Noch ${months} Monate ${days} Tage ${hours} Stunden ${minutes} Minuten ${seconds} Sekunden bis Jahresende`;
}

// Countdown starten und jede Sekunde aktualisieren
updateYearCountdown();
setInterval(updateYearCountdown, 1000);

