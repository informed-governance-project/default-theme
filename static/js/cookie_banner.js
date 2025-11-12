document.addEventListener("DOMContentLoaded", function () {
  let keyValue = document.cookie.match('(^|;) ?cookiebanner=([^;]*)(;|$)');
  let cookiebannerCookie = keyValue ? decodeURIComponent(keyValue[2]) : null;

  if (cookiebannerCookie && !window.cookiebanner_version) return;
  if (cookiebannerCookie && window.cookiebanner_version){
    if (window.cookiebanner_version == 0) return;
    if (typeof cookiebannerCookie =="string" && window.cookiebanner_version == 0) return
    if (isJson(cookiebannerCookie)) {
      parsed_cookie = JSON.parse(cookiebannerCookie)
      if (parsed_cookie.version && parsed_cookie.version == window.cookiebanner_version) return;
    }
  }

  $('#cookiebannerModal').modal("show");

  $(".cookiebannerSubmit").click(function (e) {
    let enable_cookies;
    if (this.name === 'enable_all') {
      enable_cookies = cookiegroups.map((x) => x.id);
    } else {
      let serialized_form = $("#cookiebannerForm").serializeArray();
      let checked_cookiegroups = serialized_form.map((x) => x.name);
      enable_cookies = cookiegroups
        .filter((x) => {
          return checked_cookiegroups.includes(x.id) ? x : !x.optional;
        })
        .map((x) => x.id);
    }

    let cookieData = {
      accepted: true,
      groups: enable_cookies,
      version: window.cookiebanner_version ? window.cookiebanner_version : 0
    };

    let value = encodeURIComponent(JSON.stringify(cookieData));

        // set the temporal cookie.
    let max_age = (365 * 24 * 60 * 60);
    let secure = window.location.hostname === 'localhost' ? "" : "secure";
    document.cookie = `cookiebanner=${value}; path=/; max-age=${max_age}; ${secure}`;
    location.reload();
  })
});

function isJson(str) {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
}