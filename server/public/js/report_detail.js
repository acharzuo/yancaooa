//获取生辰
function formatDate(now) {
    var now = new Date(date);
    var year = now.getFullYear();
    var month = now.getMonth() + 1;
    var date = now.getDate();
    var hour = now.getHours();
    return year + "-" + month + "-" + date + "  " + hour + "时";
}

//获取 查询字符串 数据
function GetQueryString(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return unescape(r[2]);
    return null;
}

apiready = function() {


    var mathNumber;

    //加载报告详情页面
    // var id = GetQueryString("id");
    var id = window.location.href.split('reportId=')[1];
    //var id = '58ae8ec06acef03b90d9c668';
    console.log('诊断报告id：' + id);
    apiAjax('/api/app/diagnostic-records/' + id, "GET", null, function(ret, err) {
        console.log('诊断报告详细内容：' + JSON.stringify(ret));
        if (ret.code == 0) {
            mathNumber = ret.result.mathNumber;
            var plan = ret.result.report.plan;
            if (plan) {
                $('#disease').children('strong').html(plan.disease);
                $('#emotion').children('strong').html(plan.emotion);
                $('#character').children('strong').html(plan.character);
                $('#treatment').children('strong').html(plan.treatPlan);
                $('#healthPlan').children('strong').html(plan.healthPlan);
                $('#dietPlan').children('strong').html(plan.dietPlan);
            }
            var date = new Date(ret.result.birthday);
            var year = date.getFullYear();
            var nowYear = new Date().getFullYear();
            var age = parseInt(nowYear) - parseInt(year);
            $('#userName').children('strong').html(ret.result.name);
            $('#userAge').children('strong').html(age);
            $('#userBir').children('strong').html(switchTime(ret.result.birthday));
            //TODO 经络检测图
            var result = ret.result.result.datas.data;
            var percentValue = ret.result.result.datas.data.percentValue;
            // alert(JSON.stringify(ret.result.result.datas.data));
            //虚实
            drawBase("canvas1");
            drawSheet("canvas1", result, percentValue);
            //平衡
            drawBase("canvas3");
            drawBalance("canvas3", result);
            //寒热
            drawBase("canvas2");
        }

    });

    //点击发送到手机
    $("#send").on("click", function() {
        $("#write").show();
        $("#mask").show();
        $(this).parents(".editBox").hide();
    });
    //点击取消
    $("#write .quxiao").on("click", function() {
        $("#write").hide();
        $("#mask").hide();
        $("#write input").val("");
        $("#write i").css("color", "#fff");

    });
    //点击发送
    $("#write .fasong").on("click", function() {

        var phone = $("#write input").val();
        //验证手机号
        if (!(/^1[34578]\d{9}$/.test(phone))) {
            $("#write i").css("color", "#f00");
            return false;
        }
        //如果手机验证通过
        $("#write").hide();
        $("#mask").hide();
        var data = {
            "tel": phone,
            "content": mathNumber
        };
        apiAjax('/api/app/messages', "post", data, function(ret, err) {
            if (ret.code === 0) {
                // alert(JSON.stringify(ret.result));
                alert("发送成功！");
            }
        });
    });

};



//画图表
function drawBase(id) {
    var canvas = document.getElementById(id);
    if (canvas == null) return false;
    var ctx = canvas.getContext('2d'); //获取2d上下文
    //画直线
    ctx.strokeStyle = "#00b686";
    ctx.fillStyle = "#00b686";
    ctx.lineWidth = 1; //图形边框宽度
    //画中间水平线M
    ctx.beginPath(); //创建路径
    ctx.moveTo(0, 200);
    ctx.lineTo(624, 200);
    ctx.closePath(); //结束路径
    ctx.stroke(); //描绘
    ctx.fill(); //填充
    //画栅格
    ctx.strokeStyle = "#ccc";
    ctx.beginPath();
    for (var i = 1; i < 24; i++) {
        ctx.moveTo(26 * i, 0);
        ctx.lineTo(26 * i, 600);
    }
    ctx.closePath();
    ctx.stroke();
    //H1 and L1
    ctx.strokeStyle = "#57b6f8";
    ctx.beginPath();
    ctx.moveTo(0, 125);
    ctx.lineTo(624, 125);
    ctx.moveTo(0, 275);
    ctx.lineTo(624, 275);
    ctx.closePath();
    ctx.stroke();
}

function drawSheet(id, data, percentValue) { //data是各经络值
    //h画柱状图
    var canvas = document.getElementById(id);
    if (canvas == null) return false;
    var ctx = canvas.getContext('2d'); //获取2d上下文
    for (var i = 0; i < 6; i++) {
        if (Math.abs(data[i].percentValue) <= 37.5) {
            ctx.fillStyle = "#c6fff0";
        } else {
            ctx.fillStyle = "#ffc7ae";
        }
        ctx.fillRect((52 * i + 27), 201, 18, Math.abs(data[i].percentValue * 2));

        if (data[i + 6].percentValue <= 37.5) {
            ctx.fillStyle = "#00b686";
        } else {
            ctx.fillStyle = "#f78756";
        }
        ctx.fillRect((52 * i + 7), (199 - data[i + 6].percentValue * 2), 18, (data[i + 6].percentValue * 2));

        ctx.fillStyle = "black";
        ctx.font = "20px Arial";
        ctx.fillText(data[i + 6].percentValue, (52 * i + 5), (196 - data[i + 6].percentValue * 2));
        ctx.fillText(data[i].percentValue, (52 * i + 20), 223 + Math.abs(data[i].percentValue * 2));
    }
    for (var j = 12; j < 18; j++) {
        if (Math.abs(data[j].percentValue) <= 37.5) {
            ctx.fillStyle = "#c6fff0";
        } else {
            ctx.fillStyle = "#ffc7ae";
        }
        ctx.fillRect((52 * (j - 6) + 27), 201, 18, Math.abs(data[j].percentValue * 2));

        if (data[j + 6].percentValue <= 37.5) {
            ctx.fillStyle = "#00b686";
        } else {
            ctx.fillStyle = "#f78756";
        }
        ctx.fillRect((52 * (j - 6) + 7), (199 - data[j + 6].percentValue * 2), 18, (data[j + 6].percentValue * 2));

        ctx.fillStyle = "black";
        ctx.font = "20px Arial";
        ctx.fillText(data[j + 6].percentValue, (52 * (j - 6) + 5), (196 - data[j + 6].percentValue * 2));
        ctx.fillText(data[j].percentValue, (52 * (j - 6) + 23), 223 + Math.abs(data[j].percentValue * 2));
    }

}

function drawBalance(id, data) { //data是平衡值
    //对比图
    var canvas = document.getElementById(id);
    if (canvas == null) return false;
    var ctx = canvas.getContext('2d'); //获取2d上下文    
    // drawBase(ctx,id);
    //h画柱状图
    for (var i = 0; i < 6; i++) {
        if (data[i].balancePercentValue <= 37.5) {
            ctx.fillStyle = "#00b686";
        } else {
            ctx.fillStyle = "#f78756";
        }
        ctx.fillRect((52 * i + 17), (199 - data[i].balancePercentValue * 2), 18, data[i].balancePercentValue * 2);
        ctx.fillStyle = "black";
        ctx.font = "20px Arial";
        ctx.fillText(data[i].balancePercentValue, (52 * i + 15), (196 - data[i].balancePercentValue * 2));
    }

    for (var i = 12; i < 18; i++) {
        if (data[i].balancePercentValue <= 37.5) {
            ctx.fillStyle = "#00b686";
        } else {
            ctx.fillStyle = "#f78756";
        }
        ctx.fillRect((52 * (i - 6) + 17), (199 - data[i].balancePercentValue * 2), 18, data[i].balancePercentValue * 2);
        ctx.fillStyle = "black";
        ctx.font = "20px Arial";
        ctx.fillText(data[i].balancePercentValue, (52 * (i - 6) + 15), (196 - data[i].balancePercentValue * 2));
    }

}