// 养生资讯
"use strict";

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var BaseSchema = require('../../framework/model/baseSchema');
var tool = require('../../utils/tools');

var OrderSchema = new BaseSchema({

    date:   {          // 订单日期
        type: Number,
        default: tool.getCurUtcTimestamp
    },
    shopsImportant: Object,     // 重要客户
    employee: Object,       // 员工列表
    shopsCount: Number, // 订单中店铺的数量
    shopVisitedCount: Number, // 订单中已经分配的店铺的梳理
    shopsCheckedCount: Number, // 订单中已经
    shops:  Object,   // 要处理的店铺列表
    statistics: Object,  // 统计数量
                            //shopsVisitedCount: 0,   // 被检测过的店铺数量
                            //shopsCount: shops.length,   //总店铺数量
                            //visitedCount: 0,    // 检测总次数
                            //shopsNonVisitedCount: shops.length,     // 未被检测的店铺数量

});
module.exports  = mongoose.model('Order',OrderSchema);
