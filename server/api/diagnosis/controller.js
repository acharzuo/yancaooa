var log = require(global.ROOT_PATH + "/utils/log"); // 获取日志
var Action = require('../../utils/db.js');
var mongoose = require('mongoose');
var returnFactory = require('../../utils/returnFactory');
var message = require('../../utils/statusMessage');
var Diag = require('../diag/model').Diag;
var DiagnosticRecord = mongoose.model('DiagnosticRecord');
var DiagNosis = require('./model').DiagNosis;
var DiagNosisAction = new Action(DiagNosis);
var DiagnosticRecordAction = new Action(DiagnosticRecord);


//获取问诊单
/**
 * @alias /api/pc/diagnosiss/:id[GET]
 * @description  增加问诊单
 * @param {String} id 问诊单id
 * @return {Object} 错误信息
 */
exports.find = function(req,res){
    var _id = req.params.id;//要查询问诊单的id
    Diag.findOne({'deleted':{$lt:1}}).sort({'createdAt':'desc'}).limit(1).populated('problem').exec(function(err,doc){
        if(!err){
            res.json(returnFactory('SUCCESS',doc));
        }else{
            res.json(returnFactory('ERROR',null,err));
            return;
        }
    });
};
//增加问诊结果
/**
 * @alias /api/pc/diagnosiss[POST]
 * @description  增加问诊单
 * @param {String} diagId 问诊单id
 * @param {String} diagName 问诊单标题
 * @param {String} diagnosticRecord 诊断记录id
 * @param {Array} problemData 问诊结果
 * @return {Object} 错误信息
 */

exports.create = function(req,res){
    var data = {
        diagId:req.body.diagId,//问诊单id
        diagName:req.body.diagName,//问诊单标题
        problemData:req.body.problemData,//问诊结果
        diagnosticRecord:req.body.diagnosticRecord, //诊断数据id
    };
   // var problemData =  [{
   //      'problemId':'16546546',
   //      'problem':'感冒',
   //      'answer':['吃药','吃药','吃药','吃药'],
   //      '选中答案':[0,1,3]
   //  },{
   //      'problemId':'16546546',
   //      'problem':'感冒',
   //      'answer':['吃药','吃药','吃药','吃药'],
   //      '选中答案':[0,1,3]
   //  }]
    DiagNosis.create(data,function(err,docs){
        if(!err){
            console.log(docs);
            DiagnosticRecord.findById(req.body.diagnosticRecord).exec(function(err,data) {
                if (!err) {
                    console.log(docs._id);
                    data.diagnosis = docs._id;  //把diagnosis的id保存到父类的data
                    data.save(function(err, doc) {
                        log.debug("问诊单",doc);
                        res.json(returnFactory('SUCCESS',docs));
                    });
                }else {
                    res.json(returnFactory('ERROR',null,err));
                    return;
                }
            });
        }else{
           res.json(returnFactory('ERROR',null,err));
           return;
        }
    });
};

//获取问诊结果
/**
 * @alias /api/diagnosiss/:id[GET]
 * @description  增加问诊单
 * @param {String} id 问诊单id
 * @return {Object} 错误信息
 */
exports.detail = function(req,res){
    var _id = req.params.id;
    DiagNosis.findOne({_id:_id}).populated('diagnosticRecord').populated('diagId').populate({
        path:'diagId',
        match: { deleted: { $lt: 1 } },
        populate:{
            path:'problem',
            match: { deleted: { $lt: 1 } }
        }
    }).exec(function(err,doc){
        if(!err){
            res.json(returnFactory('SUCCESS',doc));
        }else{
            res.json(returnFactory('ERROR',null,err));
            return;
        }
    });
};
