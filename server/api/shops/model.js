// 养生资讯
"use strict";

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var BaseSchema = require('../../framework/model/baseSchema');
var tool = require('../../utils/tools');

var schema = new BaseSchema({
    name:       String,  // 企业(字号)名称
    spellShortName: String, // 拼音简写
    spellName:  String,  // 名称拼音
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

