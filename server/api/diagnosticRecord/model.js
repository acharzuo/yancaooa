// 诊断数据
"use strict";

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var BaseSchema = require('../../framework/model/baseSchema');
var shortid = require('shortid');

var diagnosticRecordSchema = new BaseSchema({
    technician: String, //技师名字
    tel: {
        type: String,
        default: '未填写'
    }, //手机号
    name: String, //病人姓名
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }, //病人id
    sex: {
        type: Number, //类型数字
        default: 0 //默认存0
    }, //性别  0是未定义 1 是男 2是女
    idCardNumber: {
        type: String,
        default: '未填写'
    }, //身份证号
    birthday: Number, //出生日期
    selfReported: {
        type: String,
        default: '未填写'
    }, //主诉病症
    medicalHistory: {
        type: String,
        default: '未填写'
    }, //病史
    label: [String], //标签
    // easyQuery: String, //简易查询内容
    address: {
        type: String,
        default: '云天元'
    }, //单位地址
    startTime: Number, //查询开始时间
    endTime: Number, //查询结束时间
    diagnosis: {
        type: Schema.Types.ObjectId,
        ref: "Diagnosis"
    }, //用户填写的问诊单
    data: {
        type: Schema.Types.ObjectId,
        ref: "Data"
    }, //诊疗仪的原始数据
    result: {
        type: Schema.Types.ObjectId,
        ref: "Result"
    }, //原始数据处理后的结果
    report: {
        type: Schema.Types.ObjectId,
        ref: "Report"
    }, //诊断报告
    mathNumber: {
        type: String,
        default: shortid.generate
    },
    chTime: String, //当前时辰
    birthChTime: String, //出生时辰

});
module.exports = mongoose.model('DiagnosticRecord', diagnosticRecordSchema);