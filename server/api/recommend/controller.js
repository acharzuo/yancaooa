var log = require(global.ROOT_PATH + "/utils/log"); // 获取日志
var returnFactory = require('../../utils/returnFactory');
var message = require('../../utils/statusMessage');
var Recommend = require('./model').Recommend;
var User = require('../user/model').User;
var tool = require('../../utils/tools');
var aync = require('async');
var _ = require('lodash');
var mongoose = require('mongoose');


//创建推荐记录
/**
 * @alias /api/app/recommends[POST]
 * @description  创建推荐记录
 * @param {String} url 推荐人的独有url，格式为url/用户id，例如：xxx.html/123456
 * @return {Object} 错误信息
 */
exports.create = function(req,res){
    var url = req.body.url;//推荐人的url；
    var UserId = req.body.userId;//获取推荐人id
    var data = {
        userId:UserId,
        url:url
    };
    Recommend.findOne({userId:UserId},function(err,doc){
        if(doc){
            doc.recommendNum=doc.recommendNum+1;
            doc.updatedAt = tool.getCurUtcTimestamp(); //最后更新日期
            doc.updatedBy = req.user?req.user.id:null;  //最后更新人
            doc.save(function(err,doc){
                res.json(returnFactory('SUCCESS',doc));
            });
        }else{
            Recommend.create(data,function(err,doc){
                if(!err){
                    res.json(returnFactory('SUCCESS',doc));
                }else{
                    res.json(returnFactory('ERROR',null,err));
                }
            })
        }
    })
}

//搜索推荐记录
/**
 * @alias /api/recommends[GET]
 * @description  创建推荐记录
 * @param {String} url 推荐人的独有url，格式为url/用户id，例如：xxx.html/123456
 * @param {String} easyQuery 简易搜索内容，这里目前搜索范围为用户名字
 * @param {Object} userId 用户id
 * @param {Number} RecommendNum 推荐次数
 * @param {Number} readNum 阅读次数 
 * @return {Object} 错误信息
 */
exports.list = function(req,res){
    var userId = [];
    var query = Recommend.find({});
        aync.waterfall([
            function(cb){
                if(req.query.easyQuery){
                    User.find({name:new RegExp(req.query.easyQuery)}).select("_id").exec(function(err, doc){
                    if(!err && doc && doc.length > 0){
                        userId = doc
                        cb(null, userId);   
                    }else{
                        cb(null, []);
                    }
                })
                }else if(req.query.userId){
                    User.find({name:new RegExp(req.query.userId)}).select("_id").exec(function(err, doc){
                    if(!err && doc && doc.length > 0){
                        userId = doc
                        cb(null, userId);   
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
                query = query.where('userId').in(result)
            }
            if(req.query.userId){
                query = query.where('userId').in(result)
            }
            if(req.query.recommendNum1 && req.query.recommendNum2 ){
                query.where('RecommendNum',{
                '$gte': Number(req.query.recommendNum1),
                '$lte': Number(req.query.recommendNum2)
                });
            }
            if(req.query.readNum1 && req.query.readNum2){
                query.where('ReadNum',{
                '$gte': Number(req.query.readNum1),
                '$lte': Number(req.query.readNum2)
                });
            }
            // 选择排序
            if(req.query.sort){
                var sort = req.query.sort.split(',').join(' ');
                query = query.sort(sort);
            }

            qurey = query.populate("userId", "name");

            query = query.sort({"updatedAt":"desc"});
            query.paginate(req.query.page,req.query.count,function(err, docs, total){
                if(!err){
                    res.json(returnFactory('SUCCESS', {docs:docs,total:total}));
                    console.log({docs:docs,total:total})
                }else{
                    res.json(returnFactory('ERROR', null, err));
                }
            });    //分页                                                         
        })
}

//删除记录
/**
 * @alias /api/recomomends/:id[DELETE]
 * @description  删除记录
 * @param {String} id 记录id
 * @return {Object} 错误信息
 */
exports.delete = function(req,res){
    var _id = req.params.id;
    Recommend.update({_id:_id},{deleted:1},function(err,doc){
        if(!err){
            res.json(returnFactory('SUCCESS', doc));
        }else{
            res.json(returnFactory('ERROR', null, err));
        }
    })
}

//批量删除记录
/**
 * @alias /api/batch/recomomends/:ids[DELETE]
 * @description  删除记录
 * @param {String} id 记录ids
 * @return {Object} 错误信息
 */
exports.batchDelete = function(req,res){
    var _id = req.params.ids.split(',')
    Recommend.update({'_id': {'$in': _id}},{deleted:1},{ "multi": true },function(err,doc){
        if(!err){
            res.json(returnFactory('SUCCESS', doc));
        }else{
            res.json(returnFactory('ERROR', null, err));
        }
    })
}

//增加阅读数
/**
 * @alias /api/recomomends/:id[PATCH]
 * @description  增加阅读数
 * @param {String} id 推荐用户id，从url中取
 */

exports.update = function(req,res){
    var id = req.params.id;
    Recommend.findOne({userId:id},function(err,doc){
        if(!err){
            console.log('doc+'+doc)
            doc.readNum=doc.readNum+1;
            doc.save(function(err){
                if(!err){
                    res.json(returnFactory('SUCCESS', doc));
                }else{
                    res.json(returnFactory('ERROR', null, err));
                }
            })
        }
    })
}