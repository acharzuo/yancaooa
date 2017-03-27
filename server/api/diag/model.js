'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var mongoosePaginate = require('mongoose-paginate');
var tool = require('../../utils/tools');
var BaseSchema = require('../../framework/model/baseSchema');

var diagList = new BaseSchema({
    diagName:String,//问诊单标题内容
	problem:[{
        type:Schema.Types.ObjectId,
        ref:'Problem'
    }],//问题id
    serial:[String],//序号
})
diagList.plugin(mongoosePaginate);
var Diag = exports.Diag = mongoose.model('Diag', diagList);