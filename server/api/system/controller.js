var message = require('../../utils/statusMessage');
var SysBackups = require('./model');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

//系统备份
exports.sysBackups = function(req,res){
    
    
}
exports.authCallback = function(req, res, next) {
  res.redirect('/');
};