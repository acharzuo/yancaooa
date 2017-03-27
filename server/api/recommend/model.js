'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var mongoosePaginate = require('mongoose-paginate');
var tool = require('../../utils/tools');
var BaseSchema = require('../../framework/model/baseSchema');

var Recommend = new BaseSchema({
    userId:{
        type:mongoose.SchemaTypes.ObjectId,
        ref:'User'
    },//用户id
    recommendNum:{
        type:Number,
        default:0
    },//推荐数
    readNum:{
        type:Number,
        default:0
    },//阅读数
    url:String,//url
})
Recommend.plugin(mongoosePaginate);
var Recommend = exports.Recommend = mongoose.model('Recommend', Recommend,'recommend');