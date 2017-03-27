// 'use strict';

var report = require('./model');
var message = require('../../utils/returnFactory');//返回状态模块
var _ = require('lodash');
var log = require('../../utils/log'); //引进日志


//根据数据结果匹配方案，生成结果保存到数据库中,把结果返回到后台管理界面************************

/**
 * @alias /api/reports/:id[GET]
 * @description  获取诊断报告
 * @param {String} id 对应id
 *
 * @return {Object} 诊断报告

 */
 exports.detail = function(req,res){
     var query  = report.findById(req.params.id);
     query.populate({
         path:'diagnosticRecord plan',
         populate: {
             path: "createdBy"
         }
     }).exec(function(err,doc){
         if (!doc) {
             return res.send(message("NOT_FOUND",null));
         }else if (err) {
             return res.send(message("ERROR",null,err));
         }
         res.send(message("SUCCESS",doc));
     });
 };



 //根据数据结果匹配方案，生成结果保存到数据库中,把结果返回到PC界面************************
 /**
  * @alias /api/pc/reports/:id[GET]
  * @description  获取诊断报告
  * @param {String} diagnosticRecord 对应数据明细id
  * @param {String}
  *
  * @return {Object} 诊断报告

  */
exports.detailpc = function(req,res){
    var query  = report.findOne({"diagnosticRecord":req.params.id});

    query.populate({
        path:'diagnosticRecord plan',
        // populate: {
        //     path: "createdBy"
        // }
    }).exec(function(err,doc){
        if (!doc) {
            return res.send(message("NOT_FOUND",null));
        }else if (err) {
            return res.send(message("ERROR",null,err));
        }
        res.send(message("SUCCESS",doc));
    });
};
