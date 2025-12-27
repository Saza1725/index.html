document.addEventListener("DOMContentLoaded", () => {

  const quoteEl = document.getElementById("quote");
  const personalQuoteEl = document.getElementById("personalQuote");

  const morningBtn = document.getElementById("morningBtn");
  const noonBtn = document.getElementById("noonBtn");
  const eveningBtn = document.getElementById("eveningBtn");

  const menuButton = document.getElementById("menuButton");
  const menu = document.getElementById("menu");

  const personalLink = document.getElementById("personalLink");
  const personalOverlay = document.getElementById("personalOverlay");
  const closePersonalBtn = document.getElementById("closePersonalBtn");

  const personalNotesEl = document.getElementById("personalNotes");
  const weeklyQuoteEl = document.getElementById("weeklyQuote");

  let quotesData = null;

  /* MENU */
  menuButton.onclick = () => {
    menu.style.right = menu.style.right === "0px" ? "-260px" : "0px";
  };

  /* HEADER */
  function updateHeader() {
    const now = new Date();
    const days = ["So","Mo","Di","Mi","Do","Fr","Sa"];
    document.getElementById("daytime").innerText =
      now.getHours() < 12 ? "Morgen" : now.getHours() < 18 ? "Mittag" : "Abend";
    document.getElementById("weekday").innerText = days[now.getDay()];
    document.getElementById("date").innerText = now.toLocaleDateString("de-DE");
    document.getElementById("time").innerText = now.toLocaleTimeString("de-DE");
  }

  /* TAGESZITAT */
  fetch("quotes.json")
    .then(res => res.json())
    .then(data => {
      quotesData = data;
      const day = Math.floor((Date.now() - new Date(new Date().getFullYear(),0,0)) / 86400000);
      quoteEl.innerText = data.daily[day % data.daily.length];
    });

  /* ZEIT-ZITATE */
  function showPersonalQuote(type) {
    const list = quotesData.personal[type];
    const day = Math.floor((Date.now() - new Date(new Date().getFullYear(),0,0)) / 86400000);
    personalQuoteEl.innerText = list[day % list.length];
    personalQuoteEl.style.display = "block";
  }

  morningBtn.onclick = () => showPersonalQuote("morning");
  noonBtn.onclick = () => showPersonalQuote("noon");
  eveningBtn.onclick = () => showPersonalQuote("evening");

  /* PERSÖNLICH */
  personalLink.onclick = () => {
    personalOverlay.style.display = "flex";
  };

  closePersonalBtn.onclick = () => {
    personalOverlay.style.display = "none";
  };

  /* NOTIZEN */
  fetch("notes.json")
    .then(res => res.json())
    .then(data => {
      personalNotesEl.innerHTML = "";
      data.notes.forEach(note => {
        personalNotesEl.innerHTML += `<div class="note">${note}</div>`;
      });
    });

  /* WOCHENZITAT */
  fetch("weeklyQuote.json")
    .then(res => res.json())
    .then(data => {
      weeklyQuoteEl.innerHTML =
        `<div class="quoteBox">${data.text}</div>`;
    });

  updateHeader();
  setInterval(updateHeader, 1000);
});