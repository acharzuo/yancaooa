/**
 *  @module foo/bar/
 * 
 */

'use strict';

var Model = require('./model').Shop;
var Device = require('mongoose').model('Device');
var _ = require('lodash');
var tokenManager = require('../../utils/token_manager');
var log = require('../../utils/log'); // 日志系统
var async = require('async');
var returnFactory = require('../../utils/returnFactory');
var adminService = require('./service');
var tool = require('../../utils/tools');

/**
 * @alias /api/shops[POST]
 * @description  新增店铺
 * @param {String} name 店铺名称
 * @param {String=} shopId 店铺ID
 * @param {String} address 店铺地址
 * @param {String} responsible 负责人
 * @param {String} idCardNumber 负责人身份证号
 * @param {String} tel 电话号码
 * @param {String} image 店铺图像
 * @param {String=} status 发布状态 0 正常，1 其他状态
 * @param {String=} devices ！！- 注册经络仪，经络仪id数组
 * @param {Number=} deviceCount 终端数
 * @param {Number=} advertiseCount 广告数
 * @param {Number=} technicianCount 技师数
 * @param {Number=} expertCount 专家数
 * @param {Number=} enterTime 入驻时间 数值类型，UTC毫秒数
 * @return {Object} 店铺对象
 */
exports.create = function(req, res, next) {
    req.validate('shopId', '必须输入shopId').notEmpty();
    req.validate('devices', '必须输入合法的devices').isObjectIdArray();
    // req.validate('id', '必须是合法的id').isMongoId();
    var errors = req.validationErrors();
    if (errors) {
        return next(errors[0]);
    }

    async.waterfall([
        function(cb) { // 检测店铺id是否已经存在
            Model.findOne({ "shopId": req.body.shopId }, function(err, doc) {
                if (!err && !doc) {
                    cb(null);
                } else {
                    return res.json(returnFactory('DUP_SHOPID', null, err));
                }
            })
        },
        _createShop
    ])


    function _createShop(cb) {
        //创建Entity，自带参数校验
        var newEntity = new Model(req.body);

        // 更新修改人
        newEntity.updatedBy = newEntity.createdBy = req.user ? req.user.id : null;

        // 写入数据库
        newEntity.save(function(err, doc) {
            if (!err) {
                // 需要修改绑定的经络仪的是否使用字段
                if (req.body.devices) {
                    Device.update({ "_id": { "$in": req.body.devices } }, { "isUsed": 0 }, { "multi": true }, function(err) {
                        if (err) {
                            log.error(err);
                        }
                    });
                }
                return res.json(returnFactory('SUCCESS', doc));
            } else {
                return res.json(returnFactory('ERROR', null, err));
            }
        });
    }

};


/**
 * @alias /api/shops/:id[DELETE]
 * @description  删除店铺
 * @param {String=} id 要删除的店铺id
 * @return {Object} 错误信息
 */
exports.delete = function(req, res, next) {
    req.validate('id', '必须指定id').notEmpty();
    req.validate('id', '必须是合法的id').isMongoId();
    var errors = req.validationErrors();
    if (errors) {
        return next(errors[0]);
    }
    // 调用接口查找数据库并删除
    Model.findByIdAndRemove(req.params.id, function(err, doc) {

        if (!err) {
            // 需要修改绑定的经络仪的是否使用字段
            Device.update({ "_id": { "$in": doc.devices } }, { "isUsed": 1 }, { "multi": true }, function(err) {
                if (err) {
                    log.error(err);
                }
            });
            //返回被删除的对象
            return res.json(returnFactory('SUCCESS', doc));
        } else {
            return res.json(returnFactory('ERROR', null, err));
        }
    });
};


/**
 * @alias /api/shops[PATCH]
 * @description  修改店铺
 * @param {String} id 要修改的用户id
 * @param {String=} name 店铺名称
 * @param {String=} shopId 店铺ID
 * @param {String=} address 店铺地址
 * @param {String=} responsible 负责人
 * @param {String=} idCardNumber 负责人身份证号
 * @param {String=} tel 电话号码
 * @param {String=} image 店铺图像
 * @param {String=} status 状态 disabled publish 默认publish
 * @param {String=} devicesStr ！！- 注册经络仪，逗号分隔的经络仪
 * @param {Number=} deviceCount 终端数
 * @param {Number=} advertiseCount 广告数
 * @param {Number=} technicianCount 技师数
 * @param {Number=} expertCount 专家数
 * @param {Number=} enterTime 入驻时间 数值类型，UTC毫秒数
 * @return {Object} 店铺对象
 */
exports.update = function(req, res, next) {
    req.validate('id', '必须指定id').notEmpty();
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
        // 需要修改绑定的经络仪的是否使用字段
        if (req.body.devices) {
            // 新增的经络仪
            var devices = _.map(doc.devices, function(o) { return o.toString(); })
                // var useArray = _.difference(req.body.devices, devices);
            Device.update({ "_id": { "$in": req.body.devices } }, { "isUsed": 0 }, { "multi": true }, function(err) {
                if (err) {
                    log.error(err);
                }
            });
            // 解除使用的经络仪
            var unuseArray = _.difference(devices, req.body.devices);
            Device.update({ "_id": { "$in": unuseArray } }, { "isUsed": 1 }, { "multi": true }, function(err) {
                if (err) {
                    log.error(err);
                }
            });
        }
        //准备更新的数据
        var updateData = req.body;
        delete updateData.id; //需要删除body中的id字段
        doc.devices = updateData.devices;
        doc = _.merge(doc, updateData); //将传入的参数合并到原来的数据上
        updateData.updatedAt = tool.getCurUtcTimestamp(); //最后更新日期
        updateData.updatedBy = reqUser ? reqUser.id : null; //最后更新人
        Model.findByIdAndUpdate(doc._id, updateData, function(err) {
            if (!err) {
                return res.json(returnFactory('SUCCESS', doc));
            } else {
                return res.json(returnFactory('ERROR', null, err));
            }
        })
        // // 写入数据库
        // doc.save(function(err) {
        //     if (!err) {
        //         return res.json(returnFactory('SUCCESS', doc));
        //     } else {
        //         return res.json(returnFactory('ERROR', null, err));
        //     }
        // })
    });
};


/**
 * @alias /api/shops[GET] 
 * @author 真源
 * @description 查询店铺列表，支持分页
 * @param {Number=} page 第几页内容
 * @param {Number=} count 每页显示数量
 * @param {String=} easyQuery 简易查询关键字参数
 * @param {Number=} startTime 最后登录时间的开始时间，数值类型，UTC毫秒
 * @param {Number=} endTime 最后登录时间的结束时间
 * @param {String=} address 店铺地址
 * @param {String=} responsible 负责人名称
 * @param {String=} shopId 店铺ID，助记码
 * @param {String=} fields 选择字段，逗号分隔
 * @param {String=} sort 排序选项 "field1,-field2" 表示按field1正序排序，按field2倒序排序
 * @return {Object} 用户json数组
 * @example 返回结果示例：
 * {
 *  docs:docs, //json数组
 *  total:total  //查询到的全部管理员的数量，不是分页的数量
 * }
 */
exports.list = function(req, res) {

    //准备查询条件
    var query = Model.find({}); //将密码等信息屏蔽         

    // 1 关键字查询的模糊查询
    if (req.query.easyQuery) {
        query = query.or([
            { 'shopId': new RegExp(req.query.easyQuery, 'i') },
            { 'address': new RegExp(req.query.easyQuery, 'i') },
            { 'responsible': new RegExp(req.query.easyQuery, 'i') },
            { 'name': new RegExp(req.query.easyQuery, 'i') }
        ]);
    }

  // 2 店铺ID，助记码
  if(req.query.shopId){   
    query = query.where('shopId', new RegExp(req.query.shopId, 'i'));
  }

    // 3 店铺名称
    if (req.query.name) {
        query = query.where('name', new RegExp(req.query.name, 'i'));
    }

    // 4 店铺地址
    if (req.query.address) {
        query = query.where('address', new RegExp(req.query.address, 'i'));
    }

    // 5 店铺负责人
    if (req.query.responsible) {
        query = query.where('responsible', new RegExp(req.query.responsible, 'i'));
    }

    // 入驻时间
    if (req.query.startTime && req.query.endTime) {
        query = query.where('enterTime', {
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

    //关联外键，填充注册经络仪信息
    query = query.populate('devices');

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
 * @alias /api/shops/:id[GET]
 * @description  获取单个店铺详细信息
 * @param {String} id 店铺id
 * 
 * @return {Object} 店铺对象
 */
exports.detail = function(req, res, next) {
    req.validate('id', '必须指定id').notEmpty();
    req.validate('id', '必须是合法的id').isMongoId();
    var errors = req.validationErrors();
    if (errors) {
        return next(errors[0]);
    }
    var docId = req.params.id;
    //关联外键，填充注册经络仪信息
    Model.findById(docId).populate('devices').exec(function(err, doc) {
        if (!err) {
            //正常返回
            return res.json(returnFactory('SUCCESS', doc));
        } else {
            return res.json(returnFactory('ERROR', null, err));
        }
    });
};