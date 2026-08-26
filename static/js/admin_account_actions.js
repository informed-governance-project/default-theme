document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("account-action-form");
  const dialog = document.getElementById("account-action-confirm");

  if (!form || !dialog || typeof dialog.showModal !== "function") return;

  const message = dialog.querySelector("[data-account-action-message]");
  const confirmButton = dialog.querySelector("[data-account-action-confirm]");
  const cancelButton = dialog.querySelector("[data-account-action-cancel]");
  let requestedButton = null;
  let requestedUrl = null;

  document.querySelectorAll("[data-confirm-message]").forEach(function (button) {
    button.addEventListener("click", function (event) {
      // Hold the submission back until the operator has read what the action implies.
      event.preventDefault();
      requestedButton = button;
      message.textContent = button.dataset.confirmMessage;
      dialog.showModal();
    });
  });

  // Django's delete link is a GET to its own confirmation page. Confirming here instead means
  // posting straight to that view, which deletes on any POST.
  const deleteLink = document.querySelector("a.deletelink");
  const deleteMessage = document.getElementById("account-delete-confirm");

  if (deleteLink && deleteMessage) {
    deleteLink.addEventListener("click", function (event) {
      event.preventDefault();
      requestedUrl = deleteLink.href;
      message.textContent = deleteMessage.dataset.confirmMessage;
      dialog.showModal();
    });
  }

  confirmButton.addEventListener("click", function () {
    // Read before close(), whose handler clears them.
    const button = requestedButton;
    const url = requestedUrl;
    dialog.close();

    if (button) {
      // Submitting through the button keeps its formaction, so the row the operator confirmed
      // is the row that gets acted on.
      form.requestSubmit(button);
    } else if (url) {
      // delete_view only acts on a non-empty POST body, and this is the field its own
      // confirmation page submits.
      const confirmField = document.createElement("input");
      confirmField.type = "hidden";
      confirmField.name = "post";
      confirmField.value = "yes";
      form.appendChild(confirmField);
      form.action = url;
      form.requestSubmit();
    }
  });

  cancelButton.addEventListener("click", function () {
    dialog.close();
  });

  dialog.addEventListener("close", function () {
    requestedButton = null;
    requestedUrl = null;
  });
});
