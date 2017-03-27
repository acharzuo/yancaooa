'use strict';
// var mongoose = require("mongoose");
var Matching = require("../matching/model");
var plan = require('./model');
var message = require('../../utils/returnFactory');//返回状态模块
var _ = require('lodash');
var log = require('../../utils/log');   //引进日志

//添加诊疗方案------------------------------------------------

/**
 * @alias /api/plans[POST]
 * @description  添加诊断方案
 * @param {String} title 方案名称
 * @param {String} conclusion 经络结论
 * @param {String} disease 病症
 * @param {String} emotion 情绪
 * @param {String} character 性格
 * @param {String} treatPlan 治疗方案
 * @param {String} healthPlan 养生方案
 * @param {String} dietPlan 食疗方案
 *
 * @return {Object} 添加成功后的诊断方案信息
 */

exports.create = function(req,res){
    var body = req.body;
    var data = {
        createdBy : (req.user ? req.user.id : null), //创建人
        title : body.title,     //方案名称
        conclusion : body.conclusion,     //经络结论
        disease : body.disease,     //病症
        emotion : body.emotion,     //情绪
        character : body.character,     //性格
        treatPlan : body.treatPlan,   //治疗方案
        healthPlan : body.healthPlan,     //养生方案
        dietPlan : body.dietPlan     //食疗方案
    };
    plan.findOne({"title":req.body.title},function(err,doc){
        if (!err&&doc) {
            res.send(message("DUPLICATE_KEY",doc));
        }else if (!doc) {
            plan.create(data,function(err,doc){
                if (err) {
                    return res.send(message("ERROR",null,err));
                }
                res.send(message("SUCCESS",doc));
            });
        }
    });
};
//删除诊疗方案-------------------------------------------------

/**
 * @alias /api/plans/:id[DELETE]
 * @description  删除诊断方案
 * @param {String} id 方案id
 *
 * @return {Object} 删除成功后的状态信息
 */

exports.delete = function(req,res){
    //TODO   批量删除
    var ids = req.params.id.split(",");   //拆分字符串，得到id数组
    plan.remove({"_id":{"$in" : ids}},function(err,doc){//$in 一个键对应多个值
        if (!doc) {
            return res.send(message("NOT_FOUND",null));
        }else if (err) {
            return res.send(message("ERROR",null,err));
        }
        res.send(message("SUCCESS",doc));
    });
};

//修改诊疗方案----------------------------------------------------

/**
 * @alias /api/plans/:id[PATCH]
 * @description  添加诊断方案
 * @param {String} id 诊断方案id
 * @param {String=} title 方案名称
 * @param {String=} conclusion 经络结论
 * @param {String=} disease 病症
 * @param {String=} emotion 情绪
 * @param {String=} character 性格
 * @param {String=} treatPlan 治疗方案
 * @param {String=} healthPlan 养生方案
 * @param {String=} dietPlan 食疗方案
 *
 * @return {Object} 修改成功后的诊疗方案信息
 */

exports.update = function(req,res){
    plan.findById(req.params.id,function(err,doc){
        if (!doc) {
            return res.send(message("NOT_FOUND",null));
        }
        var updateData = req.body;
        var data = _.merge(doc,updateData);  //将传入的参数合并到原来的数据上
        data.updatedBy = (req.user ? req.user.id : null); //修改人
        // 写入数据库
        plan.update({"_id":req.params.id},data,function(err){
            if (!err) {
                plan.findById(req.params.id,function(err,doc){
                    res.send(message("SUCCESS",doc));
                    Matching.findOneAndUpdate({"plan":req.params.id},{"planName":doc.title},function(err){
                        if(!err){
                            Matching.findOne({"plan":req.params.id},function(err,ddd){
                                console.log("修改后对应的matching:",message("SUCCESS",ddd));
                            });
                        }
                    });
                });
    		}else{
                return res.send(message("ERROR",null,err));
            }
        });
    });
};

//查找，匹配合适的诊疗方案，并返回-------------------------------

/**
 * @alias /api/plans[GET]
 * @description  添加诊断方案
 * @param {String=} id 方案id
 * @param {String=} title 方案名称
 * @param {String=} conclusion 经络结论
 * @param {String=} disease 病症
 * @param {String=} emotion 情绪
 * @param {String=} character 性格
 * @param {String=} treatPlan 治疗方案
 * @param {String=} healthPlan 养生方案
 * @param {String=} dietPlan 食疗方案
 * @param {Number=} page 第几页（get）
 * @param {Number=} count 每页显示数量（get）
 * @param {String=} fields 选择字段，逗号分隔
 * @param {String=} sort 排序选项 "field1,-field2" 表示按field1正序排序，按field2倒序排序
 *
 * @return {Object} 匹配到的方案列表
 */

exports.list = function(req,res){
    var query;
    if (req.query.id) {//匹配方案名
        query = plan.find({"_id":req.query.id});
    }else{
        query = plan.find({});//所有内容
    }
    if (req.query.title) {//匹配方案名称
        query = query.where("title",new RegExp(req.query.title,'ig'));
    }
    if (req.query.conclusion) {//匹配结论
        query = query.where("conclusion",new RegExp(req.query.conclusion,'ig'));
    }
    if (req.query.disease) {//匹配病症
        query = query.where("disease",new RegExp(req.query.disease,'ig'));
    }
    if (req.query.emotion) {//匹配情绪
        query = query.where("emotion",new RegExp(req.query.emotion,'ig'));
    }
    if (req.query.character) {//匹配性格
        query = query.where("character",new RegExp(req.query.character,'ig'));
    }
    if (req.query.treatPlan) {//匹配治疗方案
        query = query.where("treatPlan",new RegExp(req.query.treatPlan,'ig'));
    }
    if (req.query.healthPlan) {//匹配养生方案
        query = query.where("healthPlan",new RegExp(req.query.healthPlan,'ig'));
    }
    if (req.query.dietPlan) {//匹配食疗方案
        query = query.where("dietPlan",new RegExp(req.query.dietPlan,'ig'));
    }
    if(req.query.easyQuery){ //简单查询
        query = query.or([
            {'title': new RegExp(req.query.easyQuery, 'ig')},
            {'conclusion': new RegExp(req.query.easyQuery, 'ig')},
            {'disease': new RegExp(req.query.easyQuery, 'ig')},
            {'emotion': new RegExp(req.query.easyQuery, 'ig')},
            {'character': new RegExp(req.query.easyQuery, 'ig')},
            {'treatPlan': new RegExp(req.query.easyQuery, 'ig')},
            {'healthPlan': new RegExp(req.query.easyQuery, 'ig')},
            {'dietPlan': new RegExp(req.query.easyQuery, 'ig')}
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

    //分页
    query.paginate(req.query.page, req.query.count, function(err, docs, total) {
        if (!err) {
            res.send(message('SUCCESS', {docs: docs,total: total}));
        } else {
            return res.send(message('ERROR', null, err));
        }
    });
};


//查看某一诊断方案=-----------点击编辑即是查看-----------------------------------

/**
 * @alias /api/plans/:id[GET]
 * @description  添加诊断方案
 * @param {String} planId 方案id
 *
 * @return {Object} 匹配到的方案信息
 */

exports.detail = function(req,res){
    plan.findById(req.params.id,function(err,doc){
        if (!doc) {
            return res.send(message("NOT_FOUND",null));
        }else if(err){
            return res.send(message("ERROR",null,err));
		}
        res.send(message("SUCCESS",doc));
	});
};
