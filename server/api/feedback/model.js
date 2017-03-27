"use strict";

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var tool = require('../../utils/tools');
var BaseSchema = require('../../framework/model/baseSchema');

var feedbackSchema = new BaseSchema({
    content:String,//反馈内容
    contact:String, //联系方式
    name: {
        type: String,
        default: '无名'
    }, //反馈人姓名
    // easyQuery:String, //简易查询
    handle:{
        type: Number,
        default:0
    } //是否处理，默认为未处理

});

module.exports = mongoose.model('Feedback', feedbackSchema,'feedback');
