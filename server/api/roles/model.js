/**
 * @author zhenyuan
 */
var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate');
var _ = require('lodash');
var tool = require('../../utils/tools');
var BaseSchema = require('../../framework/model/baseSchema');
var setting = require('../../config/setting');
/**
 * 角色模型
 */
var rolesSchema = new BaseSchema({
  // 角色名称
  name: {
    type: String,
    required: true,
    unique: true
  },

  // 角色备注
  description: String,

  // 权限列表
  authorities: [Number]
});

/**
 * Virtuals
 */
rolesSchema
  .virtual('authoritiesStr')
  .set(function(authoritiesStr) {

    //将都好分割的字符串，转换为数值数组
    try{
      this.authorities = _.map(authoritiesStr.split(','), function(v){
      return parseInt(v);
    });
    }catch(e){

    }
    
  });

// rolesSchema.plugin(mongoosePaginate);  //添加分页插件
/**
 * 发布为模型
 */
// var Roles = exports.Roles = mongoose.model('Roles', rolesSchema, 'role');
var Roles = exports.Roles = mongoose.model('Roles', rolesSchema);

//初始化权限数据
Roles.findById(setting.admin_role_id, function(err,role){
  if(err || !role){
    var initData = {
      _id: setting.admin_role_id,
      name:'admin',
      description: '超级管理员',
      authorities: [10000]
    };
    var newRole = new Roles(initData);
    newRole.save(function(err, data){
      console.log('init roles');
    });
  }
});

//初始化权限数据
Roles.findById(setting.tech_role_id, function(err,role){
  if(err || !role){
    var initData = {
      _id: setting.tech_role_id,
      name:'tech',
      description: '技师权限',
      authorities: [10000]
    };
    var newRole = new Roles(initData);
    newRole.save(function(err, data){
      console.log('init roles');
    });
  }
});

//初始化权限数据
Roles.findById(setting.app_role_id, function(err,role){
  if(err || !role){
    var initData = {
      _id:setting.app_role_id,
      name:'appUser',
      description: 'app用户权限组',
      authorities: [200000]
    };
    var newRole = new Roles(initData);
    newRole.save(function(err, data){
      console.log('init roles');
    })
  }
})
