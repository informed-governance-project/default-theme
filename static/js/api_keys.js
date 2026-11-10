$(document).ready(function () {
  const $createModal = $("#create_api_key");
  const $createDialog = $(".modal-dialog", $createModal);
  const $tableContainer = $("#api-keys-table-container");
  let keyCreated = false;

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

  // A redirect means the session or OTP lapsed: reload so the login page is not rendered inside the modal.
  function renderCreateModal(response) {
    if (response.redirected || response.status === 403) {
      window.location.reload();
      return false;
    }
    if (!response.ok) {
      throw new Error(response.statusText);
    }
    return response.text().then(function (html) {
      $createDialog.html(html);
      keyCreated = $("#api_key_token", $createDialog).length > 0;
      return true;
    });
  }

  $(".create_api_key").on("click", function () {
    keyCreated = false;
    fetch($(this).data("url"), { credentials: "same-origin" })
      .then(renderCreateModal)
      .then(function (rendered) {
        if (rendered) {
          bootstrap.Modal.getOrCreateInstance($createModal[0]).show();
        }
      })
      .catch(function (error) {
        console.error("Error:", error);
      });
  });

  $(document).on("submit", "#create-api-key-form", function (e) {
    e.preventDefault();
    const form = this;
    $(form).find("button[type=submit]").prop("disabled", true);
    fetch(form.action, {
      method: "POST",
      credentials: "same-origin",
      headers: { "X-CSRFToken": getCsrftoken() },
      body: new FormData(form),
    })
      .then(renderCreateModal)
      .catch(function (error) {
        console.error("Error:", error);
        $(form).find("button[type=submit]").prop("disabled", false);
      });
  });

  $(document).on("click", "#copy_api_key", function () {
    const $button = $(this);
    const input = document.getElementById("api_key_token");
    input.select();
    navigator.clipboard.writeText(input.value).then(function () {
      $button.find("span").text($button.data("copied-label"));
      $button.find("i").removeClass("bi-clipboard").addClass("bi-clipboard-check");
    });
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
    $("#modal-revoke-api-key-form").attr("action", $button.data("revoke-url"));
    $("#revoke_api_key_name").text($button.data("key-name"));
    bootstrap.Modal.getOrCreateInstance(document.getElementById("revoke_api_key")).show();
  });

  $("#modal-revoke-api-key-form").on("submit", function (e) {
    e.preventDefault();
    const form = this;
    const $submit = $(form).find("button[type=submit]").prop("disabled", true);
    fetch(form.action, {
      method: "POST",
      credentials: "same-origin",
      headers: { "X-CSRFToken": getCsrftoken() },
      body: new FormData(form),
    })
      .then(function (response) {
        if (response.redirected || response.status === 403) {
          window.location.reload();
          return;
        }
        if (!response.ok) {
          throw new Error(response.statusText);
        }
        return response.text().then(function (html) {
          replaceTable(html);
          bootstrap.Modal.getInstance(document.getElementById("revoke_api_key")).hide();
        });
      })
      .catch(function (error) {
        console.error("Error:", error);
      })
      .finally(function () {
        $submit.prop("disabled", false);
      });
  });
});
