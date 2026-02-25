document.addEventListener('DOMContentLoaded', function() {
  let termsModal = new bootstrap.Modal(document.getElementById('termsModal'));
  let checkbox = document.querySelector('.accept-tos-input');
  termsModal.show();
  if (checkbox) {
    checkbox.focus();
  }
});