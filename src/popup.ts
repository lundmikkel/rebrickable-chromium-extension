console.log("Popup script running");

document.addEventListener("DOMContentLoaded", () => {
  const button = document.getElementById("action-button");
  if (button) {
    button.addEventListener("click", () => {
      alert("Button clicked!");
    });
  }
});
