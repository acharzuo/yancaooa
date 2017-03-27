var log = require('../../utils/log'); //引进日志
var meridians = require('./meridians'); // 经络基本信息


var dataSample = {
    value: 0, // 经络测试原值
    determineValue: 0, // 经络测试虚实值
    percentValue: 0, // 按照百分比计算的值
    determineLabel: "正常", // 虚实判断结果文本
    balanceValue: 0, // 平衡值
    isBalance: false // 是否平衡判断
};


// "_id" : ObjectId("58621fcd68563c4da8ab2cd9"),
// "parentId" : "5861da903385b43270ea6edb",
// "largeIntestine": [[5,8,3,8,7],[4,7,5,3,8]],
// "lung": [[6,8,3,2,5],[6,8,0,4,2]]
var method = function(data) {
    // 从前台获取的原始数据
    // console.log(JSON.stringify(data));

    // 在这里进行算法处理
    if (data.length !== 24) {
        console.error("输入的数据不是24条经络的值！");
        return null;
    }
    /*
        结果：
        { data:[
          0: [value: , determineValue, determineLabel:, balanceValue:, percentValue, isBalance: true/false]
         ]
         footsAvg:
         handsAvg;
         }

    */
    // 给数据加经络ID
    for (var i = 0; i < data.length; i++) {
        data[i].meridianId = i;
    }

    var result = midValue(data);
    // 测试期间先返回一个固定的值
    /* var result = {

         pairedValue: "[0]",     //匹配报告用的数值
         datas: {key: "0"}       // 测试用的值，key=0


     }; */
    // 整理关键Key，生成结果串
    var maxId = 0;
    var max = 0;
    var pairedValueKey = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    for (var i = 0; i < result.data.length; i++) {
        if (Math.abs(result.data[i].determineValue) > Math.abs(max)) {
            max = result.data[i].determineValue;
            maxId = i;
        }
    }

    // 生成pairedValue对
    pairedValueKey[maxId] = max > 0 ? 1 : -1;

    result.tempData = result.data.concat();

    console.log(result);

    // 根据determineValue进行降序排列
    var sortedResult = [];
    var maxValue = 0;
    var maxValueJ = 0;

    for (var i = 0; i < 24; i++) {
        maxValue = result.tempData[0].percentValue;
        maxValueJ = 0;
        for (var j = 0; j < result.tempData.length; j++) {
            if (result.tempData[j].percentValue > maxValue) {
                maxValue = result.tempData[j].percentValue;
                maxValueJ = j;
            }
        }
        sortedResult.push(result.tempData[maxValueJ]);
        result.tempData.splice(maxValueJ, 1);

    }
    result.sortedData = sortedResult.concat();
    result.tempData = undefined;
    // console.log(JSON.stringify(sortedResult));


    // 按照经络归一化值离0点的远近排序。 也就是说以绝对值排序
    var sortedResult2 = [];
    var maxValue2 = 0;
    var maxValueJ2 = 0;

    for (var i = 0; i < 24; i++) {
        maxValue2 = Math.abs(sortedResult[0].percentValue);
        maxValueJ2 = 0;

        for (var j = 0; j < sortedResult.length; j++) {
            // console.log(i, j, maxValue2, maxValueJ2, sortedResult[j].percentValue);

            if (Math.abs(sortedResult[j].percentValue) > maxValue2) {
                maxValue2 = Math.abs(sortedResult[j].percentValue);
                maxValueJ2 = j;
            }
        }
        sortedResult2.push(sortedResult[maxValueJ2]);
        sortedResult.splice(maxValueJ2, 1);

    }
    console.log("取最大两条");
    // console.log(JSON.stringify(sortedResult2));

    // 最大的两条病理性的经络
    var pairedValues = [];
    var tempKey = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    tempKey[sortedResult2[0].meridianId] = sortedResult2[0].percentValue > 0 ? 1 : -1;
    pairedValues[0] = JSON.stringify(tempKey);
    tempKey = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    tempKey[sortedResult2[1].meridianId] = sortedResult2[1].percentValue > 0 ? 1 : -1;
    pairedValues[1] = JSON.stringify(tempKey);

    console.log("LLALLALA", [sortedResult2[0].meridianId, sortedResult2[1].meridianId]);

    return {
        pairedValue: JSON.stringify(pairedValueKey),
        pairedValues: pairedValues,
        pariedNames: [sortedResult2[0].meridianId, sortedResult2[1].meridianId],
        datas: result
    };

};




// 从原始数据计算出结论数据
// 输入：24组*n个点的数据
// 输出：24组的虚实、不平衡数据
function midValue(data) {

    var result = {
        data: [], // 返回的经络数据
        footsAverage: 0, // 脚部平均值
        handsAverage: 0, // 手部平均值
        levelStage: 0.375 // 判断区分常量
    };


    /*
     算法说明：

     value             BalanceValue[] / 平衡度
     ...|
        |       __------------- U1  / determineValue[] / 虚实
     30 |      /
        |     |
     5  |    _/
        |   /    areaValue[] / 寒热
     3  | _/
        |/
     ---+------------------------ Times
        |  1    3   10   50 ....

     */


    var avgHands = 0; // 手三阴三阳平均值
    var avgFoots = 0; // 足三阴三阳平均值

    // 24经络标准值U1
    var determineValue = determineValueHandle(data, 5);
    for (var i = 0; i < determineValue.length; i++) {
        result.data[i] = {};
        result.data[i].meridianId = i;
        result.data[i].value = determineValue[i];
    }

    // 计算手6*2经和脚6*2经的平均值
    for (var i = 0; i < determineValue.length; i++) {
        if (meridians.getItem(i).isHand) {
            avgHands += determineValue[i];
        } else {
            avgFoots += determineValue[i];
        }
    }

    // 手足的平均值
    avgHands = Math.round(avgHands / 12);
    avgFoots = Math.round(avgFoots / 12);


    result.footsAverage = avgFoots;
    result.handsAverage = avgHands;

    // 计算各经络的相对于平均值的虚实值

    /**
     虚实计算

     -2病理实症  |  -1生理实症| 1生理虚症   |2病理虚症
     |<-------->|<-------->|<-------->|<------...
     0          |         avg         |       ~
     avg*(1-0.375)            avg*(1+0.375)


     levelStageNumber = 0.375

     0.625 = 1 - 0.375
     **/

    // 虚实判断的区分标志常量
    var levelStageNumber = 0.375;
    result.levelStage = 0.375;

    // 计算虚实值
    for (var i = 0; i < determineValue.length; i++) {
        var tmpValue = 0;
        var tmpLevel = "";

        tmpValue = determineValue[i] - (meridians.getItem(i).isHand ? avgHands : avgFoots); // 基于平均值的相对值
        tmpLevel = (Math.abs(tmpValue) <= ((meridians.getItem(i).isHand ? avgHands : avgFoots) * levelStageNumber)) ? (tmpValue === 0 ? "" : "生理") : "病理";
        tmpLevel += (tmpValue === 0 ? "正常" : (tmpValue > 0 ? "实症" : "虚症"));

        result.data[i].determineValue = tmpValue;
        result.data[i].determineLabel = tmpLevel;

        // 归一化处理 
        result.data[i].percentValue = tmpValue / (meridians.getItem(i).isHand ? avgHands : avgFoots) * 100;
    }


    /**
     左右失衡的计算
     失衡值 = | 左U1 - 右U1 |
     失衡度 = | 左U1 - 右U1 | / (0.375 * 均值)  * 100%
     **/
    var balanceValue = [];
    for (var i = 0; i < determineValue.length; i++) {
        var leftIndex = i; // 左侧经络基于lastValue的下标值, 取完手部的取脚部，跳过手部对称部位的对比
        var rightIndex = meridians.getItem(leftIndex).pairId; // 右侧经络基于lastValue的下标值
        var tmpLevelName = "";
        // 计算失衡度
        var tmp = Math.abs(determineValue[leftIndex] - determineValue[rightIndex]);
        tmpLevelName = tmp <= ((meridians.getItem(i).isHand ? avgHands : avgFoots) * levelStageNumber) ? true : false;

        result.data[leftIndex].balanceValue = tmp;
        result.data[leftIndex].balancePercentValue = Math.round(tmp / (meridians.getItem(leftIndex).isHand ? avgHands : avgFoots) * 100);;
        result.data[leftIndex].isBalance = tmpLevelName;
    }

    // console.log("result:", result);
    return result;
}

// 最后数据的平均值作为经络的最终值，count为参考的数据点数，默认为最后三十个。
function determineValueHandle(data, count) {
    // 最终返回数据集
    var result = [];
    if (count <= 0) { count = 1; }

    // 循环每一条数据
    for (var i = 0; i < data.length; i++) {
        var temp = 0;

        // 循环将最后第count个数据加在一起
        for (var j = data[i].length - count; j < data[i].length; j++) {
            temp += data[i][j];
        }
        // 计算所有加数的平均值，并保存到返回数据中
        result.push(Math.round(temp / count));

    }
    return result;
}

module.exports = method;