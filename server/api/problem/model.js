'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var mongoosePaginate = require('mongoose-paginate');
var tool = require('../../utils/tools');
var BaseSchema = require('../../framework/model/baseSchema');

var proList = new BaseSchema({//问题表
    problem:String,//问题
    answer:[String],//答案
})
proList.plugin(mongoosePaginate);
var Pro = exports.Pro = mongoose.model('Problem', proList);
