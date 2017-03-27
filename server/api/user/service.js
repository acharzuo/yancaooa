/**
 * 服务controller的方法
 */
var User = require('./model').User;
var returnFactory = require('../../utils/returnFactory');
var tokenManager = require('../../utils/token_manager');
var tool = require('../../utils/tools');
var _ = require('lodash');
var sms = require('../message/sms');
var setting = require('../../config/setting');

exports.validationError = function(res, err) {
    return res.status(422).json(err);
};


// 增加用户检测次数
exports.increaseCheckCount = function(userId, callback) {
    User.findById(userId).exec(function(err, doc) {
        if (!err && doc) {
            if (doc.checkCount != null) {
                doc.checkCount += 1;
            } else {
                doc.checkCount = 1;
            }
            doc.save(function(err) {
                if (callback) callback(err, doc);
            })
        } else {
            if (callback) callback(err, doc);
        }

    })
}

// 检测用户是否存在
var checkUserExists = exports.checkUserExists = function(loginInfo, callback) {
    var query = User.findOne({ 'canLogin': true });

    var queryCondition = [];
    // 检测邮箱是否存在
    if (loginInfo.email) {
        queryCondition.push({ 'email': loginInfo.email });
    }
    // 检测电话是否存在
    if (loginInfo.email) {
        queryCondition.push({ 'tel': loginInfo.tel });
    }

    if (queryCondition.length == 0) {
        return callback(null, null);
    }
    if (queryCondition.length == 1) {
        query = query.where(queryCondition[0]);
    }

    if (queryCondition.length > 1) {
        query = query.or(queryCondition);
    }

    query.exec(function(err, doc) {
        callback(err, doc);
    });
};

// 获取token
exports.createToken = function(req, res, adminType, next) {
    // 获取入参
    var loginName = req.body.email;
    var loginField = 'email';
    if (!loginName) {
        loginName = req.body.tel;
        loginField = 'tel';
    }
    
    if (!loginName) {
        return res.json(returnFactory('NOT_FOUND', null));
    }

    var password = req.body.password;

    // 密码 或 验证码至少输入一个
    if (!password && !req.body.verificationCode) {
        return res.json(returnFactory('PWD_VERI_LOST', null));
    }

    //从数据库的普通用户中根据邮箱或电话号码查找用户是否存在
    User.findOne({ 'adminType': adminType, 'canLogin': true })
        // .or([
        //   {'canLogin': true},   // canLogin 为true
        //   {'canLogin': {$exists: false}}   // canLogin 不存在
        // ])
        .where(loginField, loginName)
        .exec(function(err, user) {
            if (!err && user) {
                // 密码存在 则用密码登陆
                if (password) {
                    console.log('1111111111111');
                    //检查密码是否正确
                    if (user.authenticate(password)) {
                        //生成并保存token
                        tokenManager.saveToken(user, function(token) {
                            // 返回前台token
                            return res.json(returnFactory('SUCCESS', { token: token, user: user }));

                        });
                    } else {
                        //密码不正确
                        return res.json(returnFactory('WRONG_LOGIN', null));
                    }
                } else {
                    // 验证码存在 则用验证码登陆
                    if (req.body.verificationCode) {
                        //检查 验证码是否正确
                        var message = sms.validSMSCode(req.body.tel, req.body.verificationCode);
                        if (!message) {
                            //生成并保存token
                            tokenManager.saveToken(user, function(token) {
                                // 返回前台token
                                return res.json(returnFactory('SUCCESS', { token: token, user: user }));
                            });
                        } else {
                            // 验证码不正确
                            return res.json(returnFactory('INVALIDE_VERYFI_CODE', null));
                        }
                    }
                }

            } else {
                // ！！！！验证码存在 则用验证码登陆 用户不存在 则创建用户！！！！！
                if (req.body.verificationCode) {
                    //检查 验证码是否正确
                    var message = sms.validSMSCode(req.body.tel, req.body.verificationCode);
                    if (!message) {
                        // 准备对象
                        req.body.adminType = 1;

                        //创建Entity，自带参数校验
                        var newUser = new User(req.body);

                        // 补全用户信息
                        newUser.provider = 'local';

                        // 更新修改人
                        newUser.updatedBy = newUser.createdBy = req.user ? req.user.id : null;

                        // 写入数据库
                        newUser.save(function(err) {
                            if (!err) {
                                //生成并保存token
                                tokenManager.saveToken(newUser, function(token) {
                                    // 返回前台token
                                    return res.json(returnFactory('SUCCESS', { token: token, user: newUser }));
                                });
                            } else {
                                return res.json(returnFactory('ERROR', null, err));
                            }
                        });
                    } else {
                        // 验证码不正确
                        return res.json(returnFactory('INVALIDE_VERYFI_CODE', null));
                    }
                } else {
                    // 未找到用户
                    return res.json(returnFactory('NOT_FOUND', null));
                }

            }
        });
};

// 删除token
exports.deleteToken = function(req, res) {

    //1、删除req中的user，token认证通过会添加该字段
    delete req.user;

    //2、清除redis中token对应的数据
    tokenManager.expireToken(req);

    // 3、返回前台删除成功消息
    return res.json(returnFactory('SUCCESS', null));
}


// 增加检测用户
exports.createCheckingUser = function(req, res, callback) {
    // 获取token中用户的信息
    var reqUser = req.user || {};

    // 检测用户是否存在
    checkUserExists(req.body, function(err, user) {
        if (!err) {
            if (user) {
                if (user.checkCount != null) {
                    user.checkCount += 1;
                } else {
                    user.checkCount = 1;
                }

                var updateData = req.body;
                delete updateData.id; //需要删除body中的id字段

                // 用户自己可以修改自己的密码
                if (user.id != reqUser.id) {
                    delete updateData.password;
                }

                user.updatedAt = tool.getCurUtcTimestamp(); //最后更新日期
                user.updatedBy = reqUser ? reqUser.id : null; //最后更新人

                user = _.merge(user, updateData); //将传入的参数合并到原来的数据上

                // 写入数据库
                user.save(function(err) {
                    if (callback) callback(err, user);
                });
            } else {
                // 准备对象
                req.body.adminType = 1;

                //创建Entity，自带参数校验
                var newUser = new User(req.body);

                // 补全用户信息
                newUser.provider = 'local';

                // 更新修改人
                newUser.updatedBy = newUser.createdBy = reqUser ? reqUser.id : null;

                // 写入数据库
                newUser.save(function(err) {
                    if (callback) callback(err, newUser);
                });
            }
        } else {
            callback(err, null);
        }
    });
};

// 增加游客账户
exports.createTempUser = function(user, callback){

     user.adminType = 1;
     user.canLogin = false;

     var newUser = new User(user);

     // 写入数据库
     newUser.save(function(err) {
         if (callback) callback(err, newUser);
     });
};

// 核对 手机校验码
var checkVeryficationCode = exports.checkVeryficationCode = function(req, res, next) {
    // 手机号 和 验证码 都存在才校验
    if (req.body.tel && req.body.verificationCode) {
        var message = sms.validSMSCode(req.body.tel, req.body.verificationCode);
        if (message) {
            // 校验不通过直接返回
            return false;
        }
        return true;
    }
    return true;
}

// 增加用户
exports.create = function(req, res, adminType, next) {


    // 检测用户是否存在
    checkUserExists(req.body, function(err, doc) {

        if (!err) {
            if (doc) {
                return res.json(returnFactory('DUPLICATE_KEY', null, err));
            }
            // 准备对象
            req.body.adminType = adminType;

            //创建Entity，自带参数校验
            var newUser = new User(req.body);

            // 补全用户信息
            newUser.provider = 'local';

            // 更新修改人
            newUser.updatedBy = newUser.createdBy = req.user ? req.user.id : null;

            // 写入数据库
            newUser.save(function(err, user) {
                if (err) {
                    return res.json(returnFactory('ERROR', null, err));
                }
                return res.json(returnFactory('SUCCESS', user));
            });

        } else {
            return res.json(returnFactory('ERROR', null, err));
        }
    });

};

// 检查是否超级管理员
function checkIsSuperAdmin(doc) {
    if (doc._id == setting.super_admin_id) {
        return true;
    } else {
        return false;
    }
}

// 删除用户
exports.delete = function(req, res, adminType, next) {

    req.validate('id', '必须指定id').notEmpty();
    req.validate('id', '必须是合法的id').isMongoId();
    var errors = req.validationErrors();
    if (errors) {
        return next(errors[0]);
    }
    // 调用接口查找数据库并删除
    User.findById(req.params.id, '-salt -hashedPassword', function(err, doc) {
        if (!err && doc) {
            // 不能删除超级管理员
            if (checkIsSuperAdmin(doc)) {
                return res.json(returnFactory('MODIFY_ADMIN', doc));
            }

            doc.remove(function(err) {
                if (!err) {
                    //返回被删除的对象
                    return res.json(returnFactory('SUCCESS', doc));
                } else {
                    return res.json(returnFactory('DB_ACCESS_ERROR', null, err));
                }
            })
        } else {
            return res.json(returnFactory('NOT_FOUND', null));
        }
    });
};

// 修改用户
exports.update = function(req, res, adminType, next) {

    req.validate('id', '必须指定id').notEmpty();
    req.validate('id', '必须是合法的id').isMongoId();
    // req.validate('tel', '必须是合法的手机号').isMobilePhone('zh-CN');
    var errors = req.validationErrors();
    if (errors) {
        return next(errors[0]);
    }

    // 获取token中用户的信息
    var reqUser = req.user;

    //根据id查找用户，并更新
    User.findById(req.params.id, function(err, user) {
        if (err) {
            return res.json(returnFactory('ERROR', null, err));
        }

        if (!user) {
            return res.json(returnFactory('NOT_FOUND', null));
        }

        // 不能修改超级管理员
        if (checkIsSuperAdmin(user)) {
            return res.json(returnFactory('MODIFY_ADMIN', user));
        }

        var updateData = req.body;
        delete updateData.id; //需要删除body中的id字段

        // 用户自己可以修改自己的密码
        if (!reqUser || user.id != reqUser.id) {
            delete updateData.password;
        }

        // 修改密码 如果有验证码需要验证
        if (req.body.password && req.body.verificationCode) {
            var message = sms.validSMSCode(user.tel, req.body.verificationCode);
            if (message) {
                return res.json(returnFactory('INVALIDE_VERYFI_CODE', null, null, message));
            }
        }

        user.updatedAt = tool.getCurUtcTimestamp(); //最后更新日期
        user.updatedBy = reqUser ? reqUser.id : null; //最后更新人

        user = _.merge(user, updateData); //将传入的参数合并到原来的数据上

        // 写入数据库
        user.save(function(err) {
            if (err) {
                return res.json(returnFactory('ERROR', null, err));
            }

            //正常返回
            return res.json(returnFactory('SUCCESS', user));
        });
    });
};

// 用户详情
exports.detail = function(req, res, next) {

    req.validate('id', '必须指定id').notEmpty();
    req.validate('id', '必须是合法的id').isMongoId();
    var errors = req.validationErrors();
    if (errors) {
        return next(errors[0]);
    }

    var userId = req.params.id;

    if (!userId) {
        userId = req.user.id;
    }

    User.findById(userId, '-salt -hashedPassword').exec(function(err, user) {
        if (!err) {
            //正常返回
            return res.json(returnFactory('SUCCESS', user));
        } else {
            return res.json(returnFactory('ERROR', null, err));
        }
    });
};

// 获取当前登录用户信息
exports.getLoginInfo = function(req, res, next) {

    if (!req.user) {
        return res.json(returnFactory('ERROR', null, null, '未登录'));
    }

    var userId = req.user.id;

    User.findById(userId, '-salt -hashedPassword').exec(function(err, user) {
        if (!err) {
            //正常返回
            return res.json(returnFactory('SUCCESS', user));
        } else {
            return res.json(returnFactory('ERROR', null, err));
        }
    });
};


exports.updateToken = function(req, res, callback) {
    tokenManager.updateToken(req, callback);
};

// 根据id返回用户，找不到直接返回
exports.getUserById = function(req, res, callback) {
    // 检查用户是否存在
    User.findById(req.params.user_id, function(err, user) {

        if (!err) {
            if (user) {
                // 用户存在 修改family 用户
                callback(user);
            } else {
                return res.json(returnFactory('NOT_FOUND', null));
            }
        } else {
            return res.json(returnFactory('ERROR', null, err));
        }
    });
};


// 检查家人是否在用户的家人列表中 返回家人对象
exports.checkFamilyBelong = function(user, req, res, callback) {
    User.findById(req.params.id, function(err, familyUser) {
        if (!err) {
            if (familyUser) {
                var found = _.find(user.families ? user.families : [], function(o) {
                    return o.toString() == familyUser._id.toString();
                });
                // 存在与家人列表中
                if (found) {
                    callback(familyUser);
                } else {
                    // 未找到
                    return res.json(returnFactory('NOT_FOUND', null, null,
                        '家人不属于输入的用户'));
                }
            } else {
                return res.json(returnFactory('NOT_FOUND', null));
            }
        } else {
            return res.json(returnFactory('ERROR', null, err));
        }
    });
};


// 更新家人的信息 返回更新后的家人对象
exports.updateFamily = function(familyUser, req, res, callback) {
    // 挑选出合法的属性
    var obj = _.pick(req.body, ['name', 'tel', 'avator', 'birthday', 'sex', 'checkType', 'relation']);
    // 修改 检测类型
    if (req.body.checkType != null && _.isArray(familyUser.asFamilies)) {
        familyUser.asFamilies[0].checkType = req.body.checkType;
    }
    // 修改 家人关系
    if (req.body.relation != null && _.isArray(familyUser.asFamilies)) {
        familyUser.asFamilies[0].relation = req.body.relation;
    }

    // user.updatedAt = tool.getCurUtcTimestamp(); //最后更新日期
    familyUser.updatedBy = req.user ? req.user.id : null; //最后更新人

    familyUser = _.merge(familyUser, obj); //将传入的参数合并到原来的数据上

    familyUser.save(function(err) {
        if (!err) {
            callback(familyUser);
        } else {
            return res.json(returnFactory('ERROR', null, err));
        }
    });

};

// 创建家人 返回创建的对象
exports.createFamily = function(user, req, res, callback) {
    // 挑选出合法的属性
    // var obj = _.pick(req.body,
    //     ['name','tel','avator','birthday','sex','checkType','relation']);
    // console.log(obj);

    req.body.canLogin = false; // 家人用户不能登录
    var familyUser = new User(req.body);
    familyUser.adminType = 1;
    familyUser.userType = 0;
    familyUser.createdBy = req.user ? req.user : null;
    var families = [];

    // 添加到家人用户所属家人列表中
    families.push({
        relation: req.body.relation || "",
        checkType: req.body.checkType != null ? req.body.checkType : 1,
        user: user._id
    });
    familyUser.asFamilies = families;

    familyUser.save(function(err) {
        if (!err) {

            callback(familyUser);
        } else {
            return res.json(returnFactory('ERROR', null, err));
        }
    });
}

// 拼装查询条件
exports.getUserListQuery = function(req, res) {
    //准备查询条件, 只显示adminType=1的普通用户
    var query = User.find({ 'adminType': 1 }, '-salt -hashedPassword') //将密码等信息屏蔽
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

    // 4 类型
    if (req.query.userType) {
        query = query.where('userType', Number(req.query.userType));
    }

    // 5 sex
    if (req.query.sex != null) {
        query = query.where('sex', req.query.sex);
    }

    // 6 status
    if (req.query.status != null) {
        query = query.where('status', req.query.status)
    }

    // 7 生辰
    if (req.query.startTime && req.query.endTime) {
        query = query.where('birthday', {
            '$gte': req.query.startTime,
            '$lt': req.query.endTime
        });
    }

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

    return query;
}


// 过滤输入的属性信息 防止非法属性
exports.sanitizeInput = function(req, res, next) {
        // req.body = _.pick(req.body,
        //       ['name','tel','avator','birthday','verificationCode',
        //       'sex','checkType','relation','userType','password',
        //       'role','page','count','sort','fields']);
        req.body = _.pick(req.body, ['id', 'name', 'tel', 'avator', 'birthday', 'verificationCode',
            'sex', 'userType', 'address'
        ]);
    }
    // /**
    //  * Change a users password
    //  */
    // exports.changePassword = function(req, res, next) {
    //   var userId = req.user._id;
    //   var oldPass = String(req.body.oldPassword);
    //   var newPass = String(req.body.newPassword);

//   Admin.findById(userId, function (err, user) {
//     if(user.authenticate(oldPass)) {
//       user.password = newPass;
//       user.save(function(err) {
//         if (err) return adminService.validationError(res, err);
//         res.send(200);
//       });
//     } else {
//       res.send(403);
//     }
//   });
// };



// /**
//  * Get my info
//  */
// exports.me = function(req, res, next) {
//   var userId = req.user._id;
//   Admin.findOne({
//     _id: userId
//   }, '-salt -hashedPassword', function(err, user) { // don't ever give out the password or salt
//     if (err) return next(err);
//     if (!user) return res.json(401);
//     res.json(user);
//   });
// };
