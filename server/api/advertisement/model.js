'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var mongoosePaginate = require('mongoose-paginate');
var tool = require('../../utils/tools');
var BaseSchema = require('../../framework/model/baseSchema');

var adList = new BaseSchema({
    adName:String,  //广告名称
	image:String,	//广告封面图
	startTime:Number,
	endTime:Number, 	//创建时间   有效期暂时可以以结束时间为准和系统时间作比较判断是否失效
	shopId:[{
		type:mongoose.SchemaTypes.ObjectId,
		ref:'Shop'
	}],		//广告投放的店铺集合
	playCount:Number,  //播放总次数
	playTime:Number, 		//播放总时长
	timeArray:[String],  	//统计周期
})
adList.plugin(mongoosePaginate);
module.exports = mongoose.model('Ad', adList);