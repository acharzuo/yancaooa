'use strict';

var model = require('./model');
var message = require('../../utils/returnFactory');//返回状态模块
var _ = require('lodash');
var log = require('../../utils/log');   //引进日志
var async = require('async');
var returnFactory = require('../../utils/returnFactory');


//添加文章--完成----------------------------------------------

exports.create = function(req, res, next) {
    console.log(req.body);
    var body = JSON.parse(req.body.data);
    //参数校验
    req.validate('data','无可用数据').notEmpty();
    var errors = req.validationErrors();
    if (errors) {
        return next(errors[0]);
    }

    // 整理数据
    var data = {
        createdBy : (req.user ? req.user.id : null), //创建人
        name:       body.name,      // 姓名
        part:      body.part,     // 中队
        position_name:    body.position_name,   // 主岗
        mobile:  body.mobile, // 手机号码
        telphone:    body.telphone,   // 办公电话
        position_department:   body.position_department,  // 执法岗位
        position_company:     body.position_company,    // 主岗单位
        sex:     body.sex,    // 性别
        brithday: body.brithday,   // 出生日期
        ethnic: body.ethnic,   // 民族
        Identify: body.Identify,   // 身份证号
        licenseId: body.licenseId,   // 执法证号
        role: body.role,   // 角色
        image: body.image,   // 照片
    };

    // 将数据存入数据库
    async.waterfall([
        function(cb) { // 检测店铺id是否已经存在
            model.findOne({ "licenseId": data.licenseId }, function(err, doc) {
                if (!err && !doc) {
                    cb(null);
                } else {
                    return res.json(returnFactory('DUP_SHOPID', null, err));
                }
            })
        },
        _create
    ])


    function _create(cb) {
        //创建Entity，自带参数校验
        var newEntity = new model(data);

        // 更新修改人
        newEntity.updatedBy = newEntity.createdBy = req.user ? req.user.id : null;

        // 写入数据库
        newEntity.save(function(err, doc) {
            if (!err) {
                return res.json(returnFactory('SUCCESS', doc));
            } else {
                return res.json(returnFactory('ERROR', null, err));
            }
        });
    }

};


// 列表
exports.list = function(req,res){

    var query;
    query = model.find({});//所有内容

    // 选择排序
    if(req.query.fields){
        var fields = req.query.fields.split(',').join(' ');
        query = query.select(fields);
    }

    // 选择排序
    if(req.query.sort){
        var sort = req.query.sort.split(',').join(' ');
        query = query.sort(sort);
    }
    //默认排序
    query = query.sort({"updatedAt":"desc"});
    //显示分类名称
    query.paginate(req.query.page, req.query.count, function(err, doc, total) {
        if (!err) {
            res.send(message('SUCCESS', {data: doc,total: total}));
        } else {
            return res.send(message('ERROR', null, err));
        }
    });
};


