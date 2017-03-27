//穴位管理
"use strict";

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var BaseSchema = require('../../framework/model/baseSchema');

var MeridianSchema = new BaseSchema({
    meridianName: String, //经络名称
    phoneticize: String, //拼音
    otherName: String, //别名
    image: String, //经络图
    internationalCode: String, //穴位国际编码
    englishName: String, //英文名称
    original: String, //最初记载
    path: String, //循行路线
    // acupoints: [{
    //     type: Schema.Types.ObjectId,
    //     ref: "Acupoint"
    // }],
    acupoints: [], //穴位
    syndromes: String, //病候
    indication: String, //主治病症
    verses: String, //歌诀

});
module.exports = mongoose.model('Meridian', MeridianSchema);