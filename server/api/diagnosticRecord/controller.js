'use strict';

var mongoose = require('mongoose');
var diagnosticRecord = require('./model');
var checkUserExists = require('../user/service').createCheckingUser;
var createTempUser = require('../user/service').createTempUser;

var deviceService = require('../device/service');
var user = mongoose.model('User');
var tool = require('../../utils/tools');
var message = require('../../utils/returnFactory'); //返回状态模块
var _ = require('lodash');
var log = require('../../utils/log'); //引进日志
var m = require('../data/meridians');
var merid = require('../data/serviceHandle');

var service = require('./service');

//pc   病人检测生成一条诊断数据记录---------------------------------------、

/**
 * @alias /api/pc/diagnostic-records[POST]
 * @description  创建一条病人诊断数据
 * @param {String} name 病人姓名
 * @param {Number} sex 性别 0是未定义 1是男 2是女
 * @param {Number} birthday 出生日期
 * @param {String} tel 手机号
 * @param {String=} idCardNumber 身份证
 * @param {String=} selfReported 主诉
 * @param {String=} medicalHistory 病史
 * @param {String} createdBy 技师id
 * @param {String} technician 技师名字
 * @param {String} address 单位地址
 * @param {String} chTime 当前时辰
 * @param {String} birthChTime 出生时辰
 * 
 * @return {Object} 生成的数据信息
 */
exports.create = function(req, res) {
    //TODO 根据出生日期计算年龄

    var data = {
        tel: req.body.tel, //病人联系方式
        name: req.body.name, //病人姓名
        birthday: req.body.birthday, //病人出生日期
        idCardNumber: req.body.idCardNumber, //病人身份证号
        selfReported: req.body.selfReported, //主诉
        medicalHistory: req.body.medicalHistory, //病史
        sex: req.body.sex, //病人性别
        address: req.body.address, //病人诊断地址
        chTime: req.body.chTime, //当前时辰
        birthChTime: req.body.birthChTime, //出生时辰        
        createdBy: (req.user ? req.user.id : null), //创建人
    };

    //检测用户是否存在 并创建诊断记录
    checkUserExists(req, res, function(err, user) {
        data.userId = user.id;
        diagnosticRecord.create(data, function(err, doc) {
            if (err) {
                return res.send(message("ERROR", null, err));
            }
            res.send(message("SUCCESS", doc));
            // 更新经络仪最后使用时间
            deviceService.updateDeviceLastUseDate(req);
        });
    });


};

/**
 * @alias /api/diagnostic-users[GET]
 * @description  获取所有诊断过的的用户列表
 * @return {Object} 添加成功后的用户名和电话
 */
exports.listUsers = function(req, res) {

    diagnosticRecord.aggregate([
        // your where clause: note="test2" and notetwo = "meet2"
        { "$match": {} },
        // group by key, score to get distinct
        { "$group": { _id: { tel: "$tel", name: "$name" } } },
        // Clean up the output
        { "$project": { _id: 0, tel: "$_id.tel", name: "$_id.name" } }
    ]).exec(function(err, docs) {
        if (!err) {
            res.send(message('SUCCESS', { docs: docs }));
        } else {
            return res.send(message('ERROR', null, err));
        }

    });
};

//诊疗数据列表，并返回------------------ss-----
/**
 * @alias /api/diagnostic-records[GET]
 * @description  查询诊断数据列表
 * @param {String=} tel 手机号
 * @param {String=} name 病人名
 * @param {String=} address 单位地址
 * @param {Number=} startTime 开始时间
 * @param {Number=} endTime 截止时间
 * @param {Number=} sex 性别 0未定义 1男 2女
 * @param {Number=} page 第几页
 * @param {Number=} count 每页显示数量
 * @param {String=} fields 选择字段，逗号分隔
 * @param {String=} sort 排序选项 "field1,-field2" 表示按field1正序排序，按field2倒序排序
 * @param {Number} distinct  0 去重 1 不去重 默认不去重 ；去重 按照 name 和 tel 去重
 * @return {Object} 添加成功后的经络信息
 */

exports.list = function(req, res) {

    //准备查询条件
    var query = diagnosticRecord.find({});

    //手机号
    if (req.query.tel) {
        query = query.where("tel", new RegExp(req.query.tel, 'ig'));
    }
    //病人名
    if (req.query.name) {
        query = query.where("name", new RegExp(req.query.name, 'ig'));
    }
    //单位地址
    if (req.query.address) {
        query = query.where("address", new RegExp(req.query.address, 'ig'));
    }
    //诊断时间段查询
    if (req.query.startTime && req.query.endTime) {
        query = query.where('checkTime', {
            '$gte': Number(req.query.startTime),
            '$lt': Number(req.query.endTime)
        });
    }
    //  sex
    if (req.query.sex) {
        query = query.where('sex', req.query.sex);
    }
    if (req.query.easyQuery) { //简单查询
        query = query.or([
            { 'tel': new RegExp(req.query.easyQuery, 'ig') },
            { 'name': new RegExp(req.query.easyQuery, 'ig') },
            { 'address': new RegExp(req.query.easyQuery, 'ig') }
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

//返回检测总数*************************************
/**
 * @alias /api/pc/diagnostic-records/peoples[GET]
 * @description  返回检测总人数
 *
 * @return {Object} 检测总人数

 */
exports.listCount = function(req, res) {
    diagnosticRecord.count({}, function(err, doc) {
        if (!doc) {
            return res.send(message("NOT_FOUND", null));
        } else if (err) {
            return res.send(message("ERROR", null, err));
        }
        res.send(message("SUCCESS", 1563 + doc));
    });
};

//给诊断报告添加标签-------------------------------------------
/**
 * @alias /api/pc/diagnostic-records/:id[PATCH]
 * @description  添加标签
 * @param {String} id 诊断记录的ID
 * @param {String} label 标签
 *
 * @return {Object} 诊断报告

 */
exports.update = function(req, res) {

    diagnosticRecord.update({ _id: req.params.id }, { label: req.body.label }, function(err, doc) {
        if (!doc) {
            return res.send(message("NOT_FOUND", null));
        } else if (err) {
            return res.send(message("ERROR", null, err));
        }
        return res.send(message("SUCCESS", doc));
    });
    // diagnosticRecord.findById(req.params.id).exec(function(err,doc){
    //     if(!doc){
    //         return res.status(404).json(message("NOT_FOUND",null));
    //     }
    //     doc.label = req.body.label;
    //     doc.save(function(err,data){
    //         if (err) {
    //             res.send(message("ERROR",null,err));
    //             return;
    //         }
    //         res.send(message("SUCCESS",doc));
    //     });
    // });
};


//pc端诊断报告列表-----------------------------------------------
/**
 * @alias /api/pc/diagnostic-records[GET]
 * @description  诊断报告列表
 *
 * @return {Object} 报告列表

 */
exports.pcList = function(req, res) {

    var query = diagnosticRecord.find({ result: { $exists: true } });

    if (req.query.name) { //匹配姓名
        query = query.where("name", new RegExp(req.query.name, 'ig'));
    }
    if (req.query.sex) { //匹配性别
        query = query.where("sex", req.query.sex);
    }
    //查询年龄
    if (req.query.age1 && req.query.age2) {
        query = query.where('birthday', {
            '$gte': Number(req.query.age1),
            '$lt': Number(req.query.age2)
        });
    }
    if (req.query.label) { //匹配标签
        query = query.where("label", new RegExp(req.query.label, 'ig'));
    }
    if (req.query.tel) { //匹配电话
        query = query.where("tel", new RegExp(req.query.tel, 'ig'));
    }
    if (req.query.idCardNumber) { //匹配身份证
        query = query.where("idCardNumber", new RegExp(req.query.idCardNumber, 'ig'));
    }
    //检测日期查询
    if (req.query.createdAt1 && req.query.createdAt2) {
        query = query.where('createdAt', {
            '$gte': Number(req.query.createdAt1),
            '$lt': Number(req.query.createdAt2)
        });
    }
    //出生生辰
    if (req.query.birthday1 && req.query.birthday2) {
        query = query.where('birthday', {
            '$gte': Number(req.query.birthday1),
            '$lt': Number(req.query.birthday2)
        });
    }
    if (req.query.easyQuery) { //简单查询
        query = query.or([
            { 'name': new RegExp(req.query.easyQuery, 'ig') },
            { 'tel': new RegExp(req.query.easyQuery, 'ig') },
            { 'idCardNumber': new RegExp(req.query.easyQuery, 'ig') }
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
    query.populate({
        path: 'createdBy',
    }).paginate(req.query.page, req.query.count, function(err, docs, total) {
        if (!err && docs) {
            res.send(message('SUCCESS', { docs: docs, total: total }));
        } else {
            return res.send(message('ERROR', null, err));
        }
    });
};

//app 端查看具体的诊断报告-----------------------------------------------------------
/**
 * @alias /api/app/diagnostic-records/:id[GET]
 * @description  获取单个诊断结果
 * @param {String} diagnosticRecord 对应diagnosticRecord的id
 * @param {String}
 *
 * @return {Object} 诊断结果
 */
exports.detail = function(req, res) {
    var query = diagnosticRecord.findById(req.params.id);
    query.populate({
        path: 'report',
        populate: {
            path: "plan"
        }
    }).populate('result').exec(function(err, doc) {
        if (!doc) {
            return res.send(message("NOT_FOUND", null));
        } else if (err) {
            return res.send(message("ERROR", null, err));
        }
        console.log("诊断报告", message("SUCCESS", doc));
        var newData = {
            chTime: '辰时',
            curMeridian: '手太阴肺经', // 当令经络
            curMeridianInfo: '早上3-5点时段，肺经最旺，将肝贮藏解毒的新鲜血液输送到百脉。人在清晨面色红润，精力充沛，迎接新一天到来', // 当令时辰分析
            path: '手太阴肺经，从胸上循行肩臂内，下行循肘臂内侧至手大指内侧之端。', // 经络走向
            meridianInfo: '手太阴肺经，从胸上循行肩臂内，下行循肘臂内侧至手大指内侧之端。', // 经络特点
            symptom: '手太阴肺经，从胸上循行肩臂内，下行循肘臂内侧至手大指内侧之端。', // 提示症状
            usualAcupoint: '中府 定喘 肺俞', // 常用穴位建议
            usualHealthSuggestion: '百合粥。百合50克，粳米l00克，冰糖80克，加水适量，共煮成粥。百合粥具有润肺止咳、养心安神、滋阴清热的作用。', // 饮食调理建议
            usualKeepSuggestion: '手太阴肺经上有11个穴位，这条经脉不畅，会表现为：肺部胀满、气喘、咳嗽、锁骨疼痛、肩背疼痛、小便发黄等。拍手疏通手太阴肺经，则可以治愈喉部、胸部和肺部疾病，如咳嗽、气喘、咳血、伤风、咽喉肿痛、肩背寒冷、胸痛、吐泻、痔疾等。', // 养生建议-疏通经络法
            keepCharacter: '暂无。', // 性格养生建议
            yangWuXing: '肺经五行属金', // 金性性格阳性方面
            yinWuXing: '肺经五行属金', // 金性性格阴性方面
            wuXingEffect: '肺经五行属金', // 阴性性格对身体的影响
            characterSuggestion: '肺经五行属金', // 性格转化建议
            xiantianInfo: {
                ganzhi: '乙亥', // 干支年
                nongli: '八月初九', // 农历月日
                jieqi: '秋分', // 节气
                suiyun: '少金', // 岁运
                sitian: '秋分', // 司天
                zaiquan: '秋分', // 在泉
                curQi: '四之气', // 当前气索引
                zhuqi: '阳明燥金', // 主气
                keqi: '太阴湿土', // 客气
            }, // 先天信息
            houtianInfo: {
                ganzhi: '乙亥', // 干支年
                nongli: '八月初九', // 农历月日
                jieqi: '秋分', // 节气
                suiyun: '少金', // 岁运
                sitian: '秋分', // 司天
                zaiquan: '秋分', // 在泉
                curQi: '四之气', // 当前气索引
                zhuqi: '阳明燥金', // 主气
                keqi: '太阴湿土', // 客气
            }, // 后天信息
            tizhiReport: '根据您的出生日期：年干属于金运太过。', // 先天体质分析报告
            bodyEffect: '金运太过，燥气流行，肝木受克，要注意肝胆，心脏循环系统疾病。', // 对人体影响
            bodyStyle: '强金型体质，《黄帝内经》说：“岁金太过，燥气流行，肝木受邪”。容易肝郁，重点在疏肝。', // 身体特点
            foodSuggestion: '多吃绿色和黑色的食物。多吃大枣、小米粥、十谷米养生粥、松花粉、胡萝卜等有益于肝气调达。', // 饮食调理建议
            emotionHealth: '平和、不抱怨。', // 情志调理建议
            curEffect: '土运太过，雨湿流行，肾水受到伤害。人多患腹痛、四肢厥冷，精神抑郁，身体沉重，烦闷等疾病。土气太盛就会发生肌肉痿缩，两足痿软，行走时容易抽掣，足底疼痛，水饮蓄积于中，饮食减少，四肢不能举动。在人就会病患腹胀、溏泄、肠鸣等症。' // 现在分析
        };

        doc._doc.reportInfo = newData;
        res.send(message("SUCCESS", doc));
    });
};


//查看一个诊断报告-------------------------------------------------------------
/**
 * @alias /api/pc/diagnostic-records/:id[GET]
 * @description  获取单个诊断结果
 * @param {String} diagnosticRecord 对应diagnosticRecord的id
 *
 * @return {Object} 诊断结果
 */
exports.pcDetail = function(req, res) {

    var query = diagnosticRecord.findById(req.params.id);
    query.populate({
        path: 'report',
        populate: {
            path: "plan"
        }
    }).populate('result').exec(function(err, doc) {
        if (!doc) {
            return res.send(message("NOT_FOUND", null));
        } else if (err) {
            return res.send(message("ERROR", null, err));
        }

        var meridians = require('../data/meridians');
        for (var i = 0; i < doc.result.datas.sortedData.length; i++) {
            var tmp = meridians.getItem(doc.result.datas.sortedData[i].meridianId)
            doc.result.datas.sortedData[i].meridianName = (tmp.isLeft > 0 ? '左-' : '右-') + tmp.meridianName;
        }

        var params = {
            chTime: doc.chTime,
            birthChTime: doc.birthChTime,
            conclusion: doc.report.plan.conclusion,
            birthday: doc.birthday,
            createdAt: doc.createdAt
        };

        var newData = service.getReportData(params);
        doc = doc.toJSON();
        doc.reportInfo = newData;
        console.log("诊断报告", message("SUCCESS", JSON.stringify(doc)));
        res.send(message("SUCCESS", doc));
        // res.render('report-template', { doc: doc });
    });
};

//pc分享到手机-------------------------------------------------------------
/**
 * @alias /api/report-template/:id[GET]
 * @description  获取单个诊断结果
 * @param {String} diagnosticRecord 对应diagnosticRecord的id
 *
 * @return {Object} 诊断结果
 */
exports.detailHtml = function(req, res) {

    var query = diagnosticRecord.findById(req.params.id);
    query.populate({
        path: 'report',
        populate: {
            path: "plan"
        }
    }).populate('result').exec(function(err, doc) {
        if (!doc) {
            return res.send(message("NOT_FOUND", null));
        } else if (err) {
            return res.send(message("ERROR", null, err));
        }

        var meridians = require('../data/meridians');
        for (var i = 0; i < doc.result.datas.sortedData.length; i++) {
            var tmp = meridians.getItem(doc.result.datas.sortedData[i].meridianId)
            doc.result.datas.sortedData[i].meridianName = (tmp.isLeft > 0 ? '左-' : '右-') + tmp.meridianName;
        }

        var params = {
            chTime: doc.chTime,
            birthChTime: doc.birthChTime,
            conclusion: doc.report.plan.conclusion,
            birthday: doc.birthday,
            createdAt: doc.createdAt
        };

        var newData = service.getReportData(params);
        doc = doc.toJSON();
        doc.reportInfo = newData;
        console.log("诊断报告", message("SUCCESS", JSON.stringify(doc)));
        // res.send(message("SUCCESS", doc));
        res.render('report-template', { doc: doc });
    });
};



//后台查看一个诊断报告-------------------------------------------------------------
/**
 * @alias /api/diagnostic-records/:id[GET]
 * @description  获取单个诊断结果
 * @param {String} diagnosticRecord 对应diagnosticRecord的id
 * @param {String}
 *
 * @return {Object} 诊断结果

 */

exports.detailH = function(req, res) {
       if(req.query.id){
        req.query.id = req.query.id.substring(0, 9);
    }else{
        req.query.id = 123
    }

    diagnosticRecord.findOne({ "mathNumber": req.query.id }).populate({
        path: 'report',
        populate: {
            path: "plan"
        }
    }).populate('result').exec(function(err, doc) {
        if (!doc) {
            return res.send(message("NOT_FOUND", null));
        } else if (err) {
            return res.send(message("ERROR", null, err));
        }
        console.log('222222222222222222222222222222222222222:', doc);
        console.log('333333333333333333333333333333333333333:', doc.result);
        var meridians = require('../data/meridians');
        for (var i = 0; i < doc.result.datas.data.length; i++) {
            doc.result.datas.data[i].meridianName = meridians.getItem(doc.result.datas.data[i].meridianId).meridianName;
        }

        var params = {
            chTime: doc.chTime,
            birthChTime: doc.birthChTime,
            conclusion: doc.report.plan.conclusion,
            birthday: doc.birthday,
            createdAt: doc.createdAt
        };

        var newData = service.getReportData(params);
        doc = doc.toJSON();
        doc.reportInfo = newData;
        console.log("诊断报告", message("SUCCESS", JSON.stringify(doc)));
        // res.send(message("SUCCESS", doc));
        res.render('r.ejs', { doc: doc });
    });
};

//诊断结果对比--------------------------------------------------------

/**
 * @alias /api/pc/diagnostic-records/comparison/:ids[GET]
 * @description  获取两个诊断结果
 * @param {String} diagnosticRecord 两个对应diagnosticRecord的id
 * @param {String}
 *
 * @return {Object} 两个诊断结果

 */
exports.compare = function(req, res) {
    var ids = req.params.ids.split(","); //拆分字符串，得到id数组
    var query = diagnosticRecord.find({ "_id": { "$in": ids } });
    query.populate({
        path: 'result',
        // populate: {
        //     path: "createdBy"
        // }
    }).exec(function(err, docs) {
        if (!docs) {
            return res.send(message("NOT_FOUND", null));
        } else if (err) {
            return res.send(message("ERROR", null, err));
        }
        console.log(message("SUCCESS", docs));
        res.send(message("SUCCESS", docs));
    });
};

//要打印的报告详情-------------------------------------------------------------
/**
 * @alias /api/pc/diagnostic-records/output/:id[GET]
 * @description  获取单个诊断结果
 * @param {String} diagnosticRecord 对应diagnosticRecord的id
 * @return {Object} 诊断结果
 */
exports.print = function(req, res) {
    var query = diagnosticRecord.findById(req.params.id);
    query.populate({
        path: 'report',
        populate: {
            path: "plan"
        }
    }).populate('result').exec(function(err, doc) {
        if (!doc) {
            return res.send(message("NOT_FOUND", null));
        } else if (err) {
            return res.send(message("ERROR", null, err));
        }
        console.log("诊断报告", message("SUCCESS", doc));
        res.send(message("SUCCESS", doc));
        //
    });
};


//app创建诊断记录--------------------------------------------------------
/**
 * @alias /api/app/diagnostic-records[POST]
 * @description  创建诊断记录
 * @param {String}
 *
 * @return {Object}诊断记录
 */


//app 报告列表---------------------------------------------------------------------
/**
 * @alias /api/app/diagnostic-records/peoples[GET]
 * @description 报告列表
 * @param {String} peopleId 检测人id
 * @param {String} reportId 报告编号
 * @param {Number} createdAt1 检测日期1
 * @param {Number} createdAt2 检测日期2
 *
 * @return {Object} 报告列表
 */
exports.appList = function(req, res) {
    //参数校验
    // req.validate('id','必须指定删除的id').notEmpty();
    // req.validate('id','必须是合法的id').isMongoId();
    // var errors = req.validationErrors();
    // if (errors) {
    //     return next(errors[0]);
    // }
    //获取检测人所有的报告
    var query = diagnosticRecord.find({ "userId": req.query.peopleId });
    //如果搜索的是报告编号
    if (req.query.reportId) {
        query = query.where("_id", new RegExp(req.query.reportId, 'ig'));
    }
    //检测日期查询
    if (req.query.createdAt1 && req.query.createdAt2) {
        query = query.where('createdAt', {
            '$gte': Number(req.query.createdAt1),
            '$lt': Number(req.query.createdAt2)
        });
    }

    //默认排序
    query = query.sort({ "updatedAt": "desc" });

    //返回前台筛选
    //分页
    query.paginate(req.query.page, req.query.count, function(err, docs, total) {
        if (!err && docs) {
            console.log("报告列表", message('SUCCESS', { docs: docs, total: total }));
            res.send(message('SUCCESS', { docs: docs, total: total }));
        } else {
            return res.send(message('ERROR', null, err));
        }
    });
};

//app  修改信息-------------------------------------------------
/**
 * @alias /api/app/diagnostic-records/:id[PATCH]
 * @description 报告列表
 * @param {String} id 诊断记录id
 * @param {String} name 病人名字
 * @param {String} tel  手机号
 * @param {Number} sex  性别
 * @param {Number} birthday 生日
 *
 * @return {Object} 更新后的诊断记录
 */
exports.appUpdate = function(req, res, next) {
    //参数校验
    req.validate('id', '必须指定删除的id').notEmpty();
    req.validate('id', '必须是合法的id').isMongoId();
    var errors = req.validationErrors();
    if (errors) {
        return next(errors[0]);
    }
    var user = {
        name: req.body.name,
        tel: req.body.tel,
        sex: req.body.sex,
        birthday: req.body.birthday
    };
    createTempUser(user, function(err, newUser) {
        res.send(message("SUCCESS", newUser));
    });

    diagnosticRecord.findById(req.params.id, function(err, doc) {
        if (err) {
            return res.send(message("ERROR", null, err));
        } else if (!doc) {
            return res.send(message("NOT_FOUND", null));
        }
        var updateData = req.body;
        var data = _.merge(doc, updateData); //将传入的参数合并到原来的数据上
        data.updatedBy = (req.user ? req.user.id : null); //修改人
        // 写入数据库
        data.save(function(err, doc) {
            if (!err && doc) {
                res.send(message("SUCCESS", doc));
            } else {
                return res.send(message("ERROR", null, err));
            }
        });
    });
};
