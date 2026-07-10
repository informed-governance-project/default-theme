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

  function applyReviewStatusStyle($selector) {
    const value = $selector.val();

    $selector.removeClass("fw-bold bg-failed bg-passed text-white");
    if (value === "PASS") {
      $selector.addClass("fw-bold bg-passed text-white");
    } else if (value === "FAIL") {
      $selector.addClass("fw-bold bg-failed text-white");
    }
  }

  $(".review_status_selector")
    .each(function () {
      applyReviewStatusStyle($(this));
    })
    .on("change", function () {
      applyReviewStatusStyle($(this));
    })
    .on("focus", function () {
      const $this = $(this);
      if ($this[0].options.length > 0) {
        $this[0].options[0].disabled = true;
      }
    });

  $(".answer-modified, .st-mt-answer-modified").each(function () {
    markPreviousAnswer($(this));
  });

  const previousAnswerModal = document.getElementById("previous-answer-modal");
  if (previousAnswerModal) {
    previousAnswerModal.addEventListener("show.bs.modal", function (event) {
      renderPreviousAnswer(
        previousAnswerModal.querySelector("#previous-answer-body"),
        event.relatedTarget
      );
    });
  }

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

// Collects the deduped previous values (free-text and choice payloads) found
// anywhere inside the given scope.
function collectPreviousData($scope) {
  const text = [...new Set(
    $scope.find("[data-previous-answer]")
      .map(function () { return $(this).attr("data-previous-answer"); })
      .get()
      .filter(function (value) { return value && value.trim() !== ""; })
  )].join("\n");
  const choices = [...new Set(
    $scope.find("[data-previous-choices]")
      .map(function () { return $(this).attr("data-previous-choices"); })
      .get()
      .filter(function (value) { return value && value.trim() !== ""; })
  )][0] || "";
  return { text: text, choices: choices };
}

function buildPreviousVersionButton(previous) {
  const $button = $(
    '<button type="button"' +
    ' class="view-previous-version btn btn-sm rounded-pill text-white d-inline-flex align-items-center gap-2"' +
    ' data-bs-toggle="modal" data-bs-target="#previous-answer-modal">' +
    '<i class="bi bi-info-circle-fill" aria-hidden="true"></i>' +
    '<span class="previous-answer-label"></span>' +
    '</button>'
  );
  $button.find(".previous-answer-label").text($("#view-previous-version-label").text().trim());
  $button.attr("data-previous-answer", previous.text);
  if (previous.choices) {
    $button.attr("data-previous-choices", previous.choices);
  }
  return $button;
}

// Marks a field whose answer changed with the "display-previous-answer" outline
// and a single "View previous version" pill. Incident questions live in
// [data-question-id] containers (ST/MT span two, grouped under one outline);
// timeline date fields sit in a grid ".col" and are styled in place so the
// Bootstrap row layout is preserved.
function markPreviousAnswer($modifiedWidget) {
  const questionId = $modifiedWidget.closest("[data-question-id]").attr("data-question-id");

  if (!questionId) {
    const $col = $modifiedWidget.closest(".col");
    if (!$col.length || $col.children(".display-previous-answer").length) {
      return;
    }
    const previous = collectPreviousData($col);
    $col.wrapInner('<div class="display-previous-answer"></div>');
    $col.children(".display-previous-answer").append(buildPreviousVersionButton(previous));
    return;
  }

  const baseId = questionId.replace(/_freetext_answer$/, "");
  const $group = $(
    '[data-question-id="' + baseId + '"], ' +
    '[data-question-id="' + baseId + '_freetext_answer"]'
  );
  if (!$group.length || $group.parent(".display-previous-answer").length) {
    return;
  }
  const previous = collectPreviousData($group);
  $group.wrapAll('<div class="display-previous-answer"></div>');
  $group.first().parent(".display-previous-answer").append(buildPreviousVersionButton(previous));
}

// Fills the "previous version" modal from the clicked pill: choice questions
// (MULTI/MT/SO/ST) render their previous selection as disabled radios/checkboxes,
// everything else (and ST/MT details) as text.
function renderPreviousAnswer(body, trigger) {
  body.innerHTML = "";
  if (!trigger) {
    return;
  }

  const rawChoices = trigger.getAttribute("data-previous-choices");
  if (rawChoices) {
    let choices = null;
    try {
      choices = JSON.parse(rawChoices);
    } catch (e) {
      choices = null;
    }
    if (choices && Array.isArray(choices.options)) {
      choices.options.forEach(function (option) {
        const wrapper = document.createElement("div");
        wrapper.className = "form-check";
        const input = document.createElement("input");
        input.className = "form-check-input";
        input.type = choices.type === "radio" ? "radio" : "checkbox";
        input.disabled = true;
        input.checked = Boolean(option.checked);
        const label = document.createElement("label");
        label.className = "form-check-label";
        label.textContent = option.label;
        wrapper.appendChild(input);
        wrapper.appendChild(label);
        body.appendChild(wrapper);
      });

      // ST/MT questions also carry an "Add details" free-text field.
      if (choices.details) {
        const group = document.createElement("div");
        group.className = "mt-3";
        const detailsLabel = document.createElement("label");
        detailsLabel.className = "form-label fw-light";
        detailsLabel.textContent = choices.details.label;
        const textarea = document.createElement("textarea");
        textarea.className = "form-control";
        textarea.rows = 3;
        textarea.disabled = true;
        textarea.value = choices.details.value || "";
        group.appendChild(detailsLabel);
        group.appendChild(textarea);
        body.appendChild(group);
      }
    }
  }

  const text = trigger.getAttribute("data-previous-answer");
  if (text && text.trim() !== "") {
    const paragraph = document.createElement("p");
    paragraph.className = "mb-0 previous-answer-text";
    if (body.children.length) {
      paragraph.classList.add("mt-3");
    }
    paragraph.textContent = text;
    body.appendChild(paragraph);
  }
}

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
  $containers.closest(".display-previous-answer").addClass("d-none");

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
  var $containers = $("[data-question-id*='" + name + "']");
  $containers.removeClass("d-none");
  $containers.closest(".display-previous-answer").removeClass("d-none");
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