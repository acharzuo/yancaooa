 //穴位管理
"use strict";

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var BaseSchema = require('../../framework/model/baseSchema');

var AcupointSchema = new BaseSchema({
    acupointName: String,  //穴位名称
    phoneticize : String,  //拼音
    otherName: String,   //别名
    image: String,  //穴位图
    internationalCode: String,   //穴位国际编码
    englishName: String,    //英文名称
    location: String,    //穴位位置
    anatomy: String,    //解剖
    indication: String, //主治病症
    operation: String,  //治疗方法操作
    easyQuery: String, //简单搜索内容

});
module.exports  = mongoose.model('Acupoint',AcupointSchema);
