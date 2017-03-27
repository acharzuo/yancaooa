// 'use strict';

var result = require('./model');
var message = require('../../utils/returnFactory');//返回状态模块
var _ = require('lodash');
var log = require('../../utils/log'); //引进日志

//处理过的数据结论返回到后台管理系统界面************************
/**
 * @alias /api/results/:id[GET]
 * @description  获取诊断结果
 * @param {String} id 对应的id
 * @param {String}
 *
 * @return {Object} 诊断结果

 */
exports.detail = function(req,res){
    result.findById(req.params.id).populate({
        path:'diagnosticRecord'
    }).exec(function(err,doc){
        if (!doc) {
            return res.send(message("NOT_FOUND",null));
        }
        if (err) {
            return res.send(message("ERROR",null,err));
        }
        res.send(message("SUCCESS",doc));
    });

};
