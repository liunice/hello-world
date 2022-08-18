var root = JSON.parse($response.body);

var expiredAt = 0x70db6800;
var startedAt = 0x61ec29ff;
var remainDays = 0x3e7;
var usedDays = 365;

root.cc.bought = true;
root.cc.expiredAtSec = expiredAt;

root.darwin.usedDays = usedDays;
root.darwin.bought = true;

root.hasPaidContent = true;

console.log("liulishuo.js invoked!");

$done({ body: JSON.stringify(root)});