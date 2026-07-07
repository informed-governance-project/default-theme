$(document).ready(function () {
  $(document).on("change", ".incident-input-field", function () {
    onChangeIncident(this);
  });

});

function onChangeIncident(input) {
  const $this = $(input)
  const incidentId = $this.data("incident-id");
  const csrftoken = getCsrftoken();
  let formdata = $this.serialize();
  const fieldName = $this.attr("name");
  const url = `incident/${incidentId}`;

  if (fieldName == 'incident_status'){
    let status = "CLOSE"
    if ($this.is(':checked')) status = "GOING"
    formdata=`incident_status=${status}`
  }

  if (fieldName == 'is_significative_impact'){
    let status = "False"
    if ($this.is(':checked')) status = "True"
    formdata=`is_significative_impact=${status}`
  }

  $.ajax({
    type: "POST",
    url: url,
    data: formdata,
    headers: {
      "X-CSRFToken": csrftoken
    },
    traditional: true,
    success: function (response) {
      const incidentId = response.id;
      const newIncidentstatus = response.incident_status;
      const newImpactstatus = response.is_significative_impact;
      const $incidentStatusHtml = $(`#incident_status_${incidentId}`);
      const $impactStatusHtml = $(`#impact_status_${incidentId}`);
      const $impactContainer = $this.closest(".dropdown-menu").find(".is_significative_impact_container");
      const $impactDropdown = $impactContainer.closest(".dropdown-item");
      const $impactInput = $impactContainer.find(".is_significative_impact_checkbox")
      const $statusIcon = $(`#incident_status_${incidentId}.logo-status`);
      const $impactIcon = $(`#impact_status_${incidentId}.logo-status`);
      const $impactLabel = $(`label.form-check-label[for="is_significative_impact_${incidentId}"]`);
      const $statusLabel = $(`label.form-check-label[for="id_incident_status_${incidentId}"]`);
      let incidentStatusTooltip = "";
      let impactStatusTooltip = ""
      const incidentTooltip = bootstrap.Tooltip.getInstance($incidentStatusHtml[0]);
      const impactTooltip = bootstrap.Tooltip.getInstance($impactStatusHtml[0]);

      $statusIcon.removeClass("custom-icon-ongoing custom-icon-closed logo-status")
      $impactIcon.removeClass("custom-icon-impact custom-icon-impact-disabled logo-status")

      if (newIncidentstatus === "CLOSE") {
        incidentStatusTooltip = gettext("The incident has been closed")
        $impactDropdown.addClass("disabled");
        $impactInput.prop("disabled", true);
        $statusIcon.addClass("custom-icon-closed logo-status");
        $statusLabel.text(gettext("Set to Active"));
      } else {
        incidentStatusTooltip = gettext("The incident is still ongoing")
        $impactDropdown.removeClass("disabled");
        $impactInput.prop("disabled", false);
        $statusIcon.addClass("custom-icon-ongoing logo-status");
        $statusLabel.text(gettext("Set to Inactive"));
      }

      if (newImpactstatus === true) {
        impactStatusTooltip = gettext("Incident with significant impact");
        $impactIcon.addClass("custom-icon-impact logo-status");
        $impactLabel.text(gettext("Set to no significant impact"));
      } else {
        impactStatusTooltip = gettext("No significant impact");
        $impactIcon.addClass("custom-icon-impact-disabled logo-status")
        $impactLabel.text(gettext("Set to significant impact"));
      }

      if (incidentTooltip && newIncidentstatus != undefined) {
        incidentTooltip.setContent({ '.tooltip-inner': incidentStatusTooltip });
        setTimeout(() => {
          if (incidentTooltip._element) incidentTooltip.hide();
        }, 1000);
      }

      if (impactTooltip && newImpactstatus != undefined) {
        impactTooltip.setContent({ '.tooltip-inner': impactStatusTooltip });
        setTimeout(() => {
          if (incidentTooltip._element) impactTooltip.hide();
        }, 1000);
      }
    },
    error: function (error) {
      console.log(error);
    }
  });
}
