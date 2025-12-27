document.addEventListener("DOMContentLoaded", () => {
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
  const infoContent = document.getElementById("infoContent");
  const startBtn = document.getElementById("startBtn");

  const dailyMotivationText = document.getElementById("dailyMotivationText");
  const personalQuoteDisplay = document.getElementById("personalQuoteDisplay");
  const yearCountdownEl = document.getElementById("yearCountdown");

  const morningBtn = document.getElementById("morningBtn");
  const noonBtn = document.getElementById("noonBtn");
  const eveningBtn = document.getElementById("eveningBtn");

  let menuOpen = false;
  let quotesData = null;
  let personalNotes = [];
  let personalWeeklyQuote = "";

  /* ================= MENU ================= */
  menuButton.onclick = () => {
    menu.style.right = menuOpen ? "-260px" : "0";
    menuOpen = !menuOpen;
  };
  [homeLink, personalLink, archiveLink, infoLink].forEach(link=>{
    link.onclick=()=>{
      menu.style.right="-260px";
      menuOpen=false;
    };
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

  function getDayOfYear(){
    const now=new Date();
    const start=new Date(now.getFullYear(),0,0);
    return Math.floor((now-start)/86400000);
  }

  function showPersonalQuote(type){
    if(!quotesData) return;
    const list = quotesData.personal[type];
    personalQuoteDisplay.innerText=list[getDayOfYear()%list.length];
    personalQuoteDisplay.style.display="block";
  }
  morningBtn.onclick=()=>showPersonalQuote("morning");
  noonBtn.onclick=()=>showPersonalQuote("noon");
  eveningBtn.onclick=()=>showPersonalQuote("evening");

  /* ================= PERSÖNLICH ================= */
  personalLink.onclick=()=>{
    personalOverlay.style.display="flex";
    archiveOverlay.style.display="none";
    menu.style.right="-260px";
    menuOpen=false;
    renderPersonal();
  };
  closePersonalBtn.onclick=()=>personalOverlay.style.display="none";

  function renderPersonal(){
    personalContent.innerHTML="";
    // Notizen
    const notesSection=document.createElement("div");
    notesSection.classList.add("personalSection");
    notesSection.innerHTML="<h3>Meine Notizen</h3>";
    if(personalNotes.length===0){ notesSection.innerHTML+="<p>Keine Notizen vorhanden.</p>"; }
    else{ personalNotes.forEach(n=>{
      const div=document.createElement("div");
      div.classList.add("note");
      div.innerText=n;
      notesSection.appendChild(div);
    });}
    personalContent.appendChild(notesSection);
    // Wochenzitat
    const quoteSection=document.createElement("div");
    quoteSection.classList.add("personalSection");
    quoteSection.innerHTML="<h3>Zitat der Woche</h3>";
    if(personalWeeklyQuote){
      const div=document.createElement("div");
      div.classList.add("quoteBox");
      div.innerText=personalWeeklyQuote;
      quoteSection.appendChild(div);
    }else{ quoteSection.innerHTML+="<p>Kein Wochenzitat vorhanden.</p>"; }
    personalContent.appendChild(quoteSection);
  }

  fetch("notes.json").then(r=>r.json()).then(d=>{ personalNotes=d.notes||[]; }).catch(()=>{ personalNotes=[]; });
  fetch("weeklyQuote.json").then(r=>r.json()).then(d=>{ personalWeeklyQuote=d.weeklyQuote||""; }).catch(()=>{ personalWeeklyQuote=""; });

  /* ================= ARCHIV ================= */
  function showArchive(){
    if(!quotesData) return;
    personalOverlay.style.display="none";
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
    personalOverlay.style.display="none";
    menu.style.right="-260px";
    menuOpen=false;
    showArchive();
  };
  closeArchiveBtn.onclick=()=>archiveOverlay.style.display="none";

  /* ================= LOAD QUOTES ================= */
  fetch("quotes.json").then(r=>r.json()).then(d=>{ quotesData=d; }).catch(()=>{ quotesData={daily:[], personal:{morning:[], noon:[], evening:[]}}; });

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