document.addEventListener("DOMContentLoaded", () => {
  const morningBtn = document.getElementById("morningBtn");
  const noonBtn = document.getElementById("noonBtn");
  const eveningBtn = document.getElementById("eveningBtn");
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
  const monthDetail = document.getElementById("monthDetail");
  const closeArchiveBtn = document.getElementById("closeArchiveBtn");

  const infoOverlay = document.getElementById("infoOverlay");
  const closeInfoBtn = document.getElementById("closeInfoBtn");

  const dailyMotivationText = document.getElementById("dailyMotivationText");
  const yearCountdownEl = document.getElementById("yearCountdown");

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

  // Info Overlay anzeigen
function showInfo() {
  infoOverlay.style.display = "flex";
  infoOverlay.classList.remove("slideIn");
  void infoOverlay.offsetWidth; // Reflow für wiederholtes Abspielen
  infoOverlay.classList.add("slideIn");
}

// Klick auf den Text schließt Overlay
document.getElementById("infoContent").onclick = () => {
  infoOverlay.style.display = "none";
};

// Info Overlay sofort beim Laden anzeigen
showInfo();

// Info Overlay erneut anzeigen, wenn der Menüpunkt geklickt wird
infoLink.onclick = showInfo;

  /* HEADER + COUNTDOWN */
  function getCategory() {
    const h = new Date().getHours();
    return h >=6 && h<12 ? "Morgen" : h<18 ? "Mittag" : "Abend";
  }
  function updateHeader() {
    const now = new Date();
    const days = ["So","Mo","Di","Mi","Do","Fr","Sa"];
    document.getElementById("daytime").innerText = getCategory();
    document.getElementById("weekday").innerText = days[now.getDay()];
    document.getElementById("date").innerText = now.toLocaleDateString("de-DE");
    document.getElementById("time").innerText = now.toLocaleTimeString("de-DE");
  }
  function updateYearCountdown(){
    const now = new Date();
    const end = new Date(now.getFullYear(),11,31,23,59,59);
    const diff = end-now;
    if(diff<=0){ yearCountdownEl.innerText=""; return; }
    const sec = Math.floor(diff/1000);
    const d = Math.floor(sec/86400);
    const h = Math.floor((sec%86400)/3600);
    const m = Math.floor((sec%3600)/60);
    const s = sec%60;
    yearCountdownEl.innerText = `Noch ${d} Tage ${h} Std ${m} Min ${s} Sek bis Jahresende`;
  }

  /* BUTTONS */
  function updateButtons() {
    const h = new Date().getHours();
    morningBtn.disabled = !(h>=6 && h<12);
    noonBtn.disabled = !(h>=12 && h<18);
    eveningBtn.disabled = !(h>=18 || h<6);
  }

  /* ZITATE LADEN */
  fetch("quotes.json")
    .then(res=>res.json())
    .then(data=>{ quotesData=data; })
    .catch(()=>{ console.error("quotes.json konnte nicht geladen werden"); });

  function getDayOfYear(){
    const now = new Date();
    const start = new Date(now.getFullYear(),0,0);
    return Math.floor((now-start)/86400000);
  }

  function showPersonalQuote(type){
    if(!quotesData) return;
    const list = quotesData.personal[type];
    alert(list[getDayOfYear()%list.length]);
  }
  morningBtn.onclick = ()=>showPersonalQuote("morning");
  noonBtn.onclick = ()=>showPersonalQuote("noon");
  eveningBtn.onclick = ()=>showPersonalQuote("evening");

  /* PERSÖNLICH */
  personalLink.onclick=()=>{
    personalOverlay.style.display="flex";
    renderPersonal();
  };
  closePersonalBtn.onclick=()=>personalOverlay.style.display="none";

  function renderPersonal(){
    personalContent.innerHTML="";
    const notesSection=document.createElement("div");
    notesSection.classList.add("personalSection");
    notesSection.innerHTML="<h3>Meine Notizen</h3>";
    if(personalNotes.length===0){
      notesSection.innerHTML+="<p>Keine Notizen vorhanden.</p>";
    } else {
      personalNotes.forEach(n=>{
        const div=document.createElement("div");
        div.classList.add("note");
        div.innerText=n;
        notesSection.appendChild(div);
      });
    }
    personalContent.appendChild(notesSection);

    const quoteSection=document.createElement("div");
    quoteSection.classList.add("personalSection");
    quoteSection.innerHTML="<h3>Zitat der Woche</h3>";
    if(personalWeeklyQuote){
      const div=document.createElement("div");
      div.classList.add("quoteBox");
      div.innerText=personalWeeklyQuote;
      quoteSection.appendChild(div);
    } else {
      quoteSection.innerHTML+="<p>Kein Wochenzitat vorhanden.</p>";
    }
    personalContent.appendChild(quoteSection);
  }

  fetch("notes.json")
    .then(res=>res.json())
    .then(data=>{ personalNotes=data.notes||[]; })
    .catch(()=>{ personalNotes=[]; });

  fetch("weeklyQuote.json")
    .then(res=>res.json())
    .then(data=>{ personalWeeklyQuote=data.weeklyQuote||""; })
    .catch(()=>{ personalWeeklyQuote=""; });

  /* ARCHIV */
  function showArchive(){
    if(!quotesData) return;
    monthDetail.innerHTML="";
    const dailyDiv=document.createElement("div");
    dailyDiv.innerHTML="<h3>Tägliche Zitate</h3>";
    quotesData.daily.forEach(q=>{
      const div=document.createElement("div");
      div.className="archiveItem";
      div.innerText=q;
      dailyDiv.appendChild(div);
    });
    monthDetail.appendChild(dailyDiv);

    const personalDiv=document.createElement("div");
    personalDiv.innerHTML="<h3>Persönliche Zitate</h3>";
    ["morning","noon","evening"].forEach(type=>{
      quotesData.personal[type].forEach(q=>{
        const div=document.createElement("div");
        div.className="archiveItem";
        div.innerText=`${type.charAt(0).toUpperCase()+type.slice(1)}: ${q}`;
        personalDiv.appendChild(div);
      });
    });
    monthDetail.appendChild(personalDiv);
  }
  archiveLink.onclick=()=>{
    archiveOverlay.style.display="flex";
    showArchive();
  };
  closeArchiveBtn.onclick=()=>archiveOverlay.style.display="none";

  /* START */
  updateHeader();
  updateButtons();
  updateYearCountdown();
  setInterval(()=>{
    updateHeader();
    updateButtons();
    updateYearCountdown();
  },1000);

});