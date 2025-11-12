$(document).ready(function () {
  let table = $('#access-log-table').DataTable({
    dom: 'rt<"table_controls mt-3 bottom d-flex justify-content-center lh-1 small"p><"clear">',
    language: datatableTranslations,
    autoWidth: false,
    paging: true,
    searching: false,
    order: [[0, 'desc']],
    columnDefs: [
      {
        targets: 0,
        type: 'date',
      },
    ]
  });

  displayPagination(table);

})

function displayPagination(table) {
  let rowCount = table.data().length;
  if (rowCount <= 10) $('.table_controls').addClass("d-none");
}
