document.addEventListener("DOMContentLoaded", () => {

const menuButton = document.getElementById("menuButton");
const menu = document.getElementById("menu");

const infoOverlay = document.getElementById("infoOverlay");
const startBtn = document.getElementById("startBtn");

const personalOverlay = document.getElementById("personalOverlay");
const archiveOverlay = document.getElementById("archiveOverlay");

const morningBtn = document.getElementById("morningBtn");
const noonBtn = document.getElementById("noonBtn");
const eveningBtn = document.getElementById("eveningBtn");

const quoteDisplay = document.getElementById("quoteDisplay");
const yearCountdown = document.getElementById("yearCountdown");

let menuOpen = false;
let quotesData = null;

/* MENU */
menuButton.onclick = () => {
  menu.style.right = menuOpen ? "-260px" : "0";
  menuOpen = !menuOpen;
};

/* INFO */
function hideInfo(){
  infoOverlay.style.display="none";
}

startBtn.onclick = hideInfo;

/* HEADER */
function updateHeader(){
  const now = new Date();
  document.getElementById("daytime").innerText =
    now.getHours()<12?"Morgen":now.getHours()<18?"Mittag":"Abend";
  document.getElementById("weekday").innerText =
    ["So","Mo","Di","Mi","Do","Fr","Sa"][now.getDay()];
  document.getElementById("date").innerText = now.toLocaleDateString("de-DE");
  document.getElementById("time").innerText = now.toLocaleTimeString("de-DE");
}

function updateCountdown(){
  const now=new Date();
  const end=new Date(now.getFullYear(),11,31,23,59,59);
  const diff=end-now;
  if(diff<=0)return;
  const s=Math.floor(diff/1000);
  yearCountdown.innerText=`${Math.floor(s/86400)} Tage ${Math.floor(s%86400/3600)} Std`;
}

/* ZITATE */
fetch("quotes.json").then(r=>r.json()).then(d=>quotesData=d);

function showQuote(type){
  if(!quotesData)return;
  const list=quotesData.personal[type];
  quoteDisplay.innerText=list[Math.floor(Math.random()*list.length)];
}

morningBtn.onclick=()=>showQuote("morning");
noonBtn.onclick=()=>showQuote("noon");
eveningBtn.onclick=()=>showQuote("evening");

/* START */
updateHeader();
updateCountdown();
setInterval(()=>{
  updateHeader();
  updateCountdown();
},1000);

});