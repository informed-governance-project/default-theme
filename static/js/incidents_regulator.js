function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

function onChangeIncident(value, id) {
    const csrftoken = getCookie('csrftoken');
    let formdata = $(value).serialize();

    if ($(value).attr('name') == 'incident_status'){
        let status = "CLOSE"
        if ($(value).is(':checked')) status = "GOING"
        formdata=`incident_status=${status}`
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
           
            let incident_status_tooltip = (newIncidentstatus === "CLOSE") 
                ? gettext("The incident is over") 
                : gettext("The incident is still ongoing");

            let impact_status_tooltip = newImpactstatus 
                ? gettext("Incident with significant impact") 
                : gettext("No significant impact");

            let incident_tooltip = bootstrap.Tooltip.getInstance($incident_status_html[0]);
            let impact_tooltip = bootstrap.Tooltip.getInstance($impact_status_html[0]);
            
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
