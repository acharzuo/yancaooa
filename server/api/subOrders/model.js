// 子订单
"use strict";

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var BaseSchema = require('../../framework/model/baseSchema');
var tool = require('../../utils/tools');

var schema = new BaseSchema({

    orderId: String,  // 主订单ID

    date:   {          // 订单日期
        type: Number,
        default: tool.getCurUtcTimestamp
    },

    teams: Array, // 队伍数量及对应的店铺数量
    shopVisitedCount: Number, // 订单中已经分配的店铺的梳理
    shopsCheckedCount: Number, // 订单中已经


});
module.exports  = mongoose.model('SubOrder',schema);
