var log = require(global.ROOT_PATH + "/utils/log"); // 获取日志
var Action = require('../../utils/db.js');
var returnFactory = require('../../utils/returnFactory');
var message = require('../../utils/statusMessage');
var Diag = require('./model').Diag;
var tool = require('../../utils/tools');

log.debug('已加载问诊模块')

var DiagAction = new Action(Diag);

//增加问诊单
/**
 * @alias /api/diags[POST]
 * @description  增加问诊单
 * @param {String} diagName 问诊单标题
 * @param {String} problem 问题id
 * @param {Array} serial 序号
 * @return {Object} 错误信息
 */
exports.create = function(req,res){
    var body = req.body;
    var data = {
      diagName:body.diagName,//问诊单标题
      problem:body.problem,//问题id
      problemNum:body.problemNum,//问题数量
      serial:body.serial,//序号
      createdBy:req.user?req.user.id:null//创建人
    }
    Diag.find({diagName:data.diagName},function(error,result){
        if(result.length==0||result==null){
            DiagAction.create(data,function(err,doc){
                if(!err){
                    res.json(returnFactory('SUCCESS',doc));
                }else{
                    res.json(returnFactory('ERROR',null,err));
                }
            })
        }else{
            res.json(returnFactory('ERROR',null,error));
        }
    })
    
}
//搜索
/**
 * @alias /api/diags[GET]
 * @description  搜索问诊单
 * @param {String} diagName 问诊单标题
 * @param {Number} page 第几页内容
 * @param {Number} count 每页显示数量
 * @return {Object} 错误信息
 */
exports.list = function(req,res){
    var query = Diag.find({});
    if(req.query.easyQuery){   
        query = query.where('diagName',new RegExp(req.query.easyQuery,'i'))
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
 * @alias /api/diags/:id[GET]
 * @description  获取单个信息
 * @param {String} id 获取id
 * @return {Object} 错误信息
 */
exports.detail = function(req,res){
    var params = req.params;
    var _id = params.id;
    Diag.findOne({_id:_id},function(err,doc){
        if(!err){
            res.json(returnFactory('SUCCESS',doc));
        }else{
            res.json(returnFactory('ERROR',null,err));
        }
    })
}

//修改问诊单
/**
 * @alias /api/diags/:id[PATCH]
 * @description  修改问诊单
 * @param {String} diagName 问诊单标题
 * @param {String} problem 问题标题
 * @param {Array} serial 序号
 * @return {Object} 错误信息
 */
exports.update = function(req,res){
    var _id = req.params.id;
    var body = req.body;
    body.updatedAt = tool.getCurUtcTimestamp(); //最后更新日期
    body.updatedBy = req.user?req.user.id:null;  //最后更新人
    DiagAction.update({_id:_id},body,function(err,doc){
      if(!err){
            res.json(returnFactory('SUCCESS',doc));
        }else{
            res.json(returnFactory('ERROR',null,err));
        }
    })
}
//删除问诊单
/**
 * @alias /api/deletes/:id[DELETE]
 * @description  删除问诊单
 * @param {String} id 被删除的问诊单id
 * @return {Object} 错误信息
 */
exports.delete = function(req,res){
    var _id = req.params.id;
    Diag.update({_id:_id},{deleted:1},function(err,doc){
       if(!err){
            res.json(returnFactory('SUCCESS',doc));
        }else{
            res.json(returnFactory('ERROR',null,err));
        }
    })
}

/**
 * @alias /api/batch/diags/:ids[DELETE]
 * @description  批量删除案例
 * @param {String} ids 删除案例的id，ids为数组
 * @return {Object} 错误信息
 */
exports.batchDelete = function(req, res) {
    var _id = req.params.ids.split(',')
  // 调用接口查找数据库并删除
  Diag.update({'_id': {'$in': _id}},{deleted:1},{ "multi": true },function(err, doc){
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