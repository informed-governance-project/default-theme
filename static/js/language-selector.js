document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("set_language_form");
  const languageInput = document.getElementById("language_input");

  document.querySelectorAll(".select-lang-button")
    .forEach(button => {
      button.addEventListener("click", function () {
        const language = this.dataset.language;
        languageInput.value = language;
        form.submit();
      });
    });
});


