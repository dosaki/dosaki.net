// Answers every request to the apex with a permanent redirect to the site,
// keeping the path and query string. Runs at the edge, so the origin of the
// distribution is never contacted.
function handler(event) {
  var request = event.request;
  var query = Object.keys(request.querystring)
    .map(function (key) {
      var param = request.querystring[key];
      var values = param.multiValue ? param.multiValue : [param];
      return values
        .map(function (v) {
          return v.value === "" ? key : key + "=" + v.value;
        })
        .join("&");
    })
    .join("&");

  return {
    statusCode: 301,
    statusDescription: "Moved Permanently",
    headers: {
      location: {
        value: "https://${target_domain}" + request.uri + (query ? "?" + query : ""),
      },
      "cache-control": { value: "max-age=3600" },
    },
  };
}
