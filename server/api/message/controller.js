var log = require(global.ROOT_PATH + "/utils/log"); // 获取日志
var returnFactory = require('../../utils/returnFactory');
var sms = require('./sms');
var user = require('../user/model');
var Report = require('../report/model');
var setting = require('../../config/setting');

/**
 * @alias /api/pc/messages[POST]
 * @description  短信模块
 * @param {String} tel 手机号
 * @param {String} content 短信内容
 * @return {Object} 错误信息
 */
exports.send = function(req,res){
    var tel = req.body.tel;//手机号
    var content = req.body.content;//短信内容
    // user.find({tel:tel},function(err,doc){
    //     if(!err){
            sms.sendCode(tel, content,function(success, message){
                 res.json(returnFactory('SUCCESS',message));
            })
    //     }else{
    //              res.json(returnFactory('ERROR',null,err));
    //     }
    // })
}
/**
 * @alias /api/app/messages[POST]
 * @description  短信模块
 * @param {String} tel 手机号
 * @param {String} content 短信内容
 * @return {Object} 错误信息
 */
exports.sendApp = function(req,res){
    var tel = req.body.tel;//手机号
    var content = req.body.content;//短信内容
    // user.find({tel:tel},function(err,doc){
    //     if(!err){
            sms.sendAppCode(tel, content,function(success, message){
                 res.json(returnFactory('SUCCESS',message));
            })
    //     }else{
    //              res.json(returnFactory('ERROR',null,err));
    //     }
    // })
}


/**
 * @alias /api/pc/verification_codes[POST]
 * @description  获取验证码
 * @param {String} tel 手机号
 * @return {String} 验证码
 */
exports.sendVerificationCode = function(req,res,next){
    // 参数校验
    req.validate('tel', '必须输入手机号').notEmpty();
    var errors = req.validationErrors();
    if(errors){
      return next(errors[0]);
    }  

    var tel = req.body.tel;//手机号
    // var content = req.body.content;//短信内容
    var verification_code_timeout = setting.verification_code_timeout;
    sms.sendSMSCode(tel, verification_code_timeout,function(success, message){
        if(success){
            return res.json(returnFactory('SUCCESS',message.code));
        }else{
            return res.json(returnFactory('ERROR',message));
        }
    });
};

/**
 * @alias /api/pc/verification_codes[GET]
 * @description  校验验证码
 * @param {String} tel 手机号
 * @param {String} veryficationCode 验证码
 * @return {String} 验证码
 */
exports.checkVerificationCode = function(req, res, next){

    var message = sms.validSMSCode(req.body.tel, req.body.veryficationCode);
    if(message){
        return res.json(returnFactory('SUCCESS', '0'));
    }else{
        return res.json(returnFactory('INVALIDE_VERYFI_CODE', '1'));
    }
};


/**
 * @alias /report/:id[GET]
 * @description  短信渲染诊断报告
 * @param {String} id 诊断报告id
 * @return {Object} 错误信息
 */
exports.detail = function(req,res){
    var _id = req.params.id;
    Report.find({_id:_id},function(err,doc){
        if(!err){
            res.render('diagnose-report',{doc:doc})
        }else{
            res.json(returnFactory('ERROR',null,err));
        }
    })
}