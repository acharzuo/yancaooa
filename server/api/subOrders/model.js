// 子订单
"use strict";

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var BaseSchema = require('../../framework/model/baseSchema');
var tool = require('../../utils/tools');

var OrderSchema = new BaseSchema({

    orderId: string,  // 主订单ID

    date:   {          // 订单日期
        type: Number,
        default: tool.getCurUtcTimestamp
    },

    shopsCount: Number, // 订单中店铺的数量
    shopVisitedCount: Number, // 订单中已经分配的店铺的梳理
    shopsCheckedCount: Number, // 订单中已经
    shopIds:  Object,   // 要处理的店铺列表
    subOrders: Object,  // 子订单列表

});
module.exports  = mongoose.model('Order',OrderSchema);
