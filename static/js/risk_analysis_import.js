$(document).ready(function () {

  const $importRiskAnalysisForm = $("#importRiskAnalysisForm");
  initMultiselect($importRiskAnalysisForm, { includeSelectAllOption: false });

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
        return response.json().then(data => {
          const groupId = data.import_ra_group_id;
          // No task is queued when every file was skipped; the reload shows their errors from the session messages.
          if (!groupId) {
            window.location.reload();
            return;
          }
          const poll = setInterval(async () => {
            $.get(`/reporting/import_risk_analysis_status/${groupId}`, function (data) {
              if (data.state === "SUCCESS" || data.state === "FAILURE" || data.state === "UNKNOWN") {
                clearInterval(poll);
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
                stop_spinner();

                if (data.messages) {
                  const messagesContainer = $("#messages-container");
                  if (messagesContainer.length) {
                    messagesContainer.html(data.messages);
                  }
                }
              }
            }).fail(function () {
              clearInterval(poll);
              stop_spinner();
              console.warn("Error");
            });
          }, 2000);
        });
      })
      .catch(error => {
        console.error("Error:", error);
        stop_spinner();
      })
  });
})