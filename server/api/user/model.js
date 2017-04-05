'use strict';

var mongoose = require('mongoose');
var Roles = mongoose.model('Roles');
var Schema = mongoose.Schema;
var crypto = require('crypto');
var authTypes = ['github', 'twitter', 'facebook', 'google'];
var tool = require('../../utils/tools');
var BaseSchema = require('../../framework/model/baseSchema');
var setting = require('../../config/setting');
var async = require('async');
var FamilySchema = new Schema({
    //***临时的一个子文档，不作为数据库映射集合,匿名混合模式 */
    relation: String, //关系名称
    checkType: {
        type: Number, // 检测类型 0 保存报告 1 临时报告 默认临时
        default: 1
    },
    user: { // 家人信息
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'User'
    }
}, { _id: false });


var UserSchema = new BaseSchema({
    name: String, // 1.姓名
    email: { // 2.邮箱
        type: String,
        // unique: true,
        // trim: true,
        lowercase: true,
        match: /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/,
        // index: true,
        // sparse: true
    },
    sex: {
        type: Number, //3.性别  男 0 未定义 1 男 2 女
        default: 0
    },
    status: { //4.状态，启用，禁用 0 1
        type: Number,
        default: 0
    },


    // onlineTime: {    //6.在线时长，单位？小时
    //   type: Number,  
    //   default: 0
    // },
    tel: {
        type: String, // 7.电话号码
        // unique: true
        // required: true  
    },

    role: { // 8.角色 权限组
        type: mongoose.SchemaTypes.ObjectId,
        ref: "Roles"
    },

    lastLogin: { //10.上次登录时间
        type: Number,
        default: tool.getCurUtcTimestamp
    },

    hashedPassword: String, // 14.加密后的密码
    avator: {
        type: String, // 15、头像地址
        default: ''
    },

    adminType: { // 系统用户类型 0 后台管理用户  1 普通用户 
        type: Number
    },
    provider: String,
    salt: String,
    /**
     * 后台管理用户独有属性
     */
    /**
     * 普通注册用户独有属性
     */
    userType: { //16 用户类型, 0 normal 1 tech 2 expert  
        type: Number,
        default: 0
    },
    checkCount: { //13.检测次数
        type: Number,
        default: 0
    },
    birthday: Number, //5.生日,UTC秒数
    idCardNumber: String, //身份证号 

    isTelVerified: { // 手机号是否验证 0 表示验证，1表示未验证
        type: Number,
        default: 1
    },
    families: [{
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'User'
    }], // 家人列表
    canLogin: { // 是否允许登录
        type: Boolean,
        default: true
    },
    asFamilies: [FamilySchema], // 是谁的家人 
    address: String, // 地区
    licenseId:String, // "执法编号"
});

/**
 * Virtuals
 */
UserSchema
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
UserSchema
    .virtual('profile')
    .get(function() {
        return {
            name: this.name,
            role: this.role,
            type: this.type,
            status: this.status,
            tel: this.tel,
            sex: this.sex,
            birthday: this.birthday,
            checkCount: this.checkCount,
            email: this.email
        };
    });

// Non-sensitive info we'll be putting in the token
UserSchema
    .virtual('token')
    .get(function() {
        return {
            '_id': this._id,
            'role': this.role
        };
    });

/**
 * Validations
 */

// Validate empty email
UserSchema
    .path('email')
    .validate(function(email) {
        if (authTypes.indexOf(this.provider) !== -1) return true;
        return email.length;
    }, 'Email cannot be blank');

// // Validate empty password
// UserSchema
//   .path('hashedPassword')
//   .validate(function(hashedPassword) {
//     if (authTypes.indexOf(this.provider) !== -1) return true;
//     return hashedPassword.length;
//   }, 'Password cannot be blank');

// Validate email is not taken
UserSchema
    .path('email')
    .validate(function(value, respond) {
        var self = this;
        this.constructor.findOne({ email: value }, function(err, user) {
            if (err) throw err;
            if (user) {
                if (self.id === user.id) return respond(true);
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
UserSchema
    .pre('save', function(next) {
        if (!this.isNew) return next();
        next()
            // if (!validatePresenceOf(this.hashedPassword) && authTypes.indexOf(this.provider) === -1)
            //   next(new Error('Invalid password'));
            // else
            //   next();
    });

/**
 * Methods
 */
UserSchema.methods = {
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
        return crypto.pbkdf2Sync(password, salt, 10000, 64).toString('base64');
    }
};


// var User = exports.User = mongoose.model('User', UserSchema, "user");
var User = exports.User = mongoose.model('User', UserSchema);

//初始化管理员数据
User.findById(setting.super_admin_id, function(err, doc) {
    if (err || !doc) {
        var initData = {
            _id: setting.super_admin_id,
            name: 'admin',
            password: '123456',
            role: setting.admin_role_id,
            adminType: 0,
            // status: this.status,
            tel: '18600000000',
            sex: 1,
            // birthday: tool.getCurUtcTimestamp(),
            // checkCount: 1234,
            email: 'admin@yty.com'
        };
        var newDoc = new User(initData);
        newDoc.save(function(err, data) {
            if (err) {
                console.log(err);
            }
            console.log('init admin');
        })
    }
});


//初始化前台技师数据
User.findOne({ email: 'tech@yty.com' }, function(err, doc) {
    if (err || !doc) {
        var initData = {
            name: 'tech',
            password: '123456',
            role: setting.tech_role_id,
            userType: 1,
            adminType: 1,
            // status: this.status,
            tel: '18700000000',
            sex: 1,
            // birthday: tool.getCurUtcTimestamp(),
            // checkCount: 1234,
            email: 'tech@yty.com'
        };
        var newDoc = new User(initData);
        newDoc.save(function(err, data) {
            if (err) {
                console.log(err);
            }
            console.log('init tech');
        });
    }
});

// if(ENV == 'test'){
//   async.waterfall([
//     // function(cb){
//     //     User.findByIdAndRemove(setting.test_user_id,function(err){
//     //         console.log('删除测试普通用户账户');
//     //         cb();
//     //     });
//     // },
//     // function(cb){
//     //   User.findByIdAndRemove(setting.test_admin_id,function(err){
//     //       console.log('删除测试管理员账户');
//     //       cb();
//     //   });
//     // },
//     function(cb){
//       var data = {
//               _id: setting.test_admin_id,
//               name: 'testAdmin',
//               password:'123456',
//               adminType: 0,
//               // status: this.status,
//               tel: '10000000000',
//               sex: 0,
//               role: setting.admin_role_id,
//               email: 'testAdmin@yty.com'
//               };
//         var user = new User(data);
//         user.save(function(err){
//             // global.ADMIN_USER = user;
//             console.log('创建测试管理员用户');
//             cb();
//         });
//     },
//     function(cb){
//       var data = {
//             _id: setting.test_user_id,
//             name: 'testUser',
//             userType: 1,
//             password:'123456',
//             adminType: 1,
//             // status: this.status,
//             tel: '10000000001',
//             sex: 0,
//             role: setting.tech_role_id,
//             email: 'testUser@yty.com'
//             };
//         var user = new User(data);
//         user.save(function(err){
//             // global.TECH_USER = user;
//             console.log('创建测试普通用户');
//             cb()
//         });
//     }
//   ], function(err, results){
//     console.log('初始化测试用户数据完毕');
//   });
// }