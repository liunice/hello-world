// hostname = clients.plex.tv
// ^https?:\/\/clients\.plex\.tv(:443)?/api\/v2\/user.*?includeSubscription=1 url script-response-body https://raw.githubusercontent.com/liunice/hello-world/master/plex.js

var newXML = $response.body.replace(/<subscription.*?>/, '<subscription active="1" subscribedAt="2022-08-18 14:58:30 UTC" status="Active" paymentService="VISA" plan="Monthly">')
$done({ body: newXML });