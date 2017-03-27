/**
 *
 * @editor 最后修改人
 * Created by achar on 2016/10/19.
 */
/**
 * 阿里大鱼短信发送模块
 * Created by achar on 2016/10/17.
 */

express = require("express");
var route = express.Router();

// 定义环境常量,此参数从alidayu获取
var sign_name = sign_name || "云天元";
var appkey = appkey || "23600125";
var appsecret = appsecret || "3e4ec28c9c21becbe74db229e521153b";
var sms_template_code = sms_template_code || "SMS_41105001";

TopClient = require('./lib/alidayu/api/topClient').TopClient;

var app = express();
var env = app.get("env");

/**
 * 从网络上调用
 */
route.get('/sendsmscode', function(req, res) {
    sms.sendSMSCode(req.param("phoneNumber"), 10, function(success, message) {
        res.send(success + message).end();
    });

});

/**
 * 从网络上调用
 */
route.get('/validsmscode', function(req, res) {
    sms.validSMSCode(req.param("phoneNumber"), req.param("code"), function(success, message) {
        res.send(success + message).end();
    });
})



// 当前检验待验证的验证码列表,验证或者超期后删除
var SMSCodes = [];

/**
 * 验证短信验证码是否正确
 * @param phoneNumber  电话号码
 * @param code  验证码
 */
exports.validSMSCode = function(phoneNumber, code, callback) {

    // 验证码和对应的手机号是否在内存中存在
    if (SMSCodes["" + phoneNumber]) {

        if (code == SMSCodes["" + phoneNumber].code) {

            if (new Date().getTime() - SMSCodes["" + phoneNumber].firstTime <= SMSCodes["" + phoneNumber].long * 60 * 1000) {

                // 验证码在有效期内,是有效的验证码
                SMSCodes["" + phoneNumber] = undefined;
                if (callback) callback.call(this, true, "验证码有效!");
                return;
            } else {
                SMSCodes["" + phoneNumber] = undefined;
                if (callback) callback.call(this, false, "验证码已失效,超出有效时间!");
                return "验证码已失效,超出有效时间!";
            }
        } else {
            if (callback) callback.call(this, false, "验证码无效!");
            return "验证码无效!";
        }
    } else {
        if (callback) callback.call(this, false, "验证码无效!");
        return "验证码无效!";
    }
}


/**
 * 发送验证码到指定手机
 *  1. 发送频率为不低于1分钟,(返回发送过于频繁错误)
 *  2. 有效期内验证码不重新生成,仍然以第一次生成的验证码为准.
 *  3.
 * @param phoneNumber 有效电话号码
 * @param long  有效期时长
 * @param callback 回调函数(error, message)
 */
exports.sendSMSCode = function(phoneNumber, long, callback) {
    // 定义局部变量
    var code = ""; // 验证码
    var maxCode = 9999; // 验证码因子,最大的验证码取值. 0000~9999

    // 1. 从内存中读取发送的手机号码的验证码是否在当前发送有效期内
    //    如果在有效期内,则直接使用此验证码发送,否则不重新生成验证码
    if (SMSCodes["" + phoneNumber]) {

        // Error. 发送太频繁 60秒内发送一次
        if ((new Date().getTime() - SMSCodes["" + phoneNumber].firstTime) < 60 * 1000) {
            //     callback.call(this, false, "发送太频繁了,请稍等一会再送");
            //     return;
            code = SMSCodes["" + phoneNumber].code;
        } else {
            code = Math.random() * maxCode;
            code = (Array(("" + maxCode).length).join(0) + code).slice(-("" + maxCode).length);
        }

        // TODO 未处理只发送没有进行验证的垃圾验证短信信息

        // 在1分钟到指定的时间内,发送的验证码是第一次取得的
        //code = SMSCodes["" + phoneNumber].code;
    } else {
        // 生成四位随机数
        code = Math.random() * maxCode;
        code = (Array(("" + maxCode).length).join(0) + code).slice(-("" + maxCode).length);

    }



    //  2. 开发模式不发送短信

    if (env != "production") {
        console.log("开发环境中,不发送短信,短信内容仅显示在控制台中.");
        console.log(phoneNumber + " 的发送内容为:" + code);
        SMSCodes["" + phoneNumber] = { phoneNumber: phoneNumber, code: code, long: long, firstTime: new Date() }
            //callback.call(this, true, "发送成功! [Dev]",code);
        if (callback) callback.call(this, true, { content: "发送成功！[Dev]", code: code });
        return code;
    }


    // 3. 发送信息的准备
    // API 参考: https://api.alidayu.com/doc2/apiDetail?spm=a3142.8063005.3.1.0nSLQR&apiId=25450
    var client = new TopClient({
        'appkey': appkey,
        'appsecret': appsecret,
        'REST_URL': ' http://gw.api.taobao.com/router/rest '
    });

    // 4. 执行发送命令
    client.execute('alibaba.aliqin.fc.sms.num.send', {
        'extend': '',
        'sms_type': 'normal',
        'sms_free_sign_name': sign_name,
        'sms_param': "{code:'" + code + "'}",
        'rec_num': phoneNumber,
        'sms_template_code': 'SMS_40920139'
    }, function(error, response) {
        if (!error) {
            console.log(response);
            SMSCodes["" + phoneNumber] = { phoneNumber: phoneNumber, code: code, long: long, firstTime: new Date() }
                // callback.call(this, true, "发送成功!");
            callback.call(this, true, { content: "发送成功！[Dev]", code: code });
            return;
        } else {
            console.log(error);
            console.log(response);
            callback.call(this, false, "发送失败! Error:" + response);
            return;
        }

    });
    return code;
}
exports.sendCode = function(phoneNumber, content, callback) {
    var report = '';
    if (content) {
        report = content;
    }
    // if(env != "production") {
    //     console.log("开发环境中,不发送短信,短信内容仅显示在控制台中.");
    //     console.log( phoneNumber + " 的发送内容为:" + code);
    //     SMSCodes["" + phoneNumber] =  {phoneNumber: phoneNumber, code: code, firstTime: new Date().getTime() };
    //     //callback.call(this, true, "发送成功! [Dev]",code);
    //     if(callback) callback.call(this,true,{content:"发送成功！[Dev]",code:code});
    //     return code;
    // }


    // 3. 发送信息的准备
    // API 参考: https://api.alidayu.com/doc2/apiDetail?spm=a3142.8063005.3.1.0nSLQR&apiId=25450
    var client = new TopClient({
        'appkey': appkey,
        'appsecret': appsecret,
        'REST_URL': ' http://gw.api.taobao.com/router/rest '
    });

    // 4. 执行发送命令
    client.execute('alibaba.aliqin.fc.sms.num.send', {
        'extend': '',
        'sms_type': 'normal',
        'sms_free_sign_name': sign_name,
        'sms_param': "{report:'" + report + "'}",
        'rec_num': phoneNumber,
        'sms_template_code': 'SMS_50020230'
    }, function(error, response) {
        if (!error) {
            console.log(response);
            SMSCodes["" + phoneNumber] = { phoneNumber: phoneNumber, report: report, firstTime: new Date() }
                // callback.call(this, true, "发送成功!");
            callback.call(this, true, { content: "发送成功！[Dev]", report: report });
            return;
        } else {
            console.log(error);
            console.log(response);
            callback.call(this, false, "发送失败! Error:" + response);
            return;
        }
    });
}
exports.sendAppCode = function(phoneNumber, content, callback) {
    var report = '';
    if (content) {
        report = content;
    }
    // if(env != "production") {
    //     console.log("开发环境中,不发送短信,短信内容仅显示在控制台中.");
    //     console.log( phoneNumber + " 的发送内容为:" + code);
    //     SMSCodes["" + phoneNumber] =  {phoneNumber: phoneNumber, code: code, firstTime: new Date().getTime() };
    //     //callback.call(this, true, "发送成功! [Dev]",code);
    //     if(callback) callback.call(this,true,{content:"发送成功！[Dev]",code:code});
    //     return code;
    // }


    // 3. 发送信息的准备
    // API 参考: https://api.alidayu.com/doc2/apiDetail?spm=a3142.8063005.3.1.0nSLQR&apiId=25450
    var client = new TopClient({
        'appkey': appkey,
        'appsecret': appsecret,
        'REST_URL': ' http://gw.api.taobao.com/router/rest '
    });

    // 4. 执行发送命令
    client.execute('alibaba.aliqin.fc.sms.num.send', {
        'extend': '',
        'sms_type': 'normal',
        'sms_free_sign_name': sign_name,
        'sms_param': "{report:'" + report + "'}",
        'rec_num': phoneNumber,
        'sms_template_code': 'SMS_50140114'
    }, function(error, response) {
        if (!error) {
            console.log(response);
            SMSCodes["" + phoneNumber] = { phoneNumber: phoneNumber, report: report, firstTime: new Date() }
                // callback.call(this, true, "发送成功!");
            callback.call(this, true, { content: "发送成功！[Dev]", report: report });
            return;
        } else {
            console.log(error);
            console.log(response);
            callback.call(this, false, "发送失败! Error:" + response);
            return;
        }
    });
}