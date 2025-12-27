document.addEventListener("DOMContentLoaded", () => {

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
  const infoLink = document.getElementById("infoLink");
  const personalOverlay = document.getElementById("personalOverlay");
  const closePersonalBtn = document.getElementById("closePersonalBtn");
  const personalContent = document.getElementById("personalContent");
  const archiveOverlay = document.getElementById("archiveOverlay");
  const monthsContainer = document.getElementById("monthsContainer");
  const monthDetail = document.getElementById("monthDetail");
  const backBtn = document.getElementById("backBtn");
  const closeArchiveBtn = document.getElementById("closeArchiveBtn");

  const infoOverlay = document.getElementById("infoOverlay");
  const infoContent = document.getElementById("infoContent");

  let menuOpen = false;
  let quotesData = null;
  let personalNotes = [];
  let personalWeeklyQuote = "";

  /* MENU */
  menuButton.onclick = () => {
    menu.style.right = menuOpen ? "-260px" : "0";
    menuOpen = !menuOpen;
  };
  [homeLink, personalLink, archiveLink, infoLink].forEach(link => {
    link.onclick = () => { menu.style.right = "-260px"; menuOpen = false; };
  });

  /* HEADER */
  function getCategory() {
    const h = new Date().getHours();
    return h >=6 && h<12?"Morgen":h<18?"Mittag":"Abend";
  }
  function updateHeader() {
    const now = new Date();
    const days=["So","Mo","Di","Mi","Do","Fr","Sa"];
    document.getElementById("daytime").innerText = getCategory();
    document.getElementById("weekday").innerText = days[now.getDay()];
    document.getElementById("date").innerText = now.toLocaleDateString("de-DE");
    document.getElementById("time").innerText = now.toLocaleTimeString("de-DE");
  }

  /* COUNTDOWN */
  function updateYearCountdown() {
    const now = new Date();
    const end = new Date(now.getFullYear(),11,31,23,59,59);
    const diff = end - now;
    if(diff<=0) return;
    const sec=Math.floor(diff/1000);
    const d=Math.floor(sec/86400);
    const h=Math.floor((sec%86400)/3600);
    const m=Math.floor((sec%3600)/60);
    const s=sec%60;
    yearCountdownEl.innerText=`Noch ${d} Tage ${h} Std ${m} Min ${s} Sek bis Jahresende`;
  }

  /* ZITATE LADEN */
  fetch("quotes.json")
    .then(res => res.json())
    .then(data => { quotesData=data; showDailyQuote(); })
    .catch(()=>{quoteEl.innerText="Zitate konnten nicht geladen werden.";});

  function getDayOfYear() {
    const now = new Date();
    const start = new Date(now.getFullYear(),0,0);
    return Math.floor((now-start)/86400000);
  }

  function showDailyQuote() {
    if(!quotesData) return;
    const index = getDayOfYear()%quotesData.daily.length;
    quoteEl.innerText=quotesData.daily[index];
  }

  /* ZEITBUTTONS */
  morningBtn.onclick=()=>showPersonalQuote("morning");
  noonBtn.onclick=()=>showPersonalQuote("noon");
  eveningBtn.onclick=()=>showPersonalQuote("evening");

  function showPersonalQuote(type){
    if(!quotesData) return;
    const list=quotesData.personal[type];
    personalQuoteEl.innerText=list[getDayOfYear()%list.length];
    personalQuoteEl.style.display="block";
  }

  function updateButtons(){
    const h=new Date().getHours();
    morningBtn.disabled=!(h>=6 && h<12);
    noonBtn.disabled=!(h>=12 && h<18);
    eveningBtn.disabled=!(h>=18 || h<6);
  }

  /* PERSÖNLICHER BEREICH */
  personalLink.onclick=()=>{personalOverlay.style.display="flex"; renderPersonal();};
  closePersonalBtn.onclick=()=>{personalOverlay.style.display="none";};

  function renderPersonal(){
    personalContent.innerHTML="";

    // Notizen
    const notesSection = document.createElement("div");
    notesSection.classList.add("personalSection");
    notesSection.innerHTML="<h3>Meine Notizen</h3>";
    if(personalNotes.length===0) notesSection.innerHTML+="<p>Keine Notizen vorhanden.</p>";
    else personalNotes.forEach(n=>{const div=document.createElement("div"); div.classList.add("archiveItem"); div.innerText=n; notesSection.appendChild(div);});
    personalContent.appendChild(notesSection);

    // Wochenzitat
    const quoteSection=document.createElement("div");
    quoteSection.classList.add("personalSection");
    quoteSection.innerHTML="<h3>Zitat der Woche</h3>";
    if(personalWeeklyQuote){const div=document.createElement("div"); div.classList.add("archiveItem"); div.innerText=personalWeeklyQuote; quoteSection.appendChild(div);}
    else quoteSection.innerHTML+="<p>Kein Wochenzitat vorhanden.</p>";
    personalContent.appendChild(quoteSection);
  }

  /* NOTES & WOCHENZITAT LADEN */
  fetch("notes.json").then(r=>r.json()).then(d=>{personalNotes=d.notes||[];}).catch(()=>{personalNotes=[];});
  fetch("weeklyQuote.json").then(r=>r.json()).then(d=>{personalWeeklyQuote=d.weeklyQuote||"";}).catch(()=>{personalWeeklyQuote="";});

  /* ARCHIV */
  function showMonths(){
    monthsContainer.innerHTML="";
    monthDetail.style.display="none";
    backBtn.style.display="none";

    const dailyQuotes = quotesData? quotesData.daily : [];
    const personalQuotes = quotesData? quotesData.personal : {};

    // Tägliche Zitate
    const dailySection=document.createElement("div");
    dailySection.innerHTML="<h3>Tägliche Zitate</h3>";
    dailyQuotes.forEach(q=>{const div=document.createElement("div"); div.classList.add("archiveItem"); div.innerText=q; dailySection.appendChild(div);});
    monthDetail.appendChild(dailySection);

    // Persönliche Zitate
    const personalSection=document.createElement("div");
    personalSection.innerHTML="<h3>Persönliche Zitate</h3>";
    ["morning","noon","evening"].forEach(t=>{if(personalQuotes[t]) personalQuotes[t].forEach(q=>{const div=document.createElement("div"); div.classList.add("archiveItem"); div.innerText=q; personalSection.appendChild(div);});});
    monthDetail.appendChild(personalSection);
  }

  archiveLink.onclick=()=>{archiveOverlay.style.display="flex"; showMonths();};
  closeArchiveBtn.onclick=()=>{archiveOverlay.style.display="none";};
  backBtn.onclick=showMonths;

  /* INFO OVERLAY */
  const infoText="Willkommen auf unserer Motivationsseite! Hier findest du tägliche Impulse, persönliche Notizen und Wochenzitate.";
  function showInfo(){infoContent.innerText=infoText; infoOverlay.classList.add("show");}
  infoOverlay.onclick=()=>infoOverlay.classList.remove("show");
  showInfo(); // direkt beim Laden
  infoLink.onclick=(e)=>{e.preventDefault(); showInfo();};

  /* START */
  updateHeader();
  updateButtons();
  updateYearCountdown();
  setInterval(()=>{updateHeader(); updateButtons(); updateYearCountdown();},1000);

});