var expiredAt = 0x70db6800;
var startedAt = 0x61ec29ff;
var remainDays = 0x3e7;
var usedDays = 365;
var root = {
    "endAtSec": expiredAt,
    "display": true,
    "subscriptionStatus": 1,
    "startAtSec": startedAt,
    "sessionId": "",
    "name": "",
    "state": 0
};

console.log("liulishuo2.js invoked!");

$done({ body: JSON.stringify(root)});