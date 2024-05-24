import { Observable, combineLatest } from "rxjs";
import { map } from "rxjs/operators";
// import "./progress-bar.scss";

type PartCount = {
  partId: number;
  count: number;
};

export function createProgressBar() {
  const container = document.createElement("div");
  container.id = "progress-bar-container";

  const progressBar = document.createElement("div");
  progressBar.id = "progress-bar";

  const progressBarFill = document.createElement("div");
  progressBarFill.id = "progress-bar-fill";

  const progressText = document.createElement("span");
  progressText.id = "progress-text";

  progressBar.appendChild(progressBarFill);
  container.appendChild(progressBar);
  container.appendChild(progressText);

  // Find farvelisten og indsæt progress baren over denne
  const colorList = document.querySelector(".set-colors");
  if (colorList) {
    colorList.insertAdjacentElement("beforebegin", container);
  } else {
    // Hvis farvelisten ikke er der endnu, så tilføj til body eller et andet passende sted
    document.body.appendChild(container);
  }
}

export function updateProgressBar(partCount: number, totalParts: number) {
  const progressBarFill = document.getElementById("progress-bar-fill");
  const progressText = document.getElementById("progress-text");

  if (progressBarFill && progressText) {
    const percentage = (partCount / totalParts) * 100;
    progressBarFill.style.width = `${percentage}%`;
    progressText.textContent = `Progress: ${partCount} / ${totalParts} (${percentage.toFixed(2)}%)`;
  }
}

export function initializeProgressBar(partCount: number, totalParts: number) {
  createProgressBar();

  updateProgressBar(partCount, totalParts);
}