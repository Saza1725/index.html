document.addEventListener("DOMContentLoaded", () => {
  const archiveOverlay = document.getElementById("archiveOverlay");
  const closeArchiveBtn = document.getElementById("closeArchiveBtn");
  const monthsContainer = document.getElementById("monthsContainer");
  const monthDetail = document.getElementById("monthDetail");
  const backBtn = document.getElementById("backBtn");

  // Automatische Monatsliste von Dez 2025 bis Dez 2026
  const months = [];
  for (let y = 2025; y <= 2026; y++) {
    const startMonth = y === 2025 ? 12 : 1;
    const endMonth = y === 2025 ? 12 : 12;
    for (let m = startMonth; m <= endMonth; m++) {
      months.push({ year: y, month: m });
    }
  }

  // Zeige Monatsbuttons
  function showMonths() {
    monthDetail.style.display = "none";
    backBtn.style.display = "none";
    monthsContainer.style.display = "flex";
    monthsContainer.innerHTML = "";
    months.forEach(({year, month}) => {
      const btn = document.createElement("button");
      const date = new Date(year, month-1, 1);
      btn.innerText = date.toLocaleDateString("de-DE", { month: "long", year: "numeric" });
      btn.onclick = () => showMonthDetail(year, month);
      monthsContainer.appendChild(btn);
    });
  }

  // Zeige Zitate eines Monats
  function showMonthDetail(year, month) {
    monthsContainer.style.display = "none";
    backBtn.style.display = "block";
    monthDetail.style.display = "block";
    monthDetail.innerHTML = "";

    const monthKey = `${year}-${String(month).padStart(2,"0")}`;
    const archive = JSON.parse(localStorage.getItem("archive")) || {};
    const monthData = archive[monthKey] || [];

    const h3 = document.createElement("h3");
    h3.innerText = new Date(year, month-1, 1).toLocaleDateString("de-DE", { month: "long", year: "numeric" });
    monthDetail.appendChild(h3);

    if (monthData.length === 0) {
      const p = document.createElement("p");
      p.innerText = "Keine Zitate für diesen Monat.";
      monthDetail.appendChild(p);
    } else {
      monthData.forEach(e => {
        const div = document.createElement("div");
        div.className = "archiveItem";
        div.innerHTML = `<div class="date">${e.date}</div>${e.text}`;
        monthDetail.appendChild(div);
      });
    }
  }

  backBtn.onclick = showMonths;
  closeArchiveBtn.onclick = () => archiveOverlay.style.display = "none";

  // Öffne Archiv
  window.openArchive = function() {
    archiveOverlay.style.display = "flex";
    showMonths();
  };
});