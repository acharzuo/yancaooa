// 养生资讯
"use strict";

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var BaseSchema = require('../../framework/model/baseSchema');

var ArticleSchema = new BaseSchema({
    title: String,  //文章标题
    image: String,  //封面
    author: String,     //文章作者
    pushDate : Number, //文章发布时间
    clicks: {
        type:Number,
        default:56
    },     //点击量
    tag: [String],    //tag标签
    permission: Number,     //权限  0 仅自己可见 1开放浏览
    content: String,    //文章内容
    source:  String,     //文章来源
    abstract:  String,   //摘要
    easyQuery: String, //简单搜索内容
    highlight:{
        type:Number,//类型布尔
        default:0//默认不选中，为1
    },//推荐文章
    top:{
        type:Number,
        default:0//默认不选中，为1
    },
    category: {
        type: Schema.Types.ObjectId,
        ref: "Category"
    },   //文章分类id

});
module.exports  = mongoose.model('Article',ArticleSchema);
