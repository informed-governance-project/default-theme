document.addEventListener("DOMContentLoaded", function () {
  const dialog = document.getElementById("email-placeholders-help");
  const opener = document.querySelector("[data-placeholders-help-open]");

  if (!dialog || !opener || typeof dialog.showModal !== "function") return;

  const closeButton = dialog.querySelector("[data-placeholders-help-close]");

  opener.addEventListener("click", function () {
    dialog.showModal();
  });

  closeButton.addEventListener("click", function () {
    dialog.close();
  });
});
