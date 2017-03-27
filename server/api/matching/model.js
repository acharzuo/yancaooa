"use strict";

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Plan = require('../plan/model'); // 报告内容
// var Plan = mongoose.model('Plan');
var async = require('async');

var MatchingSchema = new Schema({
    pairedValue: String, //数据结果id
    pairedName: String, //数据对应病症
    plan: String, //方案id
    planName: String, //方案名称

});

var Matching = module.exports = mongoose.model('Matching', MatchingSchema);

var setting = require('../../config/setting');
// 初始化中间数据与报告的关联 by zhenyuan
Matching.findOne({ pairedValue: '[0]' }, function(err, doc) {
    if (err || !doc) {
        var initData = {
            pairedValue: '[0]',
            pairedName: '0',
            plan: setting.default_plan_id,
            planName: "测试诊断方案010123"
        };

        var newDoc = new Matching(initData);
        newDoc.save(function(err, data) {
            if (err) {
                console.log(err);
            } else {
                console.log('[0]', 'init Matching');
            }
        });
    }
});


// // 初始化中间数据与报告的关联
// async.waterfall([
//     function(callback) {
//         Plan.findOne({ title: "测试诊断方案010123" }, function(err, doc) {
//             if (err || !doc) {
//                 var initData = {
//                     title: "测试诊断方案010123", // 方案名称
//                     conclusion: "经络结论", // 经络结论
//                     disease: "病症", // 病症
//                     emotion: "情绪", // 情绪
//                     character: "性格", // 性格
//                     treatPlan: "治疗方案", // 治疗方案
//                     healthPlan: "养生方案", // 养生方案
//                     dietPlan: "食疗方案", // 食疗方案
//                 };
//                 var newDoc = new Plan(initData);
//                 newDoc.save(function(err, data) {
//                     callback(null, data);
//                     if (err) {
//                         console.log(err);
//                     } else {
//                         console.log('测试诊断方案010123', 'init plan');
//                     }
//                 });
//             }
//         });
//     },
//     function(pdoc, callback) { // 产生要添加的数据
//         Matching.findOne({ pairedValue: '[0]' }, function(err, doc) {
//             if (err || !doc) {
//                 var initData = {
//                     pairedValue: '[0]',
//                     pairedName: '0',
//                     plan: pdoc._id,
//                     planName: pdoc.title
//                 };

//                 var newDoc = new Matching(initData);
//                 newDoc.save(function(err, data) {
//                     if (err) {
//                         console.log(err);
//                     } else {
//                         console.log('[0]', 'init Matching');
//                         callback(null, ' init done');
//                     }
//                 });
//             }
//         });
//     }
//     // function(err){              // 报错的处理
//     //     console.log(err);
//     // }

// ], function(err, result) {
//     console.log(result);
// });





// /*

// // 初始化中间数据与报告的关联
// Matching.findOne({pairedValue:'[0]'}, function(err,doc){
//   if(err || !doc){
//     var initData = {
//         pairedValue: '[0]',
//         pairedName:'0',
//         plan: 0,
//         planName: ''
//     };

//     var newDoc = new Matching(initData);
//     newDoc.save(function(err, data){
//         if(err){
//         console.log(err);
//         }
//         console.log('init tech');
//         });
//   }
// });

// */