"use strict";

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var BaseSchema = require('../../framework/model/baseSchema');

var AreaSchema = new BaseSchema({
    name: String, //省市名称
    parentId: String, //父类id
    areaCode: String, //区号
    children: [{
        type: Schema.Types.ObjectId,
        ref: "Area"
    }],

});

module.exports = mongoose.model('Area', AreaSchema,'area');
