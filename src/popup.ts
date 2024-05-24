import SyncStorage from "./storage/sync-storage";

console.log("Popup script running");

const storageKey = "api-key"

document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM content loaded")

  registerPageContent()

  registerSubmitApiKeyButton()

  registerDeleteApiKeyButton()
});

async function registerPageContent() {
  const apiKey = await SyncStorage.get(storageKey)

  console.log(apiKey)

  if (apiKey) {
    hideDiv("enter-api-key-section")
    showDiv("api-key-entered-section")
  } else {
    showDiv("enter-api-key-section")
    hideDiv("api-key-entered-section")
  }
}

function hideDiv(div: string) {
  document.getElementById(div)!.style.display = "none"
}

function showDiv(div: string) {
  document.getElementById(div)!.style.display = "block"
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
  SyncStorage.set({
    storageKey: key
  })
}

function registerDeleteApiKeyButton() {
  const button = document.getElementById("api-key-delete-button");
  if (button) {
    button.addEventListener("click", () => {
      deleteApiKey()
    });
  }
}

function deleteApiKey() {
  SyncStorage.remove([storageKey])
}