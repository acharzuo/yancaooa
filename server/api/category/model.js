"use strict";

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var BaseSchema = require('../../framework/model/baseSchema');

var CategorySchema = new BaseSchema({
    name: String, //分类名称
    parentId: String, //父类id

    children: [{
        type: Schema.Types.ObjectId,
        ref: "Category"
    }],
    article: [{//关联文章
        type: Schema.Types.ObjectId,
        ref: "Article"
    }],
});

module.exports = mongoose.model('Category', CategorySchema);
