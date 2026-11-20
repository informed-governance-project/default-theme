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

// The header dropdowns (user menu, language) are <details>; give them the behaviour users expect.
document.addEventListener("click", function (event) {
  document.querySelectorAll(".admin-dropdown[open]").forEach(function (menu) {
    if (!menu.contains(event.target)) menu.open = false;
  });
});

// Django's SelectFilter2.js turns filter_horizontal selects into the two-box picker once, on
// load. Unfold adds inline rows with its own script, not Django's inlines.js, so a row added
// later kept a plain multi-select. Unfold announces the row with formset:added.
document.addEventListener("formset:added", function (event) {
  if (typeof SelectFilter === "undefined") return;
  event.target
    .querySelectorAll("select.selectfilter, select.selectfilterstacked")
    .forEach(function (select) {
      SelectFilter.init(select.id, select.dataset.fieldName, parseInt(select.dataset.isStacked, 10));
    });
});

document.addEventListener("keydown", function (event) {
  if (event.key !== "Escape") return;
  document.querySelectorAll(".admin-dropdown[open]").forEach(function (menu) {
    menu.open = false;
    menu.querySelector("summary").focus();
  });
});
