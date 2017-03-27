var express = require('express');
var route = express.Router();
var index = require('./index');

// route.post('/api/postregister',index.postRegister);
// route.post('/api/postlogin',index.postLogin);

route.post('/login', index.login);  //登陆
route.post('/logout', index.logout);  //登陆

module.exports = route;
