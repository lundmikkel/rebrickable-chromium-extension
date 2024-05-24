console.log("Popup script running");

document.addEventListener("DOMContentLoaded", () => {
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
});

function saveApiKey(key: string) {
  //TODO: save in sync storage
  alert(key);
}