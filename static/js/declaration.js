$(document).ready(function () {
  $('.multiselectcheckbox').multiselect('setOptions', {
    numberDisplayed: 5,
  }).multiselect('rebuild');

  // Summernote Editor Initialization
  document.body.appendChild(summernoteScript);
  let $summernote_textarea = $('.summernote');
  let summernoteOptions = $summernote_textarea.is(':disabled')
    ? summernoteDisabledOptions
    : summernoteDefaultOptions;

  summernoteScript.onload = () => {
    $summernote_textarea.summernote(summernoteOptions);
  };

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


  $("#id_0-incident_detection_date").on("change.td", function () {
    const startingDateInputId = "id_0-incident_starting_date";
    const resolutionDateInputId = "id_0-incident_resolution_date";
    const detectionDate = new Date($(this).val());
    if ($(`#${startingDateInputId}`)) {
      let startingPicker = datePickers.find(p => p.optionsStore.input.id === startingDateInputId);
      if (startingPicker) {
        startingPicker.dates.clear();
        startingPicker.updateOptions({
          restrictions: { maxDate: detectionDate }
        });
      };
    }
    if ($(`#${resolutionDateInputId}`)) {
      const resolutionPicker = datePickers.find(p => p.optionsStore.input.id === resolutionDateInputId);
      if (resolutionPicker) {
        resolutionPicker.dates.clear();
        resolutionPicker.updateOptions({
          restrictions: { minDate: detectionDate }
        });
      };
    }
  });

  $('#wizard-next-btn').on('click', function (event) {
    const form = $(this).closest('form')[0];
    const lastStep = $(this).data('last-step');
    const currentStep = $(this).data('current-step');

    let firstInvalid = null;
    let allValid = true;

    $(form).find(':input').removeClass('is-invalid');

    for (const field of form.elements) {
      let $field = $(field);
      let $freeTextInput = $("#id_" + field.name + "_freetext_answer");
      let $radios = $("#id_" + field.name).find('input[type="radio"]');
      let $container = $radios.closest('.mb-3');

      if ($container.hasClass('required-field') && $freeTextInput.length) {
        if ($freeTextInput.val().trim() !== "") {
          $radios.prop("required", false).removeAttr("required");
          $freeTextInput.prop("required", false).removeAttr("required");
        } else if ($radios.is(":checked")) {
          $radios.prop("required", true).attr("required", "required");
          $freeTextInput.prop("required", false).removeAttr("required");
        } else {
          $radios.prop("required", true).attr("required", "required");
          $freeTextInput.prop("required", true).attr("required", "required");
        }
      }

      if (field.willValidate && !field.checkValidity()) {
        allValid = false;
        $field.addClass('is-invalid');

        if (!firstInvalid) {
          firstInvalid = field;
        }
      }
    }

    if (!allValid) {
      firstInvalid.focus();
      firstInvalid.reportValidity();
      return;
    }

    if (lastStep === currentStep) {
      load_spinner();
    }
  });

  let allTextarea = $('textarea');

  if (allTextarea.length > 0) {
    allTextarea.each(function () {
      if ($(this).prop('disabled')) $(this).attr('rows', '10');
    });

    allTextarea.on('focus', function () {
      if (!$(this).prop('disabled')) $(this).attr('rows', '10');
    });

    allTextarea.on('blur', function () {
      if (!$(this).prop('disabled')) $(this).attr('rows', '3');
    });
  }

  const $stepsBar = $('#nav-steps');
  const $stepBarNav = $stepsBar.find('.nav');
  const $declarationContainer = $('#declaration-container');
  let singleLineHeight = null;

  function getSingleLineHeight() {
    $stepBarNav.css('flex-nowrap');
    const height = $stepBarNav.outerHeight();
    $stepBarNav.css('flex-nowrap', '');
    return height;
  }

  function checkWrap() {
    const currentHeight = $stepsBar.outerHeight();
    const container_width = $declarationContainer.outerWidth();
    const stepbar_width = $stepsBar.outerWidth(true) + 5;

    if (!singleLineHeight) {
      singleLineHeight = getSingleLineHeight();
    }

    if (stepbar_width > container_width && currentHeight > singleLineHeight + 10) {
      $declarationContainer.addClass('pt-3');
    } else {
      $declarationContainer.removeClass('pt-3');
    }
  }

  const observer = new ResizeObserver(function (entries) {
    checkWrap();
  });

  observer.observe($stepsBar[0]);
  checkWrap();

  $('[name="wizard_goto_step"]').on('click', function () {
    const lastStep = $(this).data('last-step')
    const currentStep = $(this).data('current-step');
    if (lastStep === currentStep) {
      return;
    }
    localStorage.setItem("step-changed", "1");
  });

  if (localStorage.getItem("step-changed") === "1") {
    const title = $("#declaration-title-page");
    if (title.length) {
      title[0].scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }
    localStorage.removeItem("step-changed");
  }

  const ContactfieldPairs = [
    ["contact_lastname", "technical_lastname"],
    ["contact_firstname", "technical_firstname"],
    ["contact_title", "technical_title"],
    ["contact_email", "technical_email"],
    ["contact_telephone", "technical_telephone"],
  ];

  $(".is_technical_the_same").on("change", function () {
    if (this.checked) {
      ContactfieldPairs.forEach(function ([sourceClass, targetClass]) {
        const sourceVal = $("." + sourceClass).val();
        $("." + targetClass).val(sourceVal);
      });
    } else {
      ContactfieldPairs.forEach(function ([_, targetClass]) {
        $("." + targetClass).val("");
      });
    }
  });

  $(".review_status_selector")
    .on("change", function () {
      const $this = $(this);
      const value = $this.val();

      $this.removeClass("fw-bold bg-failed bg-passed text-white");
      if (value === "PASS") {
        $this.addClass("fw-bold bg-passed text-white");
      } else if (value === "FAIL") {
        $this.addClass("fw-bold bg-failed text-white");
      }
    })
    .on("focus", function () {
      const $this = $(this);
      if ($this[0].options.length > 0) {
        $this[0].options[0].disabled = true;
      }
    });

  $(".answer-modified").each(function () {
    $(this).closest("#question-answer-container")
      .prev('#question-label-container')
      .addClass("display-previous-answer");
  });

  $(".st-mt-answer-modified").each(function () {
    $(this).closest("#st-sm-details-container")
      .prev('#question-answer-container')
      .prev('#question-label-container')
      .addClass("display-previous-answer");
  });

  // Conditional Questions
  initConditionalInputs();
  syncConditionals();

  $(document).on("change", "input[type='radio']", function () {
    var groupName = $(this).attr("name");
    $("input[name='" + groupName + "'][data-next-question-id]").each(function () {
      hideQuestion($(this).data("next-question-id"));
    });
    syncConditionals();
  });

  $(document).on("change", "input[type='checkbox']", function () {
    syncConditionals();
  });

});

function initConditionalInputs() {
  $("[data_conditionals]").each(function () {
    var $wrapper = $(this);
    var map;
    try {
      map = JSON.parse($wrapper.attr("data_conditionals"));
    } catch (e) {
      return;
    }


    $.each(map, function (answerId, nextQuestionOptionsId) {
      $wrapper
        .find("input[type='radio'][value='" + answerId + "']," +
          "input[type='checkbox'][value='" + answerId + "']")
        .attr("data-next-question-id", nextQuestionOptionsId);
    });
  });
}

/**
 * Build the field name (= data-question-id on the containers) from
 * a QuestionOptions id. Field names follow the pattern set in
 * QuestionForm.create_question: "__question__<question_option_id>".
 */
function fieldName(questionOptionsId) {
  return "__question__" + questionOptionsId;
}

/**
 * Hide a conditional question and recursively hide any further
 * conditional questions it may itself have triggered.
 */
function hideQuestion(questionOptionsId) {
  var name = fieldName(questionOptionsId);
  var $containers = $("[data-question-id*='" + name + "']");
  $containers.addClass("d-none");

  // uncheck inputs inside so nested conditionals are cleared
  $containers.find("input[type='radio'], input[type='checkbox']").prop("checked", false);

  // recurse into any nested conditionals
  $containers.find("input[data-next-question-id]").each(function () {
    hideQuestion($(this).data("next-question-id"));
  });
}

/**
 * Show the question containers for the given QuestionOptions id.
 */
function showQuestion(questionOptionsId) {
  var name = fieldName(questionOptionsId);
  $("[data-question-id*='" + name + "']").removeClass("d-none");
}

/**
 * Re-evaluate all conditional inputs and sync visibility.
 */
function syncConditionals() {
  $("input[data-next-question-id]").each(function () {
    var nextId = $(this).data("next-question-id");

    if ($(this).is(":checked")) {
      showQuestion(nextId);
    } else {
      var stillActive = $(
        "input[data-next-question-id='" + nextId + "']:checked"
      ).length > 0;
      if (!stillActive) {
        hideQuestion(nextId);
      }
    }
  });
}