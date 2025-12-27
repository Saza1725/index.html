document.addEventListener("DOMContentLoaded", () => {
  // DOM
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
  const personalContent = document.getElementById("personalContent");
  const archiveOverlay = document.getElementById("archiveOverlay");
  const monthsContainer = document.getElementById("monthsContainer");
  const monthDetail = document.getElementById("monthDetail");
  const backBtn = document.getElementById("backBtn");
  const closeArchiveBtn = document.getElementById("closeArchiveBtn");
  const infoOverlay = document.getElementById("infoOverlay");
  const closeInfoBtn = document.getElementById("closeInfoBtn");

  let menuOpen = false;
  let quotesData = null;
  let personalNotes = [];
  let personalWeeklyQuote = "";

  // MENU
  menuButton.onclick = () => {
    menu.style.right = menuOpen ? "-260px" : "0";
    menuOpen = !menuOpen;
  };
  [homeLink, personalLink, archiveLink].forEach(l => {
    l.onclick = () => { menu.style.right = "-260px"; menuOpen = false; };
  });

  // HEADER
  function getCategory() {
    const h = new Date().getHours();
    return h >= 6 && h < 12 ? "Morgen" : h < 18 ? "Mittag" : "Abend";
  }
  function updateHeader() {
    const now = new Date();
    const days = ["So","Mo","Di","Mi","Do","Fr","Sa"];
    document.getElementById("daytime").innerText = getCategory();
    document.getElementById("weekday").innerText = days[now.getDay()];
    document.getElementById("date").innerText = now.toLocaleDateString("de-DE");
    document.getElementById("time").innerText = now.toLocaleTimeString("de-DE");
  }

  // COUNTDOWN
  function updateYearCountdown() {
    const now = new Date();
    const end = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
    const diff = end - now;
    if(diff<=0) return;
    const sec = Math.floor(diff/1000);
    const d = Math.floor(sec/86400);
    const h = Math.floor((sec%86400)/3600);
    const m = Math.floor((sec%3600)/60);
    const s = sec%60;
    yearCountdownEl.innerText = `Noch ${d} Tage ${h} Std ${m} Min ${s} Sek bis Jahresende`;
  }

  // ZITATE
  fetch("quotes.json")
    .then(res=>res.json())
    .then(data=>{ quotesData=data; showDailyQuote(); })
    .catch(()=>{ quoteEl.innerText="Zitate konnten nicht geladen werden."; });

  function getDayOfYear() {
    const now = new Date();
    const start = new Date(now.getFullYear(),0,0);
    return Math.floor((now-start)/86400000);
  }

  function showDailyQuote() {
    if(!quotesData) return;
    const index = getDayOfYear()%quotesData.daily.length;
    quoteEl.innerText = quotesData.daily[index];
  }

  // ZEITBUTTONS
  morningBtn.onclick = ()=>showPersonalQuote("morning");
  noonBtn.onclick = ()=>showPersonalQuote("noon");
  eveningBtn.onclick = ()=>showPersonalQuote("evening");

  function showPersonalQuote(type){
    if(!quotesData) return;
    const list = quotesData.personal[type];
    personalQuoteEl.innerText = list[getDayOfYear()%list.length];
    personalQuoteEl.style.display="block";
  }

  function updateButtons(){
    const h = new Date().getHours();
    morningBtn.disabled = !(h>=6 && h<12);
    noonBtn.disabled = !(h>=12 && h<18);
    eveningBtn.disabled = !(h>=18 || h<6);
  }

  // PERSÖNLICHER BEREICH
  personalLink.onclick = ()=>{ personalOverlay.style.display="flex"; renderPersonal(); };
  closePersonalBtn.onclick = ()=>{ personalOverlay.style.display="none"; };

  function renderPersonal(){
    personalContent.innerHTML="";

    // Notizen
    const notesSection = document.createElement("div");
    notesSection.classList.add("personalSection");
    notesSection.innerHTML="<h3>Meine Notizen</h3>";
    if(personalNotes.length===0){
      notesSection.innerHTML+="<p>Keine Notizen vorhanden.</p>";
    }else{
      personalNotes.forEach(n=>{
        const div=document.createElement("div");
        div.classList.add("note");
        div.innerText=n;
        notesSection.appendChild(div);
      });
    }
    personalContent.appendChild(notesSection);

    // Wochenzitat
    const quoteSection = document.createElement("div");
    quoteSection.classList.add("personalSection");
    quoteSection.innerHTML="<h3>Zitat der Woche</h3>";
    if(personalWeeklyQuote){
      const div=document.createElement("div");
      div.classList.add("quoteBox");
      div.innerText=personalWeeklyQuote;
      quoteSection.appendChild(div);
    }else{
      quoteSection.innerHTML+="<p>Kein Wochenzitat vorhanden.</p>";
    }
    personalContent.appendChild(quoteSection);
  }

  // LADEN NOTES & WEEKLY
  fetch("notes.json")
    .then(res=>res.json())
    .then(data=>{ personalNotes=data.notes||[]; })
    .catch(()=>{ personalNotes=[]; });

  fetch("weeklyQuote.json")
    .then(res=>res.json())
    .then(data=>{ personalWeeklyQuote=data.weeklyQuote||""; })
    .catch(()=>{ personalWeeklyQuote=""; });

  // ARCHIV
  function showMonths(){ monthsContainer.innerHTML=""; monthDetail.style.display="none"; backBtn.style.display="none";
    const btn=document.createElement("button"); btn.innerText="Unsere Gemeinsame Motivation"; btn.onclick=showMonthDetail; monthsContainer.appendChild(btn);
  }
  function showMonthDetail(){
    monthsContainer.innerHTML=""; backBtn.style.display="block"; monthDetail.style.display="block";
    monthDetail.innerHTML="<h3>Archiv</h3>";
    if(quotesData){
      const dailySection=document.createElement("div"); dailySection.innerHTML="<h4>Tägliche Zitate</h4>";
      quotesData.daily.forEach(q=>{ const d=document.createElement("div"); d.classList.add("archiveItem"); d.innerText=q; dailySection.appendChild(d); });
      monthDetail.appendChild(dailySection);

      ["morning","noon","evening"].forEach(t=>{
        const sec=document.createElement("div"); sec.innerHTML=`<h4>${t.charAt(0).toUpperCase()+t.slice(1)} Zitate</h4>`;
        quotesData.personal[t].forEach(q=>{ const d=document.createElement("div"); d.classList.add("archiveItem"); d.innerText=q; sec.appendChild(d); });
        monthDetail.appendChild(sec);
      });
    }
  }

  archiveLink.onclick=()=>{ archiveOverlay.style.display="flex"; showMonths(); };
  closeArchiveBtn.onclick=()=>{ archiveOverlay.style.display="none"; };
  backBtn.onclick=showMonths;

  // INFO OVERLAY
  function showInfoOverlay(){ infoOverlay.classList.add("show"); }
  closeInfoBtn.onclick=()=>{ infoOverlay.classList.remove("show"); }
  showInfoOverlay();

  const infoLink = document.createElement("a");
  infoLink.href="#";
  infoLink.innerText="Information";
  infoLink.onclick=(e)=>{ e.preventDefault(); showInfoOverlay(); return false; };
  menu.appendChild(infoLink);

  // START
  updateHeader();
  updateButtons();
  updateYearCountdown();
  setInterval(()=>{ updateHeader(); updateButtons(); updateYearCountdown(); },1000);

});