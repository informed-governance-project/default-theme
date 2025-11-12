$(function () {
    // Click-handler for the refresh-link
  $('.captcha-refresh').click(function () {
    $.getJSON("/captcha/refresh/", function (result) {
      $('.captcha').attr('src', result['image_url']);
      $('#id_captcha_0').val(result['key'])
    });
  });
});