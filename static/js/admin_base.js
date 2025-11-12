document.addEventListener("DOMContentLoaded", function () {
  const lastPage = localStorage.getItem("last_user_page");
  const backBtn = document.getElementById("back-to-interface");
  if (lastPage) {
    backBtn.href = lastPage;
  }
});