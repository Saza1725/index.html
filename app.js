document.addEventListener("DOMContentLoaded", () => {
  const menuButton = document.getElementById("menuButton");
  const menu = document.getElementById("menu");
  const homeLink = document.getElementById("homeLink");
  const personalLink = document.getElementById("personalLink");
  const archiveLink = document.getElementById("archiveLink");
  const infoLink = document.getElementById("infoLink");

  const infoOverlay = document.getElementById("infoOverlay");
  const infoContent = document.getElementById("infoContent");
  const startBtn = document.getElementById("startBtn");

  const dailyQuoteDisplay = document.getElementById("dailyQuoteDisplay");
  const dailyMotivationText = document.getElementById("dailyMotivationText");
  const yearCountdownEl = document.getElementById("yearCountdown");

  const morningBtn = document.getElementById("morningBtn");
  const noonBtn = document.getElementById("noonBtn");
  const eveningBtn = document.getElementById("eveningBtn");

  const personalOverlay = document.getElementById("personalOverlay");
  const archiveOverlay = document.getElementById("archiveOverlay");

  let menuOpen = false;
  let quotesData = { daily: [], personal: { morning: [], noon: [], evening: [] } };
  let quoteIndex = 0;

  /* ================= MENU ================= */
  menuButton.onclick = () => {
    menu.style.right = menuOpen ? "-260px" : "0";
    menuOpen = !menuOpen;
    // Schließt Overlays, wenn Menü öffnet
    if(menuOpen) { infoOverlay.style.display="none"; personalOverlay.style.display="none"; archiveOverlay.style.display="none"; }
  };
  [homeLink, personalLink, archiveLink, infoLink].forEach(link=>{
    link.onclick=()=>{ menu.style.right="-260px"; menuOpen=false; };
  });

  /* ================= INFO ================= */
  function showInfo(){
    infoOverlay.style.display="flex";
    infoOverlay.classList.remove("slideOut");
    void infoOverlay.offsetWidth;
    infoOverlay.classList.add("slideIn");
  }
  function hideInfo(){
    infoOverlay.classList.remove("slideIn");
    infoOverlay.classList.add("slideOut");
    setTimeout(()=>{ infoOverlay.style.display="none"; },500);
  }
  showInfo();
  startBtn.onclick=hideInfo;

  /* ================= HEADER ================= */
  function getCategory(){
    const h = new Date().getHours();
    return h>=6&&h<12?"Morgen":h<18?"Mittag":"Abend";
  }
  function updateHeader(){
    const now = new Date();
    const days = ["So","Mo","Di","Mi","Do","Fr","Sa"];
    document.getElementById("daytime").innerText=getCategory();
    document.getElementById("weekday").innerText=days[now.getDay()];
    document.getElementById("date").innerText=now.toLocaleDateString("de-DE");
    document.getElementById("time").innerText=now.toLocaleTimeString("de-DE");
  }
  function updateYearCountdown(){
    const now=new Date();
    const end=new Date(now.getFullYear(),11,31,23,59,59);
    const diff=end-now;
    if(diff<=0){yearCountdownEl.innerText=""; return;}
    const sec=Math.floor(diff/1000);
    const d=Math.floor(sec/86400);
    const h=Math.floor((sec%86400)/3600);
    const m=Math.floor((sec%3600)/60);
    const s=sec%60;
    yearCountdownEl.innerText=`Noch ${d} Tage ${h} Std ${m} Min ${s} Sek bis Jahresende`;
  }

  /* ================= BUTTONS ================= */
  function updateButtons(){
    const h = new Date().getHours();
    morningBtn.disabled = !(h>=6&&h<12);
    noonBtn.disabled = !(h>=12&&h<18);
    eveningBtn.disabled = !(h>=18||h<6);
  }

  function getDayOfYear(){ const now=new Date(); const start=new Date(now.getFullYear(),0,0); return Math.floor((now-start)/86400000); }

  function showPersonalQuote(type){
    if(!quotesData) return;
    const list = quotesData.personal[type];
    dailyQuoteDisplay.innerText=list[getDayOfYear()%list.length];
  }
  morningBtn.onclick=()=>showPersonalQuote("morning");
  noonBtn.onclick=()=>showPersonalQuote("noon");
  eveningBtn.onclick=()=>showPersonalQuote("evening");

  /* ================= AUTOMATISCHES TAGESZITAT ================= */
  function autoDailyQuote(){
    if(quotesData.daily.length === 0) return;
    dailyQuoteDisplay.innerText = quotesData.daily[quoteIndex % quotesData.daily.length];
    quoteIndex++;
  }
  setInterval(autoDailyQuote, 10000); // alle 10 Sekunden wechseln

  /* ================= LOAD QUOTES ================= */
  fetch("quotes.json").then(r=>r.json()).then(d=>{ quotesData=d; autoDailyQuote(); }).catch(()=>{ console.error("quotes.json konnte nicht geladen werden"); });

  /* ================= START ================= */
  updateHeader();
  updateButtons();
  updateYearCountdown();
  setInterval(()=>{
    updateHeader();
    updateButtons();
    updateYearCountdown();
  },1000);
});