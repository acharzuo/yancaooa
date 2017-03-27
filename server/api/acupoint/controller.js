
'use strict';

var acupoint = require('./model'); //定义数据库存储内容属性及类型
var message = require('../../utils/returnFactory'); //返回信息
var _ = require('lodash');
var multer = require('../../utils/multerUtil'); //文件的增删改查
var log = require('../../utils/log');   //引进日志


//增加穴位-------------post-----------------------------------
/**
 * @alias /api/acupoints[POST]
 * @description  增加穴位
 * @param {String} acupointName 穴位名称
 * @param {String} phoneticize 拼音
 * @param {String} otherName 别名
 * @param {String} image 穴位图
 * @param {String} internationalCode 穴位国际编码
 * @param {String} englishName 英文名
 * @param {String} location 穴位位置
 * @param {String} anatomy 解剖
 * @param {String} indication 主治病症
 * @param {String} operation 治疗方法操作
 *
 * @return {Object} 返回数据
 */

exports.create = function(req,res){
    //参数校验
    // req.validate('id','必须指定删除的id').notEmpty();
    // req.validate('id','必须是合法的id').isMongoId();
    // var errors = req.validationErrors();
    // if (errors) {
    //     return next(errors[0]);
    // }

    //获取表单内容
    var body = req.body;
    var data = {
        createdBy : (req.user ? req.user.id : null), //创建人
        acupointName: body.acupointName,  //穴位名称
        phoneticize : body.phoneticize,  //拼音
        otherName: body.otherName,   //别名
        image: body.image,  //穴位图
        internationalCode: body.internationalCode,   //穴位国际编码
        englishName: body.englishName,    //英文名称
        location: body.location,    //穴位位置
        anatomy: body.anatomy,    //解剖
        indication: body.indication, //主治病症
        operation: body.operation,  //治疗方法操作
    };
    //将穴位信息保存到数据库中
    acupoint.create(data,function(err,doc){
        if (err) {
            return res.send(message("ERROR",null,err));
        }else if (!doc) {
            return res.send(message("NOT_FOUND",null));
        }
        return res.send(message("SUCCESS",doc));
    });
};

//删除穴位--------------delete-------------------

/**
 * @alias /api/acupoints/:id[DELETE]
 * @description  删除穴位
 * @param {String} id 要删除的id字符串
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
    acupoint.remove({"_id":req.params.id},function(err,doc){//$in 一个键对应多个值
        if (err) {
            return res.send(message("ERROR",null,err));
        }else if (!doc) {
            return res.send(message("NOT_FOUND",null));
        }
        return res.send(message("SUCCESS",doc));
    });
};

//修改穴位 ------patch----------------------------

/**
 * @alias /api/acupoints/:id[PATCH]
 * @description  修改穴位
 * @param {String} id 要修改的id字符串
 * @param {String=} acupointName 穴位名称
 * @param {String=} phoneticize 拼音
 * @param {String=} otherName 别名
 * @param {String=} image 穴位图
 * @param {String=} internationalCode 穴位国际编码
 * @param {String=} englishName 英文名
 * @param {String=} location 穴位位置
 * @param {String=} anatomy 解剖
 * @param {String=} indication 主治病症
 * @param {String=} operation 治疗方法操作
 *
 * @return {Object} 修改后的信息

 */
exports.update = function(req,res,next){
    //参数校验
    req.validate('id','必须指定删除的id').notEmpty();
    req.validate('id','必须是合法的id').isMongoId();
    var errors = req.validationErrors();
    if (errors) {
        return next(errors[0]);
    }
    acupoint.findById(req.params.id,function(err,doc){
        if (err) {
            return res.send(message("ERROR",null,err));
        }else if (!doc) {
            return res.send(message("NOT_FOUND",null));
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

//查询，返回穴位列表------get--------------------------------

/**
 * @alias /api/acupoints[GET]
 * @description  搜索穴位
 * @param {String=} acupointName  穴位中文名
 * @param {String=} internationalCode    国际编码
 * @param {String=} operation 治疗操作
 * @param {String=} indication 主治病症
 * @param {Number=} page 第几页（get）
 * @param {Number=} count 每页显示数量（get）
 * @param {String=} fields 选择字段，逗号分隔
 * @param {String=} sort 排序选项 "field1,-field2" 表示按field1正序排序，按field2倒序排序
 *
 * @return {Object} 查询到的信息
 */

//常见穴位，，pc端-----------------------------------------------------
/**
* @alias /api/pc/acupoints[GET]
* @description 常见穴位
* @param {Number=} page 第几页（传1）
* @param {Number=} count 每页显示数量
* @param {String=} fields 选择字段，逗号分隔
* @param {String=} sort 排序选项 "field1,-field2" 表示按field1正序排序，按field2倒序排序
* @return {Object} 常见穴位
*
*/
exports.list = function(req,res){

    var query = acupoint.find({});//全部结果
    if (req.query.acupointName) {//穴位名称
        query = query.where("acupointName" , new RegExp(req.query.acupointName,'ig'));
    }
    if (req.query.internationalCode) {//国际编码
        query = query.where("internationalCode", new RegExp(req.query.internationalCode, 'ig'));
    }
    if (req.query.operation) {//治疗操作
        query = query.where("operation", new RegExp(req.query.operation, 'ig'));
    }
    if (req.query.indication) {//主治病症
        query = query.where("indication", new RegExp(req.query.indication, 'ig'));
    }

    if(req.query.easyQuery){ //简单查询
        query = query.or([
            {'acupointName': new RegExp(req.query.easyQuery, 'ig')},
            {'operation': new RegExp(req.query.easyQuery, 'ig')},
            {'indication': new RegExp(req.query.easyQuery, 'ig')},
            {'internationalCode': new RegExp(req.query.easyQuery, 'ig')}
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

//查看某一穴位-------------get---------------------------------
/**
 * @alias /api/acupoints/:id[GET]
 * @description  查看穴位
 * @param {String} id 要查看的id字符串
 *
 * @return {Object} id对应穴位的详细信息
 * @example
 返回数据请看修改接口的返回信息
 */

 //查看具体某一穴位-------------------------------------------
 /**
  * @alias /api/pc/acupoints/:id[GET]
  * @description  查看穴位
  * @param {String} id 要查看的穴位id字符串
  * @return {Object} id对应穴位的详细信息
  * @example
  返回数据请看修改接口的返回信息
  */
exports.detail = function(req,res,next){
    //参数校验
    req.validate('id','必须指定删除的id').notEmpty();
    req.validate('id','必须是合法的id').isMongoId();
    var errors = req.validationErrors();
    if (errors) {
        return next(errors[0]);
    }
    acupoint.findById(req.params.id,function(err,doc){
        if (!doc) {
            return res.send(message("NOT_FOUND",null));
        }else if(err){
            return res.send(message("ERROR",null,err));
		}
        return res.send(message("SUCCESS",doc));
	});
};

//批量删除--------------------------------------
/**
 * @alias /api/batch/acupoints/:ids[DELETE]
 * @description  批量删除穴位
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
    acupoint.remove({"_id":{"$in" : ids}},function(err,doc){//$in 一个键对应多个值
        if (!doc) {
            return res.send(message("NOT_FOUND",null));
        }else if (err) {
            return res.send(message("ERROR",null,err));
        }
        return res.send(message("SUCCESS",doc));
    });
};

//pc 端显示常见穴位=----------------------------------------
/**
 * @alias /api/pc/acupoints[GET]
 * @description  PC获取病症标题
 * @return {Object} 错误信息
 */
exports.find = function(req,res){
    acupoint.find().limit(20).sort({"updatedAt":"desc"}).exec(function(err,doc){
        if(!err&&doc) {
            //返回被删除的对象
            return res.json(message('SUCCESS', doc));
        }else{
            return res.json(message('ERROR', null, err));
        }
    });
};
