'use strict';

var model = require('./model');
var message = require('../../utils/returnFactory');//返回状态模块
var _ = require('lodash');
var log = require('../../utils/log');   //引进日志
var async = require('async');


//添加文章--完成----------------------------------------------
/**
 */
exports.create = function(req,res,next){

    // 生成一个订单
    var order = new model();        // 订单实例
    var shopsImportant = [];        // 重点用户许可证号集合
    var shops=[];                   // 店铺集合
    var employee=[];                // 员工集合

    // 获取当前员工说列表


    // 获取当前最新的用户列表

    // 生成一个订单

    // 返回订单号

    //===在前台调用生成子订单




    // 重要客户
    var shopsImportent = [
        "371621100015",
        "371621100043",
        "371621100051",
        "371621100058",
        "371621100102",
        "371621100126",
        "371621100142",
        "371621100157",
        "371621100087",
        "371621100173",
    ];


    // 整个随机获得的数据结构
    var randoms =  {
        employee: employee,     // 员工
        shops: shops,           // 店铺列表
        shopsStatus: {},     // 店铺信息整合（最新信息）； level: 0 普通， 10 重点； visitCount：访问次数（0~n）
        shopsImportent: shopsImportent, // 重点店铺
        days: [], // 多个dayVisit
        statistics:{
            shopsVisitedCount: 0,   // 被检测过的店铺数量
            shopsCount: shops.length,   //总店铺数量
            visitedCount: 0,    // 检测总次数
            shopsNonVisitedCount: shops.length,     // 未被检测的店铺数量
        }
    };

    // 每次检查一个队伍的信息
    var visitTeam = {
        employee:[],        // 队伍人员清单
        shops:[],           // 访问店铺清单
    };

    // 每日检查配对
    var dayVisit = {
        day : "",   // 日期
        teams: [],  // 各个分队及检查店铺的信息
    };

    console.log(randoms);

    // 整理数据，将数组形式整理成对象形式，便于查找
    for(var i = 0; i < randoms.shops.length; i++){
        randoms.shopsStatus["" + randoms.shops[i].licenseId] = randoms.shops[i];
        randoms.shopsStatus["" + randoms.shops[i].licenseId].level = 0;
        randoms.shopsStatus["" + randoms.shops[i].licenseId].visitCount = 0;
    }
    // 整理数据，将重点客户标记在店铺信息中
    for(var i = 0; i < shopsImportent.length; i++){
        randoms.shopsStatus["" + shopsImportent[i]].level = 10;
    }

    // 随机生成一天的人员
    dayVisit = {};  // 清空日访问
    dayVisit.day = "2016-09-09";
    dayVisit.teams = [];

    // 随机分队伍
    var teamList = randomArray(randoms.employee);
    for(var i = 0 ; i < teamList.length; i++) {
        var index = Math.floor(i / 4);
        if( i%4 === 0 ) {
            dayVisit.teams[index] = {}; // TODO 与数据结构不匹配。需要调整
            dayVisit.teams[index].employee = [];
            dayVisit.teams[index].shops =randomShops(randoms.shops, 20);   // 随机选择店铺
        }
        dayVisit.teams[index].employee.push(teamList[i]);               // 随机选择执法人员
    }
    teamList = null;
    console.log("dayvisit");
    console.log(dayVisit);
    // 随机分配店铺（未考虑重点客户）
//    for(var i = 0; i < dayVisit.teams.length; i++){
//        //dayVisit.teams[i].shops = randomShops(randoms.shops, 20);
//    }
    randoms.days.push(dayVisit);
    console.log(randoms);

    // 随机取到指定数量的店铺
    function randomShops(shops, count){
        var ret = [];
        var index = 0;
        while (true) {
            // 如果已经将所有店铺都检测完成 或者 取得到足够的访问数量，则跳出
            if(randoms.statistics.shopsNonVisitedCount <= 0 || ret.length >= count) {
                break;
            }

            // 随机取下标
            index = Math.floor(Math.random() * shops.length);
            // 如果这一家被访问过，则选择另外一家
            if(randoms.shopsStatus["" + shops[index].licenseId].visitCount > 0) {
                // 找到下一个未被访问过的店
                for(var i = 0; i < shops.length; i++){
                    index = ( ++index ) % shops.length;
                    // 寻找下一个未被选中的店铺
                    if(randoms.shopsStatus["" + shops[index].licenseId].visitCount === 0){
                        break;
                    }
                }
            }
            // 访问数量加一
            randoms.shopsStatus["" + shops[index].licenseId].visitCount ++;
            randoms.statistics.shopsVisitedCount ++;
            randoms.statistics.shopsNonVisitedCount --;

            // 加入访问列表
            ret.push(randoms.shopsStatus["" + shops[index].licenseId]);

        }

        return ret;
    }

    // 随机获取一个数组排序
    function randomArray(data){
        var ret = [];
        var originData = data;
        var index = 0;
        while (true) {
            index = Math.floor(Math.random() * originData.length);
            ret.push(originData[index]);
            originData.splice(index,1); // 删除数据组中指定位置的元素
            if(originData.length == 0) break;
        }
        return ret;
    }







    //参数校验
    req.validate('code','必须存在企业名称').notEmpty();
    var errors = req.validationErrors();
    if (errors) {
        return next(errors[0]);
    }


    var body = req.body;
    var data = {
        createdBy : (req.user ? req.user.id : null), //创建人
        name:       body.name,      // 企业名称
        image:      body.image,     // 门头图片
        address:    body.address,   // 地址
        licenseId:  body.licenseId, // 许可证号码
        manager:    body.manager,   // 负责人姓名
        register:   body.register,  // 注册日期
        expire:     body.expire,    // 到期日期
        status:     body.status,    // 店铺状态
    };
    //创建文章数据
    model.create(data,function(err,doc){
        if (err) {
            return res.send(message("ERROR",null,err));
        }

        res.send(message("SUCCESS",doc));

    });
};

//删除文章---------------------------------------------------

/**
 * @alias /api/articles/:id[DELETE]
 * @description  删除文章
 * @param {String} id 文章id
 *
 * @return {Object} 删除文章的状态信息
 */
exports.delete = function(req,res){
    article.findByIdAndRemove({"_id":req.params.id},function(err,doc){
        if (!doc) {//判断错误
            return res.send(message("NOT_FOUND",null));
        }else if (err) {
            return res.send(message("ERROR",null,err));
        }
        category.findById(doc.category).exec(function(err,docs){
            for (var i = 0; i < docs.article.length; i++) {//删除category保存的id
                if (JSON.stringify(docs.article[i]) == JSON.stringify( req.params.id)) {
                    docs.article.splice(i,1);
                }
            }
            docs.save(function(err,doc){
                console.log('删除完后的category',doc);
            });
        });
        res.send(message("SUCCESS",doc));
    });
};

//修改文章 ---------------------------------

/**
 * @alias /api/articles/:id[PATCH]
 * @description  修改文章
 * @param {String} id 文章id
 * @param {String=} title 文章标题
 * @param {String=} tag tag标签
 * @param {String=} image 文章封面
 * @param {String=} source 文章来源
 * @param {Number=} pushDate 发布时间
 * @param {String=} abstract 文章摘要
 * @param {String=} category 文章分类
 * @param {String=} content 文章内容
 * @param {String} author 文章作者
 *
 * @return {Object} 文章修改后的信息

 */
exports.update = function(req,res){
    article.findById(req.params.id,function(err,doc){
        if (!doc) {
            return res.send(message("NOT_FOUND",null));
        }else if (err) {
            return res.send(message("ERROR",err));
        }
        //先删除原来的分类
        if (doc.category) {
            category.findById(doc.category).exec(function(err,docs){
                for (var i = 0; i < docs.article.length; i++) {//删除category保存的id
                    if (JSON.stringify(docs.article[i]) == JSON.stringify( req.params.id)) {
                        docs.article.splice(i,1);
                    }
                }
                docs.save(function(err,doc){
                    console.log('删除完后的category',doc);
                });
            });
        }
        //把文章id保存到新的分类中
        category.findById(req.body.category).exec(function(err,cates){
            cates.article.push(doc._id);
            cates.save(function(err,doc){
                // res.send(message("SUCCESS",doc));
                console.log('修改后的category',doc);
            });
        });
        var updateData = req.body;
        var data = _.merge(doc,updateData);  //将传入的参数合并到原来的数据上
        data.updatedBy = (req.user ? req.user.id : null); //修改人
        // 写入数据库
        data.save(function(err){
            if (!err) {
    			article.findById(req.params.id,function(err,doc){
    				if (!err&&doc) {
    					res.send(message("SUCCESS",doc));
    				}else{
    					return res.send(message("ERROR",null,err));
    				}
    			});
    		}else{
                return res.send(message("ERROR",null,err));
            }
        });
    });
};

//查询，返回文章列表--------完成----------------------------------

/**
 * @alias /api/articles[GET]
 * @description  查询文章
 * @param {String=} title 文章标题
 * @param {String=} category 文章分类
 * @param {Number=} page 第几页（get）
 * @param {Number=} count 每页显示数量（get）
 * @param {String=} fields 选择字段，逗号分隔
 * @param {String=} sort 排序选项 "field1,-field2" 表示按field1正序排序，按field2倒序排序
 *
 * @return {Object} 查询到的文章信息
 */

 //pc  端查看所以文章列表  =----------------------
 /**
  * @alias /api/pc/articles[GET]
  * @description  查询文章
  * @param {Number=} page 第几页（get）
  * @param {Number=} count 每页显示数量（get）
  * @param {String=} fields 选择字段，逗号分隔
  * @param {String=} sort 排序选项 "field1,-field2" 表示按field1正序排序，按field2倒序排序
  *
  * @return {Object} 查询到的文章信息

  */

exports.list = function(req,res){

    var query;
    //if (req.query.category) {//匹配标签
    //    query = article.find({"category":req.query.category});
    //}else{
        query = article.find({});//所有内容
    //}
    //if (req.query.title) {//匹配文章标题
    //    query = query.where("title",new RegExp(req.query.title,'ig'));
    //}
    //
    //if(req.query.easyQuery){//简单查询
    //    query = query.or([
    //        {'title': new RegExp(req.query.easyQuery, 'ig')},
    //        {'source': new RegExp(req.query.easyQuery, 'ig')},
    //        {'abstract': new RegExp(req.query.easyQuery, 'ig')},
    //        {'content': new RegExp(req.query.easyQuery, 'ig')},
    //        {'author': new RegExp(req.query.easyQuery, 'ig')},
    //        {'tag': new RegExp(req.query.easyQuery, 'ig')}
    //    ]);
    //}

    // 选择排序
    if(req.query.fields){
        var fields = req.query.fields.split(',').join(' ');
        query = query.select(fields);
    }

    // 选择排序
    if(req.query.sort){
        var sort = req.query.sort.split(',').join(' ');
        query = query.sort(sort);
    }
    //默认排序
    query = query.sort({"updatedAt":"desc"});
    //显示分类名称
    query.populate({
        path:'category'
    }).paginate(req.query.page, req.query.count, function(err, doc, total) {
        if (!err) {
            res.send(message('SUCCESS', {data: doc,total: total}));
        } else {
            return res.send(message('ERROR', null, err));
        }
    });
};

//查看某一文章----完成------------------------------------------

/**
 * @alias /api/articles/:id[GET]
 * @description  添加文章
 * @param {String} id 文章id
 *
 * @return {Object} 查询到的文章信息
 */

exports.detail = function(req,res,next){
    req.validate('id', '必须制定删除的id').notEmpty();
    req.validate('id', '必须是合法的id').isMongoId();
    var errors = req.validationErrors();
    if(errors){
        return next(errors[0]);
    }

    var query = article.findById(req.params.id);
    // query.exec(function())
    query.populate({
        path: "category"
    }).exec(function(err,doc){
        if(!doc){
            return res.send(message("NOT_FOUND",null));
        }else if (err) {
            return res.send(message("ERROR",null,err));
        }
        res.send(message("SUCCESS",doc));

    });
};
//批量删除--------------------------------------
/**
 * @alias /api/batch/articles/:ids[DELETE]
 * @description  批量删除文章
 * @param {String} ids 要删除的多个id字符串
 *
 * @return {Object} 删除后返回的状态

 */
exports.batchDelete = function(req, res) {
    var ids = req.params.ids.split(","); //拆分字符串，得到id数组
    article.remove({"_id":{"$in" : ids}},function(err,doc){//$in 一个键对应多个值
        if (!doc) {
            return res.send(message("NOT_FOUND",null));
        }else if (err) {
            return res.send(message("ERROR",null,err));
        }
        category.findById(doc.category).exec(function(err,docs){
            for (var i = 0; i < docs.article.length; i++) {//删除category保存的id
                if (JSON.stringify(docs.article[i]) == JSON.stringify( req.params.id)) {
                    docs.article.splice(i,1);
                }
            }
            docs.save(function(err,doc){
                console.log('删除完后的category',doc);
            });
        });
        res.send(message("SUCCESS",doc));
    });
};
//推荐文章--------------------------------------------------------------
/**
 * @alias /api/articles/highlight/:ids[PATCH]
 * @description  批量推荐文章
 * @param {String} ids 要推荐的多个id字符串
 * @param {String} highlight 0为不推荐，1为推荐

 * @return {Object} 返回的状态

 */
exports.highlight = function(req,res){
    var ids = req.params.ids.split(","); //拆分字符串，得到id数组
    article.update({"_id":{"$in" : ids}},{ "multi": true },{"highlight":req.body.highlight},function(err,doc){
        if (!doc) {
            return res.send(message("NOT_FOUND",null));
        }else if (err) {
            return res.send(message("ERROR",null,err));
        }
        res.send(message("SUCCESS",doc));
    });
};



//置顶文章--------------------------------------------------------------
/**
 * @alias /api/articles/top/:ids[PATCH]
 * @description  批量置顶文章
 * @param {String} ids 要置顶的多个id字符串
 * @param {String} top 0为不推荐，1为推荐
 *
 * @return {Object} 返回的状态

 */
exports.top = function(req,res){
    var ids = req.params.ids.split(","); //拆分字符串，得到id数组
    article.update({"_id":{"$in" : ids}},{ "multi": true },{"top":req.body.top},function(err,doc){
        if (!doc) {
            return res.send(message("NOT_FOUND",null));
        }else if (err) {
            return res.send(message("ERROR",null,err));
        }
        res.send(message("SUCCESS",doc));
    });
};

// pc端 查看某一文章----------------------------------------
/**
 * @alias /api/pc/articles/:id[PATCH]
 * @description  添加文章
 * @param {String} id 文章id
 *
 * @return {Object} 查询到的文章信息
 */
exports.detailpc = function(req,res,next){
    req.validate('id', '必须制定删除的id').notEmpty();
    req.validate('id', '必须是合法的id').isMongoId();
    var errors = req.validationErrors();
    if(errors){
        return next(errors[0]);
    }
    article.update({"_id":req.params.id},{"$inc":{"clicks" : 1}},function(err,docs){
        var query = article.findById(req.params.id);
        query.populate({
            path: "category"
        }).exec(function(err,doc){
            if(!doc){
                return res.send(message("NOT_FOUND",null));
            }else if (err) {
                res.send(message("ERROR",null,err));
                return false;
            }else{
            res.send(message("SUCCESS",doc));
            }
        });
    });
};
