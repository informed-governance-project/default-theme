
$(document).ready(function () {

  if (localStorage.getItem("redirected") === "true") {
    $("#notify-options").addClass("d-none");
    $("#login-content").removeClass("d-none");

    localStorage.removeItem("redirected");
  }

  $("#with-account").on("click", function () {
    $("#notify-options").addClass("d-none");
    $("#login-content").removeClass("d-none");
  });

  $("#login_button").on("click", function () {
    window.location.href = "/";
    localStorage.setItem("redirected", "true");
  });


  $(".registration_button").on("click", function () {
    $("#notify-options").addClass("d-none");
    $("#login-content").removeClass("d-none");
  });
});
