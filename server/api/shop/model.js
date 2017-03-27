'use strict';

var mongoose = require('mongoose');
// var Roles = mongoose.model('Roles');
var mongoosePaginate = require('mongoose-paginate');
var Schema = mongoose.Schema;
// var crypto = require('crypto');
// var authTypes = ['github', 'twitter', 'facebook', 'google'];
// var tokenManager = require('../../utils/token_manager');
var tool = require('../../utils/tools');
var BaseSchema = require('../../framework/model/baseSchema');

var ShopSchema = new BaseSchema({
  shopId: {
    type: String,
    unique: true
  },  // 0. 店铺ID
  name: String,   // 1.店铺名称
  address: String, //2.店铺地址
  responsible: String, // 3.负责人名称，是否是注册用户？
  deviceCount: Number, //经络仪数量
  advertiseCount: Number, //广告数量
  technicianCount: Number, //技师数
  expertCount: Number, //专家数量
  tel: String,   //联系电话
  idCardNumber: String, //身份证号 
  enterTime: Number, // 入驻时间
  image: String,  // 店铺图像
  devices: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Device'
  }],  //注册经络仪
  status:{              //发布状态 0 正常，1 其他状态
    type:Number,
    default: 0
  },
  // birthday:Date,    //5.生日
  // onlineTime: {    //6.在线时长，单位？小时
  //   type: Number,  
  //   default: 0
  // },
  
});

/**
 * Virtuals
 */
ShopSchema
  .virtual('devicesStr')
  .set(function(devicesStr) {
    try{
      var devicesArray = devicesStr.split(',');
      this.devices = devicesArray;
    }catch(e){
      console.error(e);
    }
  });

// // Public profile information
// ShopSchema
//   .virtual('profile')
//   .get(function() {
//     return {
//       name: this.name,
//       role: this.role,
//       // type: this.type,
//       status: this.status,
//       tel: this.tel,
//       sex: this.sex,

//       // birthday: this.birthday,
//       // checkCount: this.checkCount,
//       email: this.email,
//       lastLogin: this.lastLogin
//     };
//   });

// // Non-sensitive info we'll be putting in the token
// ShopSchema
//   .virtual('token')
//   .get(function() {
//     return {
//       '_id': this._id,
//       'role': this.role
//     };
//   });

/**
 * Validations
 */

// // Validate empty email
// ShopSchema
//   .path('email')
//   .validate(function(email) {
//     if (authTypes.indexOf(this.provider) !== -1) return true;
//     return email.length;
//   }, 'Email cannot be blank');

// // Validate empty password
// ShopSchema
//   .path('hashedPassword')
//   .validate(function(hashedPassword) {
//     if (authTypes.indexOf(this.provider) !== -1) return true;
//     return hashedPassword.length;
//   }, 'Password cannot be blank');

// // Validate email is not taken
// ShopSchema
//   .path('email')
//   .validate(function(value, respond) {
//     var self = this;
//     this.constructor.findOne({email: value}, function(err, user) {
//       if(err) throw err;
//       if(user) {
//         if(self.id === user.id) return respond(true);
//         return respond(false);
//       }
//       respond(true);
//     });
// }, 'The specified email address is already in use.');

var validatePresenceOf = function(value) {
  return value && value.length;
};

/**
 * Pre-save hook
 */
ShopSchema
  .pre('save', function(next) {
    next();
  });

// /**
//  * Methods
//  */
// ShopSchema.methods = {
//   /**
//    * Authenticate - check if the passwords are the same
//    *
//    * @param {String} plainText
//    * @return {Boolean}
//    * @api public
//    */
//   authenticate: function(plainText) {
//     return this.encryptPassword(plainText) === this.hashedPassword;
//   },

//   /**
//    * Make salt
//    *
//    * @return {String}
//    * @api public
//    */
//   makeSalt: function() {
//     return crypto.randomBytes(16).toString('base64');
//   },

//   /**
//    * Encrypt password
//    *
//    * @param {String} password
//    * @return {String}
//    * @api public
//    */
//   encryptPassword: function(password) {
//     if (!password || !this.salt) return '';
//     var salt = new Buffer(this.salt, 'base64');
//     return crypto.pbkdf2Sync(password, salt, 10000, 64).toString('base64');
//   }
// };

// ShopSchema.plugin(mongoosePaginate);  //添加分页插件

// var Shop = exports.Shop = mongoose.model('Shop', ShopSchema, 'shop');
var Shop = exports.Shop = mongoose.model('Shop', ShopSchema);
// //初始化管理员数据
// Admin.findOne({email:'admin@yty.com'}, function(err,doc){
//   if(err || !doc){
//     var initData = {
//       name: 'admin',
//       password:'123456',
//       role:'admin',
//       // type: this.type,
//       // status: this.status,
//       tel: '18629621825',
//       sex: true,
//       birthday: new Date(),
//       checkCount: 1234,
//       email: 'admin@yty.com'
//     };
//     var newAdmin = new Admin(initData);
//     newAdmin.save(function(err, user){
//       if(err){
//         console.log(err);
//       }
//       console.log('init admins');
//     })
//   }
// })