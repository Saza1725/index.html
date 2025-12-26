document.addEventListener("DOMContentLoaded", () => {
  
  // ===== MENÜ SLIDE EFFEKT =====
const menu = document.getElementById("menu");
const homeLink = document.getElementById("homeLink");
const archiveLink = document.getElementById("archiveLink");

let menuOpen = false;

// Menü Button
menuButton.onclick = () => {
  if(menuOpen) {
    menu.style.right = "-260px";
  } else {
    menu.style.right = "0";
  }
  menuOpen = !menuOpen;
};

// Menü Links schließen das Menü beim Klicken
[homeLink, archiveLink].forEach(link => {
  link.onclick = () => {
    menu.style.right = "-260px";
    menuOpen = false;
  };
});

  const quoteEl = document.getElementById("quote");
  const personalEl = document.getElementById("personalQuote");
  const morningBtn = document.getElementById("morningBtn");
  const noonBtn = document.getElementById("noonBtn");
  const eveningBtn = document.getElementById("eveningBtn");
  const menuButton = document.getElementById("menuButton");

  const archiveOverlay = document.getElementById("archiveOverlay");
  const archiveList = document.getElementById("archiveList");
  const closeArchiveBtn = document.getElementById("closeArchiveBtn");

  const personalOverlay = document.getElementById("personalOverlay");
  const personalContent = document.getElementById("personalContent");
  const closePersonalBtn = document.getElementById("closePersonalBtn");
  const personalLink = document.getElementById("personalLink");

  const yearCountdownEl = document.getElementById("yearCountdown");

  const personalText = `
<h2>Mein persönlicher Bereich</h2>
<p>Nur vom Ersteller gepflegt.</p>
`;

  let quotesData = null;

  // ===== ZITATE LADEN =====
  fetch("quotes.json")
    .then(res => res.ok ? res.json() : Promise.reject("quotes.json nicht gefunden"))
    .then(data => { quotesData = data; showDailyQuote(); })
    .catch(err => { console.error(err); quoteEl.innerText = "Fehler beim Laden der Zitate"; });

  // ===== HILFSFUNKTIONEN =====
  function getDayOfYear() { return Math.floor((new Date() - new Date(new Date().getFullYear(),0,0)) / 86400000); }
  function getCategory() { const h = new Date().getHours(); return h>=6&&h<12?"morning":h>=12&&h<18?"noon":"evening"; }

  function updateHeader() {
    const now = new Date();
    const days = ["So","Mo","Di","Mi","Do","Fr","Sa"];
    document.getElementById("daytime").innerText = getCategory()==="morning"?"Morgen":getCategory()==="noon"?"Mittag":"Abend";
    document.getElementById("weekday").innerText = days[now.getDay()];
    document.getElementById("date").innerText = now.toLocaleDateString("de-DE");
    document.getElementById("time").innerText = now.toLocaleTimeString("de-DE");
  }

  // ===== TAGESZITAT + AUTOMATISCHES ARCHIV =====
  function showDailyQuote() {
    if(!quotesData) return;
    const index = getDayOfYear() % quotesData.daily.length;
    const text = quotesData.daily[index];
    quoteEl.innerText = text;
    saveDailyQuoteToArchive(text);
  }

  function saveDailyQuoteToArchive(text){
    const now=new Date();
    const start=new Date(2025,11,27), end=new Date(2026,11,31);
    if(now<start||now>end) return;

    const monthKey=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}`;
    const dateStr=now.toLocaleDateString("de-DE");

    let archive=JSON.parse(localStorage.getItem("archive"))||{};

    // alle Monate vorbereiten
    for(let y=2025;y<=2026;y++){
      for(let m=1;m<=12;m++){
        const key=`${y}-${String(m).padStart(2,"0")}`;
        if(!archive[key]) archive[key]=[];
      }
    }

    if(!archive[monthKey].some(e=>e.date===dateStr)){
      archive[monthKey].push({date:dateStr,text});
      localStorage.setItem("archive",JSON.stringify(archive));
    }
  }

  // ===== ARCHIV-OVERLAY =====
  function openArchive(){
    archiveOverlay.style.display="flex";
    archiveList.innerHTML="";
    const archive=JSON.parse(localStorage.getItem("archive"))||{};
    const months=Object.keys(archive).sort().reverse();

    months.forEach(key=>{
      const title=document.createElement("h3");
      title.innerText=new Date(key+"-01").toLocaleDateString("de-DE",{month:"long",year:"numeric"});
      archiveList.appendChild(title);

      archive[key].forEach(e=>{
        const div=document.createElement("div");
        div.className="archiveItem";
        div.innerHTML=`<div class="date">${e.date}</div>${e.text}`;
        archiveList.appendChild(div);
      });
    });

    // Suchfunktion
    const searchDate=document.getElementById("searchDate");
    const searchBtn=document.getElementById("searchBtn");
    const searchResult=document.getElementById("searchResult");

    searchBtn.onclick=()=>{
      const val=searchDate.value; if(!val) return alert("Bitte ein Datum auswählen");
      const d=new Date(val);
      const monthKey=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
      const dayStr=d.toLocaleDateString("de-DE");

      if(archive[monthKey]){
        const found=archive[monthKey].find(e=>e.date===dayStr);
        searchResult.innerText=found?found.text:"Kein Zitat gefunden für dieses Datum.";
      }else searchResult.innerText="Kein Zitat gefunden für dieses Datum.";
    };
  }

  function closeArchive(){ archiveOverlay.style.display="none"; }

  // ===== PERSÖNLICHER BEREICH =====
  personalLink.onclick=()=>{
    personalContent.innerHTML=personalText;
    personalOverlay.style.display="flex";
    document.getElementById("menu").style.right="-260px";
  };
  closePersonalBtn.onclick=()=>{ personalOverlay.style.display="none"; };

  // ===== BUTTONS =====
  function updateButtons(){
    const h=new Date().getHours();
    morningBtn.disabled=!(h>=6&&h<12);
    noonBtn.disabled=!(h>=12&&h<18);
    eveningBtn.disabled=!(h>=18||h<6);
  }
  morningBtn.onclick=()=>{ personalEl.innerText=quotesData.personal.morning[getDayOfYear()%quotesData.personal.morning.length]; personalEl.style.display="block"; };
  noonBtn.onclick=()=>{ personalEl.innerText=quotesData.personal.noon[getDayOfYear()%quotesData.personal.noon.length]; personalEl.style.display="block"; };
  eveningBtn.onclick=()=>{ personalEl.innerText=quotesData.personal.evening[getDayOfYear()%quotesData.personal.evening.length]; personalEl.style.display="block"; };

  menuButton.onclick=openArchive;
  closeArchiveBtn.onclick=closeArchive;

  // ===== COUNTDOWN =====
  function updateYearCountdown(){
    const now=new Date();
    const end=new Date(now.getFullYear(),11,31,23,59,59);
    const diff=end-now; if(diff<0) return;
    const sec=Math.floor(diff/1000);
    const d=Math.floor(sec/86400), h=Math.floor((sec%86400)/3600), m=Math.floor((sec%3600)/60), s=sec%60;
    yearCountdownEl.innerText=`Noch ${d} Tage ${h} Std ${m} Min ${s} Sek bis Jahresende`;
  }

  // ===== START =====
  updateHeader(); updateButtons(); updateYearCountdown();
  setInterval(()=>{ updateHeader(); updateButtons(); updateYearCountdown(); },1000);

});