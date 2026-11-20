document.addEventListener("DOMContentLoaded", function () {
  const resultTable = document.getElementById("result_list");

  if (!resultTable) return;

  const labels = Array.from(resultTable.querySelectorAll("thead th"), function (header) {
    return header.textContent.trim();
  });

  resultTable.querySelectorAll("tbody tr.data-row").forEach(function (row) {
    const cells = Array.from(row.children);

    cells.forEach(function (cell, index) {
      if (!cell.classList.contains("action-checkbox") && labels[index]) {
        cell.dataset.mobileLabel = labels[index];
      }
    });

    const titleCell = row.querySelector(".field-email, th:not(.action-checkbox)") ||
    cells.find(function (cell) {
      return cell.dataset.mobileLabel && !cell.classList.contains("field-actions_holder");
    });

    if (titleCell) titleCell.classList.add("responsive-card-title");
  });

  const resultContainer = resultTable.parentElement;

  function updateCardLayout() {
    // Measure the original table, otherwise an active card layout would measure itself.
    resultTable.classList.remove("responsive-cards-active");
    resultTable.classList.toggle(
      "responsive-cards-active",
      resultTable.scrollWidth > resultContainer.clientWidth + 1,
    );
  }

  updateCardLayout();

  if (typeof ResizeObserver === "function") {
    new ResizeObserver(updateCardLayout).observe(resultContainer);
  } else {
    window.addEventListener("resize", updateCardLayout);
  }
});
