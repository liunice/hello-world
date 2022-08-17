/*
QX
[rewrite_local]
^https:\/\/api\.rrmj\.cn\/user\/profile* url script-response-body http://nas/quanx/scripts/rrtv.js

QX 
[MITM]
hostname = api.rrmj.cn
by liunice
*/

var obj = JSON.parse($response.body);
obj = {"requestId":"3194892a01264ed2a2c1c9710c4ea137","code":"0000","msg":"Success","recordsTotal":null,"data":{"commentUser":true,"user":{"id":100000785124,"headImgUrl":"","isConfirmed":false,"roleInfo":"normal","level":9999,"levelStr":"yyds","sex":0,"confirmInfo":"","replyCount":0,"articleCount":0,"favoriteCount":0,"silverCount":10,"achievementCount":0,"hasSignIn":false,"sign":"","birthday":"1985-10-22","city":"","loginFrom":null,"token":null,"mobile":"18665993109","nickName":"liunice","isSilence":false,"silenceMsg":"","isBlack":false,"score":480,"continuousDay":0,"fansCount":0,"focusUserCount":0,"seriesCount":0,"actorCount":0,"focus":false,"wmSign":null, "medalList": [{
        "name": "yyds",
        "endTime": "9999-06-08 15:17:08",
        "imgUrl": "http://img.rr.tv/cover/20200424/o_1587720799676.png",
        "id": 1
      }],
      "privilegeList": [{
        "id": null,
        "createTimeStr": "",
        "createTime": null,
        "updateTime": null,
        "effectObject": "video",
        "action": "play",
        "function": "originalPainting",
        "func": "originalPainting",
        "description": "11111",
        "icon": "jiesuoyuanhua",
        "endTime": 3675562920000
      }, {
        "id": null,
        "createTimeStr": "",
        "createTime": null,
        "updateTime": null,
        "effectObject": "mall",
        "action": "sale",
        "function": "mallDiscount",
        "func": "mallDiscount",
        "description": "2222",
        "icon": "longchunshangcheng",
        "endTime": 3675562920000
      }, {
        "id": null,
        "createTimeStr": "",
        "createTime": null,
        "updateTime": null,
        "effectObject": "article",
        "action": "write",
        "function": "highLight",
        "func": "highLight",
        "description": "22222",
        "icon": "gaoliangfatie",
        "endTime": 3675562920000
      }, {
        "id": null,
        "createTimeStr": "",
        "createTime": null,
        "updateTime": null,
        "effectObject": "nickName",
        "action": "show",
        "function": "nameHighLight",
        "func": "nameHighLight",
        "description": "3333",
        "icon": "gaoliangnicheng",
        "endTime": 3675562920000
      }, {
        "id": null,
        "createTimeStr": "",
        "createTime": null,
        "updateTime": null,
        "effectObject": "comment",
        "action": "write",
        "function": "highLight",
        "func": "highLight",
        "description": "44444",
        "icon": "huifu",
        "endTime": 3675562920000
      }, {
        "id": null,
        "createTimeStr": "",
        "createTime": null,
        "updateTime": null,
        "effectObject": "danmu",
        "action": "send",
        "function": "superBarrageBlue",
        "func": "superBarrageBlue",
        "description": "44444",
        "icon": "chaojidanmu",
        "endTime": 3675562920000
      }, {
        "id": null,
        "createTimeStr": "",
        "createTime": null,
        "updateTime": null,
        "effectObject": "growth",
        "action": "play",
        "function": "0.15",
        "func": "0.15",
        "description": "5555",
        "icon": "jingyanzhijiacheng",
        "endTime": 3675562920000
      }, {
        "id": null,
        "createTimeStr": "",
        "createTime": null,
        "updateTime": null,
        "effectObject": "video",
        "action": "play",
        "function": "vipVideo",
        "func": "vipVideo",
        "description": "6666",
        "icon": "zhuanxiangjuji",
        "endTime": 3675562920000
      }, {
        "id": null,
        "createTimeStr": "",
        "createTime": null,
        "updateTime": null,
        "effectObject": "growth",
        "action": "play",
        "function": "0.4",
        "func": "0.4",
        "description": "7777",
        "icon": "jingyanzhijiacheng",
        "endTime": 3675562920000
      }, {
        "id": null,
        "createTimeStr": "",
        "createTime": null,
        "updateTime": null,
        "effectObject": "video",
        "action": "play",
        "function": "noLimit",
        "func": "noLimit",
        "description": "88888",
        "icon": "kanjuwuxianzhi",
        "endTime": 3675562920000
      }, {
        "id": null,
        "createTimeStr": "",
        "createTime": null,
        "updateTime": null,
        "effectObject": "video",
        "action": "play",
        "function": "noAd",
        "func": "noAd",
        "description": "9999",
        "icon": "kanjuwuguanggao",
        "endTime": 3675562920000
      }],"createTime":1660743773000,"newUser":false,"certLabel":null,"certNote":null,"vipMedal":{
        "name": "yyds",
        "endTime": "9999-06-08 15:17:08",
        "imgUrl": "http://img.rr.tv/cover/20200424/o_1587720799676.png",
        "id": 1,
        "isExpired": false
      },"vipLevel":"9999","changedValue":null,"isClock":false,"vipInfo":{"level":"9999","expiredTime":0,"valid":true}}}};
      
console.log("rrtv.js invoked!");

$done({body: JSON.stringify(obj)});
