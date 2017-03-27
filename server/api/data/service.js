var log = require('../../utils/log'); //引进日志

// "_id" : ObjectId("58621fcd68563c4da8ab2cd9"),
// "parentId" : "5861da903385b43270ea6edb",
// "largeIntestine": [[5,8,3,8,7],[4,7,5,3,8]],
// "lung": [[6,8,3,2,5],[6,8,0,4,2]]

//需要生成的样式
// [{
//     'name':'小肠经',
//     'leftVal':22,
//     'rightVal':77,
//     'differenceVal':55,
//     'normalVal':'11~40',
//     'status':"平衡",
//     'DL':25,
//     'DR':68
// }]

var method = exports.method = function (data){
    var mean = 0; //整体的平均值
    var arr = []; //保存左右差值
    var obj = {};   //保存处理后的值
    var arrL = []; //保存D(L)值
    var arrR = []; //保存D(R)值
    var pairedValue = ""; //根据arrL和arrR的值,经过算法,拼接成字符串
    var conclusion = ""; //数据结论
    //处理原始值，
    (function(){
        var num = 0;  //公用数
        for(var k in data){ //遍历原始数据中属性值
            // console.log(data[k]);
            if (Array.isArray(data[k])) {
                for (var i = 0; i < data[k].length; i++) {//得到每一组数据
                    // console.log(data[k][i]);
                    for (var j = 0; j < data[k][i].length; j++) {//求每一组数据之和
                        num = num + data[k][i][j];
                    }
                    num = (num/data[k][i].length).toFixed(1);//求平均值保留一位小数
                    data[k][i].length = 0;
                    data[k][i] = num;
                    num = 0;//清零
                }
                // console.log(data[k]);
                obj[k] = data[k];  // 把处理后的值赋给obj,
            }
        }
        return obj;
    }());
    // console.log(obj);


    //求差值
    var num = 0;
    for (var k in obj) {
        // console.log(obj[k]);
        for (var i = 0; i < obj[k].length; i++) {
            num = num + parseFloat(obj[k][i]);//转换成数字相加
        }
    }
    mean = (num/24).toFixed(1);//获取平均值

    for(var k in obj){
        arr.push(Math.abs(obj[k][0]-obj[k][1]).toFixed(1));//左右差的绝对值
        arrL.push(Math.round(obj[k][0]-mean));  //D(L)值
        arrR.push(Math.round(obj[k][1]-mean));  //D(R)值
    }

    //根据差值得到数据结论
    var newArr = [arrL,arrR];
    for (var i = 0; i < newArr.length; i++) {
        for (var j = 0; j < newArr[i].length; j++) {
            if (parseFloat(newArr[i][j]) > -50 && parseFloat(newArr[i][j])<= 50 ) {
                pairedValue = pairedValue + 1;
            }else if (parseFloat(newArr[i][j]) > 50) {
                pairedValue = pairedValue + 2;
            }else if (parseFloat(newArr[i][j]) < -50) {
                pairedValue = pairedValue + 3;
            }
        }
    }
    console.log(pairedValue);

    //返回结果
    var result = {
        data :obj,  //左右值
        difference: arr, //左右差的绝对值
        DL: arrL, //D(L)值
        DR: arrR, //D(R)值
        pairedValue: pairedValue   //匹配数值
    };
    return result;
};

// module.exports = method;
