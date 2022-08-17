var obj = JSON.parse($response.body);
obj = {"requestId":"1e8f7996df9d44e782588b582fc8d020","code":"0000","msg":"Success","recordsTotal":null,"data":{"level":"9999","expiredTime":0,"valid":true}}

console.log("rrtv2.js invoked!");

$done({body: JSON.stringify(obj)});