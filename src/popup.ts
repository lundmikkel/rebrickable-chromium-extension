import { Context } from "./context/context";
import { RebrickableClient } from "./rebrickable/rebrickable.client";
import SyncStorage from "./storage/sync-storage";

console.log("Popup script running");

const storageKey = "api-key";

document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM content loaded");

  registerSubmitApiKeyButton();

  registerDeleteApiKeyButton();

  renderPage();
});

async function renderPage() {
  const apiKey: string | undefined = await SyncStorage.get(storageKey);

  if (apiKey) {
    hideDiv("enter-api-key-section");
    showDiv("api-key-entered-section");
  } else {
    showDiv("enter-api-key-section");
    hideDiv("api-key-entered-section");
  }
}

function hideDiv(div: string) {
  document.getElementById(div)!.style.display = "none";
}

function showDiv(div: string) {
  document.getElementById(div)!.style.display = "block";
}

function registerSubmitApiKeyButton() {
  const button = document.getElementById("api-key-submit-button");
  if (button) {
    const input = document.getElementById(
      "api-key-input-field"
    ) as HTMLInputElement;

    button.addEventListener("click", () => {
      const key = input?.value;

      if (!key) {
        return;
      }

      SyncStorage.set(storageKey, key);

      Context.client = new RebrickableClient(key);

      renderPage();
    });
  }
}

function registerDeleteApiKeyButton() {
  const button = document.getElementById("api-key-delete-button");
  if (button) {
    button.addEventListener("click", () => {
      SyncStorage.remove(storageKey);

      Context.client = undefined;

      renderPage();
    });
  }
}
