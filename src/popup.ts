import { SyncStorage } from "./storage/sync_storage";

console.log("Popup script running");

// TODO: get from somewhere else
const syncStorage = new SyncStorage()

const storageKey = "api-key"

document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM content loaded")

  registerPageContent()

  registerSubmitApiKeyButton()

  registerDeleteApiKeyButton()
});

function registerPageContent() {
  const apiKey = syncStorage.Get(storageKey)

  if (apiKey == "") {
    hideDiv("enter-api-key-section")
    showDiv("api-key-entered-section")
  } else {
    hideDiv("api-key-entered-section")
    showDiv("enter-api-key-section")
  }
}

function hideDiv(div: string) {
  document.getElementById(div)!.hidden = true;
}

function showDiv(div: string) {
  document.getElementById(div)!.hidden = false;
}

function registerSubmitApiKeyButton() {
  const button = document.getElementById("api-key-submit-button");
  if (button) {
    const input = <HTMLInputElement> document.getElementById("api-key-input-field")

    button.addEventListener("click", () => {
      const key = input?.value;

      if (!key) {
        return;
      }

      saveApiKey(key)
    });
  }
}

function saveApiKey(key: string) {
  syncStorage.Save(storageKey, key)
}

function registerDeleteApiKeyButton() {
  const button = document.getElementById("api-key-delete-button");
  if (button) {
    button.addEventListener("click", () => {
      deleteApiKey()

      registerPageContent()
    });
  }
}

function deleteApiKey() {
  syncStorage.Delete(storageKey)
}