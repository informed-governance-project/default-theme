document.addEventListener('DOMContentLoaded', function () {
  datePickers = [];
  document.querySelectorAll('.input-group[data-td-target-input="nearest"]').forEach(function (groupEl) {
    const inputEl = groupEl.querySelector('.datetimepicker-input:not([disabled])');

    const maxDateAttr = inputEl?.getAttribute('data-max-date');
    const minDateAttr = inputEl?.getAttribute('data-min-date');
    const maxDate = maxDateAttr ? new Date(maxDateAttr) : undefined;
    const minDate = maxDateAttr ? new Date(minDateAttr) : undefined;
    const options = {
      ...defaultTempusdOptions, // defined in base.js
      restrictions: {
        maxDate: maxDate,
        minDate: minDate
      }
    };
    datePickers.push(new tempusDominus.TempusDominus(groupEl, options));
  });
});