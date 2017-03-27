"use strict";

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var tool = require('../../utils/tools');
var userModel = require('../user/model'); // 用户
var async = require('async');
var BaseSchema = require('../../framework/model/baseSchema');

var PlanSchema = new BaseSchema({
    title: String, //方案名称
    conclusion: String, //经络结论
    disease: String, //病症
    emotion: String, //情绪
    character: String, //性格
    treatPlan: String, //治疗方案
    healthPlan: String, //养生方案
    dietPlan: String, //食疗方案

});

var Plan = module.exports = mongoose.model('Plan', PlanSchema);

var setting = require('../../config/setting');

//初始化默认诊疗方案
Plan.findById(setting.default_plan_id, function(err, doc) {
    if (err || !doc) {
        var initData = {
            _id: setting.default_plan_id,
            title: "测试诊断方案010123", // 方案名称
            conclusion: "经络结论", // 经络结论
            disease: "病症", // 病症
            emotion: "情绪", // 情绪
            character: "性格", // 性格
            treatPlan: "治疗方案", // 治疗方案
            healthPlan: "养生方案", // 养生方案
            dietPlan: "食疗方案", // 食疗方案
        };
        var newDoc = new Plan(initData);
        newDoc.save(function(err, data) {
            if (err) {
                console.log(err);
            }
            console.log('init default plan plan id:' + setting.default_plan_id);
        })
    }
});