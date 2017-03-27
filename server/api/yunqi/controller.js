/**
 * Created by zhenyuan on 2017/2/7.
 */

// 'use strict';

// var User = require('./model').User;
var _ = require('lodash');
var tokenManager = require('../../utils/token_manager');
var log = require('../../utils/log'); // 日志系统
var async = require('async');
var returnFactory = require('../../utils/returnFactory');
var tool = require('../../utils/tools');
var setting = require('../../config/setting');
var service = require('./service');
var mongoose = require('mongoose');
var FiveSix = require('./fivesix');

var validationError = function(res, err) {
    return res.status(422).json(err);
};

// 引入五运六气的数据
var wuyunshengfu = require('./data/五运胜复')["五运胜复"];
var liuqishengfu = require('./data/六气胜复')["六气胜复"];
var jiazi = require('./data/甲子表')["甲子表"];
var tianganhe = require('./data/天干合')["天干合"];
var sitianzaiquan = require('./data/司天在泉')["司天在泉"];
var QI = require('./data/QI')["QI"];

var GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
var WX = ['木', '火', '土', '金', '水']; // 正五行
var HHWX = ['土', '金', '水', '木', '火']; // 合化五行  这是整个五运的基础 http://mp.weixin.qq.com/s?__biz=MzA5MjUyNDkxNA==&mid=2656552337&idx=1&sn=56874f750ac5ac2e8cdab1a929be820e&scene=21#wechat_redirect
var YIN = ['角', '徵', '宫', '商', '羽']; // 
var ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
var GANZHI = ["甲子", "乙丑", "丙寅", "丁卯", "戊辰", "己巳", "庚午", "辛未", "壬申", "癸酉", "甲戌", "乙亥", "丙子", "丁丑", "戊寅", "己卯", "庚辰", "辛巳", "壬午", "癸未", "甲申", "乙酉", "丙戌", "丁亥", "戊子", "己丑", "庚寅", "辛卯", "壬辰", "癸巳", "甲午", "乙未", "丙申", "丁酉", "戊戌", "己亥", "庚子", "辛丑", "壬寅", "癸卯", "甲辰", "乙巳", "丙午", "丁未", "戊申", "己酉", "庚戌", "辛亥", "壬子", "癸丑", "甲寅", "乙卯", "丙辰", "丁巳", "戊午", "己未", "庚申", "辛酉", "壬戌", "癸亥"];

// 司天主客分析
var SITIAN_ZHUKE = [{
    'nianzhi': "巳亥",
    'zhusheng': "厥阴司天，主胜则胸胁痛，舌难以言。",
    'kesheng': "厥阴司天，客胜则耳鸣掉眩，甚则咳。",
}, {
    'nianzhi': "子午",
    'zhusheng': "少阴司天，主胜则心热烦躁，甚则胁痛支满。",
    'kesheng': "少阴司天，客胜则鼽嚏，颈项强肩背瞀热，头痛少气，发热耳聋目瞑，甚则 肿血溢，疮疡咳喘。",
}, {
    'nianzhi': "寅申",
    'zhusheng': "少阳司天，主胜则胸满咳仰息，甚而有血手热。",
    'kesheng': "少阳司天，客胜则丹胗外发，及为丹 疮疡，呕逆喉痹 ，头痛嗌肿，耳聋血溢，内为螈。",
}, {
    'nianzhi': "丑未",
    'zhusheng': "太阴司天，主胜则胸腹满，食已而瞀。",
    'kesheng': "太阴司天，客胜则首面肿，呼吸气喘。",
}, {
    'nianzhi': "卯酉",
    'zhusheng': "阳明司天，清复内余，则咳衄嗌塞，心膈中热，咳不止而白血出者死。",
    'kesheng': "阳明司天，清复内余，则咳衄嗌塞，心膈中热，咳不止而白血出者死。",
}, {
    'nianzhi': "辰戌",
    'zhusheng': "太阳司天，主胜则喉嗌中鸣。",
    'kesheng': "太阳司天，客胜则胸中不利，出清涕，感寒则咳。",
}];

// 在泉主客分析
var ZAIQUAN_ZHUKE = [{
    'nianzhi': "巳亥",
    'zhusheng': "少阳在泉，主胜则热反上行而客于心，心痛发热，格中而呕，少阴同候。",
    'kesheng': "少阳在泉，客胜则腰腹痛而反恶寒，甚则下白溺白。",
}, {
    'nianzhi': "子午",
    'zhusheng': "阳明在泉，主胜则腰重腹痛，少腹生寒，下为溏，则寒厥于肠，上冲胸中，甚则喘不能久立。",
    'kesheng': "阳明在泉，客胜则清气动下，少腹坚满而数便泻。",
}, {
    'nianzhi': "寅申",
    'zhusheng': "厥阴在泉，主胜则筋骨繇并，腰腹时痛。",
    'kesheng': "厥阴在泉，客胜则大关节不利，内为痉强拘螈，外为不便。",
}, {
    'nianzhi': "丑未",
    'zhusheng': "太阳在泉，寒复内余，则腰尻痛，屈伸不利，股胫足膝中痛。",
    'kesheng': "太阳在泉，寒复内余，则腰尻痛，屈伸不利，股胫足膝中痛。",
}, {
    'nianzhi': "卯酉",
    'zhusheng': "少阴在泉，主胜则厥气上行，心痛发热，膈中，众痹皆作，发于胁，魄汗不藏，四逆而起。",
    'kesheng': "少阴在泉，客胜则腰痛，尻股膝髀 足病，瞀热 以酸，肿不能久立，溲便变。",
}, {
    'nianzhi': "辰戌",
    'zhusheng': "太阴在泉，主胜则寒气逆满，食饮不下，甚则为疝。",
    'kesheng': "太阴在泉，客胜则足痿下重，便溲不时，湿客下焦，发而濡泻，及为肿隐曲之疾。",
}];

/**
 * @alias /api/pc/quannian[POST]
 * @description  获取全年运气分析的内容
 * @param {String} ganzhi 干支记年 比如 "甲子"
 * @param {String} suiyun 岁运，比如 太金
 * @param {String} sitian 司天
 * @param {String} zaiquan 在泉
 * @param {String} date 日期
 * @return {Object} 返回全年分析需要的数据
 */
exports.getQuannian = function(req, res, next) {

    var ganzhi = req.query.ganzhi;
    var suiyun = req.query.suiyun;
    var sitian = req.query.sitian;
    var zaiquan = req.query.zaiquan;
    var date = req.query.date;

    var ganzhiIndex = GANZHI.indexOf(ganzhi) + 1;
    var jiazi_query = _.find(jiazi, { "id": ganzhiIndex.toString() });
    var wuyun_query = _.find(wuyunshengfu, function(obj) { return obj["五运"].indexOf(suiyun) > -1; });
    var sitian_query = _.find(sitianzaiquan, { "三阴三阳": sitian, "司天在泉": "司天" });
    var zaiquan_query = _.find(sitianzaiquan, { "三阴三阳": zaiquan, "司天在泉": "在泉" });

    var gandefu = "";
    var gandefuStr  = "";
    if(date){
        // var FiveSix = require('./fivesix');
        // var fivesix = new Fivesix(date);
        gandefu = service.getGandefu();
        gandefuStr = "交运日日干是RG,年干是NG".replace("RG", gandefu.rigan)
            .replace("NG", gandefu.niangan)
        if (gandefu.panduan) {
            gandefuStr += ",PD,形成干德福,是平气之年.".replace("PD", gandefu.panduan);
        } else {
            gandefuStr += ",没有形成干德福.";
        }
    }

    var result = {
        yunqiyihua_label: jiazi_query["运气同化或异化字样"], // 运气同化或异化字样
        yunqiyihua_name: jiazi_query["运气同化或异化名称"], // 运气同化或异化名称
        yunqiyihua_analyse: jiazi_query["运气同化或异化判断"], // 运气同化或异化分析
        pingqipanduan: jiazi_query["平气判断"], // 平气判断
        is_pingqi: jiazi_query["是否平气"] == "True", // 是否平气
        yunqitongzhi: jiazi_query["运气同治"], //  运气同治
        yunqihezhi: jiazi_query["运气合治"], //  运气合治
        sanqizhiji: wuyun_query["三气之纪"], // 三气之纪
        sheng: wuyun_query["胜"], // 胜
        fu: wuyun_query["复"], // 复
        yufa: wuyun_query["郁发"], // 郁发
        sitian_yinsheng: sitian_query["淫胜"], // 司天淫胜
        sitian_zhize: sitian_query["治则"], // 司天治则
        zaiquan_yinsheng: zaiquan_query["淫胜"], // 司天淫胜
        zaiquan_zhize: zaiquan_query["治则"], // 司天治则
        gandefu: gandefu, // 是否干德福
        gandefuStr: gandefuStr
    };

    return res.json(returnFactory('SUCCESS', result));

};


/**
 * @alias /api/pc/wuyun[POST]
 * @description  获取五运分析的内容
 * @param {String} yun 五运，比如 太金
 * @return {Object} 返回运分析需要的数据
 */
exports.getWuyun = function(req, res, next) {

    var yun = req.query.yun;
    var wuyun_query = _.find(wuyunshengfu, function(obj) { return obj["五运"].indexOf(yun) > -1; });


    var result = {
        yun: wuyun_query["五运"],
        sanqizhiji: wuyun_query["三气之纪"], // 三气之纪
        sheng: wuyun_query["胜"], // 胜
        fu: wuyun_query["复"], // 复
        yufa: wuyun_query["郁发"], // 郁发

    };

    return res.json(returnFactory('SUCCESS', result));

};


/**
 * @alias /api/pc/liuqi[GET]
 * @description  获取六气分析的内容
 * @param {String} qi 六气，比如 厥阴风木
 * @param {String} ganzhi 干支记年 比如 "甲子"
 * @param {String} qiindex 六气序数 0~5
 * @return {Object} 返回六气分析需要的数据
 */
exports.getLiuqi = function(req, res, next) {

    var result1 = {}; // 记录气分析的数据
    var result2 = {}; // 记录分析对应的数据
    var qi = req.query.qi;
    var ganzhi = req.query.ganzhi;
    var qiindex = req.query.qiindex;

    if (qi) {
        var liuqi_query = _.find(liuqishengfu, { "六气": qi });

        result1 = {
            qi: qi,
            yinsheng: liuqi_query["淫胜"], // 淫胜
            yinshengzhize: liuqi_query["淫胜治则"], // 淫胜治则
            fuqi: liuqi_query["复气"], // 复气
            fuqizhize: liuqi_query["复气治则"], // 复气治则
        };
    }

    if (ganzhi && qiindex) {
        var nianzhi = ganzhi.substr(1, 1);
        var fenxi_query = _.find(QI, { "属性": "分析", "年支": nianzhi });
        var sitianzhuke_query = _.find(QI, { "属性": "司天客主分析", "年支": nianzhi });
        var zaiquanzhuke_query = _.find(QI, { "属性": "在泉客主分析", "年支": nianzhi });
        var keqizhize_query = _.find(QI, { "属性": "客气治则", "年支": nianzhi });
        var zhuqizhize_query = _.find(QI, { "属性": "主气治则" });
        var yunqihezhi_query = _.find(QI, { "属性": "运气合治", "年支": nianzhi });

        var list = ["初气", "气二", "气三", "气四", "气五", "终气"];

        result2 = {
            fenxi: fenxi_query[list[qiindex]],
            sitianzhuke: sitianzhuke_query[list[qiindex]],
            zaiquanzhuke: zaiquanzhuke_query[list[qiindex]],
            keqizhize: keqizhize_query[list[qiindex]],
            zhuqizhize: zhuqizhize_query[list[qiindex]],
            yunqihezhi: yunqihezhi_query[list[qiindex]],
        };

        if (result2.fenxi.indexOf("逆") > -1) { // 主胜
            result2.sitianzhuke = _.find(SITIAN_ZHUKE, function(obj) { return obj.nianzhi.indexOf(nianzhi) > -1; })["zhusheng"];
            result2.zaiquanzhuke = _.find(ZAIQUAN_ZHUKE, function(obj) { return obj.nianzhi.indexOf(nianzhi) > -1; })["zhusheng"];
        }
        if (result2.fenxi.indexOf("顺") > -1) { // 客胜
            result2.sitianzhuke = _.find(SITIAN_ZHUKE, function(obj) { return obj.nianzhi.indexOf(nianzhi) > -1; })["kesheng"];
            result2.zaiquanzhuke = _.find(ZAIQUAN_ZHUKE, function(obj) { return obj.nianzhi.indexOf(nianzhi) > -1; })["kesheng"];
        }
    }

    var result = _.merge(result1, result2);

    return res.json(returnFactory('SUCCESS', result));

};



/**
 * @alias /api/users/:id[DELETE]
 * @description  删除注册用户
 * @param {String=} id 要删除的用户id
 * @return {Object} 错误信息
 */
exports.getXianTian = function(req, res, next) {
    var adminType = 1;
    userService.delete(req, res, adminType, next);
};


/**
 * @alias /api/pc/nongli/:time[GET]
 * @description  根据阳历获取农历以及五运六气相关信息
 * @param {String=} time 要删除的用户id
 * @return {Object} 错误信息
 */
exports.getNongli = function(req, res, next){
    // req.validate('time', '必须指定id').notEmpty();
    // req.validate('id', '必须是合法的id').isMongoId();
    // var errors = req.validationErrors();
    // if (errors) {
    //     return next(errors[0]);
    // }
    var date = req.params.time;
    var result = service.getWuyunliqi(date);
    return res.json(returnFactory('SUCCESS', result));
}