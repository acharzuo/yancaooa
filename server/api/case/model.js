'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var mongoosePaginate = require('mongoose-paginate');
var tool = require('../../utils/tools');
var BaseSchema = require('../../framework/model/baseSchema');

var caseList = new BaseSchema({
    label:[String],//标签
    caseName:String,//案例标题
    file:Array,//上传文件
    addr:String,//地址
    expertName:String,//专家名字
    patientName:String,//患者名字
    age:Number,//年龄
    course:Number,//疗程
    startTime:Number,//开始时间
    endTime:Number,//结束时间
    analysis:{
        type:Number,
        default:0
    },//分析状态
    content:String,//病症
    detailed:String,//详细说明
    left:{
        type:Array,
        default:null
    },//左经络数据
    right:{
        type:Array,
        default:null
    },//右经络数据
    history:{
        type:Array,
        default:null
    }//分析记录
})
caseList.plugin(mongoosePaginate);
module.exports = mongoose.model('Case', caseList);