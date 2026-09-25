$(document).ready(function () {
  const POLL_INTERVAL_MS = 2000;

  const $form = $('#exportSecurityObjectivesForm');
  const $regulation = $('#id_regulation');
  // DropdownCheckboxSelectMultiple names the select after the field, not id_<field>.
  const $standards = $('#standards');

  const standardsByRegulation = $('#so_standards_by_regulation').length
    ? JSON.parse($('#so_standards_by_regulation').text())
    : {};

  const allStandards = $standards.find('option').map(function () {
    return { value: $(this).val(), text: $(this).text().trim() };
  }).get();

  // Keep the framework list to the ones belonging to the chosen regulation, so a
  // combination that can never return a row cannot be submitted.
  function applyRegulationFilter() {
    const allowed = (standardsByRegulation[$regulation.val()] || []).map(Number);
    const selected = ($standards.val() || []).map(Number);

    // Destroy before the options change: the plugin restores the original select on
    // destroy, so tearing it down afterwards would bring the old options back.
    if ($standards.data('multiselect')) {
      $standards.multiselect('destroy');
    }

    $standards.empty();
    allStandards
      .filter(standard => allowed.includes(Number(standard.value)))
      .forEach(standard => {
        const option = new Option(standard.text, standard.value);
        option.selected = selected.includes(Number(standard.value));
        $standards.append(option);
      });

    initMultiselect($standards);
  }

  initMultiselect($form);
  applyRegulationFilter();

  $regulation.on('change', applyRegulationFilter);

  function showMessages(html) {
    const messagesContainer = $('#messages-container');
    if (messagesContainer.length && html) {
      messagesContainer.html(html);
    }
  }

  function closeModal() {
    const modalEl = $form.closest('.modal');
    if (!modalEl.length) return;

    const modal = bootstrap.Modal.getInstance(modalEl[0]);
    modalEl[0].addEventListener('hidden.bs.modal', () => {
      document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
      document.body.classList.remove('modal-open');
      document.body.style.removeProperty('overflow');
      document.body.style.removeProperty('padding-right');
    }, { once: true });
    modal.hide();
  }

  function pollExportStatus(exportId) {
    fetch(`/securityobjectives/export/${exportId}/status`, {
      headers: { 'X-Requested-With': 'XMLHttpRequest' },
    })
      .then(response => response.json())
      .then(data => {
        if (data.status === 'RUNNING') {
          setTimeout(() => pollExportStatus(exportId), POLL_INTERVAL_MS);
          return;
        }

        stop_spinner();
        closeModal();

        if (data.status === 'DONE' && data.download_uuid) {
          window.location = `/securityobjectives/export/${data.download_uuid}/download`;
          return;
        }

        showMessages(data.messages);
      })
      .catch(error => {
        console.error('Error:', error);
        stop_spinner();
      });
  }

  $form.on('submit', function (e) {
    e.preventDefault();

    const form = this;
    load_spinner();

    fetch($form.attr('action'), {
      method: 'POST',
      headers: { 'X-CSRFToken': getCsrftoken() },
      body: new FormData(form),
    })
      .then(response => response.json().then(data => ({ ok: response.ok, data })))
      .then(({ ok, data }) => {
        if (!ok) {
          stop_spinner();
          closeModal();
          showMessages(data.messages);
          return;
        }

        pollExportStatus(data.export_id);
      })
      .catch(error => {
        console.error('Error:', error);
        stop_spinner();
      });
  });
});
