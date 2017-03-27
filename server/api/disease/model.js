'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var mongoosePaginate = require('mongoose-paginate');
var tool = require('../../utils/tools');
var BaseSchema = require('../../framework/model/baseSchema');

var disease = new BaseSchema({
    disease:String,//病症
	main_points:{
		type:mongoose.SchemaTypes.ObjectId,
		ref:'Acupoint'
	},//主穴
	acu_points:[{
		type:mongoose.SchemaTypes.ObjectId,
		ref:'Acupoint'
	}],//配穴
    pointsNum:Number,//穴数量
	way:'String'
})
disease.plugin(mongoosePaginate);
module.exports = mongoose.model('Disease', disease);