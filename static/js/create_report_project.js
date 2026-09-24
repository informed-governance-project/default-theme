$(document).ready(function () {
  const multiselectConfig = {
    numberDisplayed: 4,
    includeSelectAllOption: true,
  };

  initMultiselect($('#create-report-project-form'), multiselectConfig);

  const $standard = $('#id_standard');
  $standard.find('option[data-regulation]').hide();

  $('#id_regulation').on('change', function () {
    const selectedReg = $(this).val();
    $standard.find('option').each(function () {
      const regulation = $(this).data('regulation');
      if (!regulation || regulation == selectedReg) {
        $(this).show();
      } else {
        $(this).hide();
      }
    });
    $standard.val('');
  });


  // Dinamic range on Year comparaison Dropdown
  const $refField = $("#id_reference_year");
  const $yearsField = $("#years");

  function updateYears(refYear) {
    let selectedValues = $yearsField.val() || [];

    selectedValues = selectedValues.map(v => parseInt(v));

    // Destroy before the options change: the plugin restores the original select on
    // destroy, so tearing it down afterwards would bring the old options back.
    if ($yearsField.data('multiselect')) {
      $yearsField.multiselect("destroy");
    }

    $yearsField.empty();

    for (let i = 1; i <= 10; i++) {
      const year = refYear - i;

      const option = new Option(year, year);

      if (selectedValues.includes(year)) {
        option.selected = true;
      }

      $yearsField.append(option);
    }

    initMultiselect($yearsField, multiselectConfig);
  }

  $refField.on("change", function () {
    const refYear = parseInt($(this).val());
    updateYears(refYear);
  });

  if ($refField.val()) {
    updateYears(parseInt($refField.val()));
  }
})
