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

      // A conditional question folded away by syncConditionals() cannot be answered, so
      // reportValidity() below would abort the step pointing at a field nobody can see.
      // Its mandatory flag is re-checked server side once the trigger answer is selected.
      if ($field.closest("[data-question-id].d-none").length) {
        continue;
      }
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

// Whether a question is currently shown in the form (its container exists and
// isn't hidden). Used to decide if a conditional question already has its own
// "View previous version" pill or should be folded into its trigger's modal.
function isQuestionDisplayed(fieldId) {
  if (!fieldId) {
    return false;
  }
  const $wrapper = $('[data-question-id="' + fieldId + '"]');
  return $wrapper.length > 0 && $wrapper.is(":visible");
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
    let node = null;
    try {
      node = JSON.parse(rawChoices);
    } catch (e) {
      node = null;
    }
    renderPreviousNode(body, node);
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

// A horizontal rule with a centered "Conditional question" caption, used to
// set a folded-in conditional question apart from its trigger.
function createConditionalSeparator() {
  const separator = document.createElement("div");
  separator.className = "d-flex align-items-center my-3 text-muted small text-uppercase";
  const left = document.createElement("hr");
  left.className = "flex-grow-1 m-0";
  const caption = document.createElement("span");
  caption.className = "px-2";
  caption.textContent = $("#conditional-question-label").text().trim();
  const right = document.createElement("hr");
  right.className = "flex-grow-1 m-0";
  separator.appendChild(left);
  separator.appendChild(caption);
  separator.appendChild(right);
  return separator;
}

// Renders one previous-answer node into the container. Choice nodes render
// disabled radios/checkboxes; any conditional child questions the answer
// triggered are rendered as blocks after the trigger question. Text nodes
// (free-text / date / country lists) render as plain text.
function renderPreviousNode(container, node) {
  if (!node) {
    return;
  }

  if (node.question) {
    const heading = document.createElement("div");
    heading.className = "fw-bold small mt-2 mb-3";
    heading.textContent = node.question;
    container.appendChild(heading);
  }

  if (node.kind === "choice") {
    const conditionals = [];
    (node.options || []).forEach(function (option) {
      const wrapper = document.createElement("div");
      wrapper.className = "form-check";
      const input = document.createElement("input");
      input.className = "form-check-input";
      input.type = node.type === "radio" ? "radio" : "checkbox";
      input.disabled = true;
      input.checked = Boolean(option.checked);
      const label = document.createElement("label");
      label.className = "form-check-label";
      label.textContent = option.label;
      wrapper.appendChild(input);
      wrapper.appendChild(label);
      container.appendChild(wrapper);

      if (option.conditional) {
        conditionals.push(option.conditional);
      }
    });

    // ST/MT questions also carry an "Add details" free-text field.
    if (node.details) {
      const group = document.createElement("div");
      group.className = "mt-3";
      const detailsLabel = document.createElement("label");
      detailsLabel.className = "form-label fw-light";
      detailsLabel.textContent = node.details.label;
      const textarea = document.createElement("textarea");
      textarea.className = "form-control";
      textarea.rows = 3;
      textarea.disabled = true;
      textarea.value = node.details.value || "";
      group.appendChild(detailsLabel);
      group.appendChild(textarea);
      container.appendChild(group);
    }

    // Conditional child questions render after the trigger question, each
    // behind a labelled divider, but only while hidden in the form: a displayed
    // one carries its own pill/modal.
    conditionals.forEach(function (child) {
      if (isQuestionDisplayed(child.field_id)) {
        return;
      }
      container.appendChild(createConditionalSeparator());
      const block = document.createElement("div");
      container.appendChild(block);
      renderPreviousNode(block, child);
    });
  } else if (node.kind === "text") {
    const paragraph = document.createElement("p");
    paragraph.className = "mb-0 previous-answer-text";
    paragraph.textContent = node.value || "";
    container.appendChild(paragraph);
  }
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

  // A browser refuses to submit a form holding a hidden required control, and reports
  // nothing because that control cannot be focused.
  $containers.find(":input").prop("required", false).removeAttr("required");

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
