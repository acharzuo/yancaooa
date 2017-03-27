/**
 * @author zhenyuan 
 * @description 五运六气算法
 *  采用了 http://blog.jjonline.cn/userInterFace/173.html 的日历算法
 *  改为 寿星万年历计算农历和干支 http://www.zdic.net/appendix/wnl/ 
 * @date 2017-01-18
 */

var Lunar = require('./shouxing');

/**
 * 构造函数 全局对象
 * 输入：dateStr 格式"2016-01-18 10:13:01"
 * 提供一系列方法
 * 注意：五行使用的是 合化五行的顺序  土 金 水 火 木
 */
function FiveSix(dateStr) {

    this.dateStr = dateStr; // 输入的日期
    if (!dateStr) {
        this.dateStr = new Date().format();
        dateStr = this.dateStr;
    }
    // 默认是当前日期
    var current = new Date().format();
    this.date = current.split(" ")[0];
    this.time = current.split(" ")[1];

    if (!dateStr) return;
    dateStr = dateStr.toString().trim(); // 去掉收尾空格
    var tempArry = dateStr.split(" ");
    if (tempArry.length == 1) {
        this.date = dateStr; // 日期部分计算干支
    }

    if (tempArry.length == 2) {
        this.date = dateStr.split(" ")[0]; // 日期部分计算干支
        this.time = dateStr.split(" ")[1]; // 时辰部分
    }

    this.year = Number(this.date.split("-")[0]);
    this.monthDay = Number(this.date.split("-")[1] + this.date.split("-")[2]);
    this.month = Number(this.date.split("-")[1]);
    this.day = Number(this.date.split("-")[2]);
    // 查表法的万年历 支持 1900-2100
    // this.calendar = calendar.solar2lunar(this.year, this.monthDay / 100, this.monthDay % 100);
    // 寿星万年历 支持上下五千年
    if (Lunar) {
        this.lunar = new Lunar();
        this.lunar.yueLiCalc(this.year, this.month);
        // 当前的日对象
        this.currentDay = this.lunar.lun[this.day - 1];
        this.allJieqi = this.getAllJieqi(this.year);
    }

}

// 获取本年大寒的日干
FiveSix.prototype.getDahanRigan = function() {
    var lunar = new Lunar();
    lunar.yueLiCalc(this.year, 1);
    return lunar.lun[this.allJieqi[1] - 1].Lday2;
};

// 计算干德符
FiveSix.prototype.getGandefu = function(niangan, rigan) {
    var gandefuMap = {
        "甲己": "甲己合化土",
        "己甲": "甲己合化土",
        "乙庚": "乙庚合化金",
        "庚乙": "乙庚合化金",
        "丙辛": "丙辛合化水",
        "辛丙": "丙辛合化水",
        "丁壬": "丁壬合化木",
        "壬丁": "丁壬合化木",
        "戊癸": "戊癸合化火",
        "癸戊": "戊癸合化火",
    }
    var result = {
        niangan: "",
        rigan: "",
        panduan: ""
    }
    if (niangan) {
        result.niangan = niangan;
    } else {
        result.niangan = this.getGanZhi().substr(0, 1);
    }
    if (rigan) {
        result.rigan = rigan;
    } else {
        result.rigan = this.getDahanRigan().substr(0, 1);
    }
    result.panduan = gandefuMap[result.niangan + result.rigan];

    return result;

};


// 获取本年所有节气的公历
FiveSix.prototype.getAllJieqi = function(year) {
    var lunar = new Lunar();
    allJieqi = [];
    var firstNode, secondNode, days;
    for (var i = 0; i < 12; i++) {
        lunar.yueLiCalc(year, i + 1);
        //二十四节气反映了太阳的周年视运动，所以在公历中它们的日期是基本固定的，上半年的节气在6日，中气在21日，下半年的节气在8日，中气在23日，二者前后不差1-2日。
        if (i < 6) {
            days = [3, 4, 5, 6, 7, 8, 9, 18, 19, 20, 21, 22, 23, 24];
            for (var j = 0; j < days.length; j++) {
                if (lunar.lun[days[j] - 1].jqmc.length > 0) {
                    if (!allJieqi[i * 2]) {
                        allJieqi[i * 2] = days[j];
                    } else {
                        allJieqi[i * 2 + 1] = days[j];
                        break;
                    }
                }
            }
        } else {
            days = [5, 6, 7, 8, 9, 10, 11, 20, 21, 22, 23, 24, 25, 26];
            for (var j = 0; j < days.length; j++) {
                if (lunar.lun[days[j] - 1].jqmc.length > 0) {
                    if (!allJieqi[i * 2]) {
                        allJieqi[i * 2] = days[j];
                    } else {
                        allJieqi[i * 2 + 1] = days[j];
                        break;
                    }
                }
            }
        }
    }
    return allJieqi;
};

// 获取天干
FiveSix.prototype.getTianGan = function() {

};

// 获取地支 比如："子"
FiveSix.prototype.getDiZhi = function() {

};

// 获取年份干支 比如："甲子" 从大寒日开始算新的一年
FiveSix.prototype.getGanZhi = function() {
    // var date = new Date(this.date);

    // var result = calendar.solar2lunar(this.year,this.monthDay/100,this.monthDay%100);
    // return this.calendar.gzYear;
    var dahan = "01" + this.allJieqi[1]; // 大寒日
    var tempIndex = this.currentDay.di + 1;
    var current = "" + this.currentDay.m + (tempIndex > 9 ? tempIndex : ("0" + tempIndex));
    var lunar = new Lunar();
    if (Number(current) >= Number(dahan)) {
        lunar.yueLiCalc(this.year, 5);
    } else {
        lunar.yueLiCalc(this.year - 1, 5);
    }

    return lunar.Ly;
};

// 获取农历 正月初几 月天
FiveSix.prototype.getNongli = function() {
    // var date = new Date(this.date);
    // return this.calendar.IMonthCn + this.calendar.IDayCn;
    var monthName = this.currentDay.Lmc;
    if (monthName == "十一") {
        monthName = "冬";
    }
    if (monthName == "十二") {
        monthName = "腊";
    }
    return monthName + '月' + this.currentDay.Ldc;
};

// 获取节气 比如："大寒"
// ["小寒","大寒","立春","雨水","惊蛰","春分","清明","谷雨","立夏","小满","芒种","夏至","小暑","大暑","立秋","处暑","白露","秋分","寒露","霜降","立冬","小雪","大雪","冬至"]
FiveSix.prototype.getJieqi = function() {
    // var date = new Date(this.date);
    var jieqi = ["小寒", "大寒", "立春", "雨水", "惊蛰", "春分", "清明", "谷雨", "立夏", "小满", "芒种", "夏至", "小暑", "大暑", "立秋", "处暑", "白露", "秋分", "寒露", "霜降", "立冬", "小雪", "大雪", "冬至"];
    //当前日是某个节气日
    if (this.currentDay.jqmc.length > 0) {
        return this.currentDay.jqmc;
    }
    //遍历当月每一天
    var i, firstNode, secondNode, temp; // 一个月有两个节气
    for (i = 0; i < this.lunar.lun.length; i++) {
        if (this.lunar.lun[i].jqmc.length > 0) {
            if (!firstNode) {
                firstNode = i;
            } else {
                secondNode = i;
                break;
            }
        }
    }
    // ------第一个节气---this.day---第二个节气-------
    if (this.day - 1 >= firstNode && this.day - 1 < secondNode) {
        return this.lunar.lun[firstNode].jqmc;
    }
    // this.day------第一个节气------第二个节气-------
    if (this.day - 1 < firstNode) {
        temp = jieqi.indexOf(this.lunar.lun[firstNode].jqmc);
        return jieqi[(temp + 24 - 1) % 24];
    }
    // ------第一个节气------第二个节气-------this.day
    if (this.day - 1 >= secondNode) {
        return this.lunar.lun[secondNode].jqmc;
    }


    // return this.calendar.TermPeriod;
};


/** 获取中运 比如："太水" 
 * 算法：土主甲己，金主乙庚，水主丙辛，木主丁壬，火主戌癸
 * 甲、丙、戊、庚、壬五阳干，均主岁运的有余，为太过，
乙、丁、己、辛、癸五阴干，均主岁运的衰少，为不及
 *  返回 [true/false, '土/金/水/木/火', 0/1/2/3/4]
 **/
FiveSix.prototype.getZhongyun = function() {
    var date = new Date(this.date);
    var ganzhi = this.getGanZhi();
    // 获取天干的索引
    var ganIndex = FIVE_SIX.GAN.indexOf(ganzhi.substr(0, 1));
    // 计算对应的五行序号
    var wxIndex = ganIndex % 5;

    // 计算太少 true 太 false 少 干的序数 偶数为阴 不及 少 单数为阳 太过 太
    var taishao = (ganIndex + 1) % 2 !== 0;

    // 计算五行
    var hhwx = FIVE_SIX.HHWX[wxIndex];

    return [taishao, hhwx];
};

/**
 * 返回主运 客运 顺序是符合五季节的顺序 木 火 土 金 水
 * 主运，即五运之气分主于一年各个季节的岁气。全年分做五步运行，从木运开始，而火运，而土运，而金运，而水运，按着五行相生的次第运行，直至水运而终
 * 主运：['土','金','水','木','火']
 * 客运：岁运为初之运，然后依五行相生的次序，分布到五季，并且太少相生
 * 比如某年是太金，则 客运为 太金 少水 太木 少火 太土
 */
FiveSix.prototype.getZhuKeYun = function() {
    var zhongyun = this.getZhongyun();
    var ganzhi = this.getGanZhi();
    var taishao = zhongyun[0];
    var zhuTaishaoArry = []; // 主运太少

    var niangan = ganzhi.substr(0, 1); // 第一个汉字为年干
    //参考 http://wenku.baidu.com/view/da79690e52ea551810a68762.html
    if (['甲', '乙', '丙', '壬', '癸'].indexOf(niangan) > -1) {
        zhuTaishaoArry = ['太', '少', '太', '少', '太'];
    } else {
        zhuTaishaoArry = ['少', '太', '少', '太', '少'];
    }

    var keTaishaoArry = []; // 客运太少
    var wxIndex = FIVE_SIX.WX.indexOf(zhongyun[1]); // 中运五行的序号 0开始 正五行
    if (taishao) {
        keTaishaoArry = ['太', '少', '太', '少', '太'];
    } else {
        keTaishaoArry = ['少', '太', '少', '太', '少'];
    }

    var zhuyun = [];
    var keyun = [];

    for (var i = 0; i < FIVE_SIX.WX.length; i++) {
        zhuyun[i] = zhuTaishaoArry[i] + FIVE_SIX.WX[i];
        keyun[i] = keTaishaoArry[i] + FIVE_SIX.WX[(wxIndex + i) % 5];
    }
    var result = {
        zhuyun: zhuyun,
        keyun: keyun,
        zhuyunTaishao: zhuTaishaoArry,
        keyunTaishao: keTaishaoArry,
        zhongyunIndex: wxIndex
    };
    return result;
};


/**
 *  获取司天 在泉  
 *  司天，定居于客气的第三步气位，统主上半年气候总趋向。司天根据该年干支符号确定，如甲子年为少阳君火司天，根据司天可确定客气的六步气位。第三步为少阴君火，则知该年客气的四之气为太阴湿土，五之气为少阴相火，六之气为阳明燥金。

 *  算法：根据年支 以及 下面的对应关系 计算
 *  子午　少阴君火 阳明燥金
    丑未　太阴湿土 太阳寒水
    寅申　少阳相火 厥阴风木
    卯酉　阳明燥金 少阴君火
    辰戌　太阳寒水 太阴湿土
    巳亥　厥阴风木 少阳相火
    返回：[司天, 在泉]
 */
FiveSix.prototype.getSitianZaiquan = function() {
    var date = new Date(this.date);
    var ganzhi = this.getGanZhi();
    // 获取年支的索引
    var zhiIndex = FIVE_SIX.ZHI.indexOf(ganzhi.substr(1, 1));
    // 计算对应的司天的序号
    var sitianIndex = zhiIndex % 6;

    // 计算司天
    var sitian = FIVE_SIX.SITIAN[sitianIndex];

    // 知道了司天 一年的客气就定了，根据六气顺序，可以推算出在泉
    var zaiquan = FIVE_SIX.SITIAN[(sitianIndex + 3) % 6];
    return [sitian, zaiquan, sitianIndex, (sitianIndex + 3) % 6];
};


/**
 *  返回主客气
 * 六气: 1/21~3/21 二之气 3/21~5/21 三之气 5/21~7/23 四之气 7/23~9/23 五之气 9/23~11/23 终之气 11/23~1/21
客气: 少阴君火 太阴湿土 少阳相火 阳明燥金 太阳寒水 厥阴风木
主气: 厥阴风木 少阴君火 少阳相火 太阴湿土 阳明燥金 太阳寒水

第一，客气的排列是以三阴三阳的次第为序，首尾相接，如环无端。三阴三阳的次第就是一阴二阴三阴，一阳二阳三阳，一阴为厥阴，二阴为少阴，三月为太阴，一阳为少阳，二阳为阳明，三阳为太阳。
第二，每年的第三步客气始终都与司天相同，每年的第六步客气始终都与在泉相同。
 */
FiveSix.prototype.getZhuKeQi = function() {
    var sitianZaiquan = this.getSitianZaiquan();
    var sitianIndex = sitianZaiquan[2]; // 司天的气在客气六气顺序序号
    var chuqiIndex = ((sitianIndex - 2) + 6) % 6; // 初之气，客气

    var zhuqi = FIVE_SIX.LIUQI; // 主气
    var keqi = []; // 客气
    var xiangde = []; // 是否相得
    for (var i = 0; i < 6; i++) {
        keqi[i] = FIVE_SIX.SITIAN[(chuqiIndex + i) % 6];
        xiangde[i] = checkIsXiangde(zhuqi[i], keqi[i]);
    }

    var result = {
        zhuqi: zhuqi,
        keqi: keqi,
        xiangde: xiangde
    };
    return result;
};


/**
 * 返回五行的次序 0开头，合化五行
 * 输入汉字 五行 土金木水火
 */
FiveSix.prototype.getWxIndex = function(wx) {

    return FIVE_SIX.HHWX.indexOf(wx);

};

/**
 * 返回当前月日 对应的运气 序号
 * 五运时间 
 *  01.21 ~ 04.04
    04.04 ~ 06.16
    06.16 ~ 08.28
    08.28 ~ 11.09
    11.09 ~ 01.21
 */
FiveSix.prototype.getCurrentYunQiIndex = function() {


    var result = {
        yunIndex: 4, // 主运位于五季的序号
        qiIndex: 5, // 主气位于 六气的序号
        yunBegin: 1,
        yunEnd: 2
    };

    var jiaoyun = this.getJiaoyun();

    for (var i = 0; i < 4; i++) {
        if (this.monthDay >= Number(jiaoyun[i]) && this.monthDay < Number(jiaoyun[i + 1])) {
            // result.zhuyun = FIVE_SIX.WX[i];  // 这里使用的是正五行，五个季节
            result.yunIndex = i; // 这里使用的是正五行，五个季节
            break;
        }
    }
    result.yunBegin = jiaoyun[result.yunIndex];
    if (result.yunIndex == 4) { // 计算下一年的大寒节
        var nextJiaoyun = this.getJiaoyun(this.year + 1);
        result.yunEnd = nextJiaoyun[0];
    } else {
        result.yunEnd = jiaoyun[(result.yunIndex + 1) % 5];
    }

    var jiaoqi = this.getJiaoqi();
    // 计算六气相关
    for (var i = 0; i < 5; i++) {
        if (this.monthDay > Number(jiaoqi[i]) && this.monthDay <= Number(jiaoqi[i + 1])) {
            result.qiIndex = i; // 这里使用的是六气顺序
            break;
        }
    }

    return result;

};

/**
 * 获取当前天是一年的第几天
 */
// FiveSix.prototype.getCurrentDay = function() {
//     var lYearDays = this.calendar.lYearDays(); // 农历一年的总天数
// };

/**
 * 获取主运交运的阳历日期
 * 推算——始于木运，终于水运，恒定不变。每运主七十三日零五刻，合三百六
十五日零二十五刻。 
初运木运，起于大寒节气 
二运火运，起于春分节后十三日 
三运土运，起于芒种后十日 
四运金运，起于处暑后七日 
五运水运，起于立冬后四日
 */
FiveSix.prototype.getJiaoyun1 = function(year) {
    //["小寒","大寒","立春","雨水","惊蛰","春分","清明","谷雨","立夏","小满","芒种","夏至","小暑","大暑","立秋","处暑","白露","秋分","寒露","霜降","立冬","小雪","大雪","冬至"]
    //this.calendar.getTerm(y,n); //传入公历(!)y年获得该年第n个节气的公历日期'
    if (!year) {
        year = this.year;
    }
    var result = [];
    result[0] = "01" + calendar.getTerm(year, 2); // 大寒

    var temp = calendar.getTerm(year, 6); // 春分节后十三日
    result[1] = this.addDays(3, temp, 13);

    temp = calendar.getTerm(year, 11); // 芒种后十日 
    result[2] = this.addDays(6, temp, 11);

    temp = calendar.getTerm(year, 16); // 起于处暑后七日 
    result[3] = this.addDays(8, temp, 7);

    temp = calendar.getTerm(year, 21); // 起于立冬后四日 
    result[4] = this.addDays(11, temp, 4);

    return result;
    // var lYearDays = calendar.lYearDays(); // 农历一年的总天数
};
FiveSix.prototype.getJiaoyun = function(year) {
    //["小寒","大寒","立春","雨水","惊蛰","春分","清明","谷雨","立夏","小满","芒种","夏至","小暑","大暑","立秋","处暑","白露","秋分","寒露","霜降","立冬","小雪","大雪","冬至"]
    //this.calendar.getTerm(y,n); //传入公历(!)y年获得该年第n个节气的公历日期'
    if (!year) {
        year = this.year;
        allJieqi = this.allJieqi;
    } else {
        allJieqi = this.getAllJieqi(year);
    }
    var result = [];
    // result[0] = "01" + calendar.getTerm(year, 2); //1月19-21日 大寒
    result[0] = "01" + allJieqi[1]; // 大寒

    // var temp = calendar.getTerm(year, 6); // 3月20-21日 春分节后十三日
    var temp = allJieqi[5] + 13;
    result[1] = temp > 31 ? "040" + (temp - 31) : "03" + temp;

    // temp = calendar.getTerm(year, 11); //6月5-6日 芒种后十日 
    result[2] = "06" + (allJieqi[10] + 10);

    // temp = calendar.getTerm(year, 16); //8月22-24日 起于处暑后七日 
    temp = allJieqi[15] + 7;
    result[3] = temp > 31 ? "090" + (temp - 31) : "08" + temp;

    // temp = calendar.getTerm(year, 21); // 11月7-8日 起于立冬后四日 
    result[4] = "11" + (allJieqi[20] + 4);

    return result;
    // var lYearDays = calendar.lYearDays(); // 农历一年的总天数
};

/**
 * 获取交气的时间
 * 厥阴风木为初气，主春分前六十日又八十七刻半，以风木是东方生气之始，所以为初气，从十二月中的大寒起算，经过立春、雨水、惊蛰、至二月中的春分前夕。
木能生火，少阴君火为二气，主春分后六十日又八十七刻半，从二月中的春分起算，经过清明、谷雨、立夏、至四月中的小满前夕。
君火在前，相火在后，少阳相火为三气，主夏至前后各三十日又四十三刻有奇。从四月中小满起算，经过芒种、夏至、小暑至六月中的大暑前夕。
火能生土，太阴湿土为四气，主秋分前六十日又八十七刻半，从六月中的大暑起算，经过立秋、处暑、白露至八月中的秋分前夕。
 土能生金，阳明燥金为五气，主秋分后六十日又八十七刻半，从八月的中秋分起算，经过寒露、霜降、立冬，至十月中的小雪前夕。
金能生水，太阳寒水为终气，主冬至前后各三十日又四十三刻有奇，从十月中的小雪起算，经过大雪、冬至、小寒，至十二月中的大寒前夕。
 */
FiveSix.prototype.getJiaoqi1 = function(year) {
    //["小寒","大寒","立春","雨水","惊蛰","春分","清明","谷雨","立夏","小满","芒种","夏至","小暑","大暑","立秋","处暑","白露","秋分","寒露","霜降","立冬","小雪","大雪","冬至"]
    if (!year) {
        year = this.year;
    }
    var result = [];
    result[0] = "01" + calendar.getTerm(year, 2); // 大寒

    result[1] = "03" + calendar.getTerm(year, 6); // 春分

    result[2] = "05" + calendar.getTerm(year, 10); // 小满

    result[3] = "07" + calendar.getTerm(year, 14); // 大暑

    result[4] = "09" + calendar.getTerm(year, 18); // 秋分

    result[5] = "11" + calendar.getTerm(year, 22); // 小雪

    return result;
}
FiveSix.prototype.getJiaoqi = function(year) {
    //["小寒","大寒","立春","雨水","惊蛰","春分","清明","谷雨","立夏","小满","芒种","夏至","小暑","大暑","立秋","处暑","白露","秋分","寒露","霜降","立冬","小雪","大雪","冬至"]
    if (!year) {
        year = this.year;
        allJieqi = this.allJieqi;
    } else {
        allJieqi = this.getAllJieqi(year);
    }
    var result = [];
    result[0] = "01" + allJieqi[1]; // 大寒

    result[1] = "03" + allJieqi[5]; // 春分

    result[2] = "05" + allJieqi[9]; // 小满

    result[3] = "07" + allJieqi[13]; // 大暑

    result[4] = "09" + allJieqi[17]; // 秋分

    result[5] = "11" + allJieqi[21]; // 小雪

    return result;
}

// 月日 加上一定天数的日期
FiveSix.prototype.addDays = function(month, day, day_count) {
    var r_month, r_day;
    if (day + day_count > calendar.solarMonth[month - 1]) { // 是否超出了本月
        r_month = month + 1;
        r_day = (day + day_count) % calendar.solarMonth[month - 1];
    } else {
        r_month = month;
        r_day = day + day_count;
    }

    if (r_month > 12) {
        r_month = r_month % 12;
    }

    if (r_month < 10) {
        r_month = '0' + r_month;
    }

    if (r_day < 10) {
        r_day = '0' + r_day;
    }
    return "" + r_month + r_day;
}

// 检查主气 客气 是否相得 
// true 相得 false 不相得
function checkIsXiangde(zhuqi, keqi) {
    var zhuWx = zhuqi.substr(zhuqi.length - 1, 1); // 主气的五行属性
    var keWx = keqi.substr(keqi.length - 1, 1); // 客气的五行属性
    var zhuWxIndex = FIVE_SIX.HHWX.indexOf(zhuWx); // 主气五行的序号
    var keWxIndex = FIVE_SIX.HHWX.indexOf(keWx); // 客气五行的序号

    var diff = Math.abs(zhuWxIndex - keWxIndex); // 计算五行差值
    if (diff == 2 || diff == 3) { // 五行相差为2和3，说明两者有相克关系 木 火 土 金 水
        return false;
    }

    return true;
}


// 01.21 ~ 04.04
// 04.04 ~ 06.16
// 06.16 ~ 08.28
// 08.28 ~ 11.09
// 11.09 ~ 01.21

// 01.21 ~ 03.21
// 03.21 ~ 05.21
// 05.21 ~ 07.23
// 07.23 ~ 09.23
// 09.23 ~ 11.23
// 11.23 ~ 01.21

// 定义了用到的一个概念的集合
var FIVE_SIX = {
    // 节气速查表
    //["小寒","大寒","立春","雨水","惊蛰","春分","清明","谷雨","立夏","小满","芒种","夏至","小暑","大暑","立秋","处暑","白露","秋分","寒露","霜降","立冬","小雪","大雪","冬至"]
    solarTerm: ["\u5c0f\u5bd2", "\u5927\u5bd2", "\u7acb\u6625", "\u96e8\u6c34", "\u60ca\u86f0", "\u6625\u5206", "\u6e05\u660e", "\u8c37\u96e8", "\u7acb\u590f", "\u5c0f\u6ee1", "\u8292\u79cd", "\u590f\u81f3", "\u5c0f\u6691", "\u5927\u6691", "\u7acb\u79cb", "\u5904\u6691", "\u767d\u9732", "\u79cb\u5206", "\u5bd2\u9732", "\u971c\u964d", "\u7acb\u51ac", "\u5c0f\u96ea", "\u5927\u96ea", "\u51ac\u81f3"],

    //   YUNTIME: [[121,404],[404,616],[616,828],[828,1109],[1109,121]], // 五运时间
    YUNTIME: [121, 404, 616, 828, 1109], // 五运时间
    //   QITIME: [[121,321],[321,521],[521,723],[723,923],[923,1123],[1123,121]], // 六气时间
    QITIME: [121, 321, 521, 723, 923, 1123], // 六气时间
    GAN: ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'],
    WX: ['木', '火', '土', '金', '水'], // 正五行
    HHWX: ['土', '金', '水', '木', '火'], // 合化五行  这是整个五运的基础 http://mp.weixin.qq.com/s?__biz=MzA5MjUyNDkxNA==&mid=2656552337&idx=1&sn=56874f750ac5ac2e8cdab1a929be820e&scene=21#wechat_redirect
    YIN: ['角', '徵', '宫', '商', '羽'],
    ZHI: ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'],
    SITIAN: ['少阴君火', '太阴湿土', '少阳相火', '阳明燥金', '太阳寒水', '厥阴风木'],
    LIUQI: ['厥阴风木', '少阴君火', '少阳相火', '太阴湿土', '阳明燥金', '太阳寒水'],
    GANZHI: ["甲子", "乙丑", "丙寅", "丁卯", "戊辰", "已巳", "庚午", "辛未", "壬申", "癸酉", "甲戌", "乙亥", "丙子", "丁丑", "戊寅", "已卯", "庚辰", "辛巳", "壬午", "癸未", "甲申", "乙酉", "丙戌", "丁亥", "戊子", "已丑", "庚寅", "辛卯", "壬辰", "癸巳", "甲午", "乙未", "丙申", "丁酉", "戊戌", "已亥", "庚子", "辛丑", "壬寅", "癸卯", "甲辰", "乙巳", "丙午", "丁未", "戊申", "已酉", "庚戌", "辛亥", "壬子", "癸丑", "甲寅", "乙卯", "丙辰", "丁巳", "戊午", "已未", "庚申", "辛酉", "壬戌", "癸亥"]
};
/*
主运和客运


*/



Date.prototype.format = function() {
    var year = this.getFullYear(); //获取年
    var month = this.getMonth() + 1; //获取月
    var date = this.getDate(); //获取日
    var hour = this.getHours();
    var minute = this.getMinutes();
    var second = this.getSeconds();
    if (month < 10) month = "0" + month;
    if (date < 10) date = "0" + date;
    if (hour < 10) hour = "0" + hour;
    if (minute < 10) minute = "0" + minute;
    if (second < 10) second = "0" + second;
    return year + "-" + month + "-" + date + " " + hour + "-" + minute + "-" + second;
};


/**
 * @1900-2100区间内的公历、农历互转
 * @charset UTF-8
 * @Author  Jea杨(JJonline@JJonline.Cn) 
 * @Time    2014-7-21
 * @Time    2016-8-13 Fixed 2033hex、Attribution Annals
 * @Time    2016-9-25 Fixed lunar LeapMonth Param Bug
 * @Version 1.0.2
 * @公历转农历：calendar.solar2lunar(1987,11,01); //[you can ignore params of prefix 0]
 * @农历转公历：calendar.lunar2solar(1987,09,10); //[you can ignore params of prefix 0]
 */
var calendar = {

    /**
     * 农历1900-2100的润大小信息表
     * @Array Of Property
     * @return Hex 
     */
    lunarInfo: [0x04bd8, 0x04ae0, 0x0a570, 0x054d5, 0x0d260, 0x0d950, 0x16554, 0x056a0, 0x09ad0, 0x055d2, //1900-1909
        0x04ae0, 0x0a5b6, 0x0a4d0, 0x0d250, 0x1d255, 0x0b540, 0x0d6a0, 0x0ada2, 0x095b0, 0x14977, //1910-1919
        0x04970, 0x0a4b0, 0x0b4b5, 0x06a50, 0x06d40, 0x1ab54, 0x02b60, 0x09570, 0x052f2, 0x04970, //1920-1929
        0x06566, 0x0d4a0, 0x0ea50, 0x06e95, 0x05ad0, 0x02b60, 0x186e3, 0x092e0, 0x1c8d7, 0x0c950, //1930-1939
        0x0d4a0, 0x1d8a6, 0x0b550, 0x056a0, 0x1a5b4, 0x025d0, 0x092d0, 0x0d2b2, 0x0a950, 0x0b557, //1940-1949
        0x06ca0, 0x0b550, 0x15355, 0x04da0, 0x0a5b0, 0x14573, 0x052b0, 0x0a9a8, 0x0e950, 0x06aa0, //1950-1959
        0x0aea6, 0x0ab50, 0x04b60, 0x0aae4, 0x0a570, 0x05260, 0x0f263, 0x0d950, 0x05b57, 0x056a0, //1960-1969
        0x096d0, 0x04dd5, 0x04ad0, 0x0a4d0, 0x0d4d4, 0x0d250, 0x0d558, 0x0b540, 0x0b6a0, 0x195a6, //1970-1979
        0x095b0, 0x049b0, 0x0a974, 0x0a4b0, 0x0b27a, 0x06a50, 0x06d40, 0x0af46, 0x0ab60, 0x09570, //1980-1989
        0x04af5, 0x04970, 0x064b0, 0x074a3, 0x0ea50, 0x06b58, 0x055c0, 0x0ab60, 0x096d5, 0x092e0, //1990-1999
        0x0c960, 0x0d954, 0x0d4a0, 0x0da50, 0x07552, 0x056a0, 0x0abb7, 0x025d0, 0x092d0, 0x0cab5, //2000-2009
        0x0a950, 0x0b4a0, 0x0baa4, 0x0ad50, 0x055d9, 0x04ba0, 0x0a5b0, 0x15176, 0x052b0, 0x0a930, //2010-2019
        0x07954, 0x06aa0, 0x0ad50, 0x05b52, 0x04b60, 0x0a6e6, 0x0a4e0, 0x0d260, 0x0ea65, 0x0d530, //2020-2029
        0x05aa0, 0x076a3, 0x096d0, 0x04afb, 0x04ad0, 0x0a4d0, 0x1d0b6, 0x0d250, 0x0d520, 0x0dd45, //2030-2039
        0x0b5a0, 0x056d0, 0x055b2, 0x049b0, 0x0a577, 0x0a4b0, 0x0aa50, 0x1b255, 0x06d20, 0x0ada0, //2040-2049
        /**Add By JJonline@JJonline.Cn**/
        0x14b63, 0x09370, 0x049f8, 0x04970, 0x064b0, 0x168a6, 0x0ea50, 0x06b20, 0x1a6c4, 0x0aae0, //2050-2059
        0x0a2e0, 0x0d2e3, 0x0c960, 0x0d557, 0x0d4a0, 0x0da50, 0x05d55, 0x056a0, 0x0a6d0, 0x055d4, //2060-2069
        0x052d0, 0x0a9b8, 0x0a950, 0x0b4a0, 0x0b6a6, 0x0ad50, 0x055a0, 0x0aba4, 0x0a5b0, 0x052b0, //2070-2079
        0x0b273, 0x06930, 0x07337, 0x06aa0, 0x0ad50, 0x14b55, 0x04b60, 0x0a570, 0x054e4, 0x0d160, //2080-2089
        0x0e968, 0x0d520, 0x0daa0, 0x16aa6, 0x056d0, 0x04ae0, 0x0a9d4, 0x0a2d0, 0x0d150, 0x0f252, //2090-2099
        0x0d520
    ], //2100

    /**
     * 公历每个月份的天数普通表
     * @Array Of Property
     * @return Number 
     */
    solarMonth: [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],

    /**
     * 天干地支之天干速查表
     * @Array Of Property trans["甲","乙","丙","丁","戊","己","庚","辛","壬","癸"]
     * @return Cn string 
     */
    Gan: ["\u7532", "\u4e59", "\u4e19", "\u4e01", "\u620a", "\u5df1", "\u5e9a", "\u8f9b", "\u58ec", "\u7678"],

    /**
     * 天干地支之地支速查表
     * @Array Of Property 
     * @trans["子","丑","寅","卯","辰","巳","午","未","申","酉","戌","亥"]
     * @return Cn string 
     */
    Zhi: ["\u5b50", "\u4e11", "\u5bc5", "\u536f", "\u8fb0", "\u5df3", "\u5348", "\u672a", "\u7533", "\u9149", "\u620c", "\u4ea5"],

    /**
     * 天干地支之地支速查表<=>生肖
     * @Array Of Property 
     * @trans["鼠","牛","虎","兔","龙","蛇","马","羊","猴","鸡","狗","猪"]
     * @return Cn string 
     */
    Animals: ["\u9f20", "\u725b", "\u864e", "\u5154", "\u9f99", "\u86c7", "\u9a6c", "\u7f8a", "\u7334", "\u9e21", "\u72d7", "\u732a"],

    /**
     * 24节气速查表
     * @Array Of Property 
     * @trans["小寒","大寒","立春","雨水","惊蛰","春分","清明","谷雨","立夏","小满","芒种","夏至","小暑","大暑","立秋","处暑","白露","秋分","寒露","霜降","立冬","小雪","大雪","冬至"]
     * @return Cn string 
     */
    solarTerm: ["\u5c0f\u5bd2", "\u5927\u5bd2", "\u7acb\u6625", "\u96e8\u6c34", "\u60ca\u86f0", "\u6625\u5206", "\u6e05\u660e", "\u8c37\u96e8", "\u7acb\u590f", "\u5c0f\u6ee1", "\u8292\u79cd", "\u590f\u81f3", "\u5c0f\u6691", "\u5927\u6691", "\u7acb\u79cb", "\u5904\u6691", "\u767d\u9732", "\u79cb\u5206", "\u5bd2\u9732", "\u971c\u964d", "\u7acb\u51ac", "\u5c0f\u96ea", "\u5927\u96ea", "\u51ac\u81f3"],

    /**
     * 1900-2100各年的24节气日期速查表
     * @Array Of Property 
     * @return 0x string For splice
     */
    sTermInfo: ['9778397bd097c36b0b6fc9274c91aa', '97b6b97bd19801ec9210c965cc920e', '97bcf97c3598082c95f8c965cc920f',
        '97bd0b06bdb0722c965ce1cfcc920f', 'b027097bd097c36b0b6fc9274c91aa', '97b6b97bd19801ec9210c965cc920e',
        '97bcf97c359801ec95f8c965cc920f', '97bd0b06bdb0722c965ce1cfcc920f', 'b027097bd097c36b0b6fc9274c91aa',
        '97b6b97bd19801ec9210c965cc920e', '97bcf97c359801ec95f8c965cc920f', '97bd0b06bdb0722c965ce1cfcc920f',
        'b027097bd097c36b0b6fc9274c91aa', '9778397bd19801ec9210c965cc920e', '97b6b97bd19801ec95f8c965cc920f',
        '97bd09801d98082c95f8e1cfcc920f', '97bd097bd097c36b0b6fc9210c8dc2', '9778397bd197c36c9210c9274c91aa',
        '97b6b97bd19801ec95f8c965cc920e', '97bd09801d98082c95f8e1cfcc920f', '97bd097bd097c36b0b6fc9210c8dc2',
        '9778397bd097c36c9210c9274c91aa', '97b6b97bd19801ec95f8c965cc920e', '97bcf97c3598082c95f8e1cfcc920f',
        '97bd097bd097c36b0b6fc9210c8dc2', '9778397bd097c36c9210c9274c91aa', '97b6b97bd19801ec9210c965cc920e',
        '97bcf97c3598082c95f8c965cc920f', '97bd097bd097c35b0b6fc920fb0722', '9778397bd097c36b0b6fc9274c91aa',
        '97b6b97bd19801ec9210c965cc920e', '97bcf97c3598082c95f8c965cc920f', '97bd097bd097c35b0b6fc920fb0722',
        '9778397bd097c36b0b6fc9274c91aa', '97b6b97bd19801ec9210c965cc920e', '97bcf97c359801ec95f8c965cc920f',
        '97bd097bd097c35b0b6fc920fb0722', '9778397bd097c36b0b6fc9274c91aa', '97b6b97bd19801ec9210c965cc920e',
        '97bcf97c359801ec95f8c965cc920f', '97bd097bd097c35b0b6fc920fb0722', '9778397bd097c36b0b6fc9274c91aa',
        '97b6b97bd19801ec9210c965cc920e', '97bcf97c359801ec95f8c965cc920f', '97bd097bd07f595b0b6fc920fb0722',
        '9778397bd097c36b0b6fc9210c8dc2', '9778397bd19801ec9210c9274c920e', '97b6b97bd19801ec95f8c965cc920f',
        '97bd07f5307f595b0b0bc920fb0722', '7f0e397bd097c36b0b6fc9210c8dc2', '9778397bd097c36c9210c9274c920e',
        '97b6b97bd19801ec95f8c965cc920f', '97bd07f5307f595b0b0bc920fb0722', '7f0e397bd097c36b0b6fc9210c8dc2',
        '9778397bd097c36c9210c9274c91aa', '97b6b97bd19801ec9210c965cc920e', '97bd07f1487f595b0b0bc920fb0722',
        '7f0e397bd097c36b0b6fc9210c8dc2', '9778397bd097c36b0b6fc9274c91aa', '97b6b97bd19801ec9210c965cc920e',
        '97bcf7f1487f595b0b0bb0b6fb0722', '7f0e397bd097c35b0b6fc920fb0722', '9778397bd097c36b0b6fc9274c91aa',
        '97b6b97bd19801ec9210c965cc920e', '97bcf7f1487f595b0b0bb0b6fb0722', '7f0e397bd097c35b0b6fc920fb0722',
        '9778397bd097c36b0b6fc9274c91aa', '97b6b97bd19801ec9210c965cc920e', '97bcf7f1487f531b0b0bb0b6fb0722',
        '7f0e397bd097c35b0b6fc920fb0722', '9778397bd097c36b0b6fc9274c91aa', '97b6b97bd19801ec9210c965cc920e',
        '97bcf7f1487f531b0b0bb0b6fb0722', '7f0e397bd07f595b0b6fc920fb0722', '9778397bd097c36b0b6fc9274c91aa',
        '97b6b97bd19801ec9210c9274c920e', '97bcf7f0e47f531b0b0bb0b6fb0722', '7f0e397bd07f595b0b0bc920fb0722',
        '9778397bd097c36b0b6fc9210c91aa', '97b6b97bd197c36c9210c9274c920e', '97bcf7f0e47f531b0b0bb0b6fb0722',
        '7f0e397bd07f595b0b0bc920fb0722', '9778397bd097c36b0b6fc9210c8dc2', '9778397bd097c36c9210c9274c920e',
        '97b6b7f0e47f531b0723b0b6fb0722', '7f0e37f5307f595b0b0bc920fb0722', '7f0e397bd097c36b0b6fc9210c8dc2',
        '9778397bd097c36b0b70c9274c91aa', '97b6b7f0e47f531b0723b0b6fb0721', '7f0e37f1487f595b0b0bb0b6fb0722',
        '7f0e397bd097c35b0b6fc9210c8dc2', '9778397bd097c36b0b6fc9274c91aa', '97b6b7f0e47f531b0723b0b6fb0721',
        '7f0e27f1487f595b0b0bb0b6fb0722', '7f0e397bd097c35b0b6fc920fb0722', '9778397bd097c36b0b6fc9274c91aa',
        '97b6b7f0e47f531b0723b0b6fb0721', '7f0e27f1487f531b0b0bb0b6fb0722', '7f0e397bd097c35b0b6fc920fb0722',
        '9778397bd097c36b0b6fc9274c91aa', '97b6b7f0e47f531b0723b0b6fb0721', '7f0e27f1487f531b0b0bb0b6fb0722',
        '7f0e397bd097c35b0b6fc920fb0722', '9778397bd097c36b0b6fc9274c91aa', '97b6b7f0e47f531b0723b0b6fb0721',
        '7f0e27f1487f531b0b0bb0b6fb0722', '7f0e397bd07f595b0b0bc920fb0722', '9778397bd097c36b0b6fc9274c91aa',
        '97b6b7f0e47f531b0723b0787b0721', '7f0e27f0e47f531b0b0bb0b6fb0722', '7f0e397bd07f595b0b0bc920fb0722',
        '9778397bd097c36b0b6fc9210c91aa', '97b6b7f0e47f149b0723b0787b0721', '7f0e27f0e47f531b0723b0b6fb0722',
        '7f0e397bd07f595b0b0bc920fb0722', '9778397bd097c36b0b6fc9210c8dc2', '977837f0e37f149b0723b0787b0721',
        '7f07e7f0e47f531b0723b0b6fb0722', '7f0e37f5307f595b0b0bc920fb0722', '7f0e397bd097c35b0b6fc9210c8dc2',
        '977837f0e37f14998082b0787b0721', '7f07e7f0e47f531b0723b0b6fb0721', '7f0e37f1487f595b0b0bb0b6fb0722',
        '7f0e397bd097c35b0b6fc9210c8dc2', '977837f0e37f14998082b0787b06bd', '7f07e7f0e47f531b0723b0b6fb0721',
        '7f0e27f1487f531b0b0bb0b6fb0722', '7f0e397bd097c35b0b6fc920fb0722', '977837f0e37f14998082b0787b06bd',
        '7f07e7f0e47f531b0723b0b6fb0721', '7f0e27f1487f531b0b0bb0b6fb0722', '7f0e397bd097c35b0b6fc920fb0722',
        '977837f0e37f14998082b0787b06bd', '7f07e7f0e47f531b0723b0b6fb0721', '7f0e27f1487f531b0b0bb0b6fb0722',
        '7f0e397bd07f595b0b0bc920fb0722', '977837f0e37f14998082b0787b06bd', '7f07e7f0e47f531b0723b0b6fb0721',
        '7f0e27f1487f531b0b0bb0b6fb0722', '7f0e397bd07f595b0b0bc920fb0722', '977837f0e37f14998082b0787b06bd',
        '7f07e7f0e47f149b0723b0787b0721', '7f0e27f0e47f531b0b0bb0b6fb0722', '7f0e397bd07f595b0b0bc920fb0722',
        '977837f0e37f14998082b0723b06bd', '7f07e7f0e37f149b0723b0787b0721', '7f0e27f0e47f531b0723b0b6fb0722',
        '7f0e397bd07f595b0b0bc920fb0722', '977837f0e37f14898082b0723b02d5', '7ec967f0e37f14998082b0787b0721',
        '7f07e7f0e47f531b0723b0b6fb0722', '7f0e37f1487f595b0b0bb0b6fb0722', '7f0e37f0e37f14898082b0723b02d5',
        '7ec967f0e37f14998082b0787b0721', '7f07e7f0e47f531b0723b0b6fb0722', '7f0e37f1487f531b0b0bb0b6fb0722',
        '7f0e37f0e37f14898082b0723b02d5', '7ec967f0e37f14998082b0787b06bd', '7f07e7f0e47f531b0723b0b6fb0721',
        '7f0e37f1487f531b0b0bb0b6fb0722', '7f0e37f0e37f14898082b072297c35', '7ec967f0e37f14998082b0787b06bd',
        '7f07e7f0e47f531b0723b0b6fb0721', '7f0e27f1487f531b0b0bb0b6fb0722', '7f0e37f0e37f14898082b072297c35',
        '7ec967f0e37f14998082b0787b06bd', '7f07e7f0e47f531b0723b0b6fb0721', '7f0e27f1487f531b0b0bb0b6fb0722',
        '7f0e37f0e366aa89801eb072297c35', '7ec967f0e37f14998082b0787b06bd', '7f07e7f0e47f149b0723b0787b0721',
        '7f0e27f1487f531b0b0bb0b6fb0722', '7f0e37f0e366aa89801eb072297c35', '7ec967f0e37f14998082b0723b06bd',
        '7f07e7f0e47f149b0723b0787b0721', '7f0e27f0e47f531b0723b0b6fb0722', '7f0e37f0e366aa89801eb072297c35',
        '7ec967f0e37f14998082b0723b06bd', '7f07e7f0e37f14998083b0787b0721', '7f0e27f0e47f531b0723b0b6fb0722',
        '7f0e37f0e366aa89801eb072297c35', '7ec967f0e37f14898082b0723b02d5', '7f07e7f0e37f14998082b0787b0721',
        '7f07e7f0e47f531b0723b0b6fb0722', '7f0e36665b66aa89801e9808297c35', '665f67f0e37f14898082b0723b02d5',
        '7ec967f0e37f14998082b0787b0721', '7f07e7f0e47f531b0723b0b6fb0722', '7f0e36665b66a449801e9808297c35',
        '665f67f0e37f14898082b0723b02d5', '7ec967f0e37f14998082b0787b06bd', '7f07e7f0e47f531b0723b0b6fb0721',
        '7f0e36665b66a449801e9808297c35', '665f67f0e37f14898082b072297c35', '7ec967f0e37f14998082b0787b06bd',
        '7f07e7f0e47f531b0723b0b6fb0721', '7f0e26665b66a449801e9808297c35', '665f67f0e37f1489801eb072297c35',
        '7ec967f0e37f14998082b0787b06bd', '7f07e7f0e47f531b0723b0b6fb0721', '7f0e27f1487f531b0b0bb0b6fb0722'
    ],

    /**
     * 数字转中文速查表
     * @Array Of Property 
     * @trans ['日','一','二','三','四','五','六','七','八','九','十']
     * @return Cn string 
     */
    nStr1: ["\u65e5", "\u4e00", "\u4e8c", "\u4e09", "\u56db", "\u4e94", "\u516d", "\u4e03", "\u516b", "\u4e5d", "\u5341"],

    /**
     * 日期转农历称呼速查表
     * @Array Of Property 
     * @trans ['初','十','廿','卅']
     * @return Cn string 
     */
    nStr2: ["\u521d", "\u5341", "\u5eff", "\u5345"],

    /**
     * 月份转农历称呼速查表
     * @Array Of Property 
     * @trans ['正','一','二','三','四','五','六','七','八','九','十','冬','腊']
     * @return Cn string 
     */
    nStr3: ["\u6b63", "\u4e8c", "\u4e09", "\u56db", "\u4e94", "\u516d", "\u4e03", "\u516b", "\u4e5d", "\u5341", "\u51ac", "\u814a"],

    /**
     * 返回农历y年一整年的总天数
     * @param lunar Year
     * @return Number
     * @eg:var count = calendar.lYearDays(1987) ;//count=387
     */
    lYearDays: function(y) {
        var i, sum = 348;
        for (i = 0x8000; i > 0x8; i >>= 1) { sum += (calendar.lunarInfo[y - 1900] & i) ? 1 : 0; }
        return (sum + calendar.leapDays(y));
    },

    /**
     * 返回农历y年闰月是哪个月；若y年没有闰月 则返回0
     * @param lunar Year
     * @return Number (0-12)
     * @eg:var leapMonth = calendar.leapMonth(1987) ;//leapMonth=6
     */
    leapMonth: function(y) { //闰字编码 \u95f0
        return (calendar.lunarInfo[y - 1900] & 0xf);
    },

    /**
     * 返回农历y年闰月的天数 若该年没有闰月则返回0
     * @param lunar Year
     * @return Number (0、29、30)
     * @eg:var leapMonthDay = calendar.leapDays(1987) ;//leapMonthDay=29
     */
    leapDays: function(y) {
        if (calendar.leapMonth(y)) {
            return ((calendar.lunarInfo[y - 1900] & 0x10000) ? 30 : 29);
        }
        return (0);
    },

    /**
     * 返回农历y年m月（非闰月）的总天数，计算m为闰月时的天数请使用leapDays方法
     * @param lunar Year
     * @return Number (-1、29、30)
     * @eg:var MonthDay = calendar.monthDays(1987,9) ;//MonthDay=29
     */
    monthDays: function(y, m) {
        if (m > 12 || m < 1) { return -1 } //月份参数从1至12，参数错误返回-1
        return ((calendar.lunarInfo[y - 1900] & (0x10000 >> m)) ? 30 : 29);
    },

    /**
     * 返回公历(!)y年m月的天数
     * @param solar Year
     * @return Number (-1、28、29、30、31)
     * @eg:var solarMonthDay = calendar.leapDays(1987) ;//solarMonthDay=30
     */
    solarDays: function(y, m) {
        if (m > 12 || m < 1) { return -1 } //若参数错误 返回-1
        var ms = m - 1;
        if (ms == 1) { //2月份的闰平规律测算后确认返回28或29
            return (((y % 4 == 0) && (y % 100 != 0) || (y % 400 == 0)) ? 29 : 28);
        } else {
            return (calendar.solarMonth[ms]);
        }
    },

    /**
     * 农历年份转换为干支纪年
     * @param  lYear 农历年的年份数
     * @return Cn string
     */
    toGanZhiYear: function(lYear) {
        var ganKey = (lYear - 3) % 10;
        var zhiKey = (lYear - 3) % 12;
        if (ganKey == 0) ganKey = 10; //如果余数为0则为最后一个天干
        if (zhiKey == 0) zhiKey = 12; //如果余数为0则为最后一个地支
        return calendar.Gan[ganKey - 1] + calendar.Zhi[zhiKey - 1];

    },

    /**
     * 公历月、日判断所属星座
     * @param  cMonth [description]
     * @param  cDay [description]
     * @return Cn string
     */
    toAstro: function(cMonth, cDay) {
        var s = "\u9b54\u7faf\u6c34\u74f6\u53cc\u9c7c\u767d\u7f8a\u91d1\u725b\u53cc\u5b50\u5de8\u87f9\u72ee\u5b50\u5904\u5973\u5929\u79e4\u5929\u874e\u5c04\u624b\u9b54\u7faf";
        var arr = [20, 19, 21, 21, 21, 22, 23, 23, 23, 23, 22, 22];
        return s.substr(cMonth * 2 - (cDay < arr[cMonth - 1] ? 2 : 0), 2) + "\u5ea7"; //座
    },

    /**
     * 传入offset偏移量返回干支
     * @param offset 相对甲子的偏移量
     * @return Cn string
     */
    toGanZhi: function(offset) {
        return calendar.Gan[offset % 10] + calendar.Zhi[offset % 12];
    },

    /**
     * 传入公历(!)y年获得该年第n个节气的公历日期
     * @param y公历年(1900-2100)；n二十四节气中的第几个节气(1~24)；从n=1(小寒)算起 
     * @return day Number
     * @eg:var _24 = calendar.getTerm(1987,3) ;//_24=4;意即1987年2月4日立春
     */
    getTerm: function(y, n) {
        if (y < 1900 || y > 2100) { return -1; }
        if (n < 1 || n > 24) { return -1; }
        var _table = calendar.sTermInfo[y - 1900];
        var _info = [
            parseInt('0x' + _table.substr(0, 5)).toString(),
            parseInt('0x' + _table.substr(5, 5)).toString(),
            parseInt('0x' + _table.substr(10, 5)).toString(),
            parseInt('0x' + _table.substr(15, 5)).toString(),
            parseInt('0x' + _table.substr(20, 5)).toString(),
            parseInt('0x' + _table.substr(25, 5)).toString()
        ];
        var _calday = [
            _info[0].substr(0, 1),
            _info[0].substr(1, 2),
            _info[0].substr(3, 1),
            _info[0].substr(4, 2),

            _info[1].substr(0, 1),
            _info[1].substr(1, 2),
            _info[1].substr(3, 1),
            _info[1].substr(4, 2),

            _info[2].substr(0, 1),
            _info[2].substr(1, 2),
            _info[2].substr(3, 1),
            _info[2].substr(4, 2),

            _info[3].substr(0, 1),
            _info[3].substr(1, 2),
            _info[3].substr(3, 1),
            _info[3].substr(4, 2),

            _info[4].substr(0, 1),
            _info[4].substr(1, 2),
            _info[4].substr(3, 1),
            _info[4].substr(4, 2),

            _info[5].substr(0, 1),
            _info[5].substr(1, 2),
            _info[5].substr(3, 1),
            _info[5].substr(4, 2),
        ];
        return parseInt(_calday[n - 1]);
    },

    /**
     * 传入农历数字月份返回汉语通俗表示法
     * @param lunar month
     * @return Cn string
     * @eg:var cnMonth = calendar.toChinaMonth(12) ;//cnMonth='腊月'
     */
    toChinaMonth: function(m) { // 月 => \u6708
        if (m > 12 || m < 1) { return -1 } //若参数错误 返回-1
        var s = calendar.nStr3[m - 1];
        s += "\u6708"; //加上月字
        return s;
    },

    /**
     * 传入农历日期数字返回汉字表示法
     * @param lunar day
     * @return Cn string
     * @eg:var cnDay = calendar.toChinaDay(21) ;//cnMonth='廿一'
     */
    toChinaDay: function(d) { //日 => \u65e5
        var s;
        switch (d) {
            case 10:
                s = '\u521d\u5341';
                break;
            case 20:
                s = '\u4e8c\u5341';
                break;
                break;
            case 30:
                s = '\u4e09\u5341';
                break;
                break;
            default:
                s = calendar.nStr2[Math.floor(d / 10)];
                s += calendar.nStr1[d % 10];
        }
        return (s);
    },

    /**
     * 年份转生肖[!仅能大致转换] => 精确划分生肖分界线是“立春”
     * @param y year
     * @return Cn string
     * @eg:var animal = calendar.getAnimal(1987) ;//animal='兔'
     */
    getAnimal: function(y) {
        return calendar.Animals[(y - 4) % 12]
    },

    /**
     * 传入阳历年月日获得详细的公历、农历object信息 <=>JSON
     * @param y  solar year
     * @param m  solar month
     * @param d  solar day
     * @return JSON object
     * @eg:console.log(calendar.solar2lunar(1987,11,01));
     */
    solar2lunar: function(y, m, d) { //参数区间1900.1.31~2100.12.31
        if (y < 1900 || y > 2100) { return -1; } //年份限定、上限
        if (y == 1900 && m == 1 && d < 31) { return -1; } //下限
        if (!y) { //未传参  获得当天
            var objDate = new Date();
        } else {
            var objDate = new Date(y, parseInt(m) - 1, d)
        }
        var i, leap = 0,
            temp = 0;
        //修正ymd参数
        var y = objDate.getFullYear(),
            m = objDate.getMonth() + 1,
            d = objDate.getDate();
        var offset = (Date.UTC(objDate.getFullYear(), objDate.getMonth(), objDate.getDate()) - Date.UTC(1900, 0, 31)) / 86400000;
        for (i = 1900; i < 2101 && offset > 0; i++) {
            temp = calendar.lYearDays(i);
            offset -= temp;
        }
        if (offset < 0) {
            offset += temp;
            i--;
        }

        //是否今天
        var isTodayObj = new Date(),
            isToday = false;
        if (isTodayObj.getFullYear() == y && isTodayObj.getMonth() + 1 == m && isTodayObj.getDate() == d) {
            isToday = true;
        }
        //星期几
        var nWeek = objDate.getDay(),
            cWeek = calendar.nStr1[nWeek];
        if (nWeek == 0) { nWeek = 7; } //数字表示周几顺应天朝周一开始的惯例
        //农历年
        var year = i;

        var leap = calendar.leapMonth(i); //闰哪个月
        var isLeap = false;

        //效验闰月
        for (i = 1; i < 13 && offset > 0; i++) {
            //闰月
            if (leap > 0 && i == (leap + 1) && isLeap == false) {
                --i;
                isLeap = true;
                temp = calendar.leapDays(year); //计算农历闰月天数
            } else {
                temp = calendar.monthDays(year, i); //计算农历普通月天数
            }
            //解除闰月
            if (isLeap == true && i == (leap + 1)) { isLeap = false; }
            offset -= temp;
        }

        if (offset == 0 && leap > 0 && i == leap + 1)
            if (isLeap) {
                isLeap = false;
            } else {
                isLeap = true;
                --i;
            }
        if (offset < 0) { offset += temp;--i; }
        //农历月
        var month = i;
        //农历日
        var day = offset + 1;

        //天干地支处理
        var sm = m - 1;
        var gzY = calendar.toGanZhiYear(year);

        //月柱 1900年1月小寒以前为 丙子月(60进制12)
        var firstNode = calendar.getTerm(year, (m * 2 - 1)); //返回当月「节」为几日开始
        var secondNode = calendar.getTerm(year, (m * 2)); //返回当月「节」为几日开始

        //依据12节气修正干支月
        var gzM = calendar.toGanZhi((y - 1900) * 12 + m + 11);
        if (d >= firstNode) {
            gzM = calendar.toGanZhi((y - 1900) * 12 + m + 12);
        }

        //传入的日期的节气与否
        var isTerm = false;
        var Term = null;
        if (firstNode == d) {
            isTerm = true;
            Term = calendar.solarTerm[m * 2 - 2];
        }
        if (secondNode == d) {
            isTerm = true;
            Term = calendar.solarTerm[m * 2 - 1];
        }
        //日柱 当月一日与 1900/1/1 相差天数
        var dayCyclical = Date.UTC(y, sm, 1, 0, 0, 0, 0) / 86400000 + 25567 + 10;
        var gzD = calendar.toGanZhi(dayCyclical + d - 1);
        //该日期所属的星座
        var astro = calendar.toAstro(m, d);

        var TermPeriod = calendar.getTermPeriod(y, m, d);

        return { 'lYear': year, 'lMonth': month, 'lDay': day, 'Animal': calendar.getAnimal(year), 'IMonthCn': (isLeap ? "\u95f0" : '') + calendar.toChinaMonth(month), 'IDayCn': calendar.toChinaDay(day), 'cYear': y, 'cMonth': m, 'cDay': d, 'gzYear': gzY, 'gzMonth': gzM, 'gzDay': gzD, 'isToday': isToday, 'isLeap': isLeap, 'nWeek': nWeek, 'ncWeek': "\u661f\u671f" + cWeek, 'isTerm': isTerm, 'Term': Term, 'astro': astro, 'TermPeriod': TermPeriod };
    },

    /**
     * 传入农历年月日以及传入的月份是否闰月获得详细的公历、农历object信息 <=>JSON
     * @param y  lunar year
     * @param m  lunar month
     * @param d  lunar day
     * @param isLeapMonth  lunar month is leap or not.[如果是农历闰月第四个参数赋值true即可]
     * @return JSON object
     * @eg:console.log(calendar.lunar2solar(1987,9,10));
     */
    lunar2solar: function(y, m, d, isLeapMonth) { //参数区间1900.1.31~2100.12.1
        var isLeapMonth = !!isLeapMonth;
        var leapOffset = 0;
        var leapMonth = calendar.leapMonth(y);
        var leapDay = calendar.leapDays(y);
        if (isLeapMonth && (leapMonth != m)) { return -1; } //传参要求计算该闰月公历 但该年得出的闰月与传参的月份并不同
        if (y == 2100 && m == 12 && d > 1 || y == 1900 && m == 1 && d < 31) { return -1; } //超出了最大极限值 
        var day = calendar.monthDays(y, m);
        var _day = day;
        //bugFix 2016-9-25 
        //if month is leap, _day use leapDays method 
        if (isLeapMonth) {
            _day = calendar.leapDays(y, m);
        }
        if (y < 1900 || y > 2100 || d > _day) { return -1; } //参数合法性效验

        //计算农历的时间差
        var offset = 0;
        for (var i = 1900; i < y; i++) {
            offset += calendar.lYearDays(i);
        }
        var leap = 0,
            isAdd = false;
        for (var i = 1; i < m; i++) {
            leap = calendar.leapMonth(y);
            if (!isAdd) { //处理闰月
                if (leap <= i && leap > 0) {
                    offset += calendar.leapDays(y);
                    isAdd = true;
                }
            }
            offset += calendar.monthDays(y, i);
        }
        //转换闰月农历 需补充该年闰月的前一个月的时差
        if (isLeapMonth) { offset += day; }
        //1900年农历正月一日的公历时间为1900年1月30日0时0分0秒(该时间也是本农历的最开始起始点)
        var stmap = Date.UTC(1900, 1, 30, 0, 0, 0);
        var calObj = new Date((offset + d - 31) * 86400000 + stmap);
        var cY = calObj.getUTCFullYear();
        var cM = calObj.getUTCMonth() + 1;
        var cD = calObj.getUTCDate();

        return calendar.solar2lunar(cY, cM, cD);
    },

    /**
     * 获取当前日期属于哪个节气的时段
     */
    getTermPeriod: function(y, m, d) {
        //月柱 1900年1月小寒以前为 丙子月(60进制12)
        var firstNode = calendar.getTerm(y, (m * 2 - 1)); //返回当月「节」为几日开始
        var secondNode = calendar.getTerm(y, (m * 2)); //返回当月「节」为几日开始

        //传入的日期的节气与否
        var isTerm = false;
        var Term = null;

        if (d < firstNode) {
            TermPeriod = calendar.solarTerm[(m * 2 + 24 - 3) % 24];
        }

        if (d >= firstNode) {
            TermPeriod = calendar.solarTerm[m * 2 - 2];
        }
        if (d >= secondNode) {
            TermPeriod = calendar.solarTerm[m * 2 - 1];
        }

        return TermPeriod;

    }
};

module.exports = FiveSix;