$(document).ready(function () {
  $('.so_status_form').find('option').addClass("bg-body text-dark");

  let $security_objectives_carousel = $('#security_objectives_carousel');

  function adjustTextareaHeights() {
    $('.carousel-item.active').find('textarea').each(function () {
      let parentTd = $(this).closest('td');
      $(this).css({ height: parentTd.height() });
    });
  }

  function showActiveSOStatusForm() {
    let active_SO_Id = $('#security_objectives_carousel .carousel-item.active').attr('id')
    let form_SO_StatusId = '#form_status_' + active_SO_Id;
    $('#so_status_form > div').addClass('d-none');
    $(form_SO_StatusId).removeClass('d-none');
  }

  function checkImplementation() {
    $('.form-check-input').each(function () {
      const checkboxId = $(this).attr('id');
      const justificationId = checkboxId.replace('is_implemented', 'justification');
      const textarea = $('#' + justificationId).not(".not-required");
      const placeholdertext = gettext("Justification required");
      if (textarea.length && $(this).is(':checked') && textarea.val().trim() === "") {
        textarea
          .addClass("border border-danger border-2")
          .attr("placeholder", placeholdertext);
      } else {
        textarea
          .removeClass("border border-danger border-2")
          .removeAttr('placeholder');;
      }
    });
  }

  function checkActions() {
    const $activeSlide = $('.carousel-item.active');
    const $actionstextarea = $activeSlide.find(".so_actions_form");
    const $firstMaturityLevelMeasure = $activeSlide.find(".first_maturity_level_measure");
    const placeholdertext = gettext("Please list your current and planned measures, including a schedule with the individual stages.");
    if ($actionstextarea.val().trim() === "" && $firstMaturityLevelMeasure.is(":checked")) {
      $actionstextarea
        .attr('placeholder', placeholdertext)
        .addClass("border border-danger border-2")
    } else {
      $actionstextarea
        .removeAttr('placeholder')
        .removeClass("border border-danger border-2")
    }
  }

  function checkRequiredFields() {
    const $activeSlide = $('.carousel-item.active');
    const $checkboxes_required = $activeSlide.find(".form-check-input").not(".not-required, .readonly_field")
    const $textareas_required = $activeSlide.find(".form-control").not(".not-required, .readonly_field, .so_actions_form")
    const $checkbox_no_required = $activeSlide.find(".form-check-input.not-required").not(".readonly_field")
    const $textarea_no_required = $activeSlide.find(".form-control.not-required").not(".readonly_field")
    const $anyRequiredChecked = $checkboxes_required.is(":checked");
    const $anyNonRequiredChecked = $checkbox_no_required.is(":checked");

    if ($anyRequiredChecked) {
      $checkbox_no_required.prop("checked", false).prop("disabled", true);
      $textarea_no_required.prop("disabled", true);
    } else if ($anyNonRequiredChecked) {
      $checkboxes_required.prop("disabled", true);
      $textareas_required.prop("disabled", true);
    } else {
      $checkboxes_required
        .add($textareas_required)
        .add($checkbox_no_required)
        .add($textarea_no_required)
        .prop("disabled", false);
    }
  }

  function checkSODeclarationStatusLegend() {
    const status = localStorage.getItem('so_declaration_status_legend');
    if (status === "true") {
      $('#collapseLegend').addClass("show");
    } else {
      $('#collapseLegend').removeClass("show");
    }
  }

  $('.form-check-input').on('change', function () {
    checkImplementation();
    checkRequiredFields()
    checkActions()
  });

  $('textarea[id*="-justification"]').not(".not-required").on('input', function () {
    checkImplementation();
  });

  $('textarea[id*="-actions"]').on('input', function () {
    checkActions();
  });

  $(document).on("click", ".review_comment_so_declaration", function () {
    let $this = $(this);
    let standardAnswerId = $this.data('standard-answer-id');
    let onlyReviewComment = $this.data('only-review-comment');
    let $popup = $("#review_comment_so_declaration");
    let popup_url = `/securityobjectives/review_comment/${standardAnswerId}`;
    if (onlyReviewComment) {
      popup_url += "?only_review_comment=true";
    }
    $popup.find(".modal-dialog").empty();
    $(".modal-dialog", $popup).load(popup_url, function () {
      $popup.modal("show");
      $("#so-review-comment-form").attr("action", popup_url);
      groupEl = document.querySelector('.input-group[data-td-target-input="nearest"]')
      const options = {
        ...defaultTempusdOptions,
        restrictions: {
          minDate: new Date()
        }
      };
      if (!onlyReviewComment) {
        new tempusDominus.TempusDominus(groupEl, options);
      }
    });
  });

  $(document).on('submit', '#so-review-comment-form', function (e) {
    let $form = $(this);
    let is_only_review_comment = $form.attr('is_only_review_comment');
    if (is_only_review_comment=="False"){
      return true;
    }

    e.preventDefault();
    const csrftoken = getCookie('csrftoken');
    const url = $form.attr('action');

    fetch(url, {
      method: "POST",
      headers: {
        "X-CSRFToken": csrftoken,
        "X-Requested-With": "XMLHttpRequest"
      },
      body: new FormData(this),
    })
      .then(response => {
        if (response.ok) {
          let modalEl = $("#review_comment_so_declaration");
          let modalObj = bootstrap.Modal.getInstance(modalEl);
          modalObj.hide();
        }

      })
      .catch(error => {
        console.error("Error:", error);
      });
  });
  $security_objectives_carousel.on('slid.bs.carousel', function (event) {
    adjustTextareaHeights();
    checkRequiredFields();
    checkActions();
    showActiveSOStatusForm();
    $("#security_objective_selector").find('button[data-bs-slide-to]').removeClass("slide-active-container");
    $active_button = $("#security_objective_selector").find(`[data-bs-slide-to="${event.to}"]`);
    $active_button.addClass("slide-active-container");
  });

  adjustTextareaHeights();
  checkImplementation();
  checkRequiredFields();
  showActiveSOStatusForm();
  checkActions();
  checkSODeclarationStatusLegend();

  $("#security_objective_selector").find(`[data-bs-slide-to="0"]`).addClass("slide-active-container");

  $(document).on("click", '.so_contacts', function () {
    let $this = $(this);
    const contacts = $this.data('contacts');
    $('#contact-name').text(contacts.contact_name);
    $('#contact-first-name').text(contacts.contact_first_name);
    $('#contact-email').text(contacts.contact_email);
    $('#contact-telephone').text(contacts.contact_telephone);
  });
});

function update_so_declaration(form) {
  const csrftoken = $('input[name=csrfmiddlewaretoken]').val();
  const id = form.name.split('-').shift();
  const name = form.name.split('-').pop();
  if (form.checked !== undefined) form.value = form.checked;
  if (form.value !== undefined) {
    data = JSON.stringify({ "id": id, [name]: form.value });
    url = window.location.href.split(window.location.host).pop();

    fetch(url, {
      method: "POST",
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": csrftoken
      },
      body: data
    })
      .then((response) => {
        response.json()
          .then(data => {
            if (data.success == "false") return
            if (data.data.status) {
              let so_id = data.id;
              let $so_reg_objective_button = $("#security_objective_selector").find(`#reg_${so_id}`);
              let active_SO_Id = $('#security_objectives_carousel .carousel-item.active').attr('id')
              let form_SO_StatusId = '#form_status_' + active_SO_Id;
              let $select_SO_form = $(form_SO_StatusId).find('.so_status_form')
              $so_reg_objective_button.removeClass("btn-passed btn-warning btn-failed");
              $select_SO_form.removeClass("text-white bg-passed bg-failed")
              switch (data.data.status) {
                case "PASS":
                  $select_SO_form
                    .addClass("text-white bg-passed")
                  $so_reg_objective_button.addClass("btn-passed");
                  break;
                case "FAIL":
                  $select_SO_form
                    .addClass("text-white bg-failed")
                  $so_reg_objective_button.addClass("btn-failed");
                  break;
                default:
                  $select_SO_form
                    .addClass("text-dark")
                  $so_reg_objective_button.addClass("btn-warning");
              }
            }
            if (data.objective_state) {
              so_id = data.objective_state.id;
              $so_op_objective_button = $("#security_objective_selector").find(`#op_${so_id}`);
              $so_op_objective_button.removeClass("btn-passed btn-failed btn-warning btn-uninitiated");
              if (data.objective_state.is_completed) {
                $so_op_objective_button.addClass("btn-passed");
              } else if (data.objective_state.is_partially) {
                $so_op_objective_button.addClass("btn-warning");
              } else if (data.objective_state.is_not_started) {
                $so_op_objective_button.addClass("btn-uninitiated");
              }

            }
            $so_submit_button = $("#so_submit_button");
            $so_send_button = $("#so_send_button");
            $so_submit_button.prop("disabled", true);
            $so_submit_button.addClass("disabled");
            $so_send_button.prop("disabled", true);
            if (data.ready_to_submit) {
              $so_submit_button.prop("disabled", false);
              $so_submit_button.removeClass("disabled");
            }
            if (data.ready_to_send) {
              $so_send_button.prop("disabled", false);
            }
            if (data.so_score) {
              const $scoreElem = $('.carousel-item.active').find('#so-score');
              $scoreElem.text(`${data.so_score}`);
            }
          })
      })
      .catch((error) => {
        console.log(error);
      });
  }
}

function save_so_declaration_status_legend() {
  const current = localStorage.getItem('so_declaration_status_legend') === "true";
  const newValue = !current;
  localStorage.setItem('so_declaration_status_legend', newValue);
}