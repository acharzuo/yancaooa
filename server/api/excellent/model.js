'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var mongoosePaginate = require('mongoose-paginate');
var tool = require('../../utils/tools');
var BaseSchema = require('../../framework/model/baseSchema');

var excellentCase = new BaseSchema({
	userId:{
		type:mongoose.SchemaTypes.ObjectId,
		ref:'DiagnosticRecord'
	},//用户id
    caseName:String,//案例标题
    label:[String],
    content:String,//内容
	preview:{
		type:Number,
		default:0
	},//浏览数
	imgSrc:String,
})
excellentCase.plugin(mongoosePaginate);
var excellentCase = exports.excellentCase = mongoose.model('ExcellentCase', excellentCase);