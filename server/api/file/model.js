"use strict";

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var BaseSchema = require('../../framework/model/baseSchema');
var setting = require("../../config/setting");
var async = require('async');
var fs = require('fs');
var path = require("path");


var FileSchema = new BaseSchema({
    fieldname:String, //form表单name属性值
    originalname:String,//上传文件的名称
    encoding:String,//编码格式
    mimetype: String, //文件类型
    destination:String,//文件上传到的文件夹地址
    filename:String,//文件保存到数据库中后的名称
    path:String,//文件上传的路径
    size:Number, //文件大小

    // title: String, //文件夹/文件名
    // parentId:String,//父节点
    // children: [{
    //     type: Schema.Types.ObjectId,
    //     ref: "file"
    // }]

});
var File = module.exports = mongoose.model('File', FileSchema);


function mkdir(dirpath, dirname) {
    // console.log(dirname);
    //判断是否是第一次调用
    if (typeof dirname === "undefined") { //如果第二个参数不存在
        if (fs.existsSync(dirpath)) { //判断要新建的文件夹是否存在
            return console.log('此文件夹已经存在');
        } else { //如果不存在，递归，给dirname赋值，执行else
            mkdir(dirpath, path.dirname(dirpath));
        }
    } else {
        //判断第二个参数是否正常，避免调用时传入错误参数
        if (dirname !== path.dirname(dirpath)) {
            return mkdir(dirpath);
        }
        if (fs.existsSync(dirname)) { //如果dirname 存在，创建文件夹
            fs.mkdirSync(dirpath);
        } else { //如果不存在。递归，给dirname赋值，再次执行
            mkdir(dirpath, path.dirname(dirpath));
            fs.mkdirSync(dirpath);
        }
    }
}
// 初始化uploads avator文件夹
async.waterfall([
    function(callback){

        mkdir(path.join('./public/uploads')); //创建uploads
        console.log("uploads创建成功！");
    }
],function(err,result){
    console.log(result);
});
//初始化 avator 文件夹
async.waterfall([
    function(callback){

        mkdir(path.join('./public/avator')); //创建uploads
        console.log("avator创建成功！");
    }
],function(err,result){
    console.log(result);
});
