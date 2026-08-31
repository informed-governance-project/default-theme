$(document).ready(function () {
  document.body.appendChild(summernoteScript);
  const multiselectConfig = {
    numberDisplayed: 3,
    enableClickableOptGroups: true,
    includeSelectAllOption: true,
    enableCollapsibleOptGroups: true,
    collapseOptGroupsByDefault: true,
    disableIfEmpty: true,
  };

  $('.multiselectcheckbox').multiselect('setOptions', multiselectConfig).multiselect('rebuild');

  $(document).on("click", '.so_versions', function () {
    let $this = $(this);
    let versions = $this.data('so-versions');
    let reviewUrlBase = $this.data('review-url');
    let downloadUrlBase = $this.data('download-url');
    let $modalVersionsRows = $('#modal-versions-rows');
    $modalVersionsRows.empty();
    let tooltip_download = gettext("Download PDF report");
    let tooltip_review = gettext("Review");
    let tooltip_comment = gettext("Comment");

    versions.forEach(function (version) {
      let reviewUrl = `${reviewUrlBase}?id=${version.id}`;
      let downloadUrl = downloadUrlBase.replace('0', version.id);
      let date = new Date(version.submit_date);
      let id = version.id;
      let status_class = version.status_class;
      let status_icon = version.status_icon;
      let status_tooltip = version.status_tooltip;
      let status_color = version.status_color;
      let reviewComment = version.review_comment;
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
          <button class="btn p-0 ps-1 border-0 d-inline-flex align-items-center so_versions_review_comment_so_declaration"
                  type="button" 
                  data-standard-answer-id="${id}"
                  data-bs-target="#so_versions_review_comment_so_declaration" 
                  data-bs-toggle="modal">
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
            <div class="hstack gap-2 ${status_color}">
              <div class="d-none ${status_class} icon-container-versions rounded-circle justify-content-center align-items-center">
                <i class="${status_icon} m-0 h6" aria-hidden="true"></i> 
              </div>
              <span>${status_tooltip}</span>
            </div>
          </td>
          <td class="col-2 text-center">
            <div class="d-inline-flex align-middle">
              ${commentIcon}
              <a class="btn text-dark p-0 ps-1 border-0 d-inline-flex align-items-center spinner-trigger" href="${reviewUrl}"
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
      $modalVersionsRows.append(row);
    });

    $modalVersionsRows.find('[data-bs-toggle="tooltip"]').tooltip();
  });

  $(document).on("click", ".delete_so_declaration", function () {
    let $this = $(this);
    let modalDeleteForm = $("#modal-delete-declaration-form");
    let deleteUrlBase = $this.data('delete-url');
    let standardAnswerId = $this.data('standard-answer-id');
    let deleteUrl = deleteUrlBase.replace('0', standardAnswerId);
    modalDeleteForm.attr('action', deleteUrl);
  });

  $(document).on("click", ".update_so_declaration", function () {
    let $this = $(this);
    let modalUpdateButton = $("#modal-update-declaration-button");
    let declarationUrl = $this.data('declaration-url');
    let modalReviewButton = $("#modal-review-declaration-button");
    let updateUrl = declarationUrl + "&update=true";
    modalReviewButton.attr('href', declarationUrl);
    modalUpdateButton.attr('href', updateUrl);
  });

  $(document).on("click", ".copy_so_declaration", function () {
    let $this = $(this);
    let standardAnswerId = $this.data('standard-answer-id');
    let $popup = $("#copy_so_declaration");
    let popup_url = `/securityobjectives/copy/${standardAnswerId}`;

    $(".modal-dialog", $popup).load(popup_url, function (response, status, xhr)  {
      if (xhr.status === 403 || xhr.status === 404) {
        window.location.reload();
      } else {
        $popup.modal("show");
      }
    });
  });

  function loadReviewCommentModal($popup, popupUrl, forceDisabled = false) {
    $popup.find(".modal-dialog").empty();

    $(".modal-dialog", $popup).load(
      popupUrl,
      function (response, status, xhr) {
        if (xhr.status === 403 || xhr.status === 404) {
          window.location.reload();
          return;
        }

        const $reviewComment =
          $popup.find("#id_review_comment");

        const options = $reviewComment.is(":disabled") || forceDisabled
          ? summernoteDisabledOptions
          : summernoteDefaultOptions;

        $reviewComment.summernote(options);

        $popup.modal("show");
      }
    );
  }

  $(document).on("click", ".review_comment_so_declaration", function () {
    let $this = $(this);
    let standardAnswerId = $this.data('standard-answer-id');
    let $popup = $("#review_comment_so_declaration");
    let popup_url = `/securityobjectives/review_comment/${standardAnswerId}`;
    loadReviewCommentModal($popup, popup_url);
  });


  $(document).on("click", ".so_versions_review_comment_so_declaration", function () {
    let $this = $(this);
    let standardAnswerId = $this.data('standard-answer-id');
    let $popup = $("#so_versions_review_comment_so_declaration");
    let popup_url = `/securityobjectives/review_comment/${standardAnswerId}?from=versions`;
    loadReviewCommentModal($popup, popup_url, true);
  });

  $(document).on("click", '.so_access_log', function () {
    var $popup = $("#so_access_log");
    var popup_url = 'access_log/' + $(this).data("standard-answer-id");

    $(".modal-dialog", $popup).load(popup_url, function () {
      $popup.modal("show");
    });
  });

  $(".download-link").on("click", function (e) {
    let $this = $(this);
    const csrftoken = getCsrftoken();
    const standardAnswerId = $this.data('standard-answer-id');
    load_spinner();
    fetch(`download/${standardAnswerId}`, {
      method: "POST",
      headers: {
        "X-CSRFToken": csrftoken,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    })
      .then(response => {
        if (!response.ok) {
          stop_spinner();
          return response.json().then(data => {
            if (data.messages) {
              const messagesContainer = $("#messages-container");
              if (messagesContainer.length) {
                messagesContainer.html(data.messages);
              }
              throw new Error(response.statusText);
            }
          });
        }
        const contentDisposition = response.headers.get("Content-Disposition");
        let filename = "report.pdf"; // default filename
        if (contentDisposition && contentDisposition.includes("filename=")) {
          filename = contentDisposition.split("filename=")[1].replace(/"/g, "");
        }

        return response.blob().then(blob => ({ blob, filename }));
      })
      .then(({ blob, filename }) => {
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
        stop_spinner()
      })
      .catch(error => {
        stop_spinner()
        console.error("Error:", error);
      });
  });

  // Prevent multiple submissions of the forms
  $(document).on("submit", "#modal-delete-declaration-form", function () {
    load_spinner();
  });

  $(document).on("submit", "#so_declaration_submit_form", function () {
    load_spinner();
  });

  $(document).on("submit", "#copy_so_declaration_form", function () {
    load_spinner();
  });

  $(document).on("click", "#modal-update-declaration-button", function () {
    load_spinner();
  });

  $(document).on("click", "#modal-review-declaration-button", function () {
    load_spinner();
  });
  $(document).on("submit", "#so-review-comment-form", function () {
    load_spinner();
  });

  // Dashboard columns sort management
  sort_field_from_context = $('#sort_field_so_table').text() ? JSON.parse($('#sort_field_so_table').text()) : null,
  sort_direction_from_context = $('#sort_direction_so_table').text() ? JSON.parse($('#sort_direction_so_table').text()) : "desc",

  initSortableHeaders(
    {
      sortField: sort_field_from_context,
      sortDirection: sort_direction_from_context,
    }
  );

  // Dashboard columns visibility management
  const $tableDashboard = $('#securityobjectives-table');
  $(document).on('show.bs.modal', '#SOhideColumns', function () {
    initColumnsChoice($tableDashboard);
  });
  $(document).on('change', '.column-toggle', function () {
    changeColumnVisibility($tableDashboard, this);
  });
  loadColumnDashboardState($tableDashboard);

  //Legend status management
  $(document).on('click', '#so_status_legend_btn', saveStatusLegend)
  loadStatusLegend();
})