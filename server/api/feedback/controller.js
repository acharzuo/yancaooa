
'use strict';

var _ = require('lodash');
var feedback = require('./model');
var message = require('../../utils/returnFactory');//返回状态模块
var log = require('../../utils/log'); //引进日志

//获取反馈信息------------------------------------------------
/**
 * @alias /api/app/feedbacks[POST]
 * @description  添加反馈信息
 * @param {String} content 反馈内容
 * @param {String} contact 联系方式
 * @param {String} name 联系方式
 *
 * @return {Object} 文件信息
 */
exports.create = function(req,res,next){
    //参数校验
    req.validate('content','必须有反馈内容').notEmpty();
    var errors = req.validationErrors();
    if (errors) {
        return next(errors[0]);
    }
    //TODO 如果内容已经存在，允许提交

    //获取信息
    var data = {
        content:req.body.content,//获取反馈信息
        contact:req.body.contact,//获取反馈联系方式
        // createdBy:req.user?req.user.id:null//获取联系人
        name:req.user?req.user.name:"未填写",//获取联系人名称
        createdBy:req.user?req.user.id:null//获取联系人 默认账户
    };
    //保存到数据库中
    feedback.create(data,function(err,doc){
        if (err) {
            res.send(message('ERROR',null,err));
        }
        res.send(message('SUCCESS',doc));
    });
};

//删除一条反馈------------------------------------------------
/**
 * @alias /api/feedbacks/:id[DELETE]
 * @description  删除反馈
 * @param {String} id 要删除的反馈id
 *
 * @return {Object} 删除信息

 */
exports.delete = function(req,res,next){
    //参数校验
    req.validate('id','必须指定删除的id').notEmpty();
    req.validate('id','必须是合法的id').isMongoId();
    var errors = req.validationErrors();
    if (errors) {
        return next(errors[0]);
    }
    feedback.findByIdAndRemove(req.params.id,function(err,doc){
        if (err) {
            return res.send(message("ERROR",null,err));
        }else if (!doc) {
            return res.send(message("NOT_FOUND",null));
        }
        return res.send(message("SUCCESS",doc));
    });
};

//查询列表--------------------------------------------------
/**
* @alias /api/feedbacks[GET]
* @description 查询列表
* @param {String=} name 用户
* @param {String=} content 内容
* @param {Number=} createdAt1 创建时间1
* @param {Number=} createdAt2 创建时间2
* @param {Number=} easyQuery 简易搜索内容
* @param {Number=} handle 状态
* @param {Number=} page 第几页（传1）
* @param {Number=} count 每页显示数量
* @param {String=} fields 选择字段，逗号分隔
* @param {String=} sort 排序选项 "field1,-field2" 表示按field1正序排序，按field2倒序排序
* @return {Object} 常见穴位
*
*/
exports.list = function(req,res){
    var query = feedback.find({});//全部结果
    if (req.query.name) {//用户
        query = query.where("name" , new RegExp(req.query.name,'ig'));
    }
    if (req.query.content) {//反馈内容
        query = query.where("content", new RegExp(req.query.content, 'ig'));
    }
    if (req.query.handle) {//处理状态
        query = query.where('handle', req.query.handle);
    }
    if (req.query.contact) {//联系方式
        query = query.where('contact', new RegExp(req.query.contact, 'ig'));
    }
    //检测日期查询
    if (req.query.createdAt1&&req.query.createdAt2) {
        query = query.where('createdAt', {
            '$gte': Number(req.query.createdAt1),
            '$lt': Number(req.query.createdAt2)
        });
    }

    if(req.query.easyQuery){ //简单查询
        query = query.or([
            {'name': new RegExp(req.query.easyQuery, 'ig')},
            {'content': new RegExp(req.query.easyQuery, 'ig')},
            {'contact': new RegExp(req.query.easyQuery, 'ig')}
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
            return res.send(message('SUCCESS', {docs: docs,total: total}));
        } else {
            return res.send(message('ERROR', null, err));
        }
    });
};


//批量删除=-----------------------------------------------
/**
 * @alias /api/batch/feedbacks/:ids[DELETE]
 * @description  批量删除反馈信息
 * @param {String} ids 要删除的多个id字符串
 *
 * @return {Object} 删除后返回的状态
 * @example
 返回数据请看修改接口的返回信息
 */
exports.batchDelete = function(req, res,next) {
    //参数校验

    req.validate('ids','必须指定删除的id').notEmpty();
    var errors = req.validationErrors();
    if (errors) {
        return next(errors[0]);
    }
    var ids = req.params.ids.split(","); //拆分字符串，得到id数组
    feedback.remove({"_id":{"$in" : ids}},function(err,doc){//$in 一个键对应多个值
        if (!doc) {
            return res.send(message("NOT_FOUND",null));
        }else if (err) {
            return res.send(message("ERROR",null,err));
        }
        return res.send(message("SUCCESS",doc));
    });
};

//处理反馈i--------------------------------------------------------
/**
 * @alias /api/feedbacks/dispose/:id[PATCH]
 * @description  处理反馈
 * @param {String} id 要处理的id
 * @param {String} handle 处理状态 默认0 未处理  1处理
 *
 * @return {Object} 删除后返回的状态
 * @example
 返回数据请看修改接口的返回信息
 */
exports.handle = function(req,res){
    feedback.findByIdAndUpdate(req.params.id,{"handle":req.body.handle},function(err,doc){
        if (err) {
            return res.send(message("ERROR",null,err));
        }
        res.send(message("SUCCESS",null));
    });
};
