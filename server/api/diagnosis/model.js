'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var mongoosePaginate = require('mongoose-paginate');
var tool = require('../../utils/tools');
var BaseSchema = require('../../framework/model/baseSchema');

var DiagNosis = new BaseSchema({
	diagId:{
        type:Schema.Types.ObjectId,
        ref:'Diag'
    },//问诊单id,
	diagnosticRecord:{
        type:Schema.Types.ObjectId,
        ref:'DiagnosticRecord'
    },//诊断数据id,
    diagName:String,//问诊单标题
	problemData:[String],//问诊结果
});
DiagNosis.plugin(mongoosePaginate);
var DiagNosis = exports.DiagNosis = mongoose.model('Diagnosis', DiagNosis);
