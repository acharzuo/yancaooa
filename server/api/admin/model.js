'use strict';

var mongoose = require('mongoose');
var Roles = mongoose.model('Roles');
var mongoosePaginate = require('mongoose-paginate');
var Schema = mongoose.Schema;
var crypto = require('crypto');
var authTypes = ['github', 'twitter', 'facebook', 'google'];
// var tokenManager = require('../../utils/token_manager');
var tool = require('../../utils/tools');

var AdminSchema = new Schema({
  name: String,   // 1.姓名
  email: {    // 2.邮箱
    type: String,
    unique: true,
    trim: true,
    lowercase: true,
    match: /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/,
    required: true
  },
  sex:{
   type: Boolean, //3.性别 true= 男
   default: true
  },
  status:{  //4.状态，启用，禁用 0 1
    type: Number,
    default: 0  
  },

  // birthday:Date,    //5.生日
  // onlineTime: {    //6.在线时长，单位？小时
  //   type: Number,  
  //   default: 0
  // },
  tel:{
    type: String // 7.电话号码
    // required: true  
  },
  role: {   // 8.角色 权限组
    type: mongoose.SchemaTypes.ObjectId,
    ref: "Roles"
  },
  createdAt:{   //9.创建时间
    type:Number,
    default: tool.getCurUtcTimestamp()
  },
  lastLogin: {    //10.上次登录时间
    type: Number,
    default: tool.getCurUtcTimestamp()
  },
  updatedAt: {   //11、最近修改时间
    type:Number,
    default: tool.getCurUtcTimestamp()
  },
  updatedBy: {   //12、最近修改的人
    type: String,
    default: ''
  },
  // checkCount:Number, //13.检测次数 
  hashedPassword: String,   // 14.加密后的密码
  avator:{
    type: String,  // 15、头像地址
    default:''
  },
  // type:{  //16 用户类型, normal tech  expert  
  //   type:String,  
  //   default: 'normal'
  // },
  provider: String,
  salt: String
});

/**
 * Virtuals
 */
AdminSchema
  .virtual('password')
  .set(function(password) {
    this._password = password;
    this.salt = this.makeSalt();
    this.hashedPassword = this.encryptPassword(password);
  })
  .get(function() {
    return this._password;
  });

// Public profile information
AdminSchema
  .virtual('profile')
  .get(function() {
    return {
      name: this.name,
      role: this.role,
      // type: this.type,
      status: this.status,
      tel: this.tel,
      sex: this.sex,
      // createdTime: this.createdTime,
      // birthday: this.birthday,
      // checkCount: this.checkCount,
      email: this.email,
      lastLogin: this.lastLogin
    };
  });

// Non-sensitive info we'll be putting in the token
AdminSchema
  .virtual('token')
  .get(function() {
    return {
      '_id': this._id,
      'role': this.role
    };
  });

// AdminSchema
//   .virtual('createdTime')
//   .get(function() {
//     return this.createdAt?new Date(this.createdAt):null;
//   });

/**
 * Validations
 */

// Validate empty email
AdminSchema
  .path('email')
  .validate(function(email) {
    if (authTypes.indexOf(this.provider) !== -1) return true;
    return email.length;
  }, 'Email cannot be blank');

// Validate empty password
AdminSchema
  .path('hashedPassword')
  .validate(function(hashedPassword) {
    if (authTypes.indexOf(this.provider) !== -1) return true;
    return hashedPassword.length;
  }, 'Password cannot be blank');

// Validate email is not taken
AdminSchema
  .path('email')
  .validate(function(value, respond) {
    var self = this;
    this.constructor.findOne({email: value}, function(err, user) {
      if(err) throw err;
      if(user) {
        if(self.id === user.id) return respond(true);
        return respond(false);
      }
      respond(true);
    });
}, 'The specified email address is already in use.');

var validatePresenceOf = function(value) {
  return value && value.length;
};

/**
 * Pre-save hook
 */
AdminSchema
  .pre('save', function(next) {
    if (!this.isNew) return next();

    if (!validatePresenceOf(this.hashedPassword) && authTypes.indexOf(this.provider) === -1)
      next(new Error('Invalid password'));
    else
      next();
  });

/**
 * Methods
 */
AdminSchema.methods = {
  /**
   * Authenticate - check if the passwords are the same
   *
   * @param {String} plainText
   * @return {Boolean}
   * @api public
   */
  authenticate: function(plainText) {
    return this.encryptPassword(plainText) === this.hashedPassword;
  },

  /**
   * Make salt
   *
   * @return {String}
   * @api public
   */
  makeSalt: function() {
    return crypto.randomBytes(16).toString('base64');
  },

  /**
   * Encrypt password
   *
   * @param {String} password
   * @return {String}
   * @api public
   */
  encryptPassword: function(password) {
    if (!password || !this.salt) return '';
    var salt = new Buffer(this.salt, 'base64');
    // console.log('salt'+salt);
    return crypto.pbkdf2Sync(password, salt, 10000, 64).toString('base64');
  }
};

AdminSchema.plugin(mongoosePaginate,{
  limit: 50
});  //添加分页插件

var Admin = exports.Admin = mongoose.model('Admin', AdminSchema);

//初始化管理员数据
Admin.findOne({email:'admin@yty.com'}, function(err,doc){
  if(err || !doc){
    var initData = {
      name: 'admin',
      password:'123456',
      // role:'admin',
      // type: this.type,
      // status: this.status,
      tel: '18629621825',
      sex: true,
      birthday: tool.getCurUtcTimestamp(),
      checkCount: 1234,
      email: 'admin@yty.com'
    };
    var newAdmin = new Admin(initData);
    newAdmin.save(function(err, user){
      if(err){
        console.log(err);
      }
      console.log('init admins');
    })
  }
})