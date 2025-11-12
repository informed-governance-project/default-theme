
$(document).ready(function () {
  if (localStorage.getItem("redirected") === "true") {
    $("#notify-options").addClass("d-none");
    $("#login-content").removeClass("d-none");
    $("#login_card")
      .removeClass("shadow")
      .addClass("bg-transparent border-0");
    localStorage.removeItem("redirected");
  }

  $("#with-account").on("click", function () {
    $("#notify-options").addClass("d-none");
    $("#login-content").removeClass("d-none");
    $("#login_card")
      .removeClass("shadow")
      .addClass("bg-transparent border-0");
  });

  $("#login_button").on("click", function () {
    window.location.href = "/";
    localStorage.setItem("redirected", "true");
  });

  $(".submit_login").on("click", function () {
    localStorage.setItem("redirected", "true");
  });


  $(".registration_button").on("click", function () {
    $("#notify-options").addClass("d-none");
    $("#login-content").removeClass("d-none");
  });

  $('.captcha-refresh').click(function () {
    $.getJSON("/captcha/refresh/", function (result) {
      $('.captcha').attr('src', result['image_url']);
      $('#id_captcha_0').val(result['key'])
    });
  });
});
