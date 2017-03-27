var async = require("async");
var config = require("./config");
/*
封装的增删改查方法
*/
function Action (Model){

    this.model = Model;
}

Action.prototype.getPageNationQueryList = function(obj,callback){
    var page = obj.page,
        query = obj.query,
        count = parseInt(obj.count)||10,
        m = this.model;
    if(!page)page = 1;
    async.waterfall([
        function(cb){
            var mc = query?m.find(query):m.find();
            if(obj.share){
                mc.where("isShare",true); //公开的才能显示 请勿删除
            }
            if(obj.user){
                mc.where("userId",obj.user);
            }
            if(obj.type){
                mc.where("type",obj.type);
            }
            if(obj.isCollect){
                var isc = obj.isCollect=="true"?true:false;
                if(isc){
                    mc.where("collector",{$elemMatch:{"_id":obj.req.session.user._id}});
                }else{
                    mc.or([{"collector":{$size:0}},{"collector":{$elemMatch:{"_id":{$ne:obj.req.session.user._id}}}}]);
                }
            }
            if(obj.isShare){
                var iss = obj.isShare=="true"?true:false;
                mc.where("isShare",iss);
            }
            if(obj.isGood){
                var iss = obj.isGood=="true"?true:false;
                mc.where("isGood",iss);
            }
            if(obj.isTemplate){
                var iss = obj.isTemplate=="true"?true:false;
                mc.where("isTemplate",iss);
            }
            if(obj.tag){
                // mc.where("label").elemMatch(function(elem) {
                //    elem.where('name',{$in:obj.tag.split(",")});
                // });
                mc.where("label",{$elemMatch: {$in: obj.tag.split(",")}});
            }
            mc.count(query).exec(function(err,total){
                cb(err,total);
            });
        },
        function(total,cb){
            var q = query?m.find(query):m.find();
            if(obj.share){
                q.where("isShare",true); //公开的才能显示
            }
            if(obj.user){
                q.where("userId",obj.user);
            }
            if(obj.type){
                q.where("type",obj.type);
            }
            if(obj.isCollect){
                var isc = obj.isCollect=="true"?true:false;
                if(isc){
                    q.where("collector",{$elemMatch:{"_id":obj.req.session.user._id}});
                }else{
                    console.log("ininininhahahah");
                    q.or([{"collector":{$size:0}},{"collector":{$elemMatch:{"_id":{$ne:obj.req.session.user._id}}}}]);
                }
            }
            if(obj.isShare){
                var iss = obj.isShare=="true"?true:false;
                q.where("isShare",iss);
            }
            if(obj.isGood){
                var iss = obj.isGood=="true"?true:false;
                q.where("isGood",iss);
            }
            if(obj.isTemplate){
                var iss = obj.isTemplate=="true"?true:false;
                q.where("isTemplate",iss);
            }
            if(obj.tag){
                // q.where("label").elemMatch(function(elem) {
                //    elem.where('name',{$in:obj.tag.split(",")});
                // });
                q.where("label",{$elemMatch: {$in: obj.tag.split(",")}});
            }
            q.skip((parseInt(page)-1)*count);
            q.limit(count);
            if(obj.sortBy){
                var srb = {};
                if(obj.sort=="up"){
                    srb[obj.sortBy] = 1;
                    q.sort(srb);
                }else{
                    srb[obj.sortBy] = -1;
                    q.sort(srb);
                }

            }else{
                q.sort({'createdAt':-1});
            }
            // q.sort({'time':-1});
            q.exec(function(err,list){
                cb(err,list,total);
            });
        }
    ],function(err,list,total){
        err?callback(err,null,null):callback(null,list,total);
    })  ;

    // m.count(query,function(err,total){
    //     console.log(total)
    //     m.find(query,
    //         {skip:(parseInt(page)-1)*10,
    //         limit:10
    //     }).sort({"time":-1}).find(function(err,list){
    //         if(err) return callback(err,null);
    //         return callback(null,list,total);
    //     })
    // })

};
//create
Action.prototype.create = function (doc,callback){
    this.model.create(doc, function (error) {
        if(error) return callback(error);
        var docs = Array.prototype.slice.call(arguments, 1);
        return callback(null,docs);
    });
};


Action.prototype.getById = function (id, callback) {
    this.model.findOne({_id:id}, function(error, model){
        if(error) return callback(error,null);
        return callback(null,model);
    });
};

/*
  通过微信ID查找用户
 */
Action.prototype.getByWxId = function(id,callback){
    this.model.findOne({"authData.wx.openid":id},function(error,model){
        if(error) return callback(error,null);
        return callback(null,model);
    });
};

Action.prototype.getByQQid = function(id,callback){
    this.model.findOne({"authData.qq.openid":id},function(error,model){
        if(error) return callback(error,null);
        return callback(null,model);
    });
};



Action.prototype.countByQuery = function (query, callback) {
    this.model.count(query, function(error, model){
        if(error) return callback(error,null);
        return callback(null,model);
    });
};


Action.prototype.getByQuery = function (query,fileds,opt,callback) {
    this.model.find(query, fileds, opt, function(error,model){
        if(error) return callback(error,null);

        return callback(null,model);
    });
};

Action.prototype.getSort = function (query,opt,callback) {
    this.model.find(query).sort(opt).exec(function(error,model){
        if(error) return callback(error,null);

        return callback(null,model);
    });
};

Action.prototype.getAll = function (callback) {
    this.model.find({}, function(error,model){
        if(error) return callback(error,null);

        return callback(null, model);
    });
};

Action.prototype.remove = function (query, callback){
    this.model.remove(query, function(error){
        if(error) return callback(error);

        return callback(null);
    });
};

Action.prototype.update = function( conditions, update ,options, callback) {
    this.model.update(conditions, update, options, function (error) {
        if(error) return callback(error);
        return callback(null);
    });
};


module.exports = Action;



/*
*创建UUID的方法
*/
var createUUID = exports.createUUID = config.BaseApi.createUUID = function(){
    var dg = new Date(1582, 10, 15, 0, 0, 0, 0);
    var dc = new Date();
    var t = dc.getTime() - dg.getTime();
    var tl = getIntegerBits(t,0,31);
    var tm = getIntegerBits(t,32,47);
    var thv = getIntegerBits(t,48,59) + '1'; // version 1, security version is 2
    var csar = getIntegerBits(rand(4095),0,7);
    var csl = getIntegerBits(rand(4095),0,7);


    var n = getIntegerBits(rand(8191),0,7) +
    getIntegerBits(rand(8191),8,15) +
    getIntegerBits(rand(8191),0,7) +
    getIntegerBits(rand(8191),8,15) +
    getIntegerBits(rand(8191),0,15); // this last number is two octets long
    return tl + tm  + thv  + csar + csl + n;
};

var getIntegerBits = function(val,start,end){
    var base16 = returnBase(val,16);
    var quadArray = new Array();
    var quadString = '';
    var i = 0;
    for(i=0;i<base16.length;i++){
    quadArray.push(base16.substring(i,i+1));
    }
    for(i=Math.floor(start/4);i<=Math.floor(end/4);i++){
    if(!quadArray[i] || quadArray[i] == '') quadString += '0';
    else quadString += quadArray[i];
    }
    return quadString;
};


var returnBase = function(number, base){
    return (number).toString(base).toUpperCase();
};


var rand = function(max){
    return Math.floor(Math.random() * (max + 1));
};

Array.prototype.unique = function()
{
    var n = {},r=[]; //n为hash表，r为临时数组
    for(var i = 0; i < this.length; i++) //遍历当前数组
    {
        if (!n[this[i]]) //如果hash表中没有当前项
        {
            n[this[i]] = true; //存入hash表
            r.push(this[i]); //把当前数组的当前项push到临时数组里面
        }
    }
    return r;
};
Date.prototype.pattern=function(fmt) {
    var o = {
    "M+" : this.getMonth()+1, //月份
    "d+" : this.getDate(), //日
    "h+" : this.getHours()%12 === 0 ? 12 : this.getHours()%12, //小时
    "H+" : this.getHours(), //小时
    "m+" : this.getMinutes(), //分
    "s+" : this.getSeconds(), //秒
    "q+" : Math.floor((this.getMonth()+3)/3), //季度
    "S" : this.getMilliseconds() //毫秒
    };
    var week = {
    "0" : "\日",
    "1" : "\一",
    "2" : "\二",
    "3" : "\三",
    "4" : "\四",
    "5" : "\五",
    "6" : "\六"
    };
    if(/(y+)/.test(fmt)){
        fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));
    }
    if(/(E+)/.test(fmt)){
        fmt=fmt.replace(RegExp.$1, ((RegExp.$1.length>1) ? (RegExp.$1.length>2 ? "\星\期" : "\周") : "")+week[this.getDay()+""]);
    }
    for(var k in o){
        if(new RegExp("("+ k +")").test(fmt)){
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
        }
    }
    return fmt;
};

function accAdd(arg1,arg2){
 var r1,r2,m;
 try{r1=arg1.toString().split(".")[1].length}catch(e){r1=0} ;
 try{r2=arg2.toString().split(".")[1].length}catch(e){r2=0} ;
 m=Math.pow(10,Math.max(r1,r2)) ;
 return (arg1*m+arg2*m)/m ;
}

Number.prototype.add = function(arg) {
    return accAdd(arg, this);
};

//减法函数，用来得到精确的减法结果

function accSub(arg1,arg2){
　　 var r1,r2,m,n;
　　 try{r1=arg1.toString().split(".")[1].length}catch(e){r1=0};;
　　 try{r2=arg2.toString().split(".")[1].length}catch(e){r2=0};
　　 m=Math.pow(10,Math.max(r1,r2));
　　 //last modify by deeka
　　 //动态控制精度长度
　　 n=(r1>=r2)?r1:r2;
　　 return ((arg1*m-arg2*m)/m).toFixed(n);
}
Number.prototype.sub = function(arg){
    return accSub(this,arg);
};
