$(document).ready(function () {
  const multiselectConfig = {
    maxHeight: 400,
    buttonWidth: '100%',
    widthSynchronizationMode: 'always',
    buttonTextAlignment: 'left',
    nonSelectedText: gettext('Nothing selected'),
    nSelectedText: gettext('items selected'),
    selectAllText: gettext('Select all'),
    allSelectedText: gettext('All selected'),
    numberDisplayed: 4,
    enableClickableOptGroups: true,
    includeSelectAllOption: true,
    enableCollapsibleOptGroups: true,
    collapseOptGroupsByDefault: true,
    disableIfEmpty: true,
    selectAllValue: 0,
    templates: {
      button: '<button class="multiselect form-select dropdown-toggle" data-bs-toggle="dropdown"><span class="multiselect-selected-text"></span></button>',
      option: '<button class="multiselect-option dropdown-item"></button>',
      optionGroup: '<button type="button" class="multiselect-group dropdown-item fw-bolder"></button>',
    }
  };

  $('.multiselectcheckbox').multiselect(multiselectConfig);

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

    $yearsField.multiselect(multiselectConfig);
  }

  $refField.on("change", function () {
    const refYear = parseInt($(this).val());
    updateYears(refYear);
  });

  if ($refField.val()) {
    updateYears(parseInt($refField.val()));
  }
})
