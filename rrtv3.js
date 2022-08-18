var root = JSON.parse($response.body);

for (var i = 0; i < root.data.sortedItems.length; i++) {
    var item = root.data.sortedItems[i];
    item.canPlay = true;
    item.canShowVip = false;
}
root.data.authorityInfo.playRestricted = 0;
//root.data.watchInfo.sortedItems = root.data.sortedItems;

console.log("rrtv3.js invoked!");

$done({body: JSON.stringify(root)});
