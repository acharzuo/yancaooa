'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var mongoosePaginate = require('mongoose-paginate');
var tool = require('../../utils/tools');
var BaseSchema = require('../../framework/model/baseSchema');

var Edition = new BaseSchema({
    version:{
        type:String,
        default:'0.1.0'
    },//版本号
    down:{
        type:Number,
        default:0
    },//下载数
    updateContent:{
        type:String,
        default:'暂无说明'
    },//更新说明
})
Edition.plugin(mongoosePaginate);
var Edition = exports.Edition = mongoose.model('Edition', Edition,'edition');