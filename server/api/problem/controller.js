var log = require(global.ROOT_PATH + "/utils/log"); // 获取日志
var Action = require('../../utils/db.js');
var returnFactory = require('../../utils/returnFactory');
var message = require('../../utils/statusMessage');
var Pro = require('./model').Pro;
var tool = require('../../utils/tools');

log.debug('已加载问诊模块')

var ProAction = new Action(Pro);


//增加问题
/**
 * @alias /api/problems[POST]
 * @description  增加问题
 * @param {String} problem 问题标题
 * @param {Array} answer 答案
 * @return {Object} 错误信息
 */
exports.create = function(req,res){
    var body = req.body;
    var data = {
      problem:body.problem,//问题标题
      answer:body.answer,//答案
      createdBy:req.user?req.user.id:null,//创建人
    }
    ProAction.create(data,function(err,doc){
      if(!err){
            res.json(returnFactory('SUCCESS',doc));
        }else{
            res.json(returnFactory('ERROR',null,err));
        }
    })
}

//搜索问题
/**
 * @alias /api/problems[GET]
 * @description  搜索问题
 * @param {String} easyQuery 问题标题
 * @param {Number} page 第几页内容
 * @param {Number} count 每页显示数量
 * @return {Object} 错误信息
 */
exports.list = function(req,res){
    var query = Pro.find({});
    if(req.query.easyQuery){   
        query = query.where('problem',new RegExp(req.query.easyQuery,'i'))
    }
    // if(req.query.adName){
    //     query = query.where('adName',new RegExp(req.query.adName,'i'))
    // }
    // if(req.query.shop){
    //     req.query.shop = req.query.shop.split();
    //     query = query.where('shopId').in(req.query.shop)
    // }
    // if(req.query.startTime){
    //     query = query.where({'startTime':{$gte:Number(req.query.startTime)}})
    // }
    // if(req.query.endTime){
    //     query = query.where({'endTime':{$lte:Number(req.query.endTime)}})
    // }
    // 选择排序
    if(req.query.sort){
        var sort = req.query.sort.split(',').join(' ');
        query = query.sort(sort);
    }

    query = query.where({'deleted':{$lt:1}});
    query = query.sort({"updatedAt":"desc"});
    query.paginate(req.query.page,req.query.count,function(err, docs, total){
        if(!err){
            res.json(returnFactory('SUCCESS', {docs:docs,total:total}));
        }else{
            res.json(returnFactory('ERROR', null, err));
        }
    });    //分页
}

//获取单个信息
/**
 * @alias /api/problems/:id[GET]
 * @description  获取单个信息
 * @param {String} id 获取id
 * @return {Object} 错误信息
 */
exports.detail = function(req,res){
    var params = req.params;
    var _id = params.id;
    Pro.findOne({_id:_id},function(err,doc){
        if(!err){
            res.json(returnFactory('SUCCESS',doc));
        }else{
            res.json(returnFactory('ERROR',null,err));
        }
    })
}

//修改问题
/**
 * @alias /api/problems/:id[PATCH]
 * @description  修改问题
 * @param {String} id 问题id
 * @param {String} problem 问题标题
 * @param {String} answer 问题答案
 * @return {Object} 错误信息
 */
exports.update = function(req,res){
    var _id = req.params.id;
    var body = req.body;
    body.updatedAt = tool.getCurUtcTimestamp(); //最后更新日期
    body.updatedBy = req.user?req.user.id:null;  //最后更新人
    ProAction.update({_id:_id},body,function(err,doc){
      if(!err){
            res.json(returnFactory('SUCCESS',doc));
        }else{
            res.json(returnFactory('ERROR',null,err));
        }
    })
}
//删除问题
/**
 * @alias /api/problems/:id[DELETE]
 * @description  删除问题
 * @param {String} id 问题id
 * @return {Object} 错误信息
 */
exports.delete = function(req,res){
    var _id = req.params.id;
    Pro.update({_id:_id},{deleted:1},function(err,doc){
      if(!err){
            res.json(returnFactory('SUCCESS',doc));
        }else{
            res.json(returnFactory('ERROR',null,err));
        }
    })
}
/**
 * @alias /api/batch/problems/:ids[DELETE]
 * @description  批量删除案例
 * @param {String} ids 删除案例的id，ids为数组
 * @return {Object} 错误信息
 */
exports.batchDelete = function(req, res) {
    var _id = req.params.ids.split(',')
  // 调用接口查找数据库并删除
  Pro.update({'_id': {'$in': _id}},{deleted:1},{ "multi": true },function(err, doc){
    if(!err) {
      //返回被删除的对象
      return res.json(returnFactory('SUCCESS', doc));
    }else{
      return res.json(returnFactory('ERROR', null, err));
    }
  });
};
exports.authCallback = function(req, res, next) {
  res.redirect('/');
};