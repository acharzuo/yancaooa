//var apiUrl = "http://192.168.0.147:8029";
//var apiUrl = "http://192.168.1.200:8029";
// var apiUrl = "http://192.168.0.77:8029";
 var apiUrl = "http://api.yuntianyuan.net"

Date.prototype.format = function() {
    var year = this.getFullYear(); //获取年
    var month = this.getMonth() + 1; //获取月
    var date = this.getDate(); //获取日
    var hour = this.getHours();
    var minute = this.getMinutes();
    var second = this.getSeconds();
    if (month < 10) month = "0" + month;
    if (date < 10) date = "0" + date;
    if (hour < 10) hour = "0" + hour;
    if (minute < 10) minute = "0" + minute;
    if (second < 10) second = "0" + second;
    return year + "-" + month + "-" + date + " " + hour + "-" + minute + "-" + second;
};

// 时间戳转换为日期
function convertNumbToDate(number) {
    var localNumber = number - (new Date().getTimezoneOffset() * 60 * 1000);
    var now = new Date(localNumber);
    var year = now.getFullYear(); //获取年
    var month = now.getMonth() + 1; //获取月
    var date = now.getDate(); //获取日
    if (month < 10) month = "0" + month;
    if (date < 10) date = "0" + date;
    return year + "-" + month + "-" + date;
}

function generateRandomNumber(min, max, count) {
    var array = [];
    for (var i = 0; i < count; i++) {
        array[i] = parseInt(Math.random() * (max - min) + min);
    }
    return array; //随机生成一个0到range的数字数组
}

function getLocalToken() {
    var token = null;
    var sessionData = JSON.parse(sessionStorage.getItem('ytyToken'));
    console.log(sessionData);
    if (sessionData) {
        token = sessionData.token;
        createdTime = sessionData.time;
        // token过期时间3个小时 1小时到3个小时之前过期的token可以换新的token
        if ((Date.now() - createdTime) > 9900000) {
            return null;
        }
        return token;
    } else {
        return null;
    }
}

// 检测是否登陆
function checkLogin() {
    return getLocalToken() != null;
}

function ytyApiAjax(router, type, data, callback) {
    var token = getLocalToken();
    var headers = {
        "Accept": "application/json; charset=utf-8"
    };
    if (token) {
        headers["x-access-token"] = token;
        headers["device-id"] = 'DEV001'; // 写死
    }
    $.ajax({
        url: apiUrl + router,
        headers: headers,
        type: type,
        contentType: "application/json;charset=utf-8",
        crossDomain: true,
        data: JSON.stringify(data),
        success: function(data, status, xhr) {

            console.log("updated-x-access-token:" + xhr.getResponseHeader("updated-x-access-token"));
            // console.log("x-access-token:"+xhr.getResponseHeader("x-access-token"));
            // 如果更新了token
            var newToken = xhr.getResponseHeader("updated-x-access-token");
            if (newToken) {
                var sessionData = {
                    token: newToken,
                    time: Date.now() //记录保存的时间
                };
                //保存token 到 localStorage里
                sessionStorage.setItem('ytyToken', JSON.stringify(sessionData));
            }
            if (callback) {
                callback(null, data);
            }
        },
        error: function(err) {
            if (err.status == 401) {
                // 提示登陆 或者跳转到登陆界面
                console.log("没有登陆");
                callback(err, null);
                // window.location.href = "../index.html";
            }
            if (callback) {
                callback(err, null);
            }
        }
    });
}

// 从服务器获取token
function getToken(loginInfo, callback) {

    if (!loginInfo.tel || !loginInfo.password) {
        return callback(new Error('请输入用户信息'), null);
    }
    var postData = {
        tel: loginInfo.tel,
        password: loginInfo.password
    };

    ytyApiAjax("/api/pc/user_tokens", "post", postData, function(err, data) {
        if (err) {
            console.log('访问失败');
            callback(err, data);
            //这里做出错的判断
        } else {
            // 登陆信息错误
            if (data.code != 0) {
                callback(new Error('登陆失败'), data);
            } else {
                var sessionData = {
                    token: data.result,
                    time: Date.now() //记录保存的时间
                };
                sessionStorage.setItem('ytyToken', JSON.stringify(sessionData));
                sessionStorage.setItem('ytyUser', JSON.stringify(sessionData));
                callback(null, data);
            }
        }

    })
}

// 获取寒热数据
function getColdAndHeatDatas(radarDatas) {

    return generateRandomNumber(600, 900, 24);

    var data = [
        //膀胱经
        radarDatas.data['bladder'][1],
        //胆经
        radarDatas.data['gallbladder'][1],
        //胃经
        radarDatas.data['stomach'][1],
        //肾经
        radarDatas.data['kidney'][1],
        //肝经
        radarDatas.data['liver'][1],
        //脾经
        radarDatas.data['spleen'][1],
        //膀胱经
        radarDatas.data['bladder'][0],
        //胆经
        radarDatas.data['gallbladder'][0],
        //胃经
        radarDatas.data['stomach'][0],
        //肾经
        radarDatas.data['kidney'][0],
        //肝经
        radarDatas.data['liver'][0],
        //脾经
        radarDatas.data['spleen'][0],
        //小肠经
        radarDatas.data['smallIntestine'][1],
        //三焦经
        radarDatas.data['sanjiao'][1],
        //大肠经
        radarDatas.data['largeIntestine'][1],
        //心经
        radarDatas.data['heart'][1],
        //心包经
        radarDatas.data['pericardium'][1],
        //肺经
        radarDatas.data['lung'][1],
        //小肠经
        radarDatas.data['smallIntestine'][0],
        //三焦经
        radarDatas.data['sanjiao'][0],
        //大肠经
        radarDatas.data['largeIntestine'][0],
        //心经
        radarDatas.data['heart'][0],
        //心包经
        radarDatas.data['pericardium'][0],
        //肺经
        radarDatas.data['lung'][0],
    ];
    for (var i = 0; i < data.length; i++) {
        data[i] = data[i] * 100;
    }
    return data;
}

$(".logo").on('click', function(e) {
    window.location.href = 'index.html';
});
