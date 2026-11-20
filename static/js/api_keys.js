$(document).ready(function () {
  const $createModal = $("#create_api_key");
  const $createDialog = $(".modal-dialog", $createModal);
  const $revokeModal = $("#revoke_api_key");
  const $tableContainer = $("#api-keys-table-container");
  const $pageError = $("#api_keys_error");
  const errorMessage = $pageError.data("message");
  let keyCreated = false;
  let keyRevoked = false;

  function showError($alert) {
    $alert.text(errorMessage).removeClass("d-none");
  }

  function hideError($alert) {
    $alert.text("").addClass("d-none");
  }

  // Reloading the page would trip the forced re-login on /account/api-keys/, so the table is swapped in place.
  function replaceTable(html) {
    $tableContainer.find('[data-bs-toggle="tooltip"]').each(function () {
      bootstrap.Tooltip.getInstance(this)?.dispose();
    });
    $tableContainer.html(html);
    $tableContainer.find('[data-bs-toggle="tooltip"]').each(function () {
      new bootstrap.Tooltip(this, { delay: 200 });
    });
  }

  // Swapping the modal content removes the focused element: move focus to what the user must act on next.
  function focusCreateModal() {
    const $target = $createDialog
      .find('[aria-invalid="true"], #api_key_token, #create-api-key-form :input:visible:not(button)')
      .first();
    ($target.length ? $target : $("#create_api_key_label", $createDialog)).trigger("focus");
  }

  // A redirect means the session or OTP lapsed: reload so the login page is not rendered inside the modal.
  function sessionLapsed(response) {
    if (response.redirected || response.status === 403) {
      window.location.reload();
      return true;
    }
    if (!response.ok) {
      throw new Error(response.statusText);
    }
    return false;
  }

  function renderCreateModal(response) {
    if (sessionLapsed(response)) {
      return false;
    }
    return response.text().then(function (html) {
      $createDialog.html(html);
      keyCreated = $("#api_key_token", $createDialog).length > 0;
      return true;
    });
  }

  $(".create_api_key").on("click", function () {
    keyCreated = false;
    hideError($pageError);
    fetch($(this).data("url"), { credentials: "same-origin" })
      .then(renderCreateModal)
      .then(function (rendered) {
        if (rendered) {
          bootstrap.Modal.getOrCreateInstance($createModal[0]).show();
        }
      })
      .catch(function () {
        showError($pageError);
      });
  });

  $createModal.on("shown.bs.modal", focusCreateModal);

  $(document).on("submit", "#create-api-key-form", function (e) {
    e.preventDefault();
    const form = this;
    const $submit = $(form).find("button[type=submit]").prop("disabled", true);
    hideError($(form).find(".api-key-error"));
    fetch(form.action, {
      method: "POST",
      credentials: "same-origin",
      headers: { "X-CSRFToken": getCsrftoken() },
      body: new FormData(form),
    })
      .then(renderCreateModal)
      .then(function (rendered) {
        if (rendered) {
          focusCreateModal();
        }
      })
      .catch(function () {
        showError($(form).find(".api-key-error"));
        $submit.prop("disabled", false);
      });
  });

  // The Clipboard API exists only in secure contexts; plain-HTTP hosts fall back to the selection.
  function copySelection() {
    try {
      return document.execCommand("copy");
    } catch (error) {
      return false;
    }
  }

  $(document).on("click", "#copy_api_key", function () {
    const $button = $(this);
    const input = document.getElementById("api_key_token");
    const report = function (copied) {
      $("#copy_api_key_status").text($button.data(copied ? "copied-message" : "failed-message"));
      $button.find("i").toggleClass("bi-clipboard", !copied).toggleClass("bi-clipboard-check", copied);
      if (!copied) {
        input.focus();
        input.select();
      }
    };
    input.select();
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(input.value).then(
        function () {
          report(true);
        },
        function () {
          report(copySelection());
        }
      );
    } else {
      report(copySelection());
    }
  });

  // Drop the key from the DOM once the modal closes.
  $createModal.on("hidden.bs.modal", function () {
    if (keyCreated) {
      replaceTable($("#api_keys_table_update", $createDialog).html());
      keyCreated = false;
    }
    $createDialog.empty();
  });

  $(document).on("click", ".revoke_api_key", function () {
    const $button = $(this);
    keyRevoked = false;
    hideError($revokeModal.find(".api-key-error"));
    $("#modal-revoke-api-key-form").attr("action", $button.data("revoke-url"));
    $("#revoke_api_key_name").text($button.data("key-name"));
    bootstrap.Modal.getOrCreateInstance($revokeModal[0]).show();
  });

  $("#modal-revoke-api-key-form").on("submit", function (e) {
    e.preventDefault();
    const form = this;
    const $submit = $(form).find("button[type=submit]").prop("disabled", true);
    hideError($(form).find(".api-key-error"));
    fetch(form.action, {
      method: "POST",
      credentials: "same-origin",
      headers: { "X-CSRFToken": getCsrftoken() },
      body: new FormData(form),
    })
      .then(function (response) {
        if (sessionLapsed(response)) {
          return;
        }
        return response.text().then(function (html) {
          replaceTable(html);
          keyRevoked = true;
          bootstrap.Modal.getInstance($revokeModal[0]).hide();
        });
      })
      .catch(function () {
        showError($(form).find(".api-key-error"));
        $submit.prop("disabled", false);
      });
  });

  // The revoke button that opened the modal was replaced with the table, so Bootstrap cannot return focus to it.
  $revokeModal.on("hidden.bs.modal", function () {
    $("#modal-revoke-api-key-form button[type=submit]").prop("disabled", false);
    if (keyRevoked) {
      $("#api_keys_heading").trigger("focus");
      const $status = $("#api_keys_status");
      // Re-setting identical text is not announced again, so clear it first.
      $status.text("");
      setTimeout(function () {
        $status.text($status.data("revoked-message"));
      }, 100);
      keyRevoked = false;
    }
  });
});
