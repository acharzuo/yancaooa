/**
 * Created by achar on 2016/12/5.
 */

// 'use strict';

var User = require('./model').User;
var _ = require('lodash');
var tokenManager = require('../../utils/token_manager');
var log = require('../../utils/log'); // 日志系统
var async = require('async');
var returnFactory = require('../../utils/returnFactory');
var tool = require('../../utils/tools');
var setting = require('../../config/setting');
var userService = require('./service');
var mongoose = require('mongoose');
var validationError = function(res, err) {
    return res.status(422).json(err);
};

/**
 * @alias /api/users[POST]
 * @description  普通用户创建
 * @param {String} name 用户名
 * @param {String} tel 电话号码，11位
 * @param {String=} email 邮箱
 * @param {String=} password 密码
 * @param {String=} avator 头像
 * @param {String=} role 权限组id
 * @param {String=} userType 用户类型, 0 normal 1 tech 2 expert  
 * @param {String=} birthday 生辰，UTC毫秒数
 * @param {String=} sex 性别，取值男： 男 0 未定义 1 男 2 女
 * @param {String=} idCardNumber 身份证号 
 * @param {String=} veryficationCode  验证码
 * 以下是家人的属性
 * @param {String} checkType 检测类型 0 保存报告 1 临时报告
 * @param {String} relation 关系名称
 * @return {Object} 新增的用户账号对象
 */
exports.create = function(req, res, next) {
    var adminType = 1;

    userService.create(req, res, adminType, next);

};



/**
 * @alias /api/users/:id[DELETE]
 * @description  删除注册用户
 * @param {String=} id 要删除的用户id
 * @return {Object} 错误信息
 */
exports.delete = function(req, res, next) {
    var adminType = 1;
    userService.delete(req, res, adminType, next);
};

/**
 * @alias /api/users[PATCH]
 * @description  修改用户
 * @param {String} id 要修改的用户id
 * @param {String=} name 用户名
 * @param {String=} tel 电话号码，11位
 * @param {String=} email 邮箱
 * @param {String=} password 密码
 * @param {String=} avator 头像
 * @param {String=} userType 用户类型, 0 normal 1 tech 2 expert  
 * @param {String=} birthday 生辰，UTC毫秒数
 * @param {String=} role 权限组id 
 * @param {String=} sex 性别，取值 男 0 未定义 1 男 2 女
 * @param {Number=} status 状态，正常  禁用  1
 * 
 * @return {Object} {}}
 */
exports.update = function(req, res, next) {


    // 只有管理员才能修改特殊的字段
    delete req.body.adminType;

    var adminType = 1;
    userService.update(req, res, adminType, next);
};


/**
 * @alias /api/users[GET] 
 * @author 真源
 * @description 获取所有用户账号列表，支持分页
 * @param {Number=} page 第几页内容
 * @param {Number=} count 每页显示数量
 * @param {Number=} startTime 生日的开始时间，数值类型，UTC毫秒
 * @param {Number=} endTime 生日的结束时间
 * @param {String=} easyQuery 简易查询关键字参数
 * @param {String=} tel 电话号码
 * @param {String=} status 状态，正常  禁用  1
 * @param {String=} sex 性别  男 0 未定义 1 男 2 女
 * @param {String=} userType 用户类型 0 1  2
 * @param {String=} fields 选择字段，逗号分隔
 * @param {String=} sort 排序选项 "field1,-field2" 表示按field1正序排序，按field2倒序排序 
 * @return {Array} 用户json数组
 * @example 返回结果示例：
 * {
 *  docs:docs, //json数组
 *  total:total  //全部用户的数量，不是分页的数量
 * }
 * 
 */
exports.list = function(req, res, next) {

    //准备查询条件, 只显示adminType=1的普通用户
    var query = userService.getUserListQuery(req, res);

    // 8 分页 返回结果
    query.paginate(req.query.page, req.query.count, function(err, docs, total) {

        if (!err) {
            return res.json(returnFactory('SUCCESS', { docs: docs, total: total }));
        } else {
            return res.json(returnFactory('ERROR', null, err));
        }
    });

};


/**
 * @alias /api/users/:id[GET]
 * @description  获取单个用户详细信息
 * @param {String} id 用户id
 * 
 * @return {Object} 用户对象
 */
exports.detail = function(req, res, next) {

    userService.detail(req, res, next);
};

/**
 * @alias /api/[/pc/]user_infos[GET]
 * @description  获取当前用户详细信息
 * 
 * @return {Object} 用户对象
 */
exports.getLoginInfo = function(req, res, next) {

    userService.getLoginInfo(req, res, next);
};

/**
 * @alias /api/pc/user_tokens[POST]
 * @description 获取用户token，相当于token
 * @param {String} email
 * @param {String} tel
 * @param {String} password
 * @return {String} token 
 */
exports.createToken = function(req, res, next) {
    userService.createToken(req, res, 1, next);
}


/**
 * @alias /api/user_tokens[PATCH]
 * @description 更新token
 * @return {Object} newToken
 */
exports.updateToken = function(req, res) {

    userService.updateToken(req, res, function(newToken) {
        return res.json(returnFactory('SUCCESS', newToken));
    });
};



/**
 * @alias /api/user_tokens[delete]
 * @description 登出，删除req.user 清除redis中token
 * @return null 永远返回成功
 */
exports.deleteToken = function(req, res) {
    console.log('进来没有？');
    userService.deleteToken(req, res, 1);
};





/**
 * @alias /api/pc/user_exists|/api/user_exists[GET] 
 * @description 检测邮箱或电话号码是否存在
 * @param [String] email 检测邮箱是否存在
 * @param [String] tel 检测电话是否存在
 * @return [Boolean] 
 */
exports.checkExists = function(req, res) {

    if (!req.body.email && !req.body.tel) {
        return res.json(returnFactory('ERROR', null, null, "邮箱和电话号码至少填写一个"));
    }

    userService.checkUserExists(req.body, function(err, doc) {
        if (!err) {
            return res.json(returnFactory('SUCCESS', doc != null));
        } else {
            return res.json(returnFactory('ERROR', null, err));
        }
    });
};

/**
 * @alias /api/pc/increase_user_checkcount/:id[patch]
 * @param {String} id  用户id
 * @return {Object}  新的checkCount
 */
exports.increaseCheckCount = function(req, res, next) {
    var userId = req.params.id;
    if (!userId) {
        return res.json(returnFactory('ERROR', null, null, '请输入用户id'));
    }
    userService.increaseCheckCount(userId, function(err, doc) {
        if (!err && doc) {
            return res.json(returnFactory('SUCCESS', doc.checkCount));
        } else {
            return res.json(returnFactory('ERROR', null, err));
        }
    })
}


/**
 * @alias /api/app/users/:user_id/families[POST]
 * @description  app端 普通用户添加家人
 * @param {String} name 用户名 必填
 * @param {String=} tel 电话号码，11位
 * @param {String=} avator 头像 
 * @param {String=} birthday 生辰，UTC毫秒数
 * @param {String=} sex 性别，取值男： 男 0 未定义 1 男 2 女
 * @param {String=} checkType 检测类型 0 保存报告 1 临时报告
 * @param {String} relation 关系名称
 * @return {Object} 新增的用户账号对象
 */
exports.createFamily = function(req, res, next) {

    // 参数校验
    req.validate('user_id', '必须指定合法的用户id').notEmpty().isMongoId();

    var errors = req.validationErrors();
    if (errors) {
        return next(errors[0]);
    }

    async.waterfall([
        _checkUser, // step 1 检查用户是否存在
        _createFamily, // step 2 创建家人用户
        _updateUser // step 3 更新用户的家人列表从并返回
    ], function(err, results) {
        console.log('end' + err);
    });

    // 检查用户是否合法
    function _checkUser(cb) {
        // 检查用户是否存在
        userService.getUserById(req, res, function(user) {
            cb(null, user);
        });
    }

    // 创建家人用户  如果用户存在呢  可以重复
    function _createFamily(user, cb) {
        userService.createFamily(user, req, res, function(familyUser) {

            cb(null, familyUser, user);
        });
    }

    // 更新user的family列表
    function _updateUser(familyUser, user, cb) {
        var families = user.families || [];
        // 添加到家人列表中
        families.push(familyUser._id);
        user.families = families;

        user.save(function(err) {
            if (!err) {
                // 返回的是家人用户的信息
                return res.json(returnFactory('SUCCESS', familyUser));
            } else {
                return res.json(returnFactory('ERROR', null, err));
            }
        });
    }

};



/**
 * @alias /api/app/users/:user_id/families/:id[PATCH]
 * @description  app端 修改家人信息
 * @param {String} name 用户名 必填
 * @param {String=} tel 电话号码，11位
 * @param {String=} avator 头像 
 * @param {String=} birthday 生辰，UTC毫秒数
 * @param {String=} sex 性别，取值男： 男 0 未定义 1 男 2 女
 * @param {String=} checkType 检测类型 0 保存报告 1 临时报告
 * @param {String} relation 关系名称
 * @return {Object} 新增的用户账号对象
 */
exports.updateFamily = function(req, res, next) {

    // 参数校验
    req.validate('user_id', '必须指定合法的用户id').notEmpty().isMongoId();
    req.validate('id', '必须指定合法的家人id').notEmpty().isMongoId();
    var errors = req.validationErrors();

    if (errors) {
        return next(errors[0]);
    }

    var adminType = 1; // 是否管理员 否
    var userType = 0; // 用户类型 普通用户
    async.waterfall([
        _checkUser, // step 1 检查用户是否存在
        _checkBelong, // step 2 检查是否属于用户
        _updateFamily, // step 3 修改家人用户
    ], function(err, results) {
        console.log('end' + err);
    });

    // 检查用户是否合法
    function _checkUser(cb) {
        userService.getUserById(req, res, function(user) {
            cb(null, user);
        });
    }

    // 检查 家人是否属于user
    function _checkBelong(user, cb) {
        userService.checkFamilyBelong(user, req, res, function(familyUser) {
            cb(null, familyUser);
        });
    }

    // 更新家人用户信息
    function _updateFamily(familyUser, cb) {
        userService.updateFamily(familyUser, req, res, function(newFamilyUser) {
            return res.json(returnFactory('SUCCESS', newFamilyUser));
        });
    }

};



/**
 * @alias /api/app/users/:user_id/families/:id[DELETE]
 * @description  app端 删除家人信息 仅仅删除关系，不删除用户？
 * @return {Object} 删除的用户账号对象
 */
exports.deleteFamily = function(req, res, next) {

    // 参数校验
    req.validate('user_id', '必须指定合法的用户id').notEmpty().isMongoId();
    req.validate('id', '必须指定合法的家人id').notEmpty().isMongoId();
    var errors = req.validationErrors();

    if (errors) {
        return next(errors[0]);
    }

    var adminType = 1; // 是否管理员 否
    var userType = 0; // 用户类型 普通用户
    async.waterfall([
        _checkUser, // step 1 检查用户是否存在
        _checkBelong, // step 2 检查是否属于用户
        _deleteFamily, // step 3 删除家人用户 中 所属用户信息
        _updateUser // step 4 更新用户的家人列表
    ], function(err, results) {
        console.log('end' + err);
    });

    // 检查用户是否合法
    function _checkUser(cb) {
        userService.getUserById(req, res, function(user) {
            cb(null, user);
        });
    }

    // 检查 家人是否属于user
    function _checkBelong(user, cb) {
        userService.checkFamilyBelong(user, req, res, function(familyUser) {
            cb(null, user, familyUser);
        });
    }

    // 删除家人用户信息 中 所属用户信息
    function _deleteFamily(user, familyUser, cb) {
        var asFamilies = familyUser.asFamilies ? familyUser.asFamilies.toObject() : [];
        _.remove(asFamilies, function(o) {
            return o.user.toString() == user._id.toString();
        })
        familyUser.asFamilies = asFamilies;
        familyUser.save(function(err) {
            if (!err) {
                cb(null, user, familyUser);
                // return res.json(returnFactory('SUCCESS', familyUser));
            } else {
                return res.json(returnFactory('ERROR', null, err));
            }
        });
    }

    // 删除 用户的家人列表中对应的记录
    function _updateUser(user, familyUser, cb) {
        var families = user.families ? user.families.toObject() : [];
        // 删除家人列表中对应的记录
        _.remove(families, function(o) {
            return o.toString() == familyUser._id.toString();
        });

        user.families = families;

        user.save(function(err) {
            if (!err) {
                // 返回的是家人用户的信息
                return res.json(returnFactory('SUCCESS', familyUser));
            } else {
                return res.json(returnFactory('ERROR', null, err));
            }
        });
    }
};


/**
 * @alias /api/app/users/:user_id/families[GET]
 * @description  app端 获取家人列表
 * @param {Number=} page 第几页内容
 * @param {Number=} count 每页显示数量
 * @param {Number=} startTime 生日的开始时间，数值类型，UTC毫秒
 * @param {Number=} endTime 生日的结束时间
 * @param {String=} easyQuery 简易查询关键字参数
 * @param {String=} tel 电话号码
 * @param {String=} status 状态 active disable
 * @param {String=} sex 性别  男 0 未定义 1 男 2 女
 * @param {String=} userType 用户类型 0 1  2
 * @param {String=} fields 选择字段，逗号分隔
 * @param {String=} sort 排序选项 "field1,-field2" 表示按field1正序排序，按field2倒序排序 
 * @return {Object} 家人列表
 */
exports.getFamilyList = function(req, res, next) {
    // 参数校验
    req.validate('user_id', '必须指定合法的用户id').notEmpty().isMongoId();
    var errors = req.validationErrors();
    if (errors) {
        return next(errors[0]);
    }

    async.waterfall([
        function(cb) { // 获取用户信息
            userService.getUserById(req, res, function(user) {
                cb(null, user);
            })
        },
        function(user, cb) { // 根据families 获取家人列表

            var query = userService.getUserListQuery(req, res);


            // .where('canLogin', false) ; // 家人用户不能登录

            var familyIds = _.map(user.families ? user.families : [], function(o) {
                return o.toString();
            });

            // 用户类型为普通用户
            query = query.where('userType', 0)
                .where('canLogin', false)
                .where('_id').in(familyIds);

            query.paginate(req.query.page, req.query.count, function(err, docs, total) {
                if (!err) {
                    // docs = docs.toObject();
                    docs = _.map(docs, function(o) {
                        o = o.toObject();
                        o.relation = o.asFamilies[0].relation;
                        o.checkType = o.asFamilies[0].checkType;
                        return o;
                    });
                    // console.log('==='+docs);
                    return res.json(returnFactory('SUCCESS', { docs: docs, total: total }));
                } else {
                    return res.json(returnFactory('ERROR', null, err));
                }
            });
        }
    ], function(err, results) {
        // TO DO handle errors
    });
};



/**
 * @alias /api/app/users/:user_id/families/:id[GET]
 * @description  app端 获取家人详情
 * @return {Object} 家人列表
 */
exports.getFamilyDetail = function(req, res, next) {
    // 参数校验
    req.validate('user_id', '必须指定合法的用户id').notEmpty().isMongoId();
    req.validate('id', '必须指定合法的家人id').notEmpty().isMongoId();
    var errors = req.validationErrors();
    if (errors) {
        return next(errors[0]);
    }

    async.waterfall([
        function(cb) { // 获取用户信息
            userService.getUserById(req, res, function(user) {
                cb(null, user);
            });
        },
        function(user, cb) { // 获取family信息
            userService.checkFamilyBelong(user, req, res, function(familyUser) {
                if (familyUser) {
                    familyUser = familyUser.toObject();
                    familyUser.relation = familyUser.asFamilies[0].relation;
                    familyUser.checkType = familyUser.asFamilies[0].checkType;
                }
                return res.json(returnFactory('SUCCESS', familyUser));
            });
        }
    ], function(err, results) {
        // TO DO handle errors
    });
};


/**
 * @alias /api/app/app_users[POST]
 * @description  普通app用户创建 注册
 * @param {String=} name 用户名
 * @param {String} tel 电话号码，11位
 * @param {String=} email 邮箱
 * @param {String=} password 密码
 * @param {String=} avator 头像
 * @param {String=} role 权限组id
 * @param {String=} userType 用户类型, 0 normal 1 tech 2 expert  
 * @param {String=} birthday 生辰，UTC毫秒数
 * @param {String=} sex 性别，取值男： 男 0 未定义 1 男 2 女
 * @param {String=} idCardNumber 身份证号 
 * @param {String=} veryficationCode  验证码
 * 以下是家人的属性
 * @param {String} checkType 检测类型 0 保存报告 1 临时报告
 * @param {String} relation 关系名称
 * @return {Object} 新增的用户账号对象
 */
exports.createAppUser = function(req, res, next) {
    // 参数校验
    req.validate('tel', '必须输入手机号').notEmpty();
    req.validate('password', '必须输入密码').notEmpty();
    req.validate('verificationCode', '必须输入校验码').notEmpty();
    var errors = req.validationErrors();
    if (errors) {
        return next(errors[0]);
    }
    // console.log('verificationCode2:'+req.body.verificationCode);
    // 核对校验码
    if (!userService.checkVeryficationCode(req, res)) {
        return res.json(returnFactory('INVALIDE_VERYFI_CODE', null));
    }

    // APP用户有个固定的权限组
    req.body.role = setting.app_role_id;

    var adminType = 1;
    userService.create(req, res, adminType, next);
};


/**
 * @alias /api/app/app_users[PATCH]
 * @description  修改用户自己的信息，包括手机号 和 密码
 * @param {String=} name 用户名
 * @param {String=} tel 电话号码，11位
 * @param {String=} email 邮箱
 * @param {String=} avator 头像
 * @param {String=} verificationCode 验证码
 * @param {String=} birthday 生辰，UTC毫秒数
 * @param {String=} sex 性别，取值 男 0 未定义 1 男 2 女
 * @return {Object} {}}
 */
/**
 * 修改了 修改用户信息的方式，之前是只有在登录的状态下更改，暂时先改成传入id就可以修改，在正式环境下要更改过来
 * update by owx at 2017-01-23 10:07
 */
exports.updateLogin = function(req, res, next) {
    var sms = require('../message/sms');
    // if(!req.user){
    //   return res.json(returnFactory('NOT_LOGIN',null));
    // }

    // 修改手机号 和 密码 需要校验验证码
    if (req.body.tel || req.body.password) {
        if (!req.body.verificationCode) {
            return res.json(returnFactory('NO_VERI_CODE', null));
        }
    }

    // 不能同时修改手机号 和 密码
    if (req.body.tel && req.body.password) {
        return res.json(returnFactory('BOTH_TEL_PWD', null));
    }

    // 修改手机号 如果有验证码需要验证
    if (req.body.tel) {
        var message = sms.validSMSCode(req.body.tel, req.body.verificationCode);
        if (message) {
            return res.json(returnFactory('INVALIDE_VERYFI_CODE', null));
        }
    }

    // req.params.id = req.user.id;
    req.params.id = req.body.id;

    console.log('req.params.id:', req.params.id);
    // 过滤非法属性
    userService.sanitizeInput(req, res, next);

    var adminType = 1;
    // 需要判断 修改后的手机号是否已经存在
    if (req.body.tel) {
        userService.checkUserExists({ tel: req.body.tel }, function(err, doc) {
            if (doc) {
                return res.json(returnFactory('DUPLICATE_KEY', null));
            } else {

                userService.update(req, res, adminType, next);
                // 该函数后面的代码不允许有返回到前台的代码
            }
        });
    } else {
        userService.update(req, res, adminType, next);
    }
};


/**
 * @alias /api/app/app_users/[GET]
 * @description  获取登陆用户的详细信息
 * @param {String} id 用户id
 * 
 * @return {Object} 用户对象
 */
exports.detailLogin = function(req, res, next) {

    if (!req.user) {
        return res.json(returnFactory('NOT_LOGIN', null));
    }

    req.params.id = req.user.id;

    userService.detail(req, res, next);
};