document.addEventListener("DOMContentLoaded", function () {
  const lastPage = localStorage.getItem("last_user_page");
  const backBtn = document.getElementById("back-to-interface");

  if (!backBtn || !lastPage) return;

  try {
    const url = new URL(lastPage, window.location.origin);

    if (url.origin === window.location.origin) {
      backBtn.href = url.pathname;
    }
  } catch (e) {
    console.error("Invalid URL in last_user_page:", e);
  }
});