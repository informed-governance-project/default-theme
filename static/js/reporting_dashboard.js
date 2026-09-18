$(document).ready(function () {
  const multiselectConfig = {
    numberDisplayed: 3,
    enableClickableOptGroups: true,
    includeSelectAllOption: true,
    enableCollapsibleOptGroups: true,
    collapseOptGroupsByDefault: true,
    disableIfEmpty: true,
    selectAllValue: 0,
  };

  $('.multiselectcheckbox').multiselect('setOptions', multiselectConfig).multiselect('rebuild');


  $(document).on("click", ".delete_report_project", function () {
    let $this = $(this);
    let modalDeleteForm = $("#modal-delete-report-form");
    let deleteUrlBase = $this.data('delete-url');
    let projectId = $this.data('project-id');
    let deleteUrl = deleteUrlBase.replace('0', projectId);
    modalDeleteForm.attr('action', deleteUrl);
  });

  // Dashboard columns sort management
  sort_field_from_context = $('#sort_field_reporting_table').text() ? JSON.parse($('#sort_field_reporting_table').text()) : null,
  sort_direction_from_context = $('#sort_direction_reporting_table').text() ? JSON.parse($('#sort_direction_reporting_table').text()) : "desc",

  initSortableHeaders(
    {
      sortField: sort_field_from_context,
      sortDirection: sort_direction_from_context,
    }
  );

  $(document).on("click", '.reporting_access_log', function () {
    var $popup = $("#reporting_access_log");
    var popup_url = `access_log/${$(this).data("project-id")}`;

    $(".modal-dialog", $popup).load(popup_url, function () {
      $popup.modal("show");
    });
  });

  // Dashboard columns visibility management
  const $tableDashboard = $('#reporting-table');
  $(document).on('show.bs.modal', '#ReportinghideColumns', function () {
    initColumnsChoice($tableDashboard);
  });
  $(document).on('change', '.column-toggle', function () {
    changeColumnVisibility($tableDashboard, this);
  });
  loadColumnDashboardState($tableDashboard);




  const pollTimers = {};

  function startPolling(projectId) {
    const downloadButton = $(`#download_reports[data-project-id="${projectId}"]`)
    downloadButton.off("mouseenter.running mouseleave.running click.running")
    downloadButton.removeClass("disabled")

    downloadButton.on("mouseenter.running", function () {
      downloadButton.empty()
      downloadButton.removeClass("btn-running").addClass("btn-stop")
      downloadButton.append($('<i>', { class: "bi bi-sign-stop-fill" }))
      downloadButton.append($('<span>', { class: "ms-2", text: gettext("Stop generating") }))
    })

    downloadButton.on("mouseleave.running", function () {
      downloadButton.empty()
      downloadButton.removeClass("btn-stop").addClass("btn-running")
      downloadButton.append($('<div>', { class: "spinner-border spinner-border-sm", role: "status" }))
      downloadButton.append($('<span>', { class: "ms-2", text: gettext("Generating report") }))
    })

    downloadButton.on("click.running", function (e) {
      e.preventDefault()
      e.stopPropagation()
      const csrftoken = getCsrftoken();
      $.ajax({
        url: `project/${projectId}/report/cancel`,
        method: "POST",
        headers: { "X-CSRFToken": csrftoken },
      })
    })

    stopPolling(projectId);
    pollTimers[projectId] = setInterval(function () {
      $.get(`project/${projectId}/report/status`, function (data) {
        updateUI(projectId, data)
        if (isTerminalState(data.status)) {
          downloadButton.off("mouseenter.running mouseleave.running click.running")
          stopPolling(projectId);
          onTaskFinished(projectId,data);
        }
        if (data.messages) {
          const messagesContainer = $("#messages-container");
          if (messagesContainer.length) {
            messagesContainer.html(data.messages);
          }
        }
      }).fail(function () {
        console.warn("Error");
      });
    }, 1500);
  }

  function stopPolling(projectId) {
    if (projectId) {
      clearInterval(pollTimers[projectId]);
      delete pollTimers[projectId];
    } else {
      Object.keys(pollTimers).forEach(id => {
        clearInterval(pollTimers[id]);
        delete pollTimers[id];
      });
    }
  }

  function updateUI(projectId, data) {
    const downloadButton = $(`#download_reports[data-project-id="${projectId}"]`)
    downloadButton.removeClass("btn-primary btn-running btn-stop");
    downloadButton.empty()
    switch (data.status) {
      case "FAIL":
      case "ABORT":
      case "DONE":
        const $icon = $('<i>', { class: "ms-2 bi bi-download" })
        const $text_done = $('<span>', { text: gettext("Download") })
        downloadButton.off("mouseenter.running mouseleave.running click.running")
        downloadButton.addClass("btn-primary")
        downloadButton.append($text_done).append($icon)
        break;

      case "RUNNING":
        const $spinner = $('<div>', { class: "spinner-border spinner-border-sm", role: "status" })
        const $text_running = $('<span>', { class: "ms-2", text: gettext("Generating report") })

        downloadButton.addClass("btn-running ")
        downloadButton.append($spinner).append($text_running)

        if (downloadButton.is(":hover")) {
          downloadButton.trigger("mouseenter.running")
        }
    }
  }

  function onTaskFinished(projectId, data) {
    const downloadButton = $(`#download_reports[data-project-id="${projectId}"]`)
    if (data.download_uuid) {
      downloadButton.attr("href", `project/${projectId}/report/download/${data.download_uuid}`);
    } else {
      if (downloadButton.attr("href") === undefined) {
        downloadButton.addClass("disabled")
      }
    }
  }

  function isTerminalState(status) {
    return ["FAIL", "DONE", "ABORT"].includes(status);
  }

  projectsRunning = $('#projects-running-data').text() ? JSON.parse($('#projects-running-data').text()) : [],

  projectsRunning.forEach(function(project) {
    updateUI(project.id, { status: "RUNNING" })
    startPolling(project.id)
  })

});
