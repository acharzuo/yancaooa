'use strict';

var model = require('./model');
var category = require('../category/model');
var message = require('../../utils/returnFactory');//返回状态模块
var _ = require('lodash');
var log = require('../../utils/log');   //引进日志


//添加文章--完成----------------------------------------------

exports.create = function(req,res,next){
    //参数校验
    req.validate('name','必须存在企业名称').notEmpty();
    var errors = req.validationErrors();
    if (errors) {
        return next(errors[0]);
    }


    var body = req.body;
    var data = {
        createdBy : (req.user ? req.user.id : null), //创建人
        name:       body.name,      // 企业名称
        image:      body.image,     // 门头图片
        address:    body.address,   // 地址
        licenseId:  body.licenseId, // 许可证号码
        manager:    body.manager,   // 负责人姓名
        register:   body.register,  // 注册日期
        expire:     body.expire,    // 到期日期
        status:     body.status,    // 店铺状态
    };
    //创建文章数据
    model.create(data,function(err,doc){
        if (err) {
            return res.send(message("ERROR",null,err));
        }

        res.send(message("SUCCESS",doc));

    });
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


