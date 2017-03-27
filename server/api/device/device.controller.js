/**
 * Created by achar on 2016/12/5.
 */

'use strict';

var User = require('./device.model');
var message = require('../../utils/statusMessage');
var validate = require('../../utils/validate');

/**
 * 注册新用户
 * @param req
 * @param res
 * @param next
 */
exports.register = function (req, res, next) {
    // 1. 检测输入的完整性
    var body = req.body;

    /*
     * 注册时数据要求:
     * 手机号码必输, 手机号码必须为中国手机号
     * 密码必须输入, 密码有效性检测(不能低于6位,暂定)
     * 重复密码必须与密码一致
     * 邮箱如果有的话,判断其有效性
     * 判断失败返回失败
     */
    // TODO 要是能有通用的验证模块,就更好了.
    if(  !validate.mobilePhone(body.phone, true)
            || !validate.password(body.password, true)
            || !(body.password === body.repassword)
            || !validate.email(body.email, false)
    ) {
        return res.json(message.createReturn(message.ERROR,{error:'数据验证失败!'}));
    }

    // 2. 整理数据
    var newUser = new User(body);
    newUser.hashedPassword = body.password;
    newUser.provider = 'local';
    newUser.role = 'user';

    // 3. 处理业务
    // 4. 整理返回值
    // 5. 返回

    // 保存用户信息
    newUser.save(function(err, user) {
        if (err) {
            res.json(message.createReturn(message.ERROR,err));
        }
        res.json(message.createReturn(message.SUCCESS,user));
    });
};



exports.login = function(req, res, next) {
    // 1. 检测输入的完整性
    var body = req.body;
    if( !validate.password(body.password, true)
        || !validate.mobilePhone(body.phone,true)
    ){
        return res.json(message.createReturn(message.ERROR,{}));
    }
    // 2. 整理数据
    // 3. 处理业务
    // 4. 整理返回值
    // 5. 返回
}


var validationError = function(res, err) {
  return res.status(422).json(err);
};

/**
 * Get list of users
 * restriction: 'admin'
 */
exports.index = function(req, res) {
  console.log('GET api/users');
  User.find({}, '-salt -hashedPassword')
  .paginate(req.query.page,req.query.count, function (err, users, total) {
    if(err) return res.send(500, err);
    res.status(200).json(users);
  });
};

/**
 * 在WEB后台,新建一个用户
 * @param req
 * @param res
 * @param next
 */
exports.create = function (req, res, next) {
  var newUser = new User(req.body);
  newUser.provider = 'local';
  newUser.role = 'user';
  newUser.save(function(err, user) {
    if (err) return validationError(res, err);
    res.json(user);
  });
};

/**
 * Get a single user
 */
exports.show = function (req, res, next) {
  var userId = req.params.id;

  User.findById(userId, function (err, user) {
    if (err) return next(err);
    if (!user) return res.send(401);
    res.json(user.profile);
  });
};

/**
 * Deletes a user
 * restriction: 'admin'
 */
exports.destroy = function(req, res) {
  User.findByIdAndRemove(req.params.id, function(err, user) {
    if(err) return res.send(500, err);
    return res.send(204);
  });
};

/**
 * Change a users password
 */
exports.changePassword = function(req, res, next) {
  var userId = req.user._id;
  var oldPass = String(req.body.oldPassword);
  var newPass = String(req.body.newPassword);

  User.findById(userId, function (err, user) {
    if(user.authenticate(oldPass)) {
      user.password = newPass;
      user.save(function(err) {
        if (err) return validationError(res, err);
        res.send(200);
      });
    } else {
      res.send(403);
    }
  });
};

/**
 * Get my info
 */
exports.me = function(req, res, next) {
  var userId = req.user._id;
  User.findOne({
    _id: userId
  }, '-salt -hashedPassword', function(err, user) { // don't ever give out the password or salt
    if (err) return next(err);
    if (!user) return res.json(401);
    res.json(user);
  });
};

/**
 * Authentication callback
 */
exports.authCallback = function(req, res, next) {
  res.redirect('/');
};



// 1. 检测输入的完整性
// 2. 整理数据
// 3. 处理业务
// 4. 整理返回值
// 5. 返回


