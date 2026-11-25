$(document).ready(function () {
  const POLL_INTERVAL_MS = 2000;
  // Backstop for a worker that dies mid-task without ever setting a final status.
  const MAX_POLL_ATTEMPTS = 150;

  let inProgress = false;

  // Mirrors the markup django-bootstrap5 renders, so the alert is dismissible like the
  // messages the server sends back.
  function buildAlert(message) {
    return (
      `<div class="alert alert-danger alert-dismissible fade show" role="alert">${message}` +
      `<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="${gettext('Close')}"></button></div>`
    );
  }

  // A failure used to redirect back to the list, which closed any open modal and showed
  // the message on the page; this keeps that outcome.
  function finishWithMessages(html) {
    inProgress = false;
    stop_spinner();
    $('.modal.show').modal('hide');
    const messagesContainer = $('#messages-container');
    if (messagesContainer.length && html) {
      messagesContainer.html(html);
    }
  }

  // The start view answers with the module's own status and download URLs, so this
  // script serves every module.
  function pollStatus(task, attempt = 1) {
    fetch(task.status_url, {
      headers: { 'X-Requested-With': 'XMLHttpRequest' },
    })
      .then(response => response.json())
      .then(data => {
        if (data.status === 'PENDING') {
          if (attempt >= MAX_POLL_ATTEMPTS) {
            finishWithMessages(buildAlert(gettext('The report is taking longer than expected. Please try again later.')));
            return;
          }
          setTimeout(() => pollStatus(task, attempt + 1), POLL_INTERVAL_MS);
          return;
        }

        if (data.status === 'SUCCESS') {
          inProgress = false;
          stop_spinner();
          window.location = task.download_url;
          return;
        }

        finishWithMessages(data.messages);
      })
      .catch(error => {
        console.error('Error:', error);
        finishWithMessages(buildAlert(gettext('An error occurred while generating the report.')));
      });
  }

  $(document).on('click', '.js-async-pdf', function (e) {
    e.preventDefault();
    if (inProgress) return;

    inProgress = true;
    load_spinner();

    fetch(this.href, {
      method: 'POST',
      headers: { 'X-CSRFToken': getCsrftoken(), 'X-Requested-With': 'XMLHttpRequest' },
    })
      .then(response => response.json())
      .then(data => {
        if (data.task_id) {
          pollStatus(data);
          return;
        }
        finishWithMessages(data.messages);
      })
      .catch(error => {
        console.error('Error:', error);
        finishWithMessages(buildAlert(gettext('An error occurred while generating the report.')));
      });
  });
});
