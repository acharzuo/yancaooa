var express = require('express');
var route = express.Router();
var index = require('./index');

route.get("/",index.get);
route.get("/api/getdemo",index.getDemo); //Step 1: 定义接口路由，格式/api/XXXX 对应的方法名驼峰式命名
route.post("/api/setdemo",index.setDemo);

module.exports = route;
