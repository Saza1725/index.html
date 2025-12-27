document.addEventListener("DOMContentLoaded", () => {

  const menu = document.getElementById("menu");
  const menuButton = document.getElementById("menuButton");

  const infoOverlay = document.getElementById("infoOverlay");
  const personalOverlay = document.getElementById("personalOverlay");
  const archiveOverlay = document.getElementById("archiveOverlay");

  const infoLink = document.getElementById("infoLink");
  const personalLink = document.getElementById("personalLink");
  const archiveLink = document.getElementById("archiveLink");
  const homeLink = document.getElementById("homeLink");

  const closePersonalBtn = document.getElementById("closePersonalBtn");
  const closeArchiveBtn = document.getElementById("closeArchiveBtn");

  const morningBtn = document.getElementById("morningBtn");
  const noonBtn = document.getElementById("noonBtn");
  const eveningBtn = document.getElementById("eveningBtn");

  const yearCountdownEl = document.getElementById("yearCountdown");
  const personalContent = document.getElementById("personalContent");

  let menuOpen = false;
  let quotesData = null;
  let personalNotes = [];
  let personalWeeklyQuote = "";

  /* ===== Helfer ===== */
  function closeMenu() {
    menu.style.right = "-260px";
    menuOpen = false;
  }

  function hideAll() {
    infoOverlay.classList.remove("show");
    personalOverlay.classList.remove("show");
    archiveOverlay.classList.remove("show");
  }

  function show(el) {
    hideAll();
    closeMenu();
    el.classList.add("show");
  }

  /* ===== MENU ===== */
  menuButton.onclick = () => {
    menu.style.right = menuOpen ? "-260px" : "0";
    menuOpen = !menuOpen;
  };

  homeLink.onclick = () => {
    hideAll();
    closeMenu();
  };

  /* ===== INFO ===== */
  infoLink.onclick = () => show(infoOverlay);
  document.getElementById("infoContent").onclick = () => infoOverlay.classList.remove("show");

  show(infoOverlay); // beim Laden

  /* ===== HEADER + COUNTDOWN ===== */
  function updateHeader() {
    const now = new Date();
    const days = ["So","Mo","Di","Mi","Do","Fr","Sa"];
    document.getElementById("daytime").innerText =
      now.getHours() < 12 ? "Morgen" : now.getHours() < 18 ? "Mittag" : "Abend";
    document.getElementById("weekday").innerText = days[now.getDay()];
    document.getElementById("date").innerText = now.toLocaleDateString("de-DE");
    document.getElementById("time").innerText = now.toLocaleTimeString("de-DE");
  }

  function updateCountdown() {
    const now = new Date();
    const end = new Date(now.getFullYear(),11,31,23,59,59);
    const diff = end - now;
    if(diff <= 0) return;
    const s = Math.floor(diff/1000);
    yearCountdownEl.innerText =
      `Noch ${Math.floor(s/86400)} Tage ${Math.floor(s%86400/3600)} Std ${Math.floor(s%3600/60)} Min ${s%60} Sek`;
  }

  /* ===== BUTTONS ===== */
  function updateButtons() {
    const h = new Date().getHours();
    morningBtn.disabled = !(h>=6 && h<12);
    noonBtn.disabled = !(h>=12 && h<18);
    eveningBtn.disabled = !(h>=18 || h<6);
  }

  /* ===== ZITATE ===== */
  fetch("quotes.json").then(r=>r.json()).then(d=>quotesData=d);
  fetch("notes.json").then(r=>r.json()).then(d=>personalNotes=d.notes||[]);
  fetch("weeklyQuote.json").then(r=>r.json()).then(d=>personalWeeklyQuote=d.weeklyQuote||"");

  function getDayOfYear() {
    const n=new Date(), s=new Date(n.getFullYear(),0,0);
    return Math.floor((n-s)/86400000);
  }

  function showPersonalQuote(type){
    alert(quotesData.personal[type][getDayOfYear()%quotesData.personal[type].length]);
  }

  morningBtn.onclick=()=>showPersonalQuote("morning");
  noonBtn.onclick=()=>showPersonalQuote("noon");
  eveningBtn.onclick=()=>showPersonalQuote("evening");

/* ================== PERSÖNLICHER BEREICH ================== */
function renderPersonal() {
  personalContent.innerHTML = "";

  // NOTIZEN
  const notesSection = document.createElement("div");
  notesSection.className = "personalSection";

  const notesTitle = document.createElement("h3");
  notesTitle.innerText = "Meine Notizen";
  notesSection.appendChild(notesTitle);

  if (personalNotes.length === 0) {
    const p = document.createElement("p");
    p.innerText = "Keine Notizen vorhanden.";
    notesSection.appendChild(p);
  } else {
    personalNotes.forEach(n => {
      const div = document.createElement("div");
      div.className = "note";
      div.innerText = n;
      notesSection.appendChild(div);
    });
  }

  personalContent.appendChild(notesSection);

  // WOCHENZITAT
  const quoteSection = document.createElement("div");
  quoteSection.className = "personalSection";

  const quoteTitle = document.createElement("h3");
  quoteTitle.innerText = "Zitat der Woche";
  quoteSection.appendChild(quoteTitle);

  if (personalWeeklyQuote) {
    const div = document.createElement("div");
    div.className = "quoteBox";
    div.innerText = personalWeeklyQuote;
    quoteSection.appendChild(div);
  } else {
    const p = document.createElement("p");
    p.innerText = "Kein Wochenzitat vorhanden.";
    quoteSection.appendChild(p);
  }

  personalContent.appendChild(quoteSection);
}

/* ================== ARCHIV ================== */
function showArchive() {
  if (!quotesData) return;
  monthDetail.innerHTML = "";

  // Tägliche Zitate
  const dailyDiv = document.createElement("div");
  dailyDiv.className = "archiveSection";
  const dailyTitle = document.createElement("h3");
  dailyTitle.innerText = "Tägliche Zitate";
  dailyDiv.appendChild(dailyTitle);

  quotesData.daily.forEach(q => {
    const div = document.createElement("div");
    div.className = "archiveItem";
    div.innerText = q;
    dailyDiv.appendChild(div);
  });
  monthDetail.appendChild(dailyDiv);

  // Persönliche Zitate
  const personalDiv = document.createElement("div");
  personalDiv.className = "archiveSection";
  const personalTitle = document.createElement("h3");
  personalTitle.innerText = "Persönliche Zitate";
  personalDiv.appendChild(personalTitle);

  ["morning", "noon", "evening"].forEach(type => {
    quotesData.personal[type].forEach(q => {
      const div = document.createElement("div");
      div.className = "archiveItem";
      div.innerText = `${type.charAt(0).toUpperCase() + type.slice(1)}: ${q}`;
      personalDiv.appendChild(div);
    });
  });

  monthDetail.appendChild(personalDiv);
}
  /* ===== START ===== */
  updateHeader();
  updateButtons();
  updateCountdown();
  setInterval(()=>{updateHeader();updateButtons();updateCountdown();},1000);

});