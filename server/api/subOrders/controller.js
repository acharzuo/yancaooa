'use strict';

var model = require('./model');
var orderModel = require('../orders/model');     // 主订单model
var message = require('../../utils/returnFactory');//返回状态模块
var _ = require('lodash');
var log = require('../../utils/log');   //引进日志
var async = require('async');
var tool = require('../../utils/tools');

var returnFactory = require('../../utils/returnFactory');


//添加文章--完成----------------------------------------------
/**
 */
exports.create = function(req,res,next){

    // 生成一个订单
    //参数校验
    console.log(req.body.data);
    var body = JSON.parse(req.body.data);

    if(body.date) {
        body.data = tool.getCurUtcTimestamp();
    }

    req.validate('data','必须有主订单ID').notEmpty();
    var errors = req.validationErrors();
    if (errors) {
        return next(errors[0]);
    }

    var order = null;
    var orderId = body.orderId;
    var subOrderModel = new model();        // 生成一个子订单的实例


    // 获取主订单信息
    async.waterfall([
        // 获取主订单信息
        function(cb){
            orderModel.findOne({_id: orderId}, function(err,doc){
                if(!err){
                    order = doc;
                    cb(null);
                } else {
                    return res.json(returnFactory('NO_MAIN_ORDER', null, err));
                }
            });
        },
        // 生成子订单
        function(cb){
            console.log("生成子订单");

            // 如果主订单的所有店铺都查询完成，就直接返回错误信息
            if(order.statistics.shopsNonVisitedCount == 0) {
                return res.json(returnFactory('主订单的所有店铺已经都分配完成，请重新建立新的主订单！', null, order._id));
            }

            subOrderModel.orderId = orderId;
            subOrderModel.date = body.date;
            subOrderModel.teams = [];           // 检测队伍
            // 随机生成四个队伍
            // 给每个队伍随机生成店铺 20个
            // 随机分队伍
            var teamNumber = 4;  // 队伍数量
            var teamList = randomEmployee(order.employee);

            // 获取授权号，方便随机获取数据
            var shopsArray = [];
            for(var key  in order.shops){
                if( typeof order.shops[key] == "object"
                    && key == order.shops[key].licenseId
                ) {
                    shopsArray.push(order.shops[key].licenseId);
                }
            }

            for(var i = 0 ; i < teamList.length; i++) {
                var index = Math.floor(i / teamNumber);
                if( i%teamNumber === 0 ) {
                    subOrderModel.teams[index] = {};
                    subOrderModel.teams[index].employee = [];
                    subOrderModel.teams[index].shops =randomShops(order, shopsArray, 20);   // 随机选择店铺
                }
                subOrderModel.teams[index].employee.push(teamList[i]);               // 随机选择执法人员
            }

            cb(null);
        },
        // 将子订单写入数据库
        function(cb){
            // 写入数据库
            subOrderModel.save(function(err, doc) {
                if (!err) {
                    subOrderModel = doc;
                    cb(null);
                } else {
                    return res.json(returnFactory('ERROR', null, err));
                }
            });
        },

        // 将主订单写入数据库
        function(cb){
            // 写入数据库
            var model = new orderModel(order);
            model.save(function(err, doc) {
                if (!err) {
                    return res.json(returnFactory('SUCCESS', subOrderModel));
                } else {
                    return res.json(returnFactory('ERROR', null, err));
                }
            });
        },
        // 错误的处理
        function(cb,err){
            return res.json(returnFactory('ERROR', null, err));
        }
    ]);


};


// 随机取到指定数量的店铺
function randomShops(order, shopArray, count){
    var ret = [];
    var shops = shopArray;
    var index = 0;
    while (true) {
        // 如果已经将所有店铺都检测完成 或者 取得到足够的访问数量，则跳出
        if(order.statistics.shopsNonVisitedCount <= 0 || ret.length >= count) {
            console.log("已经轮询完所有店铺！");
            break;
        }

        // 随机取下标
        index = Math.floor(Math.random() * shops.length);
        // 如果这一家被访问过，则选择另外一家
        if(order.shops["" + shops[index]].visitCount && order.shops["" + shops[index]].visitCount > 0) {
            // 找到下一个未被访问过的店
            for(var i = 0; i < shops.length; i++){
                index = ( ++index ) % shops.length;
                // 寻找下一个未被选中的店铺
                if(order.shops["" + shops[index]].visitCount === 0){
                    break;
                }
            }
        }
        // 访问数量加一
        order.shops["" + shops[index]].visitCount ++;
        order.statistics.shopsVisitedCount ++;
        order.statistics.shopsNonVisitedCount --;

        // 加入访问列表
        ret.push(order.shops["" + shops[index]]);

    }

    return ret;
}



// 随机获取一个数组排序
function randomEmployee(data){
    var ret = [];
    var originData = [];

    // 转换为数组
    for(var key  in data){
        if( typeof data[key] == "object"
            && key == data[key].licenseId
        ) {
            originData.push(data[key].licenseId);
        }
    }
    var index = 0;
    // 随机取顺序
    while (true) {
        index = Math.floor(Math.random() * originData.length);
        ret.push(originData[index]);
        originData.splice(index,1); // 删除数据组中指定位置的元素
        if(originData.length == 0) break;
    }
    return ret;
}


 //pc  端查看所以文章列表  =----------------------
 /**
  * @alias /api/pc/articles[GET]
  * @description  查询文章
  * @param {Number=} page 第几页（get）
  * @param {Number=} count 每页显示数量（get）
  * @param {String=} fields 选择字段，逗号分隔
  * @param {String=} sort 排序选项 "field1,-field2" 表示按field1正序排序，按field2倒序排序
  * @return {Object} 查询到的文章信息
  */

exports.list = function(req,res){

    var query;
    //if (req.query.category) {//匹配标签
    //    query = article.find({"category":req.query.category});
    //}else{
        query = model.find({});//所有内容
    //}
    //if (req.query.title) {//匹配文章标题
    //    query = query.where("title",new RegExp(req.query.title,'ig'));
    //}
    //
    //if(req.query.easyQuery){//简单查询
    //    query = query.or([
    //        {'title': new RegExp(req.query.easyQuery, 'ig')},
    //        {'source': new RegExp(req.query.easyQuery, 'ig')},
    //        {'abstract': new RegExp(req.query.easyQuery, 'ig')},
    //        {'content': new RegExp(req.query.easyQuery, 'ig')},
    //        {'author': new RegExp(req.query.easyQuery, 'ig')},
    //        {'tag': new RegExp(req.query.easyQuery, 'ig')}
    //    ]);
    //}

    // 选择排序
    if(req.query.fields){
        var fields = req.query.fields.split(',').join(' ');
        query = query.select(fields);
    }

    // 选择排序
    if(req.query.sort){
        var sort = req.query.sort.split(',').join(' ');
        query = query.sort(sort);
    }
    //默认排序
    query = query.sort({"updatedAt":"desc"});
    //显示分类名称
    query.paginate(req.query.page, req.query.count, function(err, doc, total) {
        if (!err) {
            res.send(message('SUCCESS', {data: doc,total: total}));
        } else {
            return res.send(message('ERROR', null, err));
        }
    });
};

