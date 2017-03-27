/**
 * Created by achar on 2016/12/5.
 * @module admin 
 */

'use strict';

// var Model = require('./model').Admin;
var Model = require('mongoose').model('User');
var _ = require('lodash');
var tokenManager = require('../../utils/token_manager');
var log = require('../../utils/log'); // 日志系统
var async = require('async');
var returnFactory = require('../../utils/returnFactory');
var adminService = require('./service');
var tool = require('../../utils/tools');
var userService = require('../user/service');

/**
 * @alias /api/admins[POST]
 * @description  创建管理员用户
 * @param {Object} admin
 * @param {String} admin.name 用户名
 * @param {String=} admin.tel 电话号码，11位
 * @param {String} admin.email 邮箱
 * @param {String} admin.password 密码
 * @param {String=} admin.avator 头像
 * @param {String=} admin.role 权限组名称 默认guest
 * @param {String=} admin.sex 性别，取值 男 0 未定义 1 男 2 女
 * @param {String=} admin.status 状态 active disable
 * @return {Object} 管理员账号对象
 */
exports.create = function(req, res, next) {

    var adminType = 0;
    userService.create(req, res, adminType, next);
};


/**
 * @alias /api/admins/:id[DELETE]
 * @description  删除管理员用户
 * @param {String=} id 要删除的用户id
 * @return {Object} 错误信息
 */
exports.delete = function(req, res, next) {

    var adminType = 1;
    userService.delete(req, res, adminType, next);
};


/**
 * @alias /api/admins/:id[PATCH]
 * @description  修改管理员用户
 * @param {String} id 要修改的用户id
 * @param {String=} name 用户名
 * @param {String=} tel 电话号码，11位
 * @param {String=} email 邮箱
 * @param {String=} password 密码
 * @param {String=} avator 头像
 * @param {String=} role 权限组名称 默认guest
 * @param {String=} sex 性别，取值 男 0 未定义 1 男 2 女
 * 
 * @return {Object} {}
 */
exports.update = function(req, res, next) {

    // 只有管理员才能修改特殊的字段
    if (req.user && req.user.adminType != 0) {
        delete req.body.adminType;
    }

    var adminType = 0;
    userService.update(req, res, adminType, next);
}


/**
 * @alias /api/admins[GET] 
 * @author 真源
 * @description 查询管理员账号列表，支持分页
 * @param {Number=} page 第几页内容
 * @param {Number=} count 每页显示数量
 * @param {String=} easyQuery 简易查询关键字参数
 * @param {Number=} startTime 最后登录时间的开始时间，数值类型，UTC毫秒
 * @param {Number=} endTime 最后登录时间的结束时间
 * @param {String=} tel 电话号码
 * @param {String=} status 状态 active disable
 * @param {String=} sex 性别  男 0 未定义 1 男 2 女
 * @param {String=} fields 选择字段，逗号分隔
 * @param {String=} role  权限组id
 * @param {String=} sort 排序选项 "field1,-field2" 表示按field1正序排序，按field2倒序排序
 * @return {Object} 用户json数组
 * @example 返回结果示例：
 * {
 *  docs:docs, //json数组
 *  total:total  //查询到的全部管理员的数量，不是分页的数量
 * }
 */
exports.list = function(req, res, next) {

    //准备查询条件
    var query = Model.find({ 'adminType': 0 }, '-salt -hashedPassword') //将密码等信息屏蔽       
        .populate('createdBy', 'name')
        .populate('updatedBy', 'name')
        .populate('role', 'name authorities');

    // 1 电话号码 或者 名字匹配的模糊查询
    if (req.query.easyQuery) {
        query = query.or([
            { 'tel': new RegExp(req.query.easyQuery, 'i') },
            { 'name': new RegExp(req.query.easyQuery, 'i') }
        ]);
    }

    // 2 电话号码
    if (req.query.tel) {
        query = query.where('tel', new RegExp(req.query.tel, 'i'));
    }

    // 3 用户名
    if (req.query.name) {
        query = query.where('name', new RegExp(req.query.name, 'i'));
    }

    // 权限组
    if (req.query.role) {
        query = query.where('role', req.query.role);
    }

    // 5 sex
    if (req.query.sex != null) {
        query = query.where('sex', req.query.sex);
    }

    // 6 status
    if (req.query.status != null) {
        query = query.where('status', req.query.status);
    }

    // 7 最后登录
    if (req.query.startTime && req.query.endTime) {
        query = query.where('lastLogin', {
            '$gte': req.query.startTime,
            '$lt': req.query.endTime
        });
    }

    // 选择排序
    if (req.query.fields) {
        var fields = req.query.fields.split(',').join(' ');
        query = query.select(fields);
    }

    // 选择排序
    if (req.query.sort) {
        var sort = req.query.sort.split(',').join(' ');
        query = query.sort(sort);
    }

    query = query.sort({ "updatedAt": "desc" });

    // 8 分页
    query.paginate(req.query.page, req.query.count, function(err, docs, total) {
        //处理输出字段
        // docs = _.map(docs,function(doc){
        //   return doc.profile;
        // })
        if (!err) {
            return res.json(returnFactory('SUCCESS', { docs: docs, total: total }));
        } else {
            return res.json(returnFactory('ERROR', null, err));
        }
    });
}



/**
 * @alias /api/admins/:id[GET]
 * @description  获取单个管理员用户详细信息
 * @param {String} id 管理员id
 * 
 * @return {Object} 管理员对象
 */
exports.detail = function(req, res, next) {

    userService.detail(req, res, next);
};


/**
 * @alias /api/admin_tokens[POST]
 * @description 获取管理员token，相当于token
 * @param {String} email
 * @param {String} password
 * @return {String} token 
 */
exports.createToken = function(req, res, next) {
    var adminType = 0; //管理员用户
    userService.createToken(req, res, adminType, next);
}


/**
 * @alias /api/admin_tokens[delete]
 * @description 登出，删除req.user 清除redis中token
 * @return null 永远返回成功
 */
exports.deleteToken = function(req, res) {

    userService.deleteToken(req, res);
}


/**
 * @alias /api/user/email[GET] 
 * @description 检测邮箱是否存在
 * @param [String] email 要检测的邮箱
 * @return [Boolean] 
 */
exports.checkEmail = function(req, res) {

    async.waterfall([
            // 1、校验参数
            function(cb) {
                //检查邮箱是否合法格式
                req.assert('email', '%0 Invalid Email').isEmail()
                    .notEmpty();
                //获取校验结果
                req.getValidationResult().then(function(checkResult) {
                    if (checkResult.isEmpty()) {
                        cb(null);
                    } else {
                        cb(checkResult.useFirstErrorOnly().mapped()); //校验不通过，直接返回  
                    }
                })
            },
            //2、校验通过，执行正常业务
            function(cb) {
                Model.count({ 'email': req.params.email }).exec(function(err, count) {
                    if (err) {
                        cb(err);
                    }
                    if (!err) {
                        cb(null, count > 0); //返回最后结果
                    }
                })
            }
        ],
        //3、返回结果
        function(err, result) {
            //统一返回结果格式
            if (err) {
                res.json(returnFactory('PARAM_ERROR', null, err));
            } else {
                res.json(returnFactory('SUCCESS', result));
            }

        })
}