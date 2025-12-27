document.addEventListener("DOMContentLoaded", () => {

let menuOpen = false;
const menu = document.getElementById("menu");
const menuButton = document.getElementById("menuButton");

menuButton.onclick = () => {
  menu.style.right = menuOpen ? "-260px" : "0";
  menuOpen = !menuOpen;
};

/* HEADER */
function updateHeader() {
  const now = new Date();
  const days = ["So","Mo","Di","Mi","Do","Fr","Sa"];
  document.getElementById("daytime").innerText =
    now.getHours()<12?"Morgen":now.getHours()<18?"Mittag":"Abend";
  document.getElementById("weekday").innerText = days[now.getDay()];
  document.getElementById("date").innerText = now.toLocaleDateString("de-DE");
  document.getElementById("time").innerText = now.toLocaleTimeString("de-DE");
}

/* COUNTDOWN */
function updateCountdown(){
  const now=new Date();
  const end=new Date(now.getFullYear(),11,31,23,59,59);
  const diff=end-now;
  const d=Math.floor(diff/86400000);
  const h=Math.floor(diff/3600000)%24;
  document.getElementById("yearCountdown").innerText =
    `Noch ${d} Tage ${h} Std bis Jahresende`;
}

/* QUOTES */
let quotesData=null;
fetch("quotes.json").then(r=>r.json()).then(d=>quotesData=d);

function showQuote(type){
  if(!quotesData)return;
  const list=quotesData.personal[type];
  const q=list[Math.floor(Math.random()*list.length)];
  const el=document.getElementById("animatedQuote");
  el.innerText=q;
}

/* BUTTON EVENTS */
morningBtn.onclick=()=>showQuote("morning");
noonBtn.onclick=()=>showQuote("noon");
eveningBtn.onclick=()=>showQuote("evening");

/* INFO */
const infoOverlay=document.getElementById("infoOverlay");
document.getElementById("startBtn").onclick=()=>{
  infoOverlay.style.animation="slideOut .8s forwards";
  setTimeout(()=>infoOverlay.remove(),700);
};

/* START */
updateHeader();
updateCountdown();
setInterval(()=>{updateHeader();updateCountdown();},1000);

});