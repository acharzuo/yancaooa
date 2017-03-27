var mongoose = require('mongoose');
var rawData = require('./model');
var result = require('../result/model');
var report = require('../report/model');
var plan = require('../plan/model');
var matching = require('../matching/model');
var setting = require('../../config/setting');
var handle = require('./serviceHandle'); //算法
var diagnosticRecord = require('../diagnosticRecord/model');
var message = require('../../utils/returnFactory'); //返回状态模块


///创建诊断报告完整数据
module.exports = function createRecord(record, res, datas) {

    //创建datas数据
    // 检测数据来源的合规性
    if (!datas) {
        return res.send(message("PARAM_IS_LOSE", "datas"));
    }

    // 转换为数组
    //var tmpData = JSON.parse(req.body.datas);

    var datass = {
        diagnosticRecord: record._id, // 记录ID
        origin: datas // 原始数据
    };

    rawData.create(datass, function(err, docs) { //回调返回生成文档信息
        var shuju = {
            record: record,
            rawData: docs
        };
        res.send(message("SUCCESS", shuju)); //创建成功之后就返回前台继续进行下一步，后台继续进行算法
        //创建result
        var value = handle(docs.origin);
        //保存diagnosticRecord的id
        value.diagnosticRecord = record._id; //将诊断记录id保存到result
        //生成文档
        result.create(value, function(err, result) { //创建数据结果
            rawData.findOne({ "diagnosticRecord": record._id }, function(err, doc) {
                doc.result = result._id; //将诊断结果的id 保存到原始数据中
                doc.save(function(err, doc) {
                    // console.log('原始数据：', doc);
                });
            });
            matching.findOne({ "pairedValue": result.pairedValue }).exec(function(err, matchings) {

                // 如果没有找到匹配模式，则使用默认的诊疗方案 by zhenyuan
                if (err || !matchings) {
                    matchings = {
                        plan: setting.default_plan_id
                    };
                }
                var matchingData = {
                    diagnosticRecord: record._id, //诊断记录id
                    plan: matchings.plan //诊断方案id
                };
                report.create(matchingData, function(err, report) { //创建诊断报告
                    if (err) {
                        return res.send(message("ERROR", null, err));
                    }
                    diagnosticRecord.findById(record._id).exec(function(err, dr) {
                        if (!err) {
                            dr.report = report._id; //把report的id保存到诊断记录中
                            dr.result = result._id; //保存result的id到诊断记录中
                            dr.data = docs._id; //保存data 的id 到 诊断记录中
                            dr.save(function(err, doc) {
                                console.log('诊断记录信息', doc);
                            });
                        }
                    });
                });
            });
        });
    });
};