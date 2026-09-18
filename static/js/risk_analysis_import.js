$(document).ready(function () {
  $('.multiselectcheckbox').multiselect({
    maxHeight: 400,
    buttonWidth: '100%',
    widthSynchronizationMode: 'always',
    buttonTextAlignment: 'left',
    nonSelectedText: gettext('Nothing selected'),
    nSelectedText: gettext('items selected'),
    allSelectedText: gettext('All selected'),
    numberDisplayed: 1,
    templates: {
      button: '<button class="multiselect form-select dropdown-toggle" data-bs-toggle="dropdown"><span class="multiselect-selected-text"></span></button>',
      option: '<button class="multiselect-option dropdown-item"></button>',
    }
  });

  $("#importRiskAnalysisForm").on("submit", function (e) {
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