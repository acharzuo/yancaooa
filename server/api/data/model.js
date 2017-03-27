// 诊断数据
"use strict";

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var BaseSchema = require('../../framework/model/baseSchema');

var DataSchema = new BaseSchema({
    // stomach: Array, //胃经
    // spleen: Array, //脾经
    // heart: Array, //心经
    // smallIntestine: Array, //小肠经
    // bladder: Array, //膀胱经
    // kidney: Array, //肾经
    // pericardium: Array, //心包经
    // sanjiao: Array,  //三焦经
    // gallbladder: Array, //胆经
    // liver: Array, //肝经
    // lung: Array, //肺经
    // largeIntestine: Array, //大肠经

    origin: Array, // 原始数据 by Achar

    diagnosticRecord: {
        type: Schema.Types.ObjectId,
        ref: 'DiagnosticRecord'
    },  //保存用户诊断记录id
    result: {
        type: Schema.Types.ObjectId,
        ref: 'Result'
    },  //保存用户诊断记录id

});
module.exports  = mongoose.model('Data',DataSchema);
