'use strict';

var meridian = require('./model');
var message = require('../../utils/returnFactory'); //返回状态模块
var _ = require('lodash');
var log = require('../../utils/log'); //引进日志
var tool = require('../../utils/tools');

//添加经络--完成----------------------------------------------

/**
 * @alias /api/meridians[POST]
 * @description  添加经络
 * @param {String} meridianName 经络中文名称
 * @param {String} phoneticize 拼音
 * @param {String} otherName 别名
 * @param {String} image 经络图
 * @param {String} internationalCode 经络国际编码
 * @param {String} englishName 英文名称
 * @param {String} indication 主治病症
 * @param {String} path 循行路线
 * @param {String} original 最初记载
 * @param {String} acupoints 经络上的穴位
 * @param {String} syndromes 病症
 * @param {String} verses 歌诀
 *
 * @return {Object} 添加成功后的经络信息

 */
exports.create = function(req, res) {
    var body = req.body;
    var data = {
        createdBy: (req.user ? req.user.id : null), //创建人
        meridianName: body.meridianName, //经络名称
        phoneticize: body.phoneticize, //拼音
        otherName: body.otherName, //别名
        image: body.image, //经络图
        internationalCode: body.internationalCode, //经络国际编码
        englishName: body.englishName, //英文名称
        indication: body.indication, //主治病症
        path: body.path, //循行路线
        original: body.original, //最初记载
        acupoints: body.acupoints, //经络上的穴位
        syndromes: body.syndromes, //病候
        verses: body.verses, //歌诀
    };
    meridian.create(data, function(err, doc) {
        if (err) {
            return res.send(message("ERROR", null, err));
        }
        res.send(message("SUCCESS", doc));
    });
};

//删除经络--完成-------------------------------------------------

/**
 * @alias /api/meridians/:id[DELETE]
 * @description  删除经络
 * @param {String} id 经络id
 *
 * @return {Object} 删除的状态信息
 */

exports.delete = function(req, res) {
    meridian.remove({ "_id": req.params.id }, function(err, doc) { //$in 一个键对应多个值
        if (!doc) {
            return res.send(message("NOT_FOUND", null));
        } else if (err) {
            return res.send(message("ERROR", null, err));
        }
        res.send(message("SUCCESS", doc));
    });
};

//修改经络 ------(注意要先查看再修改)----------------------------

/**
 * @alias /api/meridians/:id[PATCH]
 * @description  添加经络
 * @param {String} id 经络id
 * @param {String} meridianName 经络中文名称
 * @param {String} phoneticize 拼音
 * @param {String} otherName 别名
 * @param {String} image 经络图
 * @param {String} internationalCode 经络国际编码
 * @param {String} englishName 英文名称
 * @param {String} indication 主治病症
 * @param {String} path 循行路线
 * @param {String} original 最初记载
 * @param {String} acupoints 经络上的穴位
 * @param {String} syndromes 病症
 * @param {String} verses 歌诀
 *
 * @return {Object} 修改成功后的经络信息
 */

exports.update = function(req, res) {
    var data = req.body;
    data.updatedAt = tool.getCurUtcTimestamp(); //最后更新日期
    data.updatedBy = req.user ? req.user.id : null; //最后更新人
    meridian.findByIdAndUpdate(req.params.id, data, function(err, doc) {
        if (!doc) {
            return res.send(message("NOT_FOUND", null));
        } else if (err) {
            return res.send(message("ERROR", null, err));
        }
        return res.send(message("SUCCESS", doc));
    });
};

//经络列表，并返回--------------------

/**
 * @alias /api/meridians[GET]
 * @description  添加经络
 * @param {String=} meridianName 经络中文名称
 * @param {String=} internationalCode 经络国际编码
 * @param {String=} indication 主治病症
 * @param {String=} syndromes 病症
 * @param {Number=} page 第几页（get）
 * @param {Number=} count 每页显示数量（get）
 * @param {String=} fields 选择字段，逗号分隔
 * @param {String=} sort 排序选项 "field1,-field2" 表示按field1正序排序，按field2倒序排序
 *
 * @return {Object} 添加成功后的经络信息
 */

exports.list = function(req, res) {
    var query = meridian.find({}); //高级查询后的结果
    if (req.query.meridianName) { //经络名称
        query = query.where("meridianName", new RegExp(req.query.meridianName, 'ig'));
    }
    if (req.query.internationalCode) { //国际编码
        query = query.where("internationalCode", new RegExp(req.query.internationalCode, 'ig'));
    }
    if (req.query.syndromes) { //病候
        query = query.where("syndromes", new RegExp(req.query.syndromes, 'ig'));
    }
    if (req.query.indication) { //主治病症
        query = query.where("indication", new RegExp(req.query.indication, 'ig'));
    }

    if (req.query.easyQuery) { //简单查询
        query = query.or([
            { 'meridianName': new RegExp(req.query.easyQuery, 'ig') },
            { 'indication': new RegExp(req.query.easyQuery, 'ig') },
            { 'syndromes': new RegExp(req.query.easyQuery, 'ig') },
            { 'internationalCode': new RegExp(req.query.easyQuery, 'ig') }
        ]);
    }
    // 选择排序
    if (req.query.fields) {
        var fields = req.query.fields.split(',').join(' ');
        query = query.select(fields);
    }

    // 选择排序
    if (req.query.sort) {
        var sort = req.query.sort.split(',').join(' ');
        query = query.sort(sort);
    }
    //默认排序
    query = query.sort({ "updatedAt": "desc" });

    //分页
    query.paginate(req.query.page, req.query.count, function(err, docs, total) {
        if (!err) {
            res.send(message('SUCCESS', { docs: docs, total: total }));
        } else {
            return res.send(message('ERROR', null, err));
        }
    });
};

//查看某一经络----完成------------------------------------------

/**
 * @alias /api/meridians/:id[GET]
 * @description  添加经络
 * @param {String} id 经络id
 *
 * @return {Object} 要查询的经络详情
 */

exports.detail = function(req, res) {

    meridian.findById(req.params.id, function(err, doc) {
        if (!doc) {
            return res.send(message("NOT_FOUND", null));
        } else if (err) {
            return res.send(message("ERROR", null, err));
        }
        res.send(message("SUCCESS", doc));
    });
};
//批量删除--------------------------------------
/**
 * @alias /api/batch/meridians/:ids[DELETE]
 * @description  批量删除经络
 * @param {String} ids 要删除的多个id字符串
 *
 * @return {Object} 删除后返回的状态
 * @example
 返回数据请看修改接口的返回信息
 */
exports.batchDelete = function(req, res) {
    var ids = req.params.ids.split(","); //拆分字符串，得到id数组
    meridian.remove({ "_id": { "$in": ids } }, function(err, doc) { //$in 一个键对应多个值
        if (!doc) {
            return res.send(message("NOT_FOUND", null));
        } else if (err) {
            return res.send(message("ERROR", null, err));
        }
        res.send(message("SUCCESS", doc));
    });
};