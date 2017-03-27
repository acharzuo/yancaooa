/**
 * Created by achar on 2017/1/5.
 */

'use strict'

// 24经络基本信息
var meridians = {
    size: 24,
    L0: {
        id: 0, // 编号
        title: "左侧-手太阴肺经-太渊穴", // 标题
        meridianName: "手太阴肺经", // 经络名称
        acupointName: "太渊穴", // 穴位名称
        meridianCode: "LU", // 经络编码
        acupointCode: "LU9", // 穴位编码
        isLeft: 1, // 是否左边
        isHand: 1, // 是否手部经络
        pairId: 6, // 左右成对出现，对应的经络的ID
        description: "左侧-手太阴肺经-太渊穴", // 经络描述
        route: "在掌侧腕横纹桡侧，桡动脉搏动处。仰掌，于腕横纹上，桡动脉桡侧凹陷处取之", // 取穴方法
        meridianImage: "1-2.png", // 全身图片
        acupointImage: "1-1.png" // 局部图片
    },
    L1: {
        id: 1,
        title: "左侧-手厥阴心包经-大陵穴",
        meridianName: "手厥阴心包经",
        acupointName: "大陵穴",
        meridianCode: "PC",
        acupointCode: "PC7",
        isLeft: 1,
        isHand: 1,
        pairId: 7,
        description: "左侧-手厥阴心包经-大陵穴",
        route: "在腕掌横纹的中点处，当掌长肌与桡侧腕屈肌腱之间，仰掌取之",
        meridianImage: "2-2.png",
        acupointImage: "2-1.png"
    },
    L2: {
        id: 2,
        title: "左侧-手少阴心经-神门穴",
        meridianName: "手少阴心经",
        acupointName: "神门穴",
        meridianCode: "HT",
        acupointCode: "HT7",
        isLeft: 1,
        isHand: 1,
        pairId: 8,
        description: "左侧-手少阴心经-神门穴",
        route: "在腕部，腕掌侧横纹尺侧端，尺侧腕屈肌腱的桡侧凹陷处，仰掌，豌豆骨桡侧缘取之",
        meridianImage: "3-2.png",
        acupointImage: "3-1.png"
    },
    L3: {
        id: 3,
        title: "左侧-手阳明大肠经-合谷穴",
        meridianName: "手阳明大肠经",
        acupointName: "合谷穴",
        meridianCode: "LI",
        acupointCode: "LI4",
        isLeft: 1,
        isHand: 1,
        pairId: 9,
        description: "左侧-手阳明大肠经-合谷穴",
        route: "在手背，第一，二掌骨间，当第二掌骨桡侧的中点处取之",
        meridianImage: "4-2.png",
        acupointImage: "4-1.png"
    },
    L4: {
        id: 4,
        title: "左侧-手少阳三焦经-阳池穴",
        meridianName: "手少阳三焦经",
        acupointName: "阳池穴",
        meridianCode: "SJ",
        acupointCode: "SJ4",
        isLeft: 1,
        isHand: 1,
        pairId: 10,
        description: "左侧-手少阳三焦经-阳池穴",
        route: "在腕被横纹中，当指伸肌腱尺侧缘凹陷处，俯掌取之。",
        meridianImage: "5-2.png",
        acupointImage: "5-1.png"
    },
    L5: {
        id: 5,
        title: "左侧-手太阳小肠经-腕谷穴",
        meridianName: "手太阳小肠经",
        acupointName: "腕谷穴",
        meridianCode: "SI",
        acupointCode: "SI4",
        isLeft: 1,
        isHand: 1,
        pairId: 11,
        description: "左侧-手太阳小肠经-腕谷穴",
        route: "在手掌尺侧，当第五掌骨基底与钩骨之间凹陷处，赤白肉际。",
        meridianImage: "6-2.png",
        acupointImage: "6-1.png"
    },
    L6: {
        id: 6,
        title: "右侧-手太阴肺经-太渊穴",
        meridianName: "手太阴肺经",
        acupointName: "太渊穴",
        meridianCode: "LU",
        acupointCode: "LU9",
        ifLeft: 0,
        isHand: 1,
        pairId: 0,
        description: "右侧-手太阴肺经-太渊穴",
        route: "在掌侧腕横纹桡侧，桡动脉搏动处。仰掌，于腕横纹上，桡动脉桡侧凹陷处取之",
        meridianImage: "7-2.png",
        acupointImage: "7-1.png"
    },
    L7: {
        id: 7,
        title: "右侧-手厥阴心包经-大陵穴",
        meridianName: "手厥阴心包经",
        acupointName: "大陵穴",
        meridianCode: "PC",
        acupointCode: "PC7",
        isLeft: 0,
        isHand: 1,
        pairId: 1,
        description: "右侧-手厥阴心包经-大陵穴",
        route: "在腕掌横纹的中点处，当掌长肌与桡侧腕屈肌腱之间，仰掌取之",
        meridianImage: "8-2.png",
        acupointImage: "8-1.png"
    },
    L8: {
        id: 8,
        title: "右侧-手少阴心经-神门穴",
        meridianName: "手少阴心经",
        acupointName: "神门穴",
        meridianCode: "HT",
        acupointCode: "HT7",
        isLeft: 0,
        isHand: 1,
        pairId: 2,
        description: "右侧-手少阴心经-神门穴",
        route: "在腕部，腕掌侧横纹尺侧端，尺侧腕屈肌腱的桡侧凹陷处，仰掌，豌豆骨桡侧缘取之",
        meridianImage: "9-2.png",
        acupointImage: "9-1.png"
    },
    L9: {
        id: 9,
        title: "右侧-手阳明大肠经-合谷穴",
        meridianName: "手阳明大肠经",
        acupointName: "合谷穴",
        meridianCode: "LI",
        acupointCode: "LI4",
        isLeft: 0,
        isHand: 1,
        pairId: 3,
        description: "右侧-手阳明大肠经-合谷穴",
        route: "在手背，第一，二掌骨间，当第二掌骨桡侧的中点处取之",
        meridianImage: "10-2.png",
        acupointImage: "10-1.png"
    },
    L10: {
        id: 10,
        title: "右侧-手少阳三焦经-阳池穴",
        meridianName: "手少阳三焦经",
        acupointName: "阳池穴",
        meridianCode: "SJ",
        acupointCode: "SJ4",
        isLeft: 0,
        isHand: 1,
        pairId: 4,
        description: "右侧-手少阳三焦经-阳池穴",
        route: "在腕被横纹中，当指伸肌腱尺侧缘凹陷处，俯掌取之。",
        meridianImage: "11-2.png",
        acupointImage: "11-1.png"
    },
    L11: {
        id: 11,
        title: "右侧-手太阳小肠经-腕谷穴",
        meridianName: "手太阳小肠经",
        acupointName: "腕谷穴",
        meridianCode: "SI",
        acupointCode: "SI4",
        isLeft: 0,
        isHand: 1,
        pairId: 5,
        description: "右侧-手太阳小肠经-腕谷穴",
        route: "在手掌尺侧，当第五掌骨基底与钩骨之间凹陷处，赤白肉际。",
        meridianImage: "12-2.png",
        acupointImage: "12-1.png",
    },
    L12: {
        id: 12,
        title: "左侧-足太阴脾经-太白穴",
        meridianName: "足太阴脾经",
        acupointName: "太白穴",
        meridianCode: "SP",
        acupointCode: "SP3",
        isLeft: 1,
        isHand: 0,
        pairId: 18,
        description: "左侧-足太阴脾经-太白穴",
        route: "在足内侧，当足大趾关节后下放赤白肉际处",
        meridianImage: "13-2.png",
        acupointImage: "13-1.png"
    },
    L13: {
        id: 13,
        title: "左侧-足厥阴肝经-太冲穴",
        meridianName: "足厥阴肝经",
        acupointName: "太冲穴",
        meridianCode: "LR",
        acupointCode: "LR3",
        isLeft: 1,
        isHand: 0,
        pairId: 19,
        description: "左侧-足厥阴肝经-太冲穴",
        route: "在足背部，当第一跖骨间隙的后方凹陷处，正坐或仰卧取之。",
        meridianImage: "14-2.png",
        acupointImage: "14-1.png"
    },
    L14: {
        id: 14,
        title: "左侧-足少阴肾经-太溪穴",
        meridianName: "足少阴肾经",
        acupointName: "太溪穴",
        meridianCode: "KI",
        acupointCode: "KI3",
        isLeft: 1,
        isHand: 0,
        pairId: 20,
        description: "左侧-足少阴肾经-太溪穴",
        route: "在足内侧，内踝后方，当内踝尖马跟腱之间的凹陷处。正坐或仰卧取之。",
        meridianImage: "15-2.png",
        acupointImage: "15-1.png"
    },
    L15: {
        id: 15,
        title: "左侧-足阳明胃经-冲阳穴",
        meridianName: "足阳明胃经",
        acupointName: "冲阳穴",
        meridianCode: "ST",
        acupointCode: "ST42",
        isLeft: 1,
        isHand: 0,
        pairId: 21,
        description: "左侧-足阳明胃经-冲阳穴",
        route: "在足背最高处，当拇长伸肌腱与趾长伸肌腱之间，足背动脉搏动处。",
        meridianImage: "16-2.png",
        acupointImage: "16-1.png"
    },
    L16: {
        id: 16,
        title: "左侧-足少阳胆经-丘墟穴",
        meridianName: "足少阳胆经",
        acupointName: "丘墟穴",
        meridianCode: "GB",
        acupointCode: "GB40",
        isLeft: 1,
        isHand: 0,
        pairId: 22,
        description: "左侧-足少阳胆经-丘墟穴",
        route: "在足外踝的前下方，当趾长伸肌腱的外侧凹陷处。正坐垂足或侧卧取之。",
        meridianImage: "17-2.png",
        acupointImage: "17-1.png"
    },
    L17: {
        id: 17,
        title: "左侧-足太阳膀胱经-京骨穴",
        meridianName: "足太阳膀胱经",
        acupointName: "京骨穴",
        meridianCode: "BL",
        acupointCode: "BL64",
        isLeft: 1,
        isHand: 0,
        pairId: 23,
        description: "左侧-足太阳膀胱经-京骨穴",
        route: "在足外侧，第五趾骨粗隆下方，赤白肉际处。",
        meridianImage: "18-2.png",
        acupointImage: "18-1.png"
    },
    L18: {
        id: 18,
        title: "右侧-足太阴脾经-太白穴",
        meridianName: "足太阴脾经",
        acupointName: "太白穴",
        meridianCode: "SP",
        acupointCode: "SP3",
        isLeft: 0,
        isHand: 0,
        pairId: 12,
        description: "右侧-足太阴脾经-太白穴",
        route: "在足内侧缘，当足大趾关节后下方赤白肉际处。",
        meridianImage: "19-2.png",
        acupointImage: "19-1.png"
    },
    L19: {
        id: 19,
        title: "右侧-足厥阴肝经-太冲穴",
        meridianName: "足厥阴肝经",
        acupointName: "太冲穴",
        meridianCode: "LR",
        acupointCode: "LR3",
        isLeft: 0,
        isHand: 0,
        pairId: 13,
        description: "右侧-足厥阴肝经-太冲穴",
        route: "在足背部，当第一跖骨间隙的后方凹陷处，正坐或仰卧取之。",
        meridianImage: "20-2.png",
        acupointImage: "20-1.png"
    },
    L20: {
        id: 20,
        title: "右侧-足少阴肾经-太溪穴",
        meridianName: "足少阴肾经",
        acupointName: "太溪穴",
        meridianCode: "KI",
        acupointCode: "KI3",
        isLeft: 0,
        isHand: 0,
        pairId: 14,
        description: "右侧-足少阴肾经-太溪穴",
        route: "在足内侧，内踝后方，当内踝尖马跟腱之间的凹陷处。正坐或仰卧取之。",
        meridianImage: "21-2.png",
        acupointImage: "21-1.png"
    },
    L21: {
        id: 21,
        title: "右侧-足阳明胃经-冲阳穴",
        meridianName: "足阳明胃经",
        acupointName: "冲阳穴",
        meridianCode: "ST",
        acupointCode: "ST42",
        isLeft: 0,
        isHand: 0,
        pairId: 15,
        description: "右侧-足阳明胃经-冲阳穴",
        route: "在足背最高处，当拇长伸肌腱与趾长伸肌腱之间，足背动脉搏动处。",
        meridianImage: "22-2.png",
        acupointImage: "22-1.png"
    },
    L22: {
        id: 22,
        title: "右侧-足少阳胆经-丘墟穴",
        meridianName: "足少阳胆经",
        acupointName: "丘墟穴",
        meridianCode: "GB",
        acupointCode: "GB40",
        isLeft: 0,
        isHand: 0,
        pairId: 16,
        description: "右侧-足少阳胆经-丘墟穴",
        route: "在足外踝的前下方，当趾长伸肌腱的外侧凹陷处。正坐垂足或侧卧取之。",
        meridianImage: "23-2.png",
        acupointImage: "23-1.png"
    },
    L23: {
        id: 23,
        title: "右侧-足太阳膀胱经-京骨穴",
        meridianName: "足太阳膀胱经",
        acupointName: "京骨穴",
        meridianCode: "BL",
        acupointCode: "BL64",
        isLeft: 0,
        isHand: 0,
        pairId: 17,
        description: "右侧-足太阳膀胱经-京骨穴",
        route: "在足外侧，第五趾骨粗隆下方，赤白肉际处。",
        meridianImage: "24-2.png",
        acupointImage: "24-1.png"
    }
};



var f = function() {
    this.m = meridians;
}

// 获取指定经络编号的经络，经络编号为0~23
f.prototype.getItem = function(index) {
    return this.m["L" + index];
}

// 获取指定ID的经络对称经络（指定左边的获取右边的经络，指定右边的获取左边的经络）
f.prototype.getPairItem = function(index) {
    return this.getItem(this.getItem(index).pairId);
}

var MERIDIANS = new f();

if (module && module.exports) {
    module.exports = MERIDIANS;
}