document.querySelectorAll('.is-valid').forEach(function (element) {
  element.classList.remove('is-valid');
});

// Catch session expiration and redirect to login page 
$(document).ajaxError(function (event, xhr) {
  if (xhr.status === 401) {
    try {
      let response = JSON.parse(xhr.responseText);
      window.location.href = response.login_url || "/";
    } catch (e) {
      window.location.href = "/";
    }
    return;
  }
});

var datatableTranslations = {
  info: gettext("Showing _START_ to _END_ of _TOTAL_ entries"),
  lengthMenu: gettext("_MENU_ entries per page"),
  aria: { orderable: gettext(": Activate to sort") },
};

// Default options for tempus dominus
const defaultTempusdOptions = {
  allowInputToggle: true,
  promptTimeOnDateChange: true,
  promptTimeOnDateChangeTransitionDelay: 50,
  localization: {
    hourCycle: 'h23',
    format: 'yyyy-MM-dd HH:mm',
  },
  display: {
    buttons: {
      today: false,
      clear: true,
      close: true
    },
    icons: {
      time: 'bi bi-clock',
      date: 'bi bi-calendar',
      up: 'bi bi-chevron-up',
      down: 'bi bi-chevron-down',
      previous: 'bi bi-chevron-left',
      next: 'bi bi-chevron-right',
      today: 'bi bi-calendar-check',
      clear: 'bi bi-trash',
      close: 'bi bi-x-lg'
    },
    keyboardNavigation: true,
  }
};


// initialize all tooltips
var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
  return new bootstrap.Tooltip(tooltipTriggerEl, { delay: 200 })
})

$(document).ready(function () {
  $('.multiselectcheckbox').multiselect({
    maxHeight: 400,
    buttonWidth: '100%',
    widthSynchronizationMode: 'always',
    buttonTextAlignment: 'left',
    nonSelectedText: gettext('Nothing selected'),
    nSelectedText: gettext('items selected'),
    numberDisplayed: 1,
    templates: {
      button: '<button class="multiselect form-select dropdown-toggle" data-bs-toggle="dropdown"><span class="multiselect-selected-text"></span></button>',
      option: '<button class="multiselect-option dropdown-item"></button>',
    }
  });

  $('.create_so_declaration').on("click", function () {
    var $popup = $("#create_so_declaration");
    var popup_url = '/securityobjectives/create';

    $(".modal-dialog", $popup).load(popup_url, function () {
      $popup.modal("show");
    });
  });

  $('.import_so_declaration').on("click", function () {
    var $popup = $("#import_so_declaration");
    var popup_url = '/securityobjectives/import';

    $(".modal-dialog", $popup).load(popup_url, function () {
      $popup.modal("show");
    });
  });

  // Accesibility hack to be compliant with RGAA 11.2
  $('[data-bs-toggle="tooltip"]').filter('input, textarea, i').removeAttr('aria-label');

  $('input[placeholder]').each(function () {
    $(this).attr('title', $(this).attr('placeholder'));
  });

  // Accesibility hack to be compliant with RGAA 10.8
  $('label.visually-hidden').remove();

  $(document).on('click', '.spinner-trigger', function () {
    load_spinner();
  });

  // Search bar form
  toggleClearButton();
})

$(document).on("click","#openFilter", function () {
  $("#filterModal").modal("show");
});

window.getCsrftoken = function () {
  return $('meta[name="csrf-token"]').attr('content');
}

window.load_spinner = function () {
  $('#loading-spinner').removeClass('d-none').fadeIn();
}

window.stop_spinner = function () {
  $('#loading-spinner').fadeOut().addClass('d-none');
}

window.addEventListener("pageshow", function (event) {
  if (event.persisted) {
    stop_spinner();
  }
});

window.addEventListener("load", function () {
  stop_spinner();
});


// Dashboard columns sort management
var sort_field_from_context = null
var sort_direction_from_context = "desc"

function initSortableHeaders(options = {}) {
  function chevron(direction = 'down') {
    const path =
      direction === 'up'
      ? 'M1.5 10.5l6-6 6 6'
      : 'M1.5 5.5l6 6 6-6';

    return $(`
      <svg class="sort-icon unsorted"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 1 16 14"
          fill="none"
          stroke="currentColor"
          stroke-width="3">
        <path d="${path}"/>
      </svg>
    `);
  }
  const {
    sortField = null,
    sortDirection = "desc",
  } = options;

  const urlParams = new URLSearchParams(window.location.search);
  const currentSortField = urlParams.get("sort_field") || sortField;
  const currentSortDirection = urlParams.get("sort_direction") || sortDirection;

  $('.sortable').each(function () {
    const $th = $(this);
    const sortFieldAttr = $th.data('sort-field');

    const label = $(document.createTextNode($th.text().trim()));
    $th.empty();

    const $container = $('<div>', {
      class: 'd-flex align-items-center justify-content-between'
    });

    const $icons = $('<span>', {
      class: 'd-flex flex-column ms-2'
    });

    const $up = chevron("up")
    const $down = chevron("down")

    // Default sort
    if (currentSortField === null && $th.hasClass('default-sort-field')) {
      $down.removeClass('unsorted')
    }

    // Active sort
    if (sortFieldAttr === currentSortField) {
      if (currentSortDirection === 'asc') {
        $up.removeClass('unsorted')
      } else {
        $down.removeClass('unsorted')
      }
    }

    $icons.append($up, $down);
    $container.append(label, $icons);
    $th.append($container);
  });
}

$(document).on('click', '.sortable', function () {
  load_spinner();
  const sortField = $(this).data('sort-field') ? $(this).data('sort-field').trim() : null;
  const params = new URLSearchParams(window.location.search);
  const currentField = params.get('sort_field') ? params.get('sort_field').trim() : sort_field_from_context;
  const currentDirection = params.get('sort_direction') ? params.get('sort_direction').trim() : sort_direction_from_context;
  const isDefaultField = $(this).hasClass("default-sort-field")

  let nextDirection = 'asc';

  if (currentField === sortField) {
    if (currentDirection === 'asc') {
      nextDirection = 'desc';
    } else if (currentDirection === 'desc' && isDefaultField) {
      nextDirection = 'asc'
    } else {
      params.delete('sort_field');
      params.delete('sort_direction');
      params.set('reset_sort', 'true');
      const query = params.toString();
      window.location.href = query
        ? `${window.location.pathname}?${query}`
        : window.location.pathname;
      return;
    }
  }

    // Apply sorting
  params.set('sort_field', sortField);
  params.set('sort_direction', nextDirection);

  window.location.search = params.toString();
});

// Dashboard columns visibility management
const STORAGE_DASHBOARD_KEY = 'Dashboard:' + encodeURIComponent(window.location.pathname);

function getStoredData() {
  return JSON.parse(localStorage.getItem(STORAGE_DASHBOARD_KEY) || '{}');
}

function saveLocalStorageData(data) {
  localStorage.setItem(STORAGE_DASHBOARD_KEY, JSON.stringify(data));
}

function setColumnVisible($table, colIdx, visible) {
  $table.find('tr').each(function () {
    $(this).children().eq(colIdx).toggle(visible);
  });
}

function saveColumnDashboardState() {
  const storedData = getStoredData();
  storedData.ColumnsState = storedData.ColumnsState || {};
  $('.column-toggle').each(function () {
    storedData.ColumnsState[$(this).data('column')] = this.checked;
  });
  saveLocalStorageData(storedData);
}

function loadColumnDashboardState($table) {
  const storedData = getStoredData();
  if (storedData.ColumnsState) {
    Object.entries(storedData.ColumnsState).forEach(([colIdx, visible]) => {
      setColumnVisible($table, Number(colIdx), visible);
      $('.column-toggle[data-column="' + colIdx + '"]').prop('checked', visible);
    });
  }
}

function changeColumnVisibility($table, checkbox) {
  const colIdx = $(checkbox).data('column');
  const visible = checkbox.checked;
  setColumnVisible($table,colIdx, visible);
  saveColumnDashboardState();
};

function initColumnsChoice($table) {
  $('.column-toggle').each(function () {
    const colIdx = $(this).data('column');
    const isVisible = $table.find('thead th').eq(colIdx).is(':visible');
    $(this).prop('checked', isVisible);
  });
};

// Search input global functions
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


// Legend status management
function loadStatusLegend() {
  const storedData = getStoredData();
  const $legend = $('#collapseLegend');

  if (storedData.show_legend === true) {
    $legend.addClass('show');
  } else if (storedData.show_legend === false) {
    $legend.removeClass('show');
  }
}

function saveStatusLegend() {
  const storedData = getStoredData();
  storedData.show_legend = !(storedData.show_legend === true);
  saveLocalStorageData(storedData);
}

// Click-handler for the CAPTCHA refresh-link
$(document).on("click", '.captcha-refresh', function () {
  $.getJSON("/captcha/refresh/", function (result) {
    $('.captcha').attr('src', result['image_url']);
    $('#id_captcha_0').val(result['key'])
  });
});






