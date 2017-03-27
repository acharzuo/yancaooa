// 'use strict';

var area = require('./model');
var message = require('../../utils/returnFactory');//返回状态模块
var _ = require('lodash');
var log = require('../../utils/log'); //引进日志

//添加省市-----------post-------------------------------------

/**
 * @alias /api/areas[POST]
 * @description  添加省市
 * @param {String} parentId 父节点id
 * @param {String} name 添加的省市名
 *
 * @return {Object} 省市信息
 */
exports.create = function(req, res,next) {
    //参数校验
    req.validate('name','必须含有内容').notEmpty();
    var errors = req.validationErrors();
    if (errors) {
        return next(errors[0]);
    }

    var parentId = req.body.parentId; //父类id
    var children = new area({
        createdBy : (req.user ? req.user.id : null), //创建人
        name: req.body.name,
        parentId: req.body.parentId, //保存父类id
    });
    children.save(function(err, child) {  //回调返回生成文档信息
        if (err) return message("ERROR",null,err); //如果错误，返回错误信息
        if (parentId) {//如果存在父级
            area.findById(parentId).exec(function(err,doc) {//获取父类信息
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

//删除省市--------------delete------------------------------------
//TODO 第一版  省市下面如果有子类，则不能删除，
/**
 * @alias /api/areas/:id[DELETE]
 * @description  删除省市
 * @param {String} id 省市id
 *
 * @return {Object} 删除后的状态信息
 */

exports.delete = function(req, res) {
    //参数校验
    req.validate('id','必须指定删除的id').notEmpty();
    req.validate('id','必须是合法的id').isMongoId();
    var errors = req.validationErrors();
    if (errors) {
        return next(errors[0]);
    }
    area.findById(req.params.id,function(err,doc){
        if (!doc) {
            return res.send(message("NOT_FOUND",null));
        }
        if (doc.children.length === 0) { //如果删除对象下面没有子类 可以删除
            //$in 一个键对应多个值
            if(doc.parentId){
                area.findById(doc.parentId).exec(function(err,docs){
                    for (var i = 0; i < docs.children.length; i++) {
                        if (JSON.stringify(docs.children[i]) == JSON.stringify( doc._id)) {
                            docs.children.splice(i,1);
                        }
                    }
                    docs.save(function(err,doc){
                        console.log(doc);
                        area.remove({"_id": req.params.id}, function(err,doc) {
                            if (err) {
                                return res.send(message("ERROR",null,err));
                            }
                            return res.send(message("SUCCESS",doc));
                        });
                    });
                });
            }else {
                area.remove({"_id": req.params.id}, function(err,doc) {
                    if (err) {
                        return res.send(message("ERROR",null,err));
                    }
                    return res.send(message("SUCCESS",doc));
                });
            }
        }else{//如果存在子元素，不允许删除
            return res.send(message("ERROR",null,err));
        }
    });
};

//修改省市----------------------------------------------------

/**
 * @alias /api/areas/:id[PATCH]
 * @description  修改省市
 * @param {String} id 自己的id
 * @param {String=} name 修改后的名称
 *
 * @return {Object} 修改后的省市信息
 */

exports.update = function(req, res) {
    //参数校验
    req.validate('id','必须指定删除的id').notEmpty();
    req.validate('name','必须有修改的名称').notEmpty();
    req.validate('id','必须是合法的id').isMongoId();
    var errors = req.validationErrors();
    if (errors) {
        return next(errors[0]);
    }
    area.findById(req.params.id,function(err,doc){
        if (!doc) {
            return res.send(message("NOT_FOUND",null));
        }else if (err) {
            return  res.send(message("ERROR",null,err));
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

//查询省市的列表，并返回-------------------------------
/**
 * @alias /api/areas[GET]
 * @description  查询省市
 * @param {String=} name 省市名称
 * @param {String=} fields 选择字段，逗号分隔
 * @param {String=} sort 排序选项 "field1,-field2" 表示按field1正序排序，按field2倒序排序
 *
 * @return {Object} 查询到的省市信息
 */

exports.list = function(req, res) {
    //正则匹配集合
    var data = {
        name: new RegExp(req.query.name, 'ig'), //省市类型
    };
    var query = area.find(data);//高级查询后的结果
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
        path:'children',
        populate:{
            path:'children',
            populate:{
                path:'children',
                populate:{
                    path:'children'
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
//查看某一省市下面的子类----------------------------
/**
 * @alias /api/areas/:id[GET]
 * @description  查看省市下面的子类
 * @param {String} id 要查看的省市id字符串
 *
 * @return {Object} id对应省市的详细信息
 */

 // app 查看某一省市下面的子类----------------------------
 /**
  * @alias /api/app/areas/:id[GET]
  * @description  查看省市下面的子类
  * @param {String} id 要查看的省市id字符串
  *
  * @return {Object} id对应省市的详细信息
  */
exports.detail = function(req,res){
    //参数校验
    req.validate('id','必须指定删除的id').notEmpty();
    req.validate('id','必须是合法的id').isMongoId();
    var errors = req.validationErrors();
    if (errors) {
        return next(errors[0]);
    }
    //获取id对应内容
    area.findById(req.params.id).populate({
        path:'children'
    }).exec(function(err,doc){
        if (!doc) {
            return res.send(message("NOT_FOUND",null));
        }else if(err){
            return res.send(message("ERROR",null,err));
		}
        return res.send(message("SUCCESS",doc));
	});
};
//移动省市(改变等级，再刷新)---------------------------
/**
 * @alias /api/areas/address/:id[PATCH]
 * @description  移动位置
 * @param {String} id 要查看的省市id字符串
 * @param {String} parentId 要移动到位置的父类id
 *
 * @return {Object} 移动后的信息
 */
exports.move = function(req, res) {
    //参数校验
    req.validate('id','必须指定删除的id').notEmpty();
    req.validate('id','必须是合法的id').isMongoId();
    var errors = req.validationErrors();
    if (errors) {
        return next(errors[0]);
    }

    area.findById(req.body.parentId).exec(function(err,data){//获取要移动到的父级内容
        data.children.push(req.params.id);//把子类的id存到children中
        data.save(function(err){//保存
            if (!err) {
                area.findById(req.params.id).exec(function(err,child){//获取该分类的内容
                    if (child.parentId) { //如果存在父级
                        area.findById(child.parentId).exec(function(err,docs){//获取原来父级内容
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

// app  查询省市的列表，并返回-------------------------------
/**
 * @alias /api/app/areas[GET]
 * @description  查询省市
 *
 * @return {Object} 查询到的省市信息
 */

 exports.listapp = function(req, res) {
     //正则匹配集合
     var data = {
         name: new RegExp(req.query.name, 'ig'), //省市类型
     };
     var query = area.find(data);//高级查询后的结果
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
     query.exec(function(err, doc) {
         var arr = [];
         for (var i = 0; i < doc.length; i++) {
             if (!doc[i].parentId) {
                 arr.push(doc[i]);
             }
         }
         res.send(message('SUCCESS',arr));
     });
 };
