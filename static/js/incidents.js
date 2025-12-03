$(document).ready(function () {
  let table = $('#incidents-table').DataTable({
    autoWidth: false,
    stateSave: true,
    paging: false,
    searching: false,
    info: false,
    order: [[2, 'desc']],
    initComplete: function () {
      stop_spinner();
    },
    columnDefs: [
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
        orderable: true,
        type: 'string-utf8'
      },
      {
        targets: 3,
        orderable: true,
        type: 'string-utf8'
      },
      {
        targets: 4,
        orderable: true,
        type: 'string-utf8'
      },
      {
        targets: 5,
        orderable: true,
        type: 'string-utf8'
      },
      {
        targets: 6,
        orderable: true,
        type: 'string-utf8'
      },
      {
        targets: 7,
        orderable: false,
      },
      {
        targets: 8,
        orderable: false,
      },
    ]
  });

  $('.column-toggle').on('change', function () {
    var colIdx = $(this).data('column');
    table.column(colIdx).visible(this.checked);
  });

  $('#IncidentshideColumns').on('show.bs.modal', function () {
    table.columns().every(function (idx) {
      var col = table.column(idx);
      var visible = col.visible();
      $('.column-toggle[data-column="' + idx + '"]').prop('checked', visible);
    });
  });


  $(document).on("click", '.access_log', function () {
    var $popup = $("#access_log");
    var popup_url = 'access_log/' + $(this).data("incident-id");

    $(".modal-dialog", $popup).load(popup_url, function () {
      $popup.modal("show");
    });
  });

  $(document).on("click", '.report_versions', function () {
    let $this = $(this);
    let reportId = $this.data('report');
    let incidentRef = $this.data('incident-ref');
    let workflows = $this.data('workflows');
    let reviewUrlBase = $this.data('review-url');
    let downloadUrlBase = $this.data('download-url');
    let $modalReportName = $('#modal-report-name');
    let $modalincidentRef = $('#modal-incident-ref');
    let $modalWorkflowRows = $('#modal-workflow-rows');
    let $captionAccessibility = $('#caption-accessibility');


    $modalReportName.text(reportId);
    let currentText = $captionAccessibility.text();
    $captionAccessibility.text(currentText + ' : ' + reportId);
    $modalincidentRef.text(incidentRef);
    $modalWorkflowRows.empty();
    let tooltip_download = gettext("Download PDF report");
    let tooltip_review = gettext("Review");
    let tooltip_comment = gettext("Comment");

    workflows.forEach(function (workflow) {
      let reviewUrl = reviewUrlBase + workflow.id;
      let downloadUrl = downloadUrlBase.replace('0', workflow.id);
      let date = new Date(workflow.timestamp);
      let reviewStatus = workflow.review_status;
      let reviewStatusCssClass = workflow.css_class;
      let reviewComment = workflow.comment;
      let commentIcon = '';

      let formattedDate = date.toLocaleDateString('en-GB', {
        day: '2-digit', month: '2-digit', year: '2-digit'
      });
      let formattedTime = date.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit'
      });

      if (reviewComment != null && reviewComment !== '') {
        // Create a button with a data-comment uinique
        commentIcon = `
          <button class="btn p-0 ps-1 border-0 d-inline-flex align-items-center comment-btn"
                  type="button" data-bs-target="#report_version_workflow_comment" 
                  data-bs-toggle="modal" 
                  data-comment="${encodeURIComponent(reviewComment)}">
            <i class="custom-icon-comments h4 align-self-center" 
              data-bs-placement="top" data-bs-toggle="tooltip" title="${tooltip_comment}">
            </i>
          </button>
        `;
      } else {
        commentIcon = `
          <button class="btn p-0 ps-1 border-0 d-inline-flex align-items-center"
                  type="button" disabled>
            <i class="custom-icon-comments-disabled h4 align-self-center">
            </i>
          </button>
        `;
      }

      let row = `
        <tr>
          <td class="col-2 small">${formattedDate}</td>
          <td class="col-3 small">
            <i class="bi bi-clock small" aria-hidden="true"></i> 
            ${formattedTime}
          </td>
          <td class="col-5 small">
            <div class="hstack gap-1 text-${reviewStatusCssClass}">
              <i class="custom-icon-${reviewStatusCssClass}" aria-hidden="true"></i> 
              <span>${reviewStatus}</span>
            </div>
          </td>
          <td class="col-2 text-center">
            <div class="d-inline-flex align-middle">
              ${commentIcon}
              <a class="btn text-dark p-0 ps-1 border-0 d-inline-flex align-items-center" href="${reviewUrl}"
                  data-bs-placement="top" data-bs-toggle="tooltip" title="${tooltip_review}">
                  <i class="custom-icon-view h4 align-self-center" aria-hidden="true"></i>
              </a>
              <a class="btn p-0 ps-1 border-0 d-inline-flex align-items-center" href="${downloadUrl}" 
                  data-bs-placement="top" data-bs-toggle="tooltip" title="${tooltip_download}">
                  <i class="custom-icon-pdf-small h4 align-self-center" aria-hidden="true"></i>
              </a>
            </div>
          </td>
        </tr>
      `;
      $modalWorkflowRows.append(row);
    });

    // Show the comment
    $(document).on('click', '.comment-btn', function () {
      const comment = decodeURIComponent($(this).data('comment') || '');
      $('#report_version_workflow_comment')
        .find('#modal-workflow-comment')
        .html(comment);
    });
    $modalWorkflowRows.find('[data-bs-toggle="tooltip"]').tooltip();
  });

  $(document).on("click", '.delete_incident', function () {
    let $this = $(this);
    let modalDeleteButton = $("#modal-delete-button");
    let deleteUrlBase = $this.data('delete-url');
    let incidentId = $this.data('incident-id');
    let deleteUrl = deleteUrlBase.replace('0', incidentId);
    modalDeleteButton.attr('href', deleteUrl);
  });

  $(document).on("click", '.contacts_incident', function () {
    let $this = $(this);
    const contacts = $this.data('contacts');
    if (contacts.contact_name == contacts.technical_name) {
      $('#technical-card').remove();
      let both_subtitle = $('#translated-both-contact-text').text();
      $('#card-subtitle-contact').text(both_subtitle);
    }

    $('#contact-name').text(contacts.contact_name);
    $('#contact-jobtitle').text(contacts.contact_jobtitle);
    $('#contact-email').text(contacts.contact_email);
    $('#contact-telephone').text(contacts.contact_telephone);
    $('#technical-name').text(contacts.technical_name);
    $('#technical-jobtitle').text(contacts.technical_jobtitle);
    $('#technical-email').text(contacts.technical_email);
    $('#technical-telephone').text(contacts.technical_telephone);
  });

  $(document).on("click", ".export_incidents", function () {
    let $popup = $("#export_incidents");
    let popup_url = `/incidents/export_incidents`;

    $(".modal-dialog", $popup).load(popup_url, function () {
      $popup.modal("show");
    });
  });

  $("#openFilter").on("click", function () {
    $("#filterModal").modal("show");
  });


  const $search_bar_form = $("#search_bar_form")
  const $search_bar_input = $("#id_search")
  const $clearSearchBtn = $("#clearSearch")

  function toggleClearButton() {
    if ($search_bar_input.val() !== "") {
      $clearSearchBtn.removeClass("d-none");
    } else {
      $clearSearchBtn.addClass("d-none");
    }
  }

  $(document).on("input", $search_bar_input, toggleClearButton)

  $(document).on("click", "#clearSearch", function () {
    $search_bar_input.val("");
    toggleClearButton();
    $search_bar_form.trigger("submit");
  });

  $(document).on("submit", $search_bar_form, function () {
    load_spinner()
  });

  function checkNIStatusLegend() {
    const status = localStorage.getItem('ni_status_legend');
    if (status === "true") {
      $('#collapseLegend').addClass("show");
    } else {
      $('#collapseLegend').removeClass("show");
    }
  }

  checkNIStatusLegend();
  toggleClearButton();
});

function save_ni_status_legend() {
  const current = localStorage.getItem('ni_status_legend') === "true";
  const newValue = !current;
  localStorage.setItem('ni_status_legend', newValue);
}

