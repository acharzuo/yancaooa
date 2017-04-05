// 养生资讯
"use strict";

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var BaseSchema = require('../../framework/model/baseSchema');
var tool = require('../../utils/tools');

var schema = new BaseSchema({
    name: String, // 姓名
    part: String, // 中队
    position_name: String, // 主岗
    mobile: String, // 手机号码
    telphone: String, // 办公电话
    position_department: String, // 执法岗位
    position_company: String, // 主岗单位
    sex: String, // 性别
    brithday: String, // 出生日期
    ethnic: String, // 民族
    Identify: String, // 身份证号
    licenseId: String, // 执法证号
    role: String, // 角色
    image:String, // 照片
  });
module.exports  = mongoose.model('Employee',schema);
