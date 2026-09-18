$(document).ready(function () {
  const checkboxes = $(".recommendation-select-checkbox");
  const addSelectedButton = $("#addSelectedButton");
  const checkboxesDisabled = checkboxes.filter(':disabled');
  const checkAllInput = $("#select_all_recommendations");
  const recommendationsTableForm = $("#recommendationsTableForm");

  let table = $('#add-reporting-recommendations-table').DataTable({
    dom: 'rt<"table_controls mt-3 bottom d-flex justify-content-between lh-1 small"lip><"clear">',
    language: datatableTranslations,
    autoWidth: false,
    paging: true,
    searching: false,
    order: [[1, 'asc']],
    columnDefs: [
      {
        targets: 0,
        orderable: false,
      },
      {
        targets: 1,
        orderable: true,
        type: 'string-utf8'
      },
      {
        targets: 2,
        orderable: true,
        type: 'string-utf8'
      },
      {
        targets: 3,
        orderable: true,
        type: 'string-utf8'
      },
    ],
  });

  displayPagination(table);


  function updateCheckAll() {
    checkAllInput.prop('checked', checkboxes.not(":disabled").length === checkboxes.not(":disabled").filter(":checked").length);
  }

  function processCheckboxSelection(checkbox) {
    addSelectedButton.prop("disabled", !checkboxes.is(":checked"));
  }

  function displayPagination(table) {
    let rowCount = table.data().length;
    if (rowCount <= 10) $('#add-reporting-recommendations-table').siblings('.table_controls').addClass("d-none");
  }

  checkboxes.on("change", function () {
    updateCheckAll();
    processCheckboxSelection($(this));
  });

  checkAllInput.on("change", function () {
    const isChecked = this.checked;
    checkboxes.not(":disabled").prop('checked', isChecked);
    addSelectedButton.prop("disabled", !isChecked);
  });

  if (checkboxes.length > 0) {
    processCheckboxSelection(checkboxes.filter(':checked').first());
  } else {
    addSelectedButton.prop("disabled", true);
  }

  if (checkboxesDisabled.length === checkboxes.length) {
    checkAllInput.prop('disabled', true);
  }

  addSelectedButton.on('click', function () {
    if (recommendationsTableForm.length) {
      paginationParams = table.page.info();
      table.page.len(-1).draw();
      recommendationsTableForm[0].submit();
      table.page.len(paginationParams.length).draw();
    }
  });

  $("#openFilter").on("click", function () {
    $("#filterModal").modal("show");
  })
});
