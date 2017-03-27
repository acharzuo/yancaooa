var Action = require('../../utils/db')
var returnFactory = require('../../utils/returnFactory');
var message = require('../../utils/statusMessage');
var Ad = require('./model');
var Shops = require('../shop/model').Shop;
var Device = require('../device/model').Device;
var aync = require('async');
var _ = require('lodash');
var mongoose = require('mongoose');
var tool = require('../../utils/tools');

var AdAction = new Action(Ad);
//增加广告
/**
 * @alias /api/advertisements[POST]
 * @description  增加广告
 * @param {String} adName 要创建的广告名字
 * @param {String} image 广告封面图
 * @param {Number} startTime 开始时间
 * @param {Number} endTime 结束时间
 * @param {Array} shopId 广告投放店铺
 * @param {Number} playCount 播放总次数
 * @param {Number} playTime 播放总时长
 * @param {Array}  timeArray 统计周期
 * @return {Object} 错误信息
 */
exports.create = function(req,res){
    var body = req.body;
    var data = {
        adName:body.adName,  //广告名称
        image:body.image,	//广告封面图
        startTime:body.startTime,//开始时间
        endTime:body.endTime, 	//结束时间
        shopId:body.shopId,		//广告投放的店铺集合
        playCount:body.playCount,//播放总次数
        playTime:body.playTime,//播放总时长
        timeArray:body.timeArray,//统计周期
        createdBy:req.user?req.user.id:null//创建人
    };
    AdAction.create(data,function(err,doc){
        if(!err){
            res.json(returnFactory('SUCCESS',doc));
        }else{
            res.json(returnFactory('ERROR',null,err));
        }
        
    });
};

//查找所有 / 单个 /高级搜索
/**
 * @alias /api/advertisements[GET]
 * @description  搜索广告
 * @param {String} adName 广告名字
 * @param {String} shopId 店铺关键字
 * @param {String} startTime 开始时间
 * @param {String} endTime 结束时间
 * @param {Number} page 第几页内容
 * @param {Number} count 每页显示数量
 * @return {Object} 错误信息
 */
exports.list = function(req,res){
    var query = Ad.find({});
    var shop;
    var shopIds = [];
        aync.waterfall([
            function(cb){
                if(req.query.shopId){
                    Shops.find({name:new RegExp(req.query.shopId)}).select("_id").exec(function(err, doc){
                    if(!err && doc && doc.length > 0){
                        shopIds = _.map(doc, function(v){
                            return v.id;
                        });
                        cb(null, shopIds);   
                    }else{
                        cb(null, []);
                    }
                })
                }else{
                    cb(null, []);
                } 
            }
        ], function(err, result){
            if(req.query.easyQuery){   
                query = query.where('adName',new RegExp(req.query.easyQuery,'i'))
            }
            if(req.query.adName){
                query = query.where('adName',new RegExp(req.query.adName,'i'))
            }
            if(req.query.shopId){
                query = query.where('shopId').in(result);
            }
            
            if(req.query.startTime&&req.query.endTime){

                var condition = {
                    $or:[
                        // q1---f1---f2---q2  f1:发布开始  f2:发布结束、
                        // q1---f1---q2---f2
                        // f1---q1---q2---f2
                        // f1---q1---f2---q2
                        {
                            $or:[
                                {"startTime":{$lte:req.query.startTime},"endTime":{$gte:req.query.startTime}},
                                {"startTime":{$lte:req.query.endTime},"endTime":{$gte:req.query.endTime}},
                            ]
                        },
                        // q1---f1---f2---q2
                        {
                            "startTime":{$gte:req.query.startTime},
                            "endTime":{$lte:req.query.endTime}
                        }
                    ]
                };
                query = query.where(condition);
            }
            query = query.where({'deleted':{$lt:1}});
            query = query.populated('shopId');
            // 选择排序
            if(req.query.sort){
                var sort = req.query.sort.split(',').join(' ');
                query = query.sort(sort);
            }
            query = query.sort({"updatedAt":"desc"});
            query.paginate(req.query.page,req.query.count,function(err, docs, total){
                if(!err){
                    res.json(returnFactory('SUCCESS', {docs:docs,total:total}));
                }else{
                    res.json(returnFactory('ERROR', null, err));
                }
            });    //分页                                                         
        })   
    }


//获取单个信息
/**
 * @alias /api/advertisements/:id[GET]
 * @description  获取单个信息
 * @param {String} id 获取id
 * @return {Object} 错误信息
 */
exports.detail = function(req,res){
    var params = req.params;
    var _id = params.id;
    Ad.findOne({_id:_id},function(err,doc){
        if(!err){
            res.json(returnFactory('SUCCESS',doc));
        }else{
            res.json(returnFactory('ERROR',null,err));
        }
    })
}

/**
 * @alias /api/advertisements/:id[PATCH]
 * @description  更新广告
 * @param {String} 更新广告id
 * @param {String} adName 要创建的广告名字
 * @param {String} image 广告封面图
 * @param {Number} startTime 开始时间
 * @param {Number} endTime 结束时间
 * @param {Array}  shopId 广告投放店铺
 * @param {Number} playCount 播放总次数
 * @param {Number} playTime 播放总时长
 * @param {Array}  timeArray 统计周期
 * @return {Object} 错误信息
 */
exports.update = function(req,res){
    var _id = req.params.id;
    var body = req.body;
    body.updatedAt = tool.getCurUtcTimestamp(); //最后更新日期
    body.updatedBy = req.user?req.user.id:null;  //最后更新人
    AdAction.update({_id:_id},body,function(err,doc){
        if(!err){
            res.json(returnFactory('SUCCESS',doc));
        }else{
            res.json(returnFactory('ERROR',null,err));
        }
    })
}
/**
 * @alias /api/advertisements/:id[DELETE]
 * @description  删除广告
 * @param {String} _id 要删除的广告id 
 * @return {Object} 错误信息
 */
exports.delete = function(req,res){
    var _id = req.params.id;
    Ad.update({_id:_id},{deleted:1},function(err,doc){
        if(!err){
            res.json(returnFactory('SUCCESS',doc));
        }else{
            res.json(returnFactory('ERROR',null,err));
        }
    })
}

/**
 * @alias /api/pc/advertisements/:id[GET]
 * @description  经络仪拿广告
 * @param {String} _id 当前经络仪的id
 * @return {Object} 错误信息
 */
exports.find = function(req,res){
    var _id = req.query.id;
    Device.findOne({'deviceId':_id},function(err,doc){
        var devId = [],shopId = [];
        devId[0] = doc._id;
        Shops.find().where('devices').in(devId).exec(function(err1,doc1){
            shopId[0] = doc1[0]._id;
            Ad.find().where('endTime',{$gt:tool.getCurUtcTimestamp()}).where('shopId').in(shopId).exec(function(error,result){
                console.log(result)
                if(result){
                    res.json(returnFactory('SUCCESS',result));
                }
            })
        })
    })
}
exports.authCallback = function(req, res, next) {
  res.redirect('/');
};