var express = require('express');
var route = express.Router();
var index = require('./index');

route.post('/api/upload',index.upload);


module.exports = route;
