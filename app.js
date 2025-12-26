console.log("fetch test gestartet");

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

  const personalOverlay = document.getElementById("personalOverlay");
  const personalContent = document.getElementById("personalContent");
  const closePersonalBtn = document.getElementById("closePersonalBtn");
  const personalLink = document.getElementById("personalLink");

  const personalText = `
<h2>Mein persönlicher Bereich</h2>
<p>Nur ich als Ersteller ändere diesen Text.</p>
<p>Gedanken, Regeln, Motivation, Vision – alles bleibt hier fest bestehen.</p>
<ul>
  <li>✔ unveränderbar</li>
  <li>✔ strukturiert</li>
  <li>✔ nur vom Ersteller gepflegt</li>
</ul>
`;

  function openPersonal() {
    personalContent.innerHTML = personalText;
    personalOverlay.style.display = "flex";
  }

  function closePersonal() {
    personalOverlay.style.display = "none";
  }

  personalLink.onclick = () => {
    openPersonal();
    document.getElementById("menu").style.right = "-260px";
  };
  closePersonalBtn.onclick = closePersonal;

  let quotesData = null;

  fetch("quotes.json")
    .then(res => res.json())
    .then(data => {
      quotesData = data;
      showDailyQuote();
    })
    .catch(() => { quoteEl.innerText = "Fehler beim Laden der Zitate"; });

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

  function showDailyQuote() {
    if (!quotesData) return;
    const index = getDayOfYear() % quotesData.daily.length;
    const text = quotesData.daily[index];
    quoteEl.innerText = text;
    saveToArchive("Tageszitat", text);
  }

  function showPersonal(type) {
    const list = quotesData.personal[type];
    const q = list[getDayOfYear() % list.length];
    personalEl.innerText = q;
    personalEl.style.display = "block";
    saveToArchive(type, q);
  }

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

  function updateYearCountdown() {
    const now = new Date();
    const end = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
    const diff = end - now;
    if (diff < 0) return;
    const totalSeconds = Math.floor(diff / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    yearCountdownEl.innerText =
      `Noch ${days} Tage ${hours} Std ${minutes} Min ${seconds} Sek bis Jahresende`;
  }

  updateHeader();
  updateButtons();
  updateYearCountdown();
  setInterval(() => {
    updateHeader();
    updateButtons();
    updateYearCountdown();
  }, 1000);

});