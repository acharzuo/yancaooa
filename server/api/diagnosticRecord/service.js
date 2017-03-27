
var xiantiantizhi = require('../meridian/data/先天体质')['Sheet3'];
var xinggeyingxiang = require('../meridian/data/性格影响')['性格影响'];
var shierjingluo = require('../meridian/data/十二经络')['十二经络'];

var timeArr = [{
    'date':'子时',
    'time':'23:00 - 00:59'
    },{
    'date':'丑时',
    'time':'01:00 - 02:59'
    },{
    'date':'寅时',
    'time':'03:00 - 04:59'
    },{
    'date':'卯时',
    'time':'05:00 - 06:59'
    },{
    'date':'辰时',
    'time':'07:00 - 08:59'
    },{
    'date':'巳时',
    'time':'09:00 - 10:59'
    },{
    'date':'午时',
    'time':'11:00 - 12:59'
    },{
    'date':'未时',
    'time':'13:00 - 14:59'
    },{
    'date':'申时',
    'time':'15:00 - 16:59'
    },{
    'date':'酉时',
    'time':'17:00 - 18:59'
    },{
    'date':'戌时',
    'time':'19:00 - 20:59'
    },{
    'date':'亥时',
    'time':'21:00 - 22:59'
    }];
var _ = require('lodash');

var XushiEmun = {
    "虚症": "xu",
    "实症": "shi",
    "寒症": "han",
    "热症": "re",
}; //　虚实对应关系

var FiveSix = require('../yunqi/fivesix');
var moment = require('moment');

function convertTime(number){
    var now = new Date(Number(number));
    var year = now.getFullYear(); //获取年
    var month = now.getMonth() + 1; //获取月
    var date = now.getDate(); //获取日
    if (month < 10) month = "0" + month;
    if (date < 10) date = "0" + date;
    return year + "-" + month + "-" + date;
}

// 返回诊断报告需要的数据
exports.getReportData = function(doc){
    if(!doc) doc = {};
    var result = {
            xiantianInfo:{},
            houtianInfo:{}
        };
    try{
    var chTime = doc.chTime || '辰时';
    var birthChTime = doc.birthChTime || '子时';
    var conclusion = doc.conclusion || '足阳明胃经-虚症';
    var xiantianTime = doc.xiantianTime || '1987-03-06';
    var houtianTime = doc.houtianTime || '2017-03-06'

    xiantianTime = convertTime(doc.birthday);
    houtianTime = convertTime(doc.createdAt);

    // 当前检测经络的虚实寒热
    var xushi = conclusion.replace('<p>','').replace('</p>', '').split('-')[1];

    // 当前检测经络名称
    var resultJingluoName = conclusion.replace('<p>','').replace('</p>', '').split('-')[0]; 

    // 当前时辰对应的经络
    var curTimeMeridian = _.find(shierjingluo, function(obj) { return obj["chTime"].indexOf(chTime) > -1; })

    // 检测结果的经络信息
    var resultMeridian = _.find(shierjingluo, function(obj) { return obj["meridianName"].indexOf(resultJingluoName) > -1; })

    // 性格影响的行
    var xinggeRecord = _.find(xinggeyingxiang, function(obj) { return obj["名称"].indexOf(resultJingluoName) > -1; })

    // 五运六气 begin
    var xiantianFiveSix = new FiveSix(xiantianTime);
    var houtianFiveSix = new FiveSix(houtianTime);

    var xiantianZhuqi = xiantianFiveSix.getZhuKeQi();
    var houtianZhuqi = houtianFiveSix.getZhuKeQi();

    var xiantianCurIndex = xiantianFiveSix.getCurrentYunQiIndex();
    var houtianCurIndex = xiantianFiveSix.getCurrentYunQiIndex();

    var zhongyun1 = xiantianFiveSix.getZhongyun();
    var zhongyunStr1 = (zhongyun1[0] ? '太' : '少') + zhongyun1[1];

    var zhongyun2 = houtianFiveSix.getZhongyun();
    var zhongyunStr2 = (zhongyun2[0] ? '太' : '少') + zhongyun2[1];

    var qis = ["初之气", "二之气", "三之气", "四之气", "五之气", "终之气"];
    // 五运六气 end

    // 先天体质
    var xiantiantiangan = xiantianFiveSix.getGanZhi().substring(0,1);
    var xiantianTizhiRecord = _.find(xiantiantizhi, function(obj) { return obj["对应天干"].indexOf(xiantiantiangan) > -1; });

    var houtiantiangan = houtianFiveSix.getGanZhi().substring(0,1);
    var houtianTizhiRecord = _.find(xiantiantizhi, function(obj) { return obj["对应天干"].indexOf(houtiantiangan) > -1; });

    result = {
            wuxing: xinggeRecord['五行'],  // 肺经五行属金
            wuxingShort: xinggeRecord['五行'].substr(xinggeRecord['五行'].length-1, 1), // 金
            shortMeridianName:resultMeridian.shortName,  // 经络简称 心经
            chTime: resultMeridian.chTime,   // 检测经络对应的当令时辰
            curMeridian: curTimeMeridian.meridianName, // 当令经络 当前时间的
            curMeridianInfo: resultMeridian.chTimeInfo, // 当令时辰分析 诊断经络的
            path: resultMeridian.path, // 经络走向
            meridianInfo: resultMeridian.meridianInfo, // 经络特点
            symptom: resultMeridian[XushiEmun[xushi]], // 提示症状
            usualAcupoint: resultMeridian[XushiEmun[xushi]+"Acupoint"],  // 常用穴位建议
            // usualAcupoint: resultMeridian.usualAcupoint,  // 常用穴位建议
            usualHealthSuggestion: resultMeridian[XushiEmun[xushi]+"Suggestion"],  // 饮食调理建议
            // usualHealthSuggestion: resultMeridian.foodSuggestion,  // 饮食调理建议
            usualKeepSuggestion: resultMeridian.healthPlan,  // 养生建议-疏通经络法
            keepCharacter: resultMeridian[XushiEmun[xushi]+"Character"],  // 性格养生建议
            yangWuXing: xinggeRecord['阳性方面'],  // 金性性格阳性方面
            yinWuXing: xinggeRecord['阴性方面'],  // 金性性格阴性方面
            wuXingEffect: xinggeRecord['阴性性格对身体的影响'],  // 阴性性格对身体的影响
            characterSuggestion: xinggeRecord['性格转化'],  // 性格转化建议
            xiantianInfo: {
                ganzhi: xiantianFiveSix.getGanZhi(), // 干支年
                nongli: xiantianFiveSix.getNongli(), // 农历月日
                jieqi: xiantianFiveSix.getJieqi(), // 节气
                suiyun: zhongyunStr1, // 岁运
                sitian: xiantianFiveSix.getSitianZaiquan()[0], // 司天
                zaiquan: xiantianFiveSix.getSitianZaiquan()[1], // 在泉
                curQi: qis[xiantianCurIndex.qiIndex], // 当前气索引
                zhuqi: xiantianZhuqi.zhuqi[xiantianCurIndex.qiIndex], // 主气
                keqi: xiantianZhuqi.keqi[xiantianCurIndex.qiIndex], // 客气
            },  // 先天信息
            houtianInfo: {
                ganzhi: houtianFiveSix.getGanZhi(), // 干支年
                nongli: houtianFiveSix.getNongli(), // 农历月日
                jieqi: houtianFiveSix.getJieqi(), // 节气
                suiyun: zhongyunStr2, // 岁运
                sitian: houtianFiveSix.getSitianZaiquan()[0], // 司天
                zaiquan: houtianFiveSix.getSitianZaiquan()[1], // 在泉
                curQi: qis[houtianCurIndex.qiIndex], // 当前气索引
                zhuqi: houtianZhuqi.zhuqi[houtianCurIndex.qiIndex], // 主气
                keqi: houtianZhuqi.keqi[houtianCurIndex.qiIndex], // 客气
            },  // 后天信息
            tizhiReport: '根据您的出生日期：年干属于'+xiantianTizhiRecord['五运']+'。', // 先天体质分析报告
            bodyEffect: xiantianTizhiRecord['天运影响'], // 对人体影响
            bodyStyle: xiantianTizhiRecord['特点'], // 身体特点
            foodSuggestion: xiantianTizhiRecord['食疗'], // 饮食调理建议
            emotionHealth: xiantianTizhiRecord['情志养生'], // 情志调理建议
            curEffect: houtianTizhiRecord['天运影响'] // 现在分析
        };
        return result;
    }catch(e){
        console.log(e);
        return result;
    }

}