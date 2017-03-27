'use strict';

var path = require('path');

var express = require('express');

// var m = require('./api/diagnosticRecord/service');
// var doc = {
//     birthday:'1488811074459',
//     createdAt: '567199560000'
// }
// console.log(m.getReportData(doc));
// console.log('111111111111111')

/*实例化express对象*/
var app = express();
//定义全局环境变量
// 在此之前，应该在开发环境的电脑上配置export NODE_ENV=product
global.ENV = app.get("env");
// 初始化测试数据
// if(ENV == 'test'){
//   require('./initTest');
// }

var ejs = require('ejs');


var setting = require('./config/setting'); // 自己定义的全局变量
console.log('file upload url:' + setting.file_url);
var log = require('./utils/log'); // 日志系统

var system = require('./utils/system'); // 系统操作库
var pagination = require('mongoose-pagination'); //分页-z

// *****************************************************
// 全局变量定义
// 在./config/setting.js中定义


// *****************************************************
// 日志系统初始化
log.debug("日志系统启动!");

//实例化redis客户端,配置token时需要用到-z
global.redisClient = require('./utils/redis').redisClient;

// ********************************************************
// Express 设置

if (global.ENV == 'production') {
    console.log('正式环境模式');
} else if (ENV == 'test') {
    console.log('测试环境模式');
} else {
    console.log('开发环境模式');
}
// global.ENV = 'production';
require('./utils/express')(app);
// var env = app.get('env');



// ********************************************************
// 加载API模块

// 扫描API目录
// var route_list = system.scanJustFolder(API_PATH);
// log.debug("目录列表", route_list);

//批量配置路由-z
require('./utils/config-route')(app);


// // 加载API目录
// for (var i = 0; i < route_list.length; i++) {
//    var routePath =  path.join(global.API_PATH, route_list[i].name, route_list[i].name + ".router");
//    var route = require(routePath);
//    var apiRoot = ['', 'api', route_list[i].name].join('/');
//    app.use(apiRoot ,route);
//    log.debug("Load API Root: " , apiRoot , " PATH:",  routePath);
// }
// app.use('/api/user', require(__dirname+'\\server\\api\\user\\route'));
// ********************************************************
// 页面模块

// 加载server目录 server目录是公开目录，没有token验证
// var app_list = ['logreg'];
// for(var i=0;i<app_list.length;i++){
//     var app_route = require('./server/'+app_list[i]+'/route');
//     app.use("/",app_route)
// }

// 仅加载一个演示页面,空白页面
app.get("/", function(req, res) {
    res.render("index.html", {});

});



// *********************************************************
// database 数据库设置

// 实例化数据库访问
global.db = require('./utils/mongodb')(setting.database);



var message = require('./utils/returnFactory');
//错误处理-z
app.use(function(err, req, res, next) {
    if (err.name === 'UnauthorizedError') {
        res.status(401).send('invalid token...');
    }
    if (err.name === 'ParamValidateError') {
        res.status(200).json(message('PARAM_ERROR', null, err));
    }
    log.error(err);
});


module.exports = app;
// app.listen(8029,function(err){
//     console.log('listen on 8029');
// });