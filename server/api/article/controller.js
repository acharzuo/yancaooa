'use strict';

var article = require('./model');
var category = require('../category/model');
var message = require('../../utils/returnFactory');//返回状态模块
var _ = require('lodash');
var log = require('../../utils/log');   //引进日志


//添加文章--完成----------------------------------------------
/**
 * @alias /api/articles[POST]
 * @description  添加文章
 * @param {String} title 文章标题
 * @param {String} tag tag标签
 * @param {String} image 文章封面
 * @param {String} source 文章来源
 * @param {Number} pushDate 发布时间
 * @param {String} abstract 文章摘要
 * @param {String} category 文章分类
 * @param {String} content 文章内容
 * @param {String} author 文章作者
 *
 * @return {Object} 文章信息

 */
exports.create = function(req,res,next){
    //参数校验
    req.validate('title','必须存在文章标题').notEmpty();
    var errors = req.validationErrors();
    if (errors) {
        return next(errors[0]);
    }

    var body = req.body;
    var data = {
        createdBy : (req.user ? req.user.id : null), //创建人
        title: body.title,  //文章标题
        tag: body.tag,      //tag标签
        image:  body.image,     //文章封面
        source: body.source,    //文章来源
        author: body.author,    //作者
        pushDate: body.pushDate,    //创建时间
        abstract: body.abstract,    //文章摘要
        category: body.category,        //文章分类
        content:  body.content, //文章内容
    };
    //创建文章数据
    article.create(data,function(err,doc){
        if (err) {
            return res.send(message("ERROR",null,err));
        }
        //把文章id保存到分类中
        category.findById(req.body.category).exec(function(err,cates){
            cates.article.push(doc._id);
            cates.save(function(err,docs){
                if(err){
                    return res.send(message("ERROR",null,err));
                }else if(!docs){
                     return res.send(message("NOT_FOUND",null));
                }
                res.send(message("SUCCESS",doc));
            });
        });
    });
};

//删除文章---------------------------------------------------

/**
 * @alias /api/articles/:id[DELETE]
 * @description  删除文章
 * @param {String} id 文章id
 *
 * @return {Object} 删除文章的状态信息
 */
exports.delete = function(req,res){
    article.findByIdAndRemove({"_id":req.params.id},function(err,doc){
        if (!doc) {//判断错误
            return res.send(message("NOT_FOUND",null));
        }else if (err) {
            return res.send(message("ERROR",null,err));
        }
        category.findById(doc.category).exec(function(err,docs){
            for (var i = 0; i < docs.article.length; i++) {//删除category保存的id
                if (JSON.stringify(docs.article[i]) == JSON.stringify( req.params.id)) {
                    docs.article.splice(i,1);
                }
            }
            docs.save(function(err,doc){
                console.log('删除完后的category',doc);
            });
        });
        res.send(message("SUCCESS",doc));
    });
};

//修改文章 ---------------------------------

/**
 * @alias /api/articles/:id[PATCH]
 * @description  修改文章
 * @param {String} id 文章id
 * @param {String=} title 文章标题
 * @param {String=} tag tag标签
 * @param {String=} image 文章封面
 * @param {String=} source 文章来源
 * @param {Number=} pushDate 发布时间
 * @param {String=} abstract 文章摘要
 * @param {String=} category 文章分类
 * @param {String=} content 文章内容
 * @param {String} author 文章作者
 *
 * @return {Object} 文章修改后的信息

 */
exports.update = function(req,res){
    article.findById(req.params.id,function(err,doc){
        if (!doc) {
            return res.send(message("NOT_FOUND",null));
        }else if (err) {
            return res.send(message("ERROR",err));
        }
        //先删除原来的分类
        if (doc.category) {
            category.findById(doc.category).exec(function(err,docs){
                for (var i = 0; i < docs.article.length; i++) {//删除category保存的id
                    if (JSON.stringify(docs.article[i]) == JSON.stringify( req.params.id)) {
                        docs.article.splice(i,1);
                    }
                }
                docs.save(function(err,doc){
                    console.log('删除完后的category',doc);
                });
            });
        }
        //把文章id保存到新的分类中
        category.findById(req.body.category).exec(function(err,cates){
            cates.article.push(doc._id);
            cates.save(function(err,doc){
                // res.send(message("SUCCESS",doc));
                console.log('修改后的category',doc);
            });
        });
        var updateData = req.body;
        var data = _.merge(doc,updateData);  //将传入的参数合并到原来的数据上
        data.updatedBy = (req.user ? req.user.id : null); //修改人
        // 写入数据库
        data.save(function(err){
            if (!err) {
    			article.findById(req.params.id,function(err,doc){
    				if (!err&&doc) {
    					res.send(message("SUCCESS",doc));
    				}else{
    					return res.send(message("ERROR",null,err));
    				}
    			});
    		}else{
                return res.send(message("ERROR",null,err));
            }
        });
    });
};

//查询，返回文章列表--------完成----------------------------------

/**
 * @alias /api/articles[GET]
 * @description  查询文章
 * @param {String=} title 文章标题
 * @param {String=} category 文章分类
 * @param {Number=} page 第几页（get）
 * @param {Number=} count 每页显示数量（get）
 * @param {String=} fields 选择字段，逗号分隔
 * @param {String=} sort 排序选项 "field1,-field2" 表示按field1正序排序，按field2倒序排序
 *
 * @return {Object} 查询到的文章信息
 */

 //pc  端查看所以文章列表  =----------------------
 /**
  * @alias /api/pc/articles[GET]
  * @description  查询文章
  * @param {Number=} page 第几页（get）
  * @param {Number=} count 每页显示数量（get）
  * @param {String=} fields 选择字段，逗号分隔
  * @param {String=} sort 排序选项 "field1,-field2" 表示按field1正序排序，按field2倒序排序
  *
  * @return {Object} 查询到的文章信息

  */

exports.list = function(req,res){

    var query;
    if (req.query.category) {//匹配标签
        query = article.find({"category":req.query.category});
    }else{
        query = article.find({});//所有内容
    }
    if (req.query.title) {//匹配文章标题
        query = query.where("title",new RegExp(req.query.title,'ig'));
    }

    if(req.query.easyQuery){//简单查询
        query = query.or([
            {'title': new RegExp(req.query.easyQuery, 'ig')},
            {'source': new RegExp(req.query.easyQuery, 'ig')},
            {'abstract': new RegExp(req.query.easyQuery, 'ig')},
            {'content': new RegExp(req.query.easyQuery, 'ig')},
            {'author': new RegExp(req.query.easyQuery, 'ig')},
            {'tag': new RegExp(req.query.easyQuery, 'ig')}
        ]);
    }

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
    query.populate({
        path:'category'
    }).paginate(req.query.page, req.query.count, function(err, doc, total) {
        if (!err) {
            res.send(message('SUCCESS', {data: doc,total: total}));
        } else {
            return res.send(message('ERROR', null, err));
        }
    });
};

//查看某一文章----完成------------------------------------------

/**
 * @alias /api/articles/:id[GET]
 * @description  添加文章
 * @param {String} id 文章id
 *
 * @return {Object} 查询到的文章信息
 */

exports.detail = function(req,res,next){
    req.validate('id', '必须制定删除的id').notEmpty();
    req.validate('id', '必须是合法的id').isMongoId();
    var errors = req.validationErrors();
    if(errors){
        return next(errors[0]);
    }

    var query = article.findById(req.params.id);
    // query.exec(function())
    query.populate({
        path: "category"
    }).exec(function(err,doc){
        if(!doc){
            return res.send(message("NOT_FOUND",null));
        }else if (err) {
            return res.send(message("ERROR",null,err));
        }
        res.send(message("SUCCESS",doc));

    });
};
//批量删除--------------------------------------
/**
 * @alias /api/batch/articles/:ids[DELETE]
 * @description  批量删除文章
 * @param {String} ids 要删除的多个id字符串
 *
 * @return {Object} 删除后返回的状态

 */
exports.batchDelete = function(req, res) {
    var ids = req.params.ids.split(","); //拆分字符串，得到id数组
    article.remove({"_id":{"$in" : ids}},function(err,doc){//$in 一个键对应多个值
        if (!doc) {
            return res.send(message("NOT_FOUND",null));
        }else if (err) {
            return res.send(message("ERROR",null,err));
        }
        category.findById(doc.category).exec(function(err,docs){
            for (var i = 0; i < docs.article.length; i++) {//删除category保存的id
                if (JSON.stringify(docs.article[i]) == JSON.stringify( req.params.id)) {
                    docs.article.splice(i,1);
                }
            }
            docs.save(function(err,doc){
                console.log('删除完后的category',doc);
            });
        });
        res.send(message("SUCCESS",doc));
    });
};
//推荐文章--------------------------------------------------------------
/**
 * @alias /api/articles/highlight/:ids[PATCH]
 * @description  批量推荐文章
 * @param {String} ids 要推荐的多个id字符串
 * @param {String} highlight 0为不推荐，1为推荐

 * @return {Object} 返回的状态

 */
exports.highlight = function(req,res){
    var ids = req.params.ids.split(","); //拆分字符串，得到id数组
    article.update({"_id":{"$in" : ids}},{ "multi": true },{"highlight":req.body.highlight},function(err,doc){
        if (!doc) {
            return res.send(message("NOT_FOUND",null));
        }else if (err) {
            return res.send(message("ERROR",null,err));
        }
        res.send(message("SUCCESS",doc));
    });
};



//置顶文章--------------------------------------------------------------
/**
 * @alias /api/articles/top/:ids[PATCH]
 * @description  批量置顶文章
 * @param {String} ids 要置顶的多个id字符串
 * @param {String} top 0为不推荐，1为推荐
 *
 * @return {Object} 返回的状态

 */
exports.top = function(req,res){
    var ids = req.params.ids.split(","); //拆分字符串，得到id数组
    article.update({"_id":{"$in" : ids}},{ "multi": true },{"top":req.body.top},function(err,doc){
        if (!doc) {
            return res.send(message("NOT_FOUND",null));
        }else if (err) {
            return res.send(message("ERROR",null,err));
        }
        res.send(message("SUCCESS",doc));
    });
};

// pc端 查看某一文章----------------------------------------
/**
 * @alias /api/pc/articles/:id[PATCH]
 * @description  添加文章
 * @param {String} id 文章id
 *
 * @return {Object} 查询到的文章信息
 */
exports.detailpc = function(req,res,next){
    req.validate('id', '必须制定删除的id').notEmpty();
    req.validate('id', '必须是合法的id').isMongoId();
    var errors = req.validationErrors();
    if(errors){
        return next(errors[0]);
    }
    article.update({"_id":req.params.id},{"$inc":{"clicks" : 1}},function(err,docs){
        var query = article.findById(req.params.id);
        query.populate({
            path: "category"
        }).exec(function(err,doc){
            if(!doc){
                return res.send(message("NOT_FOUND",null));
            }else if (err) {
                res.send(message("ERROR",null,err));
                return false;
            }else{
            res.send(message("SUCCESS",doc));
            }
        });
    });
};
