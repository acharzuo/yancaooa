// electron 崩溃时接手日志
"use strict";

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var message = require('../utils/returnFactory'); //返回状态模块
var log = require('../utils/log'); //引进日志


var ResultSchema = new Schema({
    datas: String
});
var crash = mongoose.model('crashReporter', ResultSchema);




//处理过的数据结论返回到后台管理系统界面************************
/**
 * @alias /crashReporter [POST]
 * @description  保存崩溃日志信息
 * @param {String} datas 日志信息
 * @return {Object} 保存结果

 */
exports.acceptLogs = function(req, res) {
    var data = {
        datas: req.body.datas
    };
    crash.create(data, function(err, doc) {
        if (err) {
            res.send(message("ERROR", null, err));
        } else if (!doc) {
            return res.send(message("NOT_FOUND", null));
        } else {
            res.send(message("SUCCESS", doc));
        }
    });

};