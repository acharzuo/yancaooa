// 诊断数据
"use strict";

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ResultSchema = new Schema({
    // data: Object, //计算后的左右值
    // difference: Array, //左右差的绝对值
    // DL: Array, //D(L)值
    // DR: Array, // D(R)值
    pairedValue: String, //匹配值
    pairedValues: Array, //最大两个匹配值
    pariedNames: String, //最大两条值
    datas: Object, // 存储计算后的数据

    diagnosticRecord: {
        type: Schema.Types.ObjectId,
        ref: 'DiagnosticRecord'
    }, //保存用户诊断记录id

});
module.exports = mongoose.model('Result', ResultSchema);