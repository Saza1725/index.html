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
  const menuButton = document.getElementById("menuButton");

  const archiveOverlay = document.getElementById("archiveOverlay");
  const archiveList = document.getElementById("archiveList");
  const closeArchiveBtn = document.getElementById("closeArchiveBtn");

  const yearCountdownEl = document.getElementById("yearCountdown");

  let quotesData = null;
  
  const personalText = `
<h2>Mein persönlicher Bereich</h2>

<p>
Das hier ist mein persönlicher Text.
Nur ich als Ersteller ändere ihn.
</p>

<p>
Gedanken, Regeln, Motivation, Vision –
alles bleibt hier fest bestehen.
</p>

<ul>
  <li>✔ unveränderbar</li>
  <li>✔ strukturiert</li>
  <li>✔ nur vom Ersteller gepflegt</li>
</ul>
`;

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
    saveToArchive(type, q);
  }

  // =====================
  // ARCHIV
  // =====================
  function saveToArchive(type, text) {
    const today = new Date().toLocaleDateString("de-DE");
    let archive = JSON.parse(localStorage.getItem("archive")) || [];

    if (!archive.some(i => i.date === today && i.type === type)) {
      archive.unshift({ date: today, type, text });
      localStorage.setItem("archive", JSON.stringify(archive));
    }
  }

  function openArchive() {
    archiveOverlay.style.display = "flex";
    archiveList.innerHTML = "";

    const archive = JSON.parse(localStorage.getItem("archive")) || [];
    archive.forEach(item => {
      const div = document.createElement("div");
      div.className = "archiveItem";
      div.innerHTML = `<strong>${item.date} · ${item.type}</strong><br>${item.text}`;
      archiveList.appendChild(div);
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

  morningBtn.onclick = () => showPersonal("morning");
  noonBtn.onclick = () => showPersonal("noon");
  eveningBtn.onclick = () => showPersonal("evening");

  menuButton.onclick = openArchive;
  closeArchiveBtn.onclick = closeArchive;

  // =====================
  // ✅ JAHRES COUNTDOWN
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

