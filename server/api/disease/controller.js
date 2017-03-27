var log = require(global.ROOT_PATH + "/utils/log"); // 获取日志
var Action = require('../../utils/db.js');
var returnFactory = require('../../utils/returnFactory');
var message = require('../../utils/statusMessage');
var Disease = require('./model');
var aync = require('async');
var _ = require('lodash');
var Acupoint = require('../acupoint/model');
var DisAction = new Action(Disease);
var tool = require('../../utils/tools');

//增加病症
/**
 * @alias /api/diseases[POST]
 * @description  增加病症
 * @param {String} disease 病症标题
 * @param {String} main_points 主穴
 * @param {Array} acu_points 配穴
 * @param {Number} pointsNum 穴数
 * @param {String} way 方式
 * @return {Object} 错误信息
 */
exports.create = function(req,res){
    var body = req.body;
    var data = {
        disease:body.disease,//病症标题
        main_points:body.main_points,//主穴
        acu_points:body.acu_points,//配穴
        pointsNum:body.pointsNum,//穴数
        way:body.way,//方式
        createdBy:req.user?req.user.id:null//创建人
    }
    Disease.create(data,function(err,doc){
        if(!err){
            res.json(returnFactory('SUCCESS',doc));
        }else{
            res.json(returnFactory('ERROR',null,err));
        }
    })
}

//病症列表
/**
 * @alias /api/diseases[GET]
 * @description  搜索病症
 * @param {String} disease 问诊单标题
 * @param {String} main_points 主穴
 * @param {Array} acu_points 配穴
 * @param {Number} page 第几页内容
 * @param {Number} count 每页显示数量
 * @return {Object} 错误信息
 */
exports.list = function(req,res){
    var query = Disease.find({});
    var acu_points = [];
    var main_points = [];
    if(req.query.acu_points){
        req.query.acu_points = req.query.acu_points.split(',');
    }
    
    if(req.query.easyQuery){   
        query = query.where('disease',new RegExp(req.query.easyQuery,'i'))
    }
    function _acu_points(_acu_point,cb){
        Acupoint.find({acupointName:{$in:_acu_point}}).select("_id").exec(function(err, doc){
                        if(!err && doc && doc.length > 0){
                            _acu_point = _.map(doc, function(v){
                                return v.id;
                            });
                            cb(null, _acu_point);   
                        }else{
                            cb(null, []);
                        }
                    })
    }
    function _main_points(_main_point,cb){
        Acupoint.find({acupointName:new RegExp(_main_point)}).select("_id").exec(function(err, doc){
                        if(!err && doc && doc.length > 0){
                            _main_point = doc;
                            cb(null, _main_point);   
                        }else{
                            cb(null, []);
                        }
                    })
    }
        aync.waterfall([
            function(cb){
                if(req.query.acu_points&&!req.query.main_points){
                    _acu_points(req.query.acu_points,function(err,_acu_point){
                        cb(null,_acu_point,null)
                    });
                }else if(req.query.main_points&&!req.query.acu_points){
                    _main_points(req.query.main_points,function(err,_main_point){
                        cb(null,null,_main_point)
                    });
                }else if(req.query.main_points&&req.query.acu_points){
                    aync.parallel([
                        function(done){
                            _acu_points(req.query.acu_points,done);
                        },function(done){
                            _main_points(req.query.main_points,done);
                        }
                    ],function(err,results){
                        console.log('xiao+'+results);
                        cb(null,results[0],results[1])
                    })
                }else{
                    cb(null, null,null);
                } 
            }
        ],function(err, acu,main){
            console.log('xiao1+'+acu);
            console.log('xiao2+'+main);
            if(req.query.disease){
                query = query.where('disease',new RegExp(req.query.disease,'i'))
            }
            if(main){
                query = query.where('main_points').in(main);
            }
            if(acu){
                query = query.where('acu_points').all(acu);
            }
            query = query.populated('main_points').populated('acu_points');
            // 选择排序
            if(req.query.sort){
                var sort = req.query.sort.split(',').join(' ');
                query = query.sort(sort);
            }

            //query = query.where({'deleted':{$lt:1}});
            query = query.sort({"updatedAt":"desc"});
            query.paginate(req.query.page,req.query.count,function(err, docs, total){
                if(!err){
                    res.json(returnFactory('SUCCESS', {docs:docs,total:total}));
                }else{
                    res.json(returnFactory('ERROR', null, err));
                }
            })  //分页
        })
}

//获取单个信息
/**
 * @alias /api/diseases/:id[GET]
 * @description  获取单个信息
 * @param {String} id 获取id
 * @return {Object} 错误信息
 */
exports.detail = function(req,res){
    var params = req.params;
    var _id = params.id;
    Disease.findById(_id).exec(function(err,doc){
        if(!err){
            res.json(returnFactory('SUCCESS',doc));
        }else{
            res.json(returnFactory('ERROR',null,err));
        }
    })
}

//获取单个信息
/**
 * @alias /api/pc/diseases/:id[GET]
 * @description  获取单个信息
 * @param {String} id 获取id
 * @return {Object} 错误信息
 */
exports.detailPc = function(req,res){
    var params = req.params;
    var _id = params.id;
    Disease.findOne({_id:_id}).populated('main_points acu_points').exec(function(err,doc){
        if(!err){
            res.json(returnFactory('SUCCESS',doc));
        }else{
            res.json(returnFactory('ERROR',null,err));
        }
    })
}

//修改病症
/**
 * @alias /api/diseases/:id[PATCH]
 * @description  修改病症
 * @param {String} disease 病症
 * @param {String} main_points 主穴
 * @param {Array} acu_points 配穴
 * @param {Number} pointsNum 穴数
 * @return {Object} 错误信息
 */
exports.update = function(req,res){
    var body = req.body;
    var _id = req.params.id;
    body.updatedAt = tool.getCurUtcTimestamp(); //最后更新日期
    body.updatedBy = req.user?req.user.id:null;  //最后更新人
    DisAction.update({_id:_id},body,function(err,doc){
        if(!err){
            res.json(returnFactory('SUCCESS',doc));
        }else{
            res.json(returnFactory('ERROR',null,err));
        }
    })
}
//删除病症
/**
 * @alias /api/diseases/:id[DELETE]
 * @description  删除病症
 * @param {String} id 被删除的病症id
 * @return {Object} 错误信息
 */
exports.delete = function(req,res){
    var _id = req.params.id//要删除的病症id
    Disease.update({_id:_id},{deleted:1},function(err,doc){
        if(!err){
            res.json(returnFactory('SUCCESS',doc));
        }else{
            res.json(returnFactory('ERROR',null,err));
        }
    })
}
/**
 * @alias /api/batch/diseases/:ids[DELETE]
 * @description  批量删除病症
 * @param {String} ids 删除病症的id，ids为数组
 * @return {Object} 错误信息
 */
exports.batchDelete = function(req, res) {
    var _id = req.params.ids.split(',')
  // 调用接口查找数据库并删除
  Disease.update({'_id': {'$in': _id}},{deleted:1},{ "multi": true },function(err, doc){
    if(!err) {
      //返回被删除的对象
      return res.json(returnFactory('SUCCESS', doc));
    }else{
      return res.json(returnFactory('ERROR', null, err));
    }
  });
};

/**
 * @alias /api/pc/diseases[GET]
 * @description  PC获取病症标题
 * @return {Object} 错误信息
 */
exports.find = function(req,res){
    Disease.find().limit(20).sort({"updatedAt":"desc"}).exec(function(err,doc){
        if(!err) {
            //返回被删除的对象
            return res.json(returnFactory('SUCCESS', doc));
        }else{
            return res.json(returnFactory('ERROR', null, err));
        }
    })
}