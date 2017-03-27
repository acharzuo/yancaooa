var Action = require('../../utils/db.js')
var returnFactory = require('../../utils/returnFactory');
var message = require('../../utils/statusMessage');
var Case = require('./model');
var tool = require('../../utils/tools');

var CaseAction = new Action(Case);

//增加案例
/**
 * @alias /api/cases[POST]
 * @description  增加案例
 * @param {Array} label 案例标签
 * @param {String} caseName 案例标题
 * @param {Array} file 附件
 * @param {String} addr 地址
 * @param {String} expertName 专家名字
 * @param {String} patientName 患者名字
 * @param {Number} age 年龄
 * @param {Number} course 疗程
 * @param {Number} startTime 开始时间
 * @param {Number} endTime 结束时间
 * @param {String} content 病症
 * @param {String} detailed 详细状态
 * @return {Object} 错误信息
 */
exports.create = function(req,res){
    var body = req.body;
    var data = {
        label:body.label,//标签
        caseName:body.caseName,//标题
        file:body.file,//文件
        addr:body.addr,//地址
        expertName:body.expertName,//专家名字
        patientName:body.patientName,//患者姓名
        age:body.age,//年龄
        course:body.course,//疗程
        startTime:body.startTime,//开始时间
        endTime:body.endTime,//结束时间
        content:body.content,//病症
        detailed:body.detailed,//详细状态
        createdBy:req.user?req.user.id:null//创建人
    };
    CaseAction.create(data,function(err,doc){
        if(!err){
            res.json(returnFactory('SUCCESS',doc));
        }else{
            res.json(returnFactory('ERROR',null,err));
        }
    })
}

//高级搜索
/**
 * @alias /api/cases[GET]
 * @description  搜索广告
 * @param {String} caseName 案例关键词
 * @param {Array} label 标签关键词
 * @param {Boolean} analysis 分析状态
 * @param {Number} page 第几页内容
 * @param {Number} count 每页显示数量
 * @return {Object} 错误信息
 */
exports.list = function(req,res){
    var query = Case.find({});
    if(req.query.easyQuery){   
        query = query.or([
        {'caseName': new RegExp(req.query.easyQuery, 'i')},
        {'addr':new RegExp(req.query.easyQuery, 'i')},
        {'expertName':new RegExp(req.query.easyQuery, 'i')},
        {'patientName':new RegExp(req.query.easyQuery, 'i')}
        ]);
    }
    if(req.query.caseName){
        query = query.where('caseName',new RegExp(req.query.caseName,'i'))
    }
    if(req.query.label){
        query = query.where('label',new RegExp(req.query.label,'i'))
    }
    if(req.query.analysis){
        query = query.where('analysis',req.query.analysis)
    }
    // 选择排序
    if(req.query.sort){
        var sort = req.query.sort.split(',').join(' ');
        query = query.sort(sort);
    }
    
    query = query.where({'deleted':{$lt:1}});
    query = query.sort({"updatedAt":"desc"});
    query.paginate(req.query.page,req.query.count,function(err, docs, total){
        if(!err){
            res.json(returnFactory('SUCCESS', {docs:docs,total:total}));
        }else{
            res.json(returnFactory('ERROR', null, err));
        }
    });    //分页
}

//保存分析信息
/**
 * @alias /api/analysis/:id[PATCH]
 * @description  保存分析内容
 * @param {String} id 获取id
 * @param {Boolean} analysis 分析状态
 * @param {Array} left 左经络
 * @param {Array} right 右经络
 * @return {Object} 错误信息
 */
exports.analysis = function(req,res){
    var _id = req.body.id;
    var data = {},left,right;

    Case.findById(_id,function(err,doc){
        if(doc){
            if(req.body.left){
                doc.left = req.body.left;
            }
            if(req.body.right){
                doc.right = req.body.right;
            }
            doc.analysis = 1;
            data = {
                remark:req.body.history,
                left:doc.left,
                right:doc.right,
                name:req.user?req.user.id:"云天元",
                time:tool.getCurUtcTimestamp()};
            doc.history.unshift(data);
            doc.save(function(err1,doc1){
                if(!err){
                    res.json(returnFactory('SUCCESS',doc1));
                }
            })
        }else{
            res.json(returnFactory('ERROR',null,err));
        }
    })
}

//获取单个信息
/**
 * @alias /api/cases/:id[GET]
 * @description  获取单个信息
 * @param {String} id 获取id
 * @return {Object} 错误信息
 */
exports.detail = function(req,res){
    var params = req.params;
    var _id = params.id;
    Case.findOne({_id:_id},function(err,doc){
        if(!err){
            res.json(returnFactory('SUCCESS',doc));
        }else{
            res.json(returnFactory('ERROR',null,err));
        }
    })
}

//更新案例
/**
 * @alias /api/cases/:id[PATCH]
 * @description  增加案例
 * @param {String} _id 更新案例id
 * @param {Array} label 案例标签
 * @param {String} caseName 案例标题
 * @param {String} file 附件
 * @param {String} addr 地址
 * @param {String} expertName 专家名字
 * @param {String} patientName 患者名字
 * @param {Number} age 年龄
 * @param {Number} course 疗程
 * @param {Number} startTime 开始时间
 * @param {Number} endTime 结束时间
 * @param {String} content 病症
 * @param {String} detailed 详细状态
 * @param {Array} left 左经络
 * @param {Array} right 右经络0
 * @return {Object} 错误信息
 */
exports.update = function(req,res){
    var _id = req.params.id;
    var body = req.body;
    body.updatedAt = tool.getCurUtcTimestamp(); //最后更新日期
    body.updatedBy = req.user?req.user.id:null;  //最后更新人
    CaseAction.update({_id:_id},body,function(err,doc){
        if(!err){
            res.json(returnFactory('SUCCESS',doc));
        }else{
            res.json(returnFactory('ERROR',null,err));
        }
    })
}
/**
 * @alias /api/cases/:id[DELETE]
 * @description  删除案例
 * @param {String} _id 要删除的案例id 
 * @return {Object} 错误信息
 */
exports.delete = function(req,res){
    var _id = req.params.id;
    Case.update({_id:_id},{deleted:1},function(err,doc){
        if(!err){
            res.json(returnFactory('SUCCESS',doc));
        }else{
            res.json(returnFactory('ERROR',null,err));
        }
    })
}

/**
 * @alias /api/batch/cases/:ids[DELETE]
 * @description  批量删除案例
 * @param {String} ids 删除案例的id，ids为数组
 * @return {Object} 错误信息
 */
exports.batchDelete = function(req, res) {
    var _id = req.params.ids.split(',');
  // 调用接口查找数据库并删除
  Case.update({'_id': {'$in': _id}},{deleted:1},{ "multi": true },function(err, doc){
    if(!err) {
      //返回被删除的对象
      return res.json(returnFactory('SUCCESS', doc));
    }else{
      return res.json(returnFactory('ERROR', null, err));
    }
  });
};

exports.authCallback = function(req, res, next) {
  res.redirect('/');
};