'use strict';

var mongoose = require('mongoose');
// var Roles = mongoose.model('Roles');
var Schema = mongoose.Schema;
var _ = require('lodash');
// var crypto = require('crypto');
// var authTypes = ['github', 'twitter', 'facebook', 'google'];
// var tokenManager = require('../../utils/token_manager');
var tool = require('../../utils/tools');
var BaseSchema = require('../../framework/model/baseSchema');

var DeviceSchema = new BaseSchema({
    deviceId: {
        type: String,
        unique: true,
        required: true
    }, // 0. 经络仪ID
    type: { //型号，类型，0 个人、 1 店铺
        type: Number,
        default: 0
    },
    lastUseDate: { //最后使用时间
        type: Number,
        default: tool.getCurUtcTimestamp
    },
    maintenanceTimes: {
        type: Number, //维护次数
        default: 0
    },
    adjustTimes: {
        type: Number, //校正次数
        default: 0
    },
    adjustCount: {
        type: Number, // 校正量
        default: 0
    },
    user: String, //使用者
    // name: String,   // 1.经络仪名称
    // address: String, //2.经络仪地址
    // response: String, // 3.负责人名称，是否是注册用户？
    // deviceCount: Number, //经络仪数量
    // advertiseCount: Number, //广告数量
    // technicianCount: Number, //技师数
    // expertCount: Number, //专家数量
    tel: String, //联系电话
    idCardNumber: String, //身份证号 
    enterTime: {
        type: Number, // 入驻时间
        default: tool.getCurUtcTimestamp
    },
    // image: String,  // 经络仪图像
    // devices: [String],  //注册经络仪
    status: { //发布状态 0 正常 1 禁用
        type: Number,
        default: 0
    },
    isUsed: { // 是否被店铺使用，0 已经使用 1 未使用
        type: Number,
        default: 1
    }
    // checkCount:Number, //13.检测次数 
    // type:{  //16 用户类型, normal tech  expert  
    //   type:String,  
    //   default: 'normal'
    // },
});



// // Public profile information
// DeviceSchema
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
// DeviceSchema
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
// DeviceSchema
//   .path('email')
//   .validate(function(email) {
//     if (authTypes.indexOf(this.provider) !== -1) return true;
//     return email.length;
//   }, 'Email cannot be blank');

// // Validate empty password
// DeviceSchema
//   .path('hashedPassword')
//   .validate(function(hashedPassword) {
//     if (authTypes.indexOf(this.provider) !== -1) return true;
//     return hashedPassword.length;
//   }, 'Password cannot be blank');

// // Validate email is not taken
// DeviceSchema
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
DeviceSchema
    .pre('save', function(next) {
        next();
    });

// /**
//  * Methods
//  */
// DeviceSchema.methods = {
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

// DeviceSchema.plugin(mongoosePaginate);  //添加分页插件

// var Device = exports.Device = mongoose.model('Device', DeviceSchema, 'device');
var Device = exports.Device = mongoose.model('Device', DeviceSchema);

//初始化经络仪数据
Device.findOne({ 'deviceId': "DEV001" }, function(err, doc) {
    if (err || !doc) {
        var initData = {
            deviceId: 'DEV001',
            type: 1,
            user: "测试者"
        };
        var device = new Device(initData);
        device.save(function(err, data) {
            console.log('init device');
        });
    }
});

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