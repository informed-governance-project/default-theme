$(document).ready(function () {

  const $importRiskAnalysisForm = $("#importRiskAnalysisForm");
  initMultiselect($importRiskAnalysisForm, { includeSelectAllOption: false });

  // Backstop for a worker that dies mid-task without the status ever reaching a final state.
  const MAX_POLL_ATTEMPTS = 150;

  // Mirrors the markup django-bootstrap5 renders, so the alert is dismissible like the
  // messages the server sends back.
  function buildAlert(message) {
    return (
      `<div class="alert alert-danger alert-dismissible fade show" role="alert">${message}` +
      `<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="${gettext('Close')}"></button></div>`
    );
  }

  function finishImport(messagesHtml) {
    const modalEl = $importRiskAnalysisForm.closest(".modal");
    if (modalEl.length) {
      const modal = bootstrap.Modal.getInstance(modalEl[0]);
      modalEl[0].addEventListener('hidden.bs.modal', () => {
        document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
        document.body.classList.remove('modal-open');
        document.body.style.removeProperty('overflow');
        document.body.style.removeProperty('padding-right');
      }, { once: true });
      modal.hide();
    }
    stop_spinner();

    if (messagesHtml) {
      const messagesContainer = $("#messages-container");
      if (messagesContainer.length) {
        messagesContainer.html(messagesHtml);
      }
    }
  }

  $importRiskAnalysisForm.on("submit", function (e) {
    e.preventDefault();
    const csrftoken = getCsrftoken();
    const form = this;
    const $form = $(form);
    const url = $form.attr("action");
    const formData = new FormData(form);

    fetch(url, {
      method: "POST",
      headers: {
        "X-CSRFToken": csrftoken,
      },
      body: formData
    })
      .then(response => {
        if (!response.ok) {
          return response.json().then(data => {
            const modalEl = $form.closest(".modal");
            if (modalEl.length) {
              const modal = bootstrap.Modal.getInstance(modalEl[0]);
              modalEl[0].addEventListener('hidden.bs.modal', () => {
                document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
                document.body.classList.remove('modal-open');
                document.body.style.removeProperty('overflow');
                document.body.style.removeProperty('padding-right');
              }, { once: true });
              modal.hide();
            }
            if (data.messages) {
              const messagesContainer = $("#messages-container");
              if (messagesContainer.length) {
                messagesContainer.html(data.messages);
              }
              throw new Error(response.statusText);
            }
            stop_spinner();
          });
        }
        response.json().then(data => {
          const groupId = data.import_ra_group_id;
          if (groupId) {
            let attempts = 0;
            const poll = setInterval(async () => {
              attempts += 1;
              if (attempts > MAX_POLL_ATTEMPTS) {
                clearInterval(poll);
                finishImport(buildAlert(gettext("The risk analysis import is taking longer than expected. Check the imported data later before importing it again.")));
                return;
              }
              $.get(`/reporting/import_risk_analysis_status/${groupId}`, function (data) {
                if (data.state === "SUCCESS" || data.state === "FAILURE" || data.state === "UNKNOWN") {
                  clearInterval(poll);
                  finishImport(data.messages);
                }
              }).fail(function () {
                console.warn("Error");
              });
            }, 2000);
          }
        });
      })
      .catch(error => {
        console.error("Error:", error);
        stop_spinner();
      })
  });
})