// 'use strict';  create by Jay Bein

var mongoose = require('mongoose');
var rawData = require('./model');
var result = require('../result/model');
var report = require('../report/model');
var plan = require('../plan/model');
var matching = require('../matching/model');
// var user = require('../user/model');
var user = mongoose.model('User');
var setting = require('../../config/setting');
// var result = mongoose.model('Result');
// var report = mongoose.model('Report');
// var plan = mongoose.model('Plan');
// var matching = mongoose.model('Matching');
// var diagnosticRecord = mongoose.model('DiagnosticRecord');

var service = require('./service');

var handle = require('./serviceHandle'); //算法
var diagnosticRecord = require('../diagnosticRecord/model');
var message = require('../../utils/returnFactory'); //返回状态模块
var _ = require('lodash');
var log = require('../../utils/log'); //引进日志
var medidian = require('./meridians'); //经络信息
var createRecord = require('./createRecord') // 创建的函数

//从pc端传来的原始数据保存到数据库中************************

/**
 * @alias /api/pc/datas[POST]
 * @description  添加原始数据
 * @param {String} diagnosticRecord 对应用户诊断数据id
 * @param {Array} datas //原始数据
 * @return {Object} 原始数据信息
 */
exports.create = function(req, res) {

    // 检测数据来源的合规性
    if (!req.body.diagnosticRecord) {
        return res.send(message("PARAM_IS_LOSE", "diagnosticRecord"));
    }

    diagnosticRecord.findById(req.body.diagnosticRecord, function(err, record) {
        createRecord(record, res, req.body.datas);
    });

};

//原始数据*******************************************************

/**
 * @alias /api/datas/:id[GET]
 * @description  添加原始数据
 * @param {String} id 原始数据的id
 * @param {String}
 *
 * @return {Object} 原始数据信息
 */

exports.detail = function(req, res, next) {
    //参数校验
    req.validate('id', '必须指定删除的id').notEmpty();
    req.validate('id', '必须是合法的id').isMongoId();
    var errors = req.validationErrors();
    if (errors) {
        return next(errors[0]);
    }

    rawData.findById(req.params.id).populate({
        path: 'diagnosticRecord result'
    }).exec(function(err, doc) {
        if (!doc) {
            return res.send(message("NOT_FOUND", null));
        } else if (err) {
            return res.send(message("ERROR", null, err));
        }
        res.send(message("SUCCESS", doc));
        // doc.result
    });
};

//从app 端传来的原始数据保存到数据库中************************

/**
 * @alias /api/app/datas[POST]
 * @description  添加原始数据
 * @param {String} userId //用户id
 * @param {Array} datas //原始数据
 * @return {Object} 原始数据信息
 */
exports.appCreate = function(req, res) {
    if (typeof req.body.datas == 'string') {
        req.body.datas = JSON.parse(req.body.datas);
    }
    console.log("前台传过来的数据", res.body);
    if (typeof req.body.datas == 'string') {
        req.body.datas = JSON.parse(req.body.datas);
    }

    if (req.body.userId) { //如果登录
        user.findById(req.body.userId, function(err, doc) {
            var data = {
                tel: doc.tel, //病人联系方式
                name: doc.name, //病人姓名
                birthday: doc.birthday, //病人出生日期
                idCardNumber: doc.idCardNumber, //病人身份证号
                sex: doc.sex, //病人性别
                userId: req.body.userId, //受监测人id
                createdBy: (req.user ? req.user.id : null), //创建人
            };
            //创建诊断报告
            diagnosticRecord.create(data, function(err, record) {
                if (err) {
                    return res.send(message("ERROR", null, err));
                }
                createRecord(record, res, req.body.datas);
            });
        });
    } else { //如果是未登录
        var name = "游客";
        for (var i = 0; i < 4; i++) {
            name = name + Math.floor(Math.random() * 10);
        }
        var data = {
            name: name, //病人姓名
            tel: '12345678900' //默认手机号
        };
        //创建诊断报告
        diagnosticRecord.create(data, function(err, record) {
            if (err) {
                return res.send(message("ERROR", null, err));
            }
            createRecord(record, res, req.body.datas);
        });
    }
};

// *****************************************
/**
 * @alias /api/datas/name[GET]
 * @description  获取原始数据
 * @param {String} id 对应用户诊断数据id
 * @param {String}
 *
 * @return {Object} 原始数据信息

 */
exports.queryByName = function(req, res, next) {
    //参数校验
    diagnosticRecord.find().where('name', new RegExp(req.params.name, 'i')).populate('data').exec(function(err, one) {
        res.send(message("SUCCESS", one));
    });
};

exports.helloWorld = function(req, res, next) {
    console.log('hello world!');
    // var data = {
    //     message:'hello world !',
    // };
    res.send(message("SUCCESS"));
};

// pc端数据展示==================================================
/**
 * @alias /api/pc/datas/sheet/:id[GET]
 * @description  获取原始数据
 * @param {String} id 诊断报告id
 * @return {Object} 原始数据信息
 */

exports.pcDetail = function(req, res, next) {
    //参数校验
    req.validate('id', '必须指定删除的id').notEmpty();
    req.validate('id', '必须是合法的id').isMongoId();
    var errors = req.validationErrors();
    if (errors) {
        return next(errors[0]);
    }
    diagnosticRecord.findById(req.params.id, function(err, dc) {
        if (!doc) {
            return res.send(message("NOT_FOUND", null));
        } else if (err) {
            return res.send(message("ERROR", null, err));
        } else {
            rawData.findById(dc.data).exec(function(err, doc) {
                if (!doc) {
                    return res.send(message("NOT_FOUND", null));
                } else if (err) {
                    return res.send(message("ERROR", null, err));
                }
                res.send(message("SUCCESS", doc));
            });
        }
    })
}