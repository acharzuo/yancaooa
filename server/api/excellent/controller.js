var log = require(global.ROOT_PATH + "/utils/log"); // 获取日志
var Action = require('../../utils/db.js');
var returnFactory = require('../../utils/returnFactory');
var DiagnosticRecord = require('../diagnosticRecord/model')
var Excellent = require('./model').excellentCase;
var ExcellentAction = new Action(Excellent);
var tool = require('../../utils/tools');


//增加优秀案例
/**
 * @alias /api/excellent[POST]
 * @description  增加优秀案例
 * @param {String} userId 案例人id
 * @param {String} caseName 案例标题
 * @param {String} label 标签
 * @param {String} content 内容
 * @param {String} imgSrc 封面图
 * @return {Object} 错误信息
 */
exports.create = function(req,res){
    var body = req.body;
    var data = {
        userId : body.userId,
        caseName : body.caseName,
        label : body.label,
        content : body.content,
        imgSrc:req.body.imgSrc,
        createdBy:req.user?req.user.id:null//创建人
    }
    ExcellentAction.create(data,function(err,docs){
        if(!err){
            res.json(returnFactory('SUCCESS',docs));
        }else{
            res.json(returnFactory('ERROR',null,err));
        }
    })
}
//获取所有优秀案例
/**
 * @alias /api/excellent[GET]
 * @description  获取优秀案例
 * @param {String} caseName 案例标题
 * @param {String} label 标签
 * @return {Object} 错误信息
 */
exports.list = function(req,res){
    var query = Excellent.find({});
    if(req.query.easyQuery){   
        query = query.or([
        {'caseName': new RegExp(req.query.easyQuery, 'i')},
        {'label':new RegExp(req.query.easyQuery, 'i')},
        ]);
    }
    if(req.query.caseName){
        query = query.where('caseName',new RegExp(req.query.caseName,'i'))
    }
    if(req.query.label){
        query = query.where('label',new RegExp(req.query.label,'i'))
    }
    // 选择排序
    if(req.query.sort){
        var sort = req.query.sort.split(',').join(' ');
        query = query.sort(sort);
    }

    query = query.where({'deleted':{$lt:1}});
    query = query.sort({"updatedAt":"desc"});
    query = query.populate('DiagnosticRecord');
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
 * @alias /api/excellents/:id[GET]
 * @description  获取单个信息
 * @param {String} id 获取id
 * @return {Object} 错误信息
 */
exports.detail = function(req,res){
    var params = req.params;
    var _id = params.id;
    Excellent.findOne({_id:_id}).populate('DiagnosticRecord').exec(function(err,doc){
        if(!err){
            res.json(returnFactory('SUCCESS',doc));
            ExcellentAction.update({_id:_id},{'$inc':{preview:1}})
        }else{
            res.json(returnFactory('ERROR',null,err));
        }
    })
}

//修改优秀案例
/**
 * @alias /api/excellents/:id[PATCH]
 * @description  修改优秀案例
 * @param {String} id 案例id
 * @param {String} userId 案例人id
 * @param {String} caseName 案例标题
 * @param {String} label 标签
 * @param {String} content 内容
 * @param {String} imgSrc 封面图
 * @return {Object} 错误信息
 */
exports.update = function(req,res){
    var body = req.body;
    var _id = req.params.id;
    body.updatedAt = tool.getCurUtcTimestamp(); //最后更新日期
    body.updatedBy = req.user?req.user.id:null;  //最后更新人
    ExcellentAction.update({_id:_id},body,function(err,docs){
        if(!err){
            res.json(returnFactory('SUCCESS',docs));
        }else{
            res.json(returnFactory('ERROR',null,err));
        }
    })
}

/**
 * @alias /api/excellents/:id[DELETE]
 * @description  删除案例
 * @param {String} _id 要删除的案例id
 * @return {Object} 错误信息
 */
exports.delete = function(req,res){
    var _id = req.params.id;
    Excellent.update({_id:_id},{deleted:1},function(err,doc){
        if(!err){
            res.json(returnFactory('SUCCESS',doc));
        }else{
            res.json(returnFactory('ERROR',null,err));
        }
    })
}

/**
 * @alias /api/batch/excellents/:ids[DELETE]
 * @description  批量删除案例
 * @param {String} ids 删除案例的id，ids为数组
 * @return {Object} 错误信息
 */
exports.batchDelete = function(req, res) {
    var _id = req.params.ids.split(',')
  // 调用接口查找数据库并删除
  Excellent.update({'_id': {'$in': _id}},{deleted:1},{ "multi": true },function(err, doc){
    if(!err) {
      //返回被删除的对象
      return res.json(returnFactory('SUCCESS', doc));
    }else{
      return res.json(returnFactory('ERROR', null, err));
    }
  });
};
