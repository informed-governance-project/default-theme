$(document).ready(function () {
  let table = $('#reporting-recommendations-table').DataTable({
    dom: 'rt<"table_controls mt-3 bottom d-flex justify-content-between lh-1 small"lip><"clear">',
    language: datatableTranslations,
    autoWidth: false,
    paging: true,
    searching: false,
    order: [[0, 'asc']],
    columnDefs: [
      {
        targets: 0,
        orderable: true,
        type: 'num'
      },
      {
        targets: 0,
        orderable: true,
        type: 'string-utf8'
      },
      {
        targets: 1,
        orderable: true,
        type: 'string-utf8'
      },
      {
        targets: 2,
        orderable: false,
      },
    ],
  });

  displayPagination(table);

  function displayPagination(table) {
    let rowCount = table.data().length;
    if (rowCount <= 10) $('#reporting-recommendations-table').siblings('.table_controls').addClass("d-none");
  }

  $(document).on("click", ".delete_report_recommendation", function () {
    let $this = $(this);
    let modalDeleteButton = $("#modal-delete-report-recommendation-button");
    let deleteUrlBase = $this.data('delete-url');
    modalDeleteButton.attr('href', deleteUrlBase);
  });

  $(document).on("change", ".reporting-input-field", function () {
    onChangeRecommendation(this);
  });
});

function onChangeRecommendation(input) {
  const $this = $(input)
  const id = $this.data("recommendation-id");
  const csrftoken = getCsrftoken();
  let formdata = $this.serialize();

  $.ajax({
    type: "POST",
    url: "/reporting/recommendations/update/" + id,
    data: formdata,
    headers: {
      "X-CSRFToken": csrftoken
    },
    traditional: true,
    success: function () {
      window.location.reload();
    },
    error: function (error) {
      console.log(error);
    }
  });
}