document.addEventListener("DOMContentLoaded", function() {
  document.getElementById("language_selector").addEventListener("change", function(evt) {
    evt.preventDefault();
    document.getElementById("set_language_form").submit();
  });
});
