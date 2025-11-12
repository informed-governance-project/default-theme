$(document).ready(function () {
  const $sectorregulation = $('#id_sectorregulation');
  const $workflow = $('#id_workflow');
  $sectorregulation.find('option[data-regulation]').hide();
  $workflow.find('option[data-sectorregulation]').hide();


  $('#id_regulation').on('change', function () {
    const selectedReg = $(this).val();
    $sectorregulation.find('option').each(function () {
      const srReg = $(this).data('regulation');
      if (!srReg || srReg == selectedReg) {
        $(this).show();
      } else {
        $(this).hide();
      }
    });
    $sectorregulation.val('');
    $workflow.val('');
  });

  $('#id_sectorregulation').on('change', function () {
    const selectedSectorReg = $(this).val();
    $workflow.find('option').each(function () {
      const wfReg = $(this).data('sectorregulation');
      if (!wfReg || wfReg == selectedSectorReg) {
        $(this).show();
      } else {
        $(this).hide();
      }
    });
    $workflow.val('');
  });

  datePickers = [];
  document.querySelectorAll('.input-group[data-td-target-input="nearest"]').forEach(function (groupEl) {
    const inputEl = groupEl.querySelector('.datetimepicker-input:not([disabled])');
    const defaultTempusdOptions = {
      allowInputToggle: true,
      promptTimeOnDateChange: false,
      localization: {
        hourCycle: 'h23',
        format: 'yyyy-MM-dd',
      },
      display: {
        buttons: {
          today: false,
          clear: true,
          close: true
        },
        components: {
          calendar: true,
          date: true,
          month: true,
          year: true,
          decades: true,
          clock: false,
          hours: false,
          minutes: false,
          seconds: false,
          useTwentyfourHour: undefined
        },
        icons: {
          time: 'bi bi-clock',
          date: 'bi bi-calendar',
          up: 'bi bi-chevron-up',
          down: 'bi bi-chevron-down',
          previous: 'bi bi-chevron-left',
          next: 'bi bi-chevron-right',
          today: 'bi bi-calendar-check',
          clear: 'bi bi-trash',
          close: 'bi bi-x-lg'
        },
        keyboardNavigation: true,
      }
    };

    const maxDateAttr = inputEl?.getAttribute('data-max-date');
    const minDateAttr = inputEl?.getAttribute('data-min-date');
    const maxDate = maxDateAttr ? new Date(maxDateAttr) : undefined;
    const minDate = maxDateAttr ? new Date(minDateAttr) : undefined;
    const options = {
      ...defaultTempusdOptions,
      restrictions: {
        maxDate: maxDate,
        minDate: minDate
      }
    };
    datePickers.push(new tempusDominus.TempusDominus(groupEl, options));
  });

  const fromDateInputId = "id_from_date";
  const toDateInputId = "id_to_date";
  const fromPicker = datePickers.find(p => p.optionsStore.input.id === fromDateInputId);
  const toPicker = datePickers.find(p => p.optionsStore.input.id === toDateInputId);
  let isUpdating = false;

  if (toPicker && fromPicker) {
    $(`#${fromDateInputId}`).on("change", function (e) {
      if (isUpdating) return;
      isUpdating = true;
      const selectedFrom = e.detail.date;
      const currentTo = toPicker.dates.picked[0];

      toPicker.updateOptions({
        restrictions: { minDate: selectedFrom }
      });
      if (currentTo && currentTo < selectedFrom) {
        toPicker.dates.clear();
      }
      isUpdating = false;
    });

  }

  $(`#${toDateInputId}`).on("change", function (e) {
    if (isUpdating) return;
    isUpdating = true;
    const selectedTo = e.detail.date;
    const currentFrom = fromPicker.dates.picked[0];

    fromPicker.updateOptions({
      restrictions: { maxDate: selectedTo }
    });
    if (currentFrom && currentFrom > selectedTo) {
      fromPicker.dates.clear();
    }
    isUpdating = false;
  });

  $("#exportIncidentsForm").on("submit", function (e) {
    e.preventDefault();
    const csrftoken = getCookie('csrftoken');
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
              modal.hide();
            }
            if (data.messages) {
              const messagesContainer = $("#messages-container");
              if (messagesContainer.length) {
                messagesContainer.html(data.messages);
              }
              throw new Error(response.statusText);
            }
          });
        }

        let filename = "export.csv";
        const disposition = response.headers.get("Content-Disposition") || "";
        const match = disposition.match(/filename="?([^"]+)"?/);
        if (match && match[1]) filename = match[1];

        return response.blob().then(blob => ({ blob, filename }));
      })
      .then(({ blob, filename }) => {
        const modalEl = $form.closest(".modal");
        const link = document.createElement("a");

        link.href = URL.createObjectURL(blob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        link.remove();
        stop_spinner();

        if (modalEl.length) {
          const modal = bootstrap.Modal.getInstance(modalEl[0]);
          modal.hide();
        }

      })
      .catch(error => {
        console.error("Error:", error);
        stop_spinner();
      })
      .finally(() => stop_spinner());
  });
});




