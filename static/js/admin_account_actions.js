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

  const changelistForm = document.getElementById("changelist-form");
  const batchMessagesTag = document.getElementById("account-action-messages");
  const batchMessages = batchMessagesTag ? JSON.parse(batchMessagesTag.textContent) : null;
  let requestedSubmitter = null;
  let confirmed = false;

  if (changelistForm && batchMessages) {
    changelistForm.addEventListener("submit", function (event) {
      if (confirmed) return;

      const action = changelistForm.querySelector('select[name="action"]');
      const text = action ? batchMessages[action.value] : null;
      if (!text) return;
      // Nothing ticked: let the admin report that rather than confirming a no-op.
      if (!changelistForm.querySelector(".action-select:checked")) return;

      event.preventDefault();
      requestedButton = null;
      requestedSubmitter = event.submitter;
      message.textContent = text;
      dialog.showModal();
    });
  }

  confirmButton.addEventListener("click", function () {
    // Read before close(), whose handler clears them.
    const button = requestedButton;
    const submitter = requestedSubmitter;
    dialog.close();

    if (button) {
      // Submitting through the button keeps its formaction, so the row the operator confirmed
      // is the row that gets acted on.
      form.requestSubmit(button);
    } else if (changelistForm) {
      confirmed = true;
      // Submitting through Run keeps its index, which tells the admin which action ran.
      changelistForm.requestSubmit(submitter);
    }
  });

  cancelButton.addEventListener("click", function () {
    dialog.close();
  });

  dialog.addEventListener("close", function () {
    requestedButton = null;
    requestedSubmitter = null;
  });
});
