// 'use strict';
var mongoose = require('mongoose');
var matching = require('./model');
var Plan = mongoose.model("Plan");
var message = require('../../utils/returnFactory');//返回状态模块
var _ = require('lodash');
var log = require('../../utils/log');   //引进日志
var plan = require('../plan/model');
var aync = require('async');

//修改后保存----------------------------------
/**
 * @alias /api/matchings/:id[PATCH]
 * @description  匹配对应方案
 * @param {String} id 要修改的id
 * @param {String} plan 方案id(post)
 *
 * @return {Object}  方案数据

 */
exports.update = function(req,res){
    Plan.findById(req.body.plan,function(err,plans){
        var data = {
            plan:req.body.plan,
            planName:plans.title
        };
        matching.findByIdAndUpdate(req.params.id,data,function(err,docs){
            if (!err&&docs) {
                // res.send(message("SUCCESS",docs));
                matching.findById(req.params.id,function(err,doc){
                    if(!err&&doc){
                        res.send(message("SUCCESS",doc));
                    }
                });
            }else{
                return res.send(message("ERROR",null,err));
            }
        });
    });
};

//根据数据结果匹配方案-------------------------------------

/**
 * @alias /api/matchings[GET]
 * @description  获取匹配方案列表
 * @param {String=} pairedValue
 * @param {String=} pairedName
 * @param {String=} plan 方案id
 * @param {String=} planName 方案名称
 * @param {Number=} page 第几页（get）
 * @param {Number=} count 每页显示数量（get）
 * @param {String=} fields 选择字段，逗号分隔
 * @param {String=} sort 排序选项 "field1,-field2" 表示按field1正序排序，按field2倒序排序
 * @return {Object}  方案数据

 */
exports.list = function(req,res){

    var query;
    if (req.query.plan) {//匹配标签
        query = article.find({"plan":req.query.plan});
    }else{
        query = matching.find({});//所有内容
    }
    if (req.query.pairedValue) {
        query = query.where("pairedValue", new RegExp(req.query.indication, 'ig'));
    }
    if (req.query.pairedName) {
        query = query.where("pairedName", new RegExp(req.query.pairedName, 'ig'));
    }
    if (req.query.planName) {
        query = query.where("planName", new RegExp(req.query.planName, 'ig'));
    }

    if(req.query.easyQuery){ //简单查询
        query = query.or([
            {'pairedValue': new RegExp(req.query.easyQuery, 'ig')},
            {'pairedName': new RegExp(req.query.easyQuery, 'ig')},
            {'planName': new RegExp(req.query.easyQuery, 'ig')}
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
    // console.log(req.query.acupointName);
    //分页
    query.paginate(req.query.page, req.query.count, function(err, docs, total) {
        if (!err) {
            return res.send(message('SUCCESS', {docs: docs,total: total}));
        } else {
            return res.send(message('ERROR', null, err));
        }
    });
};


// exports.find = function(req,res){
//     matching.find(function(err,doc){
//         // for(var i =1;i<doc.length;i++){
//         //     plan.findOne({"conclusion":doc[i].planName},function(err1,doc1){
//         //         if(doc1){
//         //             console.log("doc1++"+doc1)
//         //             // matching.update({$set:{"plan":doc1._id}},{"multi":true},function(err2,doc2){
//         //             //     console.log("doc2+++"+doc2)
//         //             // })
//         //         }
                
//         //     })
//         // }
//         aync.each(doc,function(item,cb){
//             plan.findOne({"title":'<p>'+item.planName+'</p>'},function(err1,doc1){
//                 if(doc1){
//                     console.log("doc1++"+doc1)
//                     // matching.update({$set:{"plan":doc1._id}},{"multi":true},function(err2,doc2){
//                     //     console.log("doc2+++"+doc2)
//                     // })
//                     item.plan = doc1._id;
//                     item.save(function(){
//                         cb(null)
//                     });
//                 }
                
//             })
//         },function(err){
//             res.send('SUCCESS',message)
//         })
//         res.send('SUCCESS','成功')
//     })
// }
