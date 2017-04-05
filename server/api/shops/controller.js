'use strict';

var model = require('./model');
var category = require('../category/model');
var message = require('../../utils/returnFactory');//返回状态模块
var _ = require('lodash');
var log = require('../../utils/log');   //引进日志
var async = require('async');
var returnFactory = require('../../utils/returnFactory');


//添加文章--完成----------------------------------------------

exports.create1 = function(req,res,next){
    console.log(req.body);
    var body = JSON.parse(req.body.data);
    //参数校验
    req.validate('data','无可用数据').notEmpty();
    var errors = req.validationErrors();
    if (errors) {
        return next(errors[0]);
    }

    // 处理日期格式
    body.shop.register = new Date(body.shop.register).getTime();
    body.shop.expire = new Date(body.shop.expire).getTime();



    var data = {
        createdBy : (req.user ? req.user.id : null), //创建人
        name:       body.shop.name,      // 企业名称
        image:      body.shop.image,     // 门头图片
        address:    body.shop.address,   // 地址
        licenseId:  body.shop.licenseId, // 许可证号码
        manager:    body.shop.manager,   // 负责人姓名
        register:   body.shop.register,  // 注册日期
        expire:     body.shop.expire,    // 到期日期
        status:     body.shop.status,    // 店铺状态
        geolocation: body.geolocation,   // 地理位置
        coords:
            body.geolocation.coords
    };


    //创建店铺
    model.create(data,function(err,doc){
        if (err) {
            console.log(err);
            return res.send(message("ERROR",null,err));
        }

        res.send(message("SUCCESS",doc));

    });
};



exports.create = function(req, res, next) {
    console.log(req.body);
    var body = JSON.parse(req.body.data);
    //参数校验
    req.validate('data','无可用数据').notEmpty();
    var errors = req.validationErrors();
    if (errors) {
        return next(errors[0]);
    }


    // 处理日期格式
    body.register = body.register ? new Date(body.register).getTime() : null;
    body.expire = body.expire? new Date(body.expire).getTime() : null;



    var data = {
        createdBy : (req.user ? req.user.id : null), //创建人
        name:       body.name,      // 企业名称
        image:      body.image,     // 门头图片
        address:    body.address,   // 地址
        licenseId:  body.licenseId, // 许可证号码
        manager:    body.manager,   // 负责人姓名
        register:   body.register,  // 注册日期
        expire:     body.expire,    // 到期日期
        status:     body.status? body.status : null,    // 店铺状态
        geolocation: body.geolocation ? body.geolocation : null,   // 地理位置
        coords:
            body.geolocation && body.geolocation.coords ?  body.geolocation.coords : null
    };

    async.waterfall([
        function(cb) { // 检测店铺id是否已经存在
            model.findOne({ "licenseId": data.licenseId }, function(err, doc) {
                if (!err && !doc) {
                    cb(null);
                } else {
                    
        doc.geolocation= body.geolocation ? body.geolocation : null,   // 地理位置
        doc.coords= body.geolocation && body.geolocation.coords ?  body.geolocation.coords : null
               data = doc;
               cb(null);
                    //return res.json(returnFactory('DUP_SHOPID', null, err));
                }
            })
        },
        _createShop
    ])


    function _createShop(cb) {
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


