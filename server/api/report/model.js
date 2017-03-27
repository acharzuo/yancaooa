// 诊断数据
"use strict";

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ReportSchema = new Schema({

    diagnosticRecord: {
        type: Schema.Types.ObjectId,
        ref: 'DiagnosticRecord'
    },  //把诊断报告关联到diagnosticRecord中
    plan: {
        type: Schema.Types.ObjectId,
        ref: 'Plan'
    }
});
var Report = module.exports  = mongoose.model('Report',ReportSchema);
