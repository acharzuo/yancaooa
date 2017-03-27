var Model = require('./model').Roles;
// var Roles = require('mongoose').model('Roles');
var validate = require('../../utils/validate');
var _ = require('lodash');
var tokenManager = require('../../utils/token_manager');
var log = require('../../utils/log');               // 日志系统
var async = require('async');
var returnFactory = require('../../utils/returnFactory');
var tool = require('../../utils/tools');
var allAuthorities = require('../../config/authorities.config');
var service = require('./service');

/**
 * @alias /api/roles[POST]
 * @description  增加权限组
 * @param {String} id 权限组id
 * @param {String} name 权限组名称，唯一
 * @param {String} description 权限组说明
 * @param {Array} authorities 权限码列表列表，数组
 * @param {String} authoritiesStr 权限码列表列表，逗号分隔
 * @return {Object} 店铺对象
 */
exports.create = function (req, res, next) {

  // req.validate('id', '必须指定id').notEmpty();
  req.validate('authorities', '必须是数组').isArray();
  var errors = req.validationErrors();
  if(errors){
    return next(errors[0]);
  }

  // 加上最低权限 200000
  if(req.body.authorities){
    req.body.authorities.push('200000');
  }
  //创建Entity，自带参数校验
  var newEntity = new Model(req.body);


  // 更新修改人
  newEntity.updatedBy = newEntity.createdBy = req.user?req.user.id:null;

  // 写入数据库
  newEntity.save(function(err, doc) {
    if(!err){
      return res.json(returnFactory('SUCCESS', doc));
    }else{
      return res.json(returnFactory('ERROR', null, err));  
    }  
  });
};


/**
 * @alias /api/roles/:id[DELETE]
 * @description  删除权限组
 * @param {String=} id 要删除的权限组的id
 * @return {Object} 错误信息
 */
exports.delete = function(req, res, next) {
  req.validate('id', '必须指定id').notEmpty();
  req.validate('id', '必须是合法的id').isMongoId();
  var errors = req.validationErrors();
  if(errors){
    return next(errors[0]);
  }
  // 调用接口查找数据库并删除
  Model.findByIdAndRemove(req.params.id, function(err, doc){
  
    if(!err){
      //返回被删除的对象
      return res.json(returnFactory('SUCCESS', doc));
    }else{
      return res.json(returnFactory('ERROR', null, err));
    }
  });
};


/**
 * @alias /api/roles[PATCH]
 * @description  修改权限组
 * @param {String} id 要修改的经络仪id
 * @param {String} name 权限组名称，唯一
 * @param {String} description 权限组说明
 * @param {String=} authoritiesStr 权限码列表列表，逗号分隔
 * @param {String} authorities 权限码列表列表，数组
 * @return {Object} 店铺对象
 */
exports.update = function(req, res, next) {
  req.validate('id', '必须指定id').notEmpty();
  req.validate('id', '必须是合法的id').isMongoId();
  var errors = req.validationErrors();
  if(errors){
    return next(errors[0]);
  }
  // 获取token中用户的信息
  var reqUser = req.user;

  //根据id查找对象，并更新
  Model.findById(req.params.id, function(err, doc) {
    if(err){
      return res.json(returnFactory('ERROR', null, err));
    }

    //准备更新的数据
    var updateData = req.body;
    delete updateData.id; //需要删除body中的id字段
    doc.authorities = updateData.authorities;
    doc = _.merge(doc,updateData);  //将传入的参数合并到原来的数据上
    doc.updatedAt = tool.getCurUtcTimestamp(); //最后更新日期
    doc.updatedBy = reqUser?reqUser.id:null;  //最后更新人

    // 写入数据库
    doc.save(function(err){
      if(!err) {
        return res.json(returnFactory('SUCCESS', doc));
      }else{
        return res.json(returnFactory('ERROR', null, err));
      }
    })
  });
};


/**
 * @alias /api/roles[GET] 
 * @author 真源
 * @description 查询权限组
 * @param {Number=} page 第几页内容
 * @param {Number=} count 每页显示数量
 * @param {String=} name 权限组名称
 * @param {String=} fields 选择字段，逗号分隔
 * @param {String=} sort 排序选项 "field1,-field2" 表示按field1正序排序，按field2倒序排序
 * @return {Object} json数组
 * @example 返回结果示例：
 * {
 *  docs:docs, //json数组
 *  total:total  //查询到的全部对象的数量，不是分页的数量
 * }
 */
exports.list = function(req, res) {

  //准备查询条件
  var query = Model.find({});           

  // 1 权限组名称
  if(req.query.name){   
    query = query.where('name', new RegExp(req.query.name, 'i'));
  }

  // 选择输出字段
  if(req.query.fields){
      var fields = req.query.fields.split(',').join(' ');
      query = query.select(fields);
  }

  // 选择排序
  if(req.query.sort){
      var sort = req.query.sort.split(',').join(' ');
      query = query.sort(sort);
  }

  query = query.sort({"updatedAt":"desc"});

  // 分页执行
  query.paginate(req.query.page, req.query.count, function(err, docs, total){
      if(!err) {
        return res.json(returnFactory('SUCCESS',{docs:docs, total:total}));
      }else{
        return res.json(returnFactory('ERROR', null, err));
      }
  });
};

/**
 * @alias /api/roles/:id[GET]
 * @description  获取单个权限组详细信息
 * @param {String} id 对象id
 * @return {Object} 权限对象
 */
exports.detail = function (req, res, next) {
  req.validate('id', '必须指定id').notEmpty();
  req.validate('id', '必须是合法的id').isMongoId();
  var errors = req.validationErrors();
  if(errors){
    return next(errors[0]);
  }  
  var docId = req.params.id;

  Model.findById(docId).exec(function (err, doc) {
     if(!err) {
       // 以下是增加权限组的描述
       var authorities = doc.authorities;
       if(authorities && authorities.length > 0){
         var authoritiesArray = [];
         var tmp = {}
         for(var i=0;i<authorities.length;i++){
            tmp = {
              code: authorities[i],
              description: service.getAuthorityObj(authorities[i])
            };
            authoritiesArray.push(tmp);
         }

        //  console.log('authoritiesArray:', authoritiesArray)
         doc._doc.authoritiesArray = authoritiesArray;
       }
        return res.json(returnFactory('SUCCESS', doc));
      }else {
        return res.json(returnFactory('ERROR', null, err));
      }
  });


};

/**
 * @alias /api/authorities[GET]
 * @description  获取权限列表
 * @return {Object} 权限列表
 */
exports.getAuthorities = function (req, res, next) {

  return res.json(returnFactory('SUCCESS', allAuthorities));
};
