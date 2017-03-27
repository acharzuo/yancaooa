/**
 * Created by zhenyuan on 2016/12/19.
 */

'use strict';

var Model = require('./model').Device;
// var Roles = require('mongoose').model('Roles');
var validate = require('../../utils/validate');
var _ = require('lodash');
var tokenManager = require('../../utils/token_manager');
var log = require('../../utils/log'); // 日志系统
var async = require('async');
var returnFactory = require('../../utils/returnFactory');
var tool = require('../../utils/tools');


/**
 * @alias /api/devices[POST]
 * @description  新增经络仪
 * @param {String} deviceId 经络仪ID
 * @param {String} type 型号 person shop
 * @param {String} user 使用者 
 * @param {String} tel 联系电话
 * @param {String=} status 状态 0 正常 1 禁用
 * @param {Number=} enterTime 入驻时间 数值类型，UTC毫秒数
 * @return {Object} 经络仪对象
 */
exports.create = function(req, res, next) {

    req.validate('deviceId', '经络仪ID必填').notEmpty();
    var errors = req.validationErrors();
    if (errors) {
        return next(errors[0]);
    }

    Model.findOne({ deviceId: req.body.deviceId }, function(err, doc) {
        if (doc) {
            // 经络仪id不能重复
            return res.json(returnFactory('DUPLICATE_KEY', null));
        } else {
            //创建Entity，自带参数校验
            var newEntity = new Model(req.body);

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
    });


}


/**
 * @alias /api/devices/:id[DELETE]
 * @description  删除经络仪
 * @param {String=} id 要删除的经络仪的id
 * @return {Object} 错误信息
 */
exports.delete = function(req, res, next) {

    req.validate('id', '必须制定删除的id').notEmpty();
    req.validate('id', '必须是合法的id').isMongoId();
    var errors = req.validationErrors();
    if (errors) {
        return next(errors[0]);
    }

    // 调用接口查找数据库并删除
    Model.findByIdAndRemove(req.params.id, function(err, doc) {

        if (!err) {
            //返回被删除的对象
            return res.json(returnFactory('SUCCESS', doc));
        } else {
            return res.json(returnFactory('ERROR', null, err));
        }
    });
};


/**
 * @alias /api/devices/:id[PATCH]
 * @description  修改经络仪
 * @param {String} id 要修改的经络仪id
 * @param {String=} deviceId 经络仪助记码ID
 * @param {String=} type 型号 person shop
 * @param {String=} user 使用者 
 * @param {String=} tel 联系电话
 * @param {String=} status 状态 0 正常 1 禁用
 * @param {Number=} adjustTimes 校正次数
 * @param {Number=} adjustCount 校正量
 * @param {Number=} maintenanceTimes 维护次数
 * @param {Number=} enterTime 入驻时间 数值类型，UTC毫秒数
 * @return {Object} 店铺对象
 */
exports.update = function(req, res, next) {

    req.validate('id', '必须制定删除的id').notEmpty();
    req.validate('id', '必须是合法的id').isMongoId();
    var errors = req.validationErrors();
    if (errors) {
        return next(errors[0]);
    }

    // 获取token中用户的信息
    var reqUser = req.user;

    //根据id查找对象，并更新
    Model.findById(req.params.id, function(err, doc) {
        if (err) {
            return res.json(returnFactory('ERROR', null, err));
        }

        if (!doc) {
            return res.status(404).json(returnFactory('NOT_FOUND', null));
        }

        //准备更新的数据
        var updateData = req.body;
        delete updateData.id; //需要删除body中的id字段
        doc = _.merge(doc, updateData); //将传入的参数合并到原来的数据上
        doc.updatedAt = tool.getCurUtcTimestamp(); //最后更新日期
        doc.updatedBy = reqUser ? reqUser.id : null; //最后更新人

        // 写入数据库
        doc.save(function(err) {
            if (!err) {
                return res.json(returnFactory('SUCCESS', doc));
            } else {
                return res.json(returnFactory('ERROR', null, err));
            }
        })
    });
};



/**
 * @alias /api/devices[GET] 
 * @author 真源
 * @description 查询经络仪信息，支持分页
 * @param {Number=} page 第几页内容
 * @param {Number=} count 每页显示数量
 * @param {String=} easyQuery 简易查询关键字参数
 * @param {Number=} startTime 最后登录时间的开始时间，数值类型，UTC毫秒
 * @param {Number=} endTime 最后登录时间的结束时间
 * @param {String} deviceId 经络仪助记码ID
 * @param {String} type 型号 person shop
 * @param {String} user 使用者 
 * @param {String} tel 联系电话
 * @param {String=} status 状态 0 正常 1 禁用
 * @param {Number=} enterTime 入驻时间 数值类型，UTC毫秒数
 * @param {Number=} isUsed 是否被店铺使用，0 已经使用 1 未使用
 * 
 * @param {String=} fields 选择字段，逗号分隔
 * @param {String=} sort 排序选项 "field1,-field2" 表示按field1正序排序，按field2倒序排序
 * @return {Object} 用户json数组
 * @example 返回结果示例：
 * {
 *  docs:docs, //json数组
 *  total:total  //查询到的全部对象的数量，不是分页的数量
 * }
 */
exports.list = function(req, res) {

    //准备查询条件
    var query = Model.find({});

    // 1 关键字查询的模糊查询
    if (req.query.easyQuery) {
        query = query.or([
            { 'deviceId': new RegExp(req.query.easyQuery, 'i') },
            { 'user': new RegExp(req.query.easyQuery, 'i') },
            { 'tel': new RegExp(req.query.easyQuery, 'i') }
        ]);
    }

    // 2 设备ID，助记码
    if (req.query.deviceId) {
        query = query.where('deviceId', new RegExp(req.query.deviceId, 'i'));
    }

    // 3 设备类型
    if (req.query.type != null) {
        query = query.where('type', req.query.type);
    }

    // 4 使用者
    if (req.query.user) {
        query = query.where('user', new RegExp(req.query.user, 'i'));
    }

    // 5 联系电话
    if (req.query.tel) {
        query = query.where('tel', new RegExp(req.query.tel, 'i'));
    }

    // // 4 zhuangtai
    if (req.query.status != null) {
        query = query.where('status', req.query.status);
    }

    // //  isUsed
    if (req.query.isUsed != null) {
        query = query.where('isUsed', Number(req.query.isUsed));
    }

    // 最后使用时间
    if (req.query.startTime && req.query.endTime) {
        query = query.where('lastUseDate', {
            '$gte': req.query.startTime,
            '$lt': req.query.endTime
        });
    }

    // 选择字段
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

    // 8 分页执行
    query.paginate(req.query.page, req.query.count, function(err, docs, total) {
        if (!err) {
            return res.json(returnFactory('SUCCESS', { docs: docs, total: total }));
        } else {
            return res.json(returnFactory('ERROR', null, err));
        }
    });
}



/**
 * @alias /api/devices/:id[GET]
 * @description  获取单个经络仪详细信息
 * @param {String} id 经络仪id
 * 
 * @return {Object} 经络仪对象
 */
exports.detail = function(req, res, next) {

    req.validate('id', '必须制定删除的id').notEmpty();
    req.validate('id', '必须是合法的id').isMongoId();
    var errors = req.validationErrors();
    if (errors) {
        return next(errors[0]);
    }

    var docId = req.params.id;

    Model.findById(docId).exec(function(err, doc) {
        if (!err) {
            //正常返回
            return res.json(returnFactory('SUCCESS', doc));
        } else {
            return res.json(returnFactory('ERROR', null, err));
        }
    });
};


/**
 * @alias /api/batch/devices[PATCH]
 * @description  批量修改经络仪属性
 * @param {String} ids 修改的经络仪的id，逗号分隔，在url中传送
 * @param {Object} operation 修改的属性 {key1: value1;key2: value2} 例如：{status: 0} 解禁
 * @return {Object} 错误信息
 */
exports.batchUpdate = function(req, res) {
    var ids = req.params.ids.split(',');

    // 查询某个范围的对象，并且批量更新多个属性
    Model.update({ '_id': { '$in': ids } },
        req.body.operation, { multi: true },
        function(err, doc) {

            if (!err) {
                //返回被删除的对象
                return res.json(returnFactory('SUCCESS', doc));
            } else {
                return res.json(returnFactory('ERROR', null, err));
            }
        });
};


/**
 * @alias /api/device_types[GET]
 * @description  获取经络仪类型列表
 * @return {Object} 经络仪类型列表
 */
exports.getTypes = function(req, res) {

    var typeList = require('./device_typelist');
    return res.json(returnFactory('SUCCESS', typeList));
};