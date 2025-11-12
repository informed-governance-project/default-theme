function onChangeIncident(value, id) {
  const csrftoken = getCookie('csrftoken');
  let formdata = $(value).serialize();

  if ($(value).attr('name') == 'incident_status'){
    let status = "CLOSE"
    if ($(value).is(':checked')) status = "GOING"
    formdata=`incident_status=${status}`
  }

  if ($(value).attr('name') == 'is_significative_impact'){
    let status = "False"
    if ($(value).is(':checked')) status = "True"
    formdata=`is_significative_impact=${status}`
  }

  $.ajax({
    type: "POST",
    url: "incident/" + id,
    data: formdata,
    headers: {
      "X-CSRFToken": csrftoken
    },
    traditional: true,
    success: function (response) {
      let incident_id = response.id;
      let newIncidentstatus = response.incident_status;
      let newImpactstatus = response.is_significative_impact;
      let $incident_status_html = $(`#incident_status_${incident_id}`);
      let $impact_status_html = $(`#impact_status_${incident_id}`);
      let $incident_status_checkbox = $impact_status_html.find('input[name="is_significative_impact"]');
      let incident_status_tooltip = (newIncidentstatus === "CLOSE")
        ? gettext("The incident is over")
        : gettext("The incident is still ongoing");

      let impact_status_tooltip = newImpactstatus
        ? gettext("Incident with significant impact")
        : gettext("No significant impact");

      let incident_tooltip = bootstrap.Tooltip.getInstance($incident_status_html[0]);
      let impact_tooltip = bootstrap.Tooltip.getInstance($impact_status_html[0]);

      $incident_status_checkbox.prop("disabled", newIncidentstatus === "CLOSE");

      if (incident_tooltip && newIncidentstatus != undefined) {
        incident_tooltip.setContent({ '.tooltip-inner': incident_status_tooltip });
        setTimeout(() => {
          if (incident_tooltip._element) incident_tooltip.hide();
        }, 1000);
      }

      if (impact_tooltip && newImpactstatus != undefined) {
        impact_tooltip.setContent({ '.tooltip-inner': impact_status_tooltip });
        setTimeout(() => {
          if (incident_tooltip._element) impact_tooltip.hide();
        }, 1000);
      }
    },
    error: function (error) {
      console.log(error);
    }
  });
}
