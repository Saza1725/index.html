document.addEventListener("DOMContentLoaded", () => {

  // ======= DOM ELEMENTE =======
  const quoteEl = document.getElementById("quote");
  const personalEl = document.getElementById("personalQuote");
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
  const personalContent = document.getElementById("personalContent");
  const closePersonalBtn = document.getElementById("closePersonalBtn");

  const archiveOverlay = document.getElementById("archiveOverlay");
  const monthsContainer = document.getElementById("monthsContainer");
  const monthDetail = document.getElementById("monthDetail");
  const backBtn = document.getElementById("backBtn");
  const closeArchiveBtn = document.getElementById("closeArchiveBtn");

  let menuOpen = false;
  let quotesData = null;
  let personalNotes = [];
  let personalWeeklyQuote = "";

  // ======= MENU SLIDE =======
  menuButton.onclick = () => {
    menu.style.right = menuOpen ? "-260px" : "0";
    menuOpen = !menuOpen;
  };
  [homeLink, archiveLink, personalLink].forEach(link => {
    link.onclick = () => { menu.style.right = "-260px"; menuOpen = false; };
  });

  // ======= PERSÖNLICHER BEREICH (nur lesen) =======
  personalLink.onclick = () => {
    personalOverlay.style.display = "flex";
    showPersonalContent();
  };
  closePersonalBtn.onclick = () => personalOverlay.style.display = "none";

  function showPersonalContent() {
    personalContent.innerHTML = `<h2>Persönlicher Bereich</h2>`;

    // Notizen anzeigen
    if(personalNotes.length === 0) {
      personalContent.innerHTML += "<p>Keine Notizen vorhanden.</p>";
    } else {
      personalContent.innerHTML += "<h3>Notizen</h3>";
      personalNotes.forEach(n => {
        personalContent.innerHTML += `<div class="archiveItem">${n}</div>`;
      });
    }

    // Wochenzitat anzeigen
    if(personalWeeklyQuote) {
      personalContent.innerHTML += `<h3>Persönliches Zitat der Woche</h3>
                                    <div class="archiveItem">${personalWeeklyQuote}</div>`;
    }
  }

  // ======= ZITATE LADEN =======
  fetch("quotes.json")
    .then(res => { if(!res.ok) throw new Error("quotes.json nicht gefunden"); return res.json(); })
    .then(data => { quotesData = data; showDailyQuote(); })
    .catch(err => { console.error(err); quoteEl.innerText = "Fehler beim Laden der Zitate"; });

// ======= NOTIZEN LADEN =======
fetch("notes.json")
  .then(res => res.json())
  .then(data => {
    const notesEl = document.getElementById("notesContent");
    if (notesEl) notesEl.innerText = data.text;
  })
  .catch(() => {
    const notesEl = document.getElementById("notesContent");
    if (notesEl) notesEl.innerText = "Keine Notizen vorhanden.";
  });

// ======= WOCHENZITAT LADEN =======
const weeklyQuoteEl = document.getElementById("weeklyQuote");

fetch("weeklyQuote.json")
  .then(res => {
    if (!res.ok) throw new Error("weeklyQuote.json fehlt");
    return res.json();
  })
  .then(data => {
    if (data.text && data.text.trim() !== "") {
      weeklyQuoteEl.innerText =text;
    } else {
      weeklyQuoteEl.innerText = "Kein Wochenzitat vorhanden";
    }
  })
  .catch(() => {
    weeklyQuoteEl.innerText = "Kein Wochenzitat vorhanden";
  });
  // Persönliche Notizen laden
  fetch("notes.json")
    .then(res => res.json())
    .then(data => { personalNotes = data.notes || []; })
    .catch(err => console.error("notes.json konnte nicht geladen werden", err));

  fetch("weeklyQuote.json")
    .then(res => res.json())
    .then(data => { personalWeeklyQuote = data.quote || ""; })
    .catch(err => console.error("weeklyQuote.json konnte nicht geladen werden", err));

  function getDayOfYear() { const now = new Date(); const start = new Date(now.getFullYear(),0,0); return Math.floor((now-start)/86400000); }
  function getCategory() { const h=new Date().getHours(); return h>=6&&h<12?"morning":h>=12&&h<18?"noon":"evening"; }
  function updateHeader() { const now=new Date(); const days=["So","Mo","Di","Mi","Do","Fr","Sa"]; document.getElementById("daytime").innerText=getCategory()==="morning"?"Morgen":getCategory()==="noon"?"Mittag":"Abend"; document.getElementById("weekday").innerText=days[now.getDay()]; document.getElementById("date").innerText=now.toLocaleDateString("de-DE"); document.getElementById("time").innerText=now.toLocaleTimeString("de-DE"); }

  // ======= TAGESZITAT + ARCHIV =======
  function showDailyQuote() {
    if(!quotesData) return;
    const index = getDayOfYear() % quotesData.daily.length;
    const text = quotesData.daily[index];
    quoteEl.innerText = text;
    saveDailyQuoteToArchive(text);
  }

  function saveDailyQuoteToArchive(text) {
    const now=new Date();
    const startDate=new Date(2025,11,27);
    const endDate=new Date(2026,11,31);
    if(now<startDate||now>endDate) return;
    const dateStr=now.toLocaleDateString("de-DE");
    const monthKey=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}`;
    let archive=JSON.parse(localStorage.getItem("archive"))||{};
    if(!archive[monthKey]) archive[monthKey]=[];
    if(!archive[monthKey].some(e=>e.date===dateStr)){ archive[monthKey].push({date:dateStr,text}); localStorage.setItem("archive",JSON.stringify(archive)); }
  }

  // ======= ARCHIV =======
  const months = [];
  for(let y=2025;y<=2026;y++){
    const startM = y===2025?12:1;
    for(let m=startM;m<=12;m++){
      months.push({year:y,month:m});
    }
  }

  function showMonths(){
    monthDetail.style.display="none";
    backBtn.style.display="none";
    monthsContainer.style.display="flex";
    monthsContainer.innerHTML="";
    months.forEach(({year,month})=>{
      const btn=document.createElement("button");
      const date=new Date(year,month-1,1);
      btn.innerText=date.toLocaleDateString("de-DE",{month:"long",year:"numeric"});
      btn.onclick=()=>showMonthDetail(year,month);
      monthsContainer.appendChild(btn);
    });
  }

  function showMonthDetail(year,month){
    monthsContainer.style.display="none";
    backBtn.style.display="block";
    monthDetail.style.display="block";
    monthDetail.innerHTML="";
    const monthKey=`${year}-${String(month).padStart(2,"0")}`;
    const archive=JSON.parse(localStorage.getItem("archive"))||{};
    const monthData=archive[monthKey]||[];
    const h3=document.createElement("h3");
    h3.innerText=new Date(year,month-1,1).toLocaleDateString("de-DE",{month:"long",year:"numeric"});
    monthDetail.appendChild(h3);
    if(monthData.length===0){
      const p=document.createElement("p");
      p.innerText="Keine Zitate für diesen Monat.";
      monthDetail.appendChild(p);
    }else{
      monthData.forEach(e=>{
        const div=document.createElement("div");
        div.className="archiveItem";
        div.innerHTML=`<div class="date">${e.date}</div>${e.text}`;
        monthDetail.appendChild(div);
      });
    }
  }

  backBtn.onclick=showMonths;
  closeArchiveBtn.onclick=()=>archiveOverlay.style.display="none";
  archiveLink.onclick=()=>{archiveOverlay.style.display="flex"; showMonths();};

  // ======= PERSÖNLICHE ZITATE BUTTONS =======
  morningBtn.onclick=()=>showPersonalQuote("morning");
  noonBtn.onclick=()=>showPersonalQuote("noon");
  eveningBtn.onclick=()=>showPersonalQuote("evening");

  function showPersonalQuote(type){
    if(!quotesData) return;
    personalEl.innerText=quotesData.personal[type][getDayOfYear()%quotesData.personal[type].length];
    personalEl.style.display="block";
  }

  // ======= BUTTON STATUS =======
  function updateButtons(){
    const h=new Date().getHours();
    morningBtn.disabled=!(h>=6&&h<12);
    noonBtn.disabled=!(h>=12&&h<18);
    eveningBtn.disabled=!(h>=18||h<6);
  }

  // ======= COUNTDOWN =======
  function updateYearCountdown(){
    const now=new Date();
    const end=new Date(now.getFullYear(),11,31,23,59,59);
    const diff=end-now;
    if(diff<0) return;
    const sec=Math.floor(diff/1000);
    const d=Math.floor(sec/86400);
    const h=Math.floor((sec%86400)/3600);
    const m=Math.floor((sec%3600)/60);
    const s=sec%60;
    yearCountdownEl.innerText=`Noch ${d} Tage ${h} Std ${m} Min ${s} Sek bis Jahresende`;
  }

  // ======= START =======
  updateHeader();
  updateButtons();
  updateYearCountdown();
  showDailyQuote();

  setInterval(()=>{
    updateHeader();
    updateButtons();
    updateYearCountdown();
  },1000);

});