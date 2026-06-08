$(document).ready(function () {
  $(document).on("click", '.workflow_comment', function () {
    let $this = $(this);
    let workflowComment =decodeURIComponent($this.data('workflow-comment') || '');
    let status = $this.data('status');
    let reviewStatusCssClass = $this.data('status-css-class');
    let $modalWorkflowComment = $('#workflow_comment').find('#modal-workflow-comment');
    let $statusContainer = $('#workflow_comment').find('#status-container');
    $statusContainer
      .attr("class","form-select fw-bolder text-white")
      .addClass(`bg-${reviewStatusCssClass}`)
      .html(`<option value="${reviewStatusCssClass}" selected>${status}</option>`);
    $modalWorkflowComment.summernote(summernoteDisabledOptions);
    $modalWorkflowComment.summernote("code", workflowComment);
  });
});
