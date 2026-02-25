document.addEventListener("DOMContentLoaded", function() {
  const select = document.getElementById("id_select_company");
  const submitBtn = document.getElementById("submit-btn");

  function toggleButton() {
    if (select.value) {
      submitBtn.disabled = false;
    } else {
      submitBtn.disabled = true;
    }
  }

      // initial check
  toggleButton();

      // update on change
  select.addEventListener("change", toggleButton);
});