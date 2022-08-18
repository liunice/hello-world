var root = JSON.parse($response.body);

for (var i = 0; i < root.sortedItems.length; i++) {
    var item = root.sortedItems[i];
    item.canPlay = true;
}
root.authorityInfo.playRestricted = 0;
root.watchInfo.sortedItems = root.sortedItems;

console.log("rrtv3.js invoked!");

$done({body: JSON.stringify(obj)});