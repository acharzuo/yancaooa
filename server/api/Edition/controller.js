var log = require(global.ROOT_PATH + "/utils/log"); // 获取日志
var returnFactory = require('../../utils/returnFactory');
var message = require('../../utils/statusMessage');
var Edition = require('./model').Edition;
var User = require('../user/model').User;
var tool = require('../../utils/tools');

//增加版本号
/**
 * @alias /api/editions[POST]
 * @description  增加版本号
 * @param {String} version 版本号
 * @param {String} updateContent 更新内容
 * @return {Object} 错误信息
 */
exports.create = function(req,res){
    var data = {
        version:req.body.version,
        updateContent:req.body.updateContent
    }
    Edition.create(data,function(err,doc){
        if(!err){
            res.json(returnFactory('SUCCESS',doc));
        }else{
            res.json(returnFactory('ERROR',null,err));
        }
    })
}

//搜索版本号
/**
 * @alias /api/editions[GET]
 * @description  搜索版本号
 * @param {String} version 版本号
 * @param {Number} down 下载次数
 * @param {String} updateContent 更新内容
 * @return {Object} 错误信息
 */
exports.list = function(req,res){
    var query = Edition.find({});
    if(req.query.easyQuery){   
        query = query.or([
            {'version': new RegExp(req.query.easyQuery, 'i')},
            {'updateContent': new RegExp(req.query.easyQuery, 'i')}
        ]);
    }
    if(req.query.version){
        query = query.where('version',new RegExp(req.query.version,'i'))
    }
    if(req.query.down1 && req.query.down2){
        query = query.where('down',{
            '$gte': Number(req.query.down1),
            '$lte': Number(req.query.down2)
        });
    }
    if(req.query.updateContent){
        query = query.where('updateContent',new RegExp(req.query.updateContent,'i'))
    }
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

//删除版本
/**
 * @alias /api/editions/:id[DELETE]
 * @description  删除版本
 * @param {String} id 版本id
 * @return {Object} 错误信息
 */
exports.delete = function(req,res){
    var _id = req.params.id;
    Edition.update({_id:_id},{deleted:1},function(err,doc){
        if(!err){
            res.json(returnFactory('SUCCESS', doc));
        }else{
            res.json(returnFactory('ERROR', null, err));
        }
    })
}

//批量删除记录
/**
 * @alias /api/batch/editions/:ids[DELETE]
 * @description  删除记录
 * @param {String} id 版本ids
 * @return {Object} 错误信息
 */
exports.batchDelete = function(req,res){
    var _id = req.params.ids.split(',')
    Edition.update({'_id': {'$in': _id}},{deleted:1},{ "multi": true },function(err,doc){
        if(!err){
            res.json(returnFactory('SUCCESS', doc));
        }else{
            res.json(returnFactory('ERROR', null, err));
        }
    })
}

//下载次数
/**
 * @alias /api/app/editions[PATCH]
 * @description  下载次数
 * @return {Object} 错误信息
 */
exports.down = function(req,res){
    Edition.find().sort({'createdAt':'desc'}).limit(1).exec(function(err,doc){
        if(!err){
            Edition.findOne({_id:doc[0]._id},function(error,result){
                result.down = result.down+1;
                result.save(function(err){
                if(!err){
                        res.json(returnFactory('SUCCESS', result));
                    }else{
                        res.json(returnFactory('ERROR', null, err));
                    } 
                })
            })
            
        }
    })
}