document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("account-action-form");
  const dialog = document.getElementById("account-action-confirm");

  if (!form || !dialog || typeof dialog.showModal !== "function") return;

  const message = dialog.querySelector("[data-account-action-message]");
  const confirmButton = dialog.querySelector("[data-account-action-confirm]");
  const cancelButton = dialog.querySelector("[data-account-action-cancel]");
  let requestedButton = null;

  document.querySelectorAll("#result_list [data-confirm-message]").forEach(function (button) {
    button.addEventListener("click", function (event) {
      // Hold the submission back until the operator has read what the action implies.
      event.preventDefault();
      requestedButton = button;
      message.textContent = button.dataset.confirmMessage;
      dialog.showModal();
    });
  });

  confirmButton.addEventListener("click", function () {
    // Read before close(), whose handler clears it.
    const button = requestedButton;
    dialog.close();
    // Submitting through the button keeps its formaction, so the row the operator confirmed
    // is the row that gets acted on.
    if (button) form.requestSubmit(button);
  });

  cancelButton.addEventListener("click", function () {
    dialog.close();
  });

  dialog.addEventListener("close", function () {
    requestedButton = null;
  });
});
