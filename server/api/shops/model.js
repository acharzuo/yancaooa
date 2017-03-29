// 养生资讯
"use strict";

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var BaseSchema = require('../../framework/model/baseSchema');
var tool = require('../../utils/tools');

var schema = new BaseSchema({
    name:       String,  // 企业(字号)名称
    image:      String,  // 门头图片
    licenseId:  String,  // 许可证号
    register: {          // 许可时间
        type: Number,
        default: tool.getCurUtcTimestamp
    },
    expire: {           // 许可终值时间
        type: Number,
        default: tool.getCurUtcTimestamp  // 默认超期一年
    },
    manager:    String,   // 负责人
    address:    String,   // 地址
    //permission: Number,   //权限  0 仅自己可见 1开放浏览
    status:     String,   // 当前状态
    geolocation: Object,  // 全球坐标
    coords:     Object,   // 经纬度

});
module.exports  = mongoose.model('shops', schema);
//
//{"shop":{"licenseId":"371621116239","name":"新意书店","manager":"李守和","regist":"2017-03-21","expire":"2018-12-31","address":"山东省滨州市惠民县胡集镇北李村","status":"初始申请","image":"title.png"},"geolocation":{"coordsType":"gcj02","address":{"cityCode":"010","province":"北京市","district":"朝阳区","poiName":"元大都城垣遗址公园管理处","street":"北土城东路","city":"北京市","country":"中国"},"addresses":"北京市朝阳区北土城东路靠近元大都城垣遗址公园管理处","coords":{"latitude":39.976504,"longitude":116.427344,"accuracy":29,"altitude":0,"heading":null,"speed":0,"altitudeAccuracy":0},"timestamp":1490685137529}}
//{"code":0,"message":"成功","result":"NULL"}
//{"shop":{"licenseId":"371621116239","name":"新意书店","manager":"李守和",
//    "regist":"2017-03-21","expire":"2018-12-31","address":"山东省滨州市惠民县胡集镇北李村",
//    "status":"初始申请","image":"title.png"},
//    "geolocation":{"coordsType":"gcj02","address":{"cityCode":"010","province":"北京市","district":"朝阳区","poiName":"元大都城垣遗址公园管理处","street":"北土城东路","city":"北京市","country":"中国"},"addresses":"北京市朝阳区北土城东路靠近元大都城垣遗址公园管理处","coords":{"latitude":39.976504,"longitude":116.427344,"accuracy":29,"altitude":0,"heading":null,"speed":0,"altitudeAccuracy":0},"timestamp":1490685137529}}