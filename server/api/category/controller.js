// 'use strict';

var category = require('./model');
var message = require('../../utils/returnFactory');//返回状态模块
var _ = require('lodash');
var log = require('../../utils/log'); //引进日志

//添加分类-----------post-------------------------------------

/**
 * @alias /api/categories[POST]
 * @description  添加分类
 * @param {String} parentId 父节点id
 * @param {String} name 添加的分类名
 *
 * @return {Object} 分类信息
 */
exports.create = function(req, res) {
    var parentId = req.body.parentId; //父类id
    var children = new category({
        createdBy : (req.user ? req.user.id : null), //创建人
        name: req.body.name,
        parentId: req.body.parentId, //保存父类id
    });
    children.save(function(err, child) {  //回调返回生成文档信息
        if (err) return message("ERROR",null,err); //如果错误，返回错误信息
        if (parentId) {
            category.findById(parentId).exec(function(err,doc) {
                if (!err) {
                    doc.children.push(child._id);  //把子类的id保存到父类的children数组
                    doc.save(function(err, doc) {
                        log.debug("树形结构",doc);
                        res.send(message("SUCCESS",child));
                    });
                }else {
                    return res.send(message("ERROR",null,err));
                }
            });
        }else{
            res.send(message("SUCCESS",child));
        }
    });
};

//删除分类--------------delete------------------------------------
//TODO 第一版  分类下面如果有子类，则不能删除，
/**
 * @alias /api/categories/:id[DELETE]
 * @description  删除分类
 * @param {String} id 分类id
 *
 * @return {Object} 删除后的状态信息

 */

exports.delete = function(req, res) {

    category.findById(req.params.id,function(err,doc){
        if (!doc) {
            return res.send(message("NOT_FOUND",null));
        }
        if (doc.children.length === 0 && doc.article.length === 0 ) { //如果删除对象下面没有子类,并且没有文章 可以删除
            //$in 一个键对应多个值
            if(doc.parentId){
                category.findById(doc.parentId).exec(function(err,docs){
                    for (var i = 0; i < docs.children.length; i++) {
                        if (JSON.stringify(docs.children[i]) == JSON.stringify( doc._id)) {
                            docs.children.splice(i,1);
                        }
                    }
                    docs.save(function(err,doc){
                        console.log(doc);
                        category.remove({"_id": req.params.id}, function(err,doc) {
                            if (err) {
                                return res.send(message("ERROR",null,err));
                            }
                            res.send(message("SUCCESS",doc));
                        });
                    });
                });
            }else {
                category.remove({"_id": req.params.id}, function(err,doc) {
                    if (err) {
                        return res.send(message("ERROR",null,err));
                    }
                    res.send(message("SUCCESS",doc));
                });
            }
        }else if(doc.children.length !== 0 ){
            return res.send(message("ERROR",null,'下面还有分类，不允许删除操作'));
        }else if(doc.article.length !== 0 ){
            return res.send(message('ERROR',null,'分类下存在保存的文章,不允许删除操作'));
        }else{
            res.send(message('ERROR',null,err));
        }
    });
};

//修改分类----------------------------------------------------

/**
 * @alias /api/categories/:id[PATCH]
 * @description  修改分类
 * @param {String} id 自己的id
 * @param {String=} name 修改后的名称
 *
 * @return {Object} 修改后的分类信息
 */

exports.update = function(req, res) {
    category.findById(req.params.id,function(err,doc){
        if (!doc) {
            return res.send(message("NOT_FOUND",null));
        }else if (err) {
            return res.send(message("ERROR",null,err));
        }
        var updateData = req.body;
        var data = _.merge(doc,updateData);  //将传入的参数合并到原来的数据上
        data.updatedBy = (req.user ? req.user.id : null); //修改人
        // 写入数据库
        data.save(function(err,doc){
            if (!err&&doc) {
                return res.send(message("SUCCESS",doc));
            }else{
                return res.send(message("ERROR",null,err));
            }
        });
    });
};

//查询分类的列表，并返回-------------------------------

/**
 * @alias /api/categories[GET]
 * @description  查询分类
 * @param {String=} name 分类名称
 * @param {String=} fields 选择字段，逗号分隔
 * @param {String=} sort 排序选项 "field1,-field2" 表示按field1正序排序，按field2倒序排序
 *
 * @return {Object} 查询到的分类信息
 */

exports.list = function(req, res) {
    //正则匹配集合
    var data = {
        name: new RegExp(req.query.name, 'ig'), //分类类型
    };

    var query = category.find(data);//高级查询后的结果

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
    // query = query.sort({"updatedAt":"desc"});
    query.populate({
        path: 'children',
        // Get friends of friends - populate the 'friends' array for every friend
        //无下限？
        populate: {
            path: 'children',
            populate: {
                path: 'children',
                populate: {
                    path: 'children',
                    populate: {
                        path: 'children',
                        populate: {
                            path:'children',
                            populate: {
                                path: 'children',
                                populate: {
                                    path: 'children',
                                    populate: {
                                        path: 'children',
                                        populate: {
                                            path: 'children',
                                            populate: {
                                                path: 'children',
                                                populate: {
                                                    path: 'children',
                                                    populate: {
                                                        path: 'children'
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }).exec(function(err, doc) {
        var arr = [];
        for (var i = 0; i < doc.length; i++) {
            if (!doc[i].parentId) {
                arr.push(doc[i]);
            }
        }
        res.send(message('SUCCESS',arr)); //返回树形结构
    });
};
//查看某一分类下面的子类----------------------------
/**
 * @alias /api/categories/:id[GET]
 * @description  查看分类下面的子类
 * @param {String} id 要查看的分类id字符串
 *
 * @return {Object} id对应分类的详细信息
 */

exports.detail = function(req,res){
    category.findById(req.params.id,function(err,doc){
        if (!doc) {
            return res.send(message("NOT_FOUND",null));
        }else if(err){
            return res.send(message("ERROR",null,err));
		}
        res.send(message("SUCCESS",doc));
	});
};
//移动分类(改变等级，再刷新)---------------------------
/**
 * @alias /api/categories/address/:id[PATCH]
 * @description  查看分类下面的子类
 * @param {String} id 要查看的分类id字符串
 * @param {String} parentId 要移动到位置的父类id
 *
 * @return {Object} id对应分类的详细信息
 */
exports.move = function(req, res) {
    category.findById(req.body.parentId).exec(function(err,data){//获取要移动到的父级内容
        data.children.push(req.params.id);//把子类的id存到children中
        data.save(function(err){//保存
            if (!err) {
                category.findById(req.params.id).exec(function(err,child){//获取该分类的内容
                    if (child.parentId) { //如果存在父级
                        category.findById(child.parentId).exec(function(err,docs){//获取原来父级内容
                            for (var i = 0; i < docs.children.length; i++) {//删除保存的id
                                if (JSON.stringify(docs.children[i]) == JSON.stringify( child._id)) {
                                    docs.children.splice(i,1);
                                }
                            }
                            docs.save(function(err,doc){//删除完成后保存
                                console.log(doc);
                            });
                        });
                    }
                    child.parentId = req.body.parentId;//把最新的父级id 替换原来id
                    child.save(function(err,doc){//保存后返回信息
                         res.send(message("SUCCESS",doc));
                    });
                });
            }
        });
    });
};
