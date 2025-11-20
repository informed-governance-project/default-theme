$(document).ready(function () {
  let table = $('#securityobjectives-table').DataTable({
    autoWidth: false,
    stateSave: true,
    paging: false,
    searching: false,
    info: false,
    order: [],
    columnDefs: [
      {
        targets: 0,
        orderable: true,
        type: 'string-utf8'
      },
      {
        targets: 1,
        orderable: true,
        type: 'string-utf8',
      },
      {
        targets: 2,
        orderable: true,
        type: 'string-utf8',
      },
      {
        targets: 3,
        orderable: true,
        type: 'string-utf8',
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
        orderable: true,
        type: 'string-utf8',
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

  $('#SOhideColumns').on('show.bs.modal', function () {
    table.columns().every(function (idx) {
      var col = table.column(idx);
      var visible = col.visible();
      $('.column-toggle[data-column="' + idx + '"]').prop('checked', visible);
    });
  });

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
      $modalVersionsRows.append(row);
    });

    $modalVersionsRows.find('[data-bs-toggle="tooltip"]').tooltip();
  });



  $(document).on("click", ".delete_so_declaration", function () {
    let $this = $(this);
    let modalDeleteButton = $("#modal-delete-declaration-button");
    let deleteUrlBase = $this.data('delete-url');
    let standardAnswerId = $this.data('standard-answer-id');
    let deleteUrl = deleteUrlBase.replace('0', standardAnswerId);
    modalDeleteButton.attr('href', deleteUrl);
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

    $(".modal-dialog", $popup).load(popup_url, function () {
      $popup.modal("show");
    });
  });

  $(document).on("click", ".review_comment_so_declaration", function () {
    let $this = $(this);
    let standardAnswerId = $this.data('standard-answer-id');
    let $popup = $("#review_comment_so_declaration");
    let popup_url = `/securityobjectives/review_comment/${standardAnswerId}`;
    $popup.find(".modal-dialog").empty();
    $(".modal-dialog", $popup).load(popup_url, function () {
      $popup.modal("show");
      groupEl = document.querySelector('.input-group[data-td-target-input="nearest"]')

      const options = {
        ...defaultTempusdOptions,
        restrictions: {
          minDate: new Date()
        }
      };
      if (groupEl) new tempusDominus.TempusDominus(groupEl, options);
    });
  });

  $(document).on("click", ".so_versions_review_comment_so_declaration", function () {
    let $this = $(this);
    let standardAnswerId = $this.data('standard-answer-id');
    let $popup = $("#so_versions_review_comment_so_declaration");
    let popup_url = `/securityobjectives/review_comment/${standardAnswerId}?from=versions`;
    $popup.find(".modal-dialog").empty();
    $(".modal-dialog", $popup).load(popup_url, function () {
      $popup.modal("show");
      groupEl = document.querySelector('.input-group[data-td-target-input="nearest"]')

      const options = {
        ...defaultTempusdOptions,
        restrictions: {
          minDate: new Date()
        }
      };
      if (groupEl) new tempusDominus.TempusDominus(groupEl, options);
    });
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
    const csrftoken = getCookie('csrftoken');
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

  $("#openFilter").on("click", function () {
    $("#filterModal").modal("show");
  })

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

  function checkSOStatusLegend() {
    const status = localStorage.getItem('so_status_legend');
    if (status === "true") {
      $('#collapseLegend').addClass("show");
    } else {
      $('#collapseLegend').removeClass("show");
    }
  }

  checkSOStatusLegend();
  toggleClearButton();

})

function save_so_status_legend() {
  const current = localStorage.getItem('so_status_legend') === "true";
  const newValue = !current;
  localStorage.setItem('so_status_legend', newValue);
}