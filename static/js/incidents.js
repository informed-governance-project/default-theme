$(document).ready(function () {
  $(document).on("click", '.access_log', function () {
    var $popup = $("#access_log");
    var popup_url = 'access_log/' + $(this).data("incident-id");

    $(".modal-dialog", $popup).load(popup_url, function (response, status, xhr) {
      if (xhr.status === 403 || xhr.status === 404) {
        window.location.reload();
      } else {
        $popup.modal("show");
      }
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
      let comment = decodeURIComponent($(this).data('comment') || '');
      $('#report_version_workflow_comment #modal-workflow-comment').val(comment);
    });
    $modalWorkflowRows.find('[data-bs-toggle="tooltip"]').tooltip();
  });

  $(document).on("click", '.delete_incident', function () {
    let $this = $(this);
    let modalDeleteForm = $("#modal-delete-form");
    let deleteUrlBase = $this.data('delete-url');
    let incidentId = $this.data('incident-id');
    let deleteUrl = deleteUrlBase.replace('0', incidentId);
    modalDeleteForm.attr('action', deleteUrl);
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

    $(".modal-dialog", $popup).load(popup_url, function (response, status, xhr) {
      if (xhr.status === 403) {
        window.location.reload();
      } else {
        $popup.modal("show");
      }
    });
  });

  // Dashboard columns sort management

  sort_field_from_context = $('#sort_field_ni_table').text() ? JSON.parse($('#sort_field_ni_table').text()) : null,
  sort_direction_from_context = $('#sort_direction_ni_table').text() ? JSON.parse($('#sort_direction_ni_table').text()) : "desc",

  initSortableHeaders(
    {
      sortField: sort_field_from_context,
      sortDirection: sort_direction_from_context,
    }
  );

  // Dashboard columns visibility management
  const $tableDashboard = $('#incidents-table');
  $(document).on('show.bs.modal', '#IncidentshideColumns', function () {
    initColumnsChoice($tableDashboard);
  });
  $(document).on('change', '.column-toggle', function () {
    changeColumnVisibility($tableDashboard, this);
  });
  loadColumnDashboardState($tableDashboard);

  //Legend status management
  $(document).on('click', '#ni_legend_btn', saveStatusLegend)
  loadStatusLegend();
});

