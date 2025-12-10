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
})

window.getCookie = function (name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      // Does this cookie string begin with the name we want?
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
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
