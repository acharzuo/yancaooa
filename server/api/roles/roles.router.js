/**
 * 用户管理路由入口
 * Created by achar on 2016/12/5.
 */

'use strict';

var express = require('express');
//var auth = require('../../auth/auth.service');
var log = require(global.ROOT_PATH + "/utils/log"); // 获取日志

var router = express.Router();

log.debug("加载权限管理模块!");

// 注册登录
var controller = require('./roles.controller');


// router.get('/', controller.index);    //获取所有用户信息
// router.delete('/:id', controller.destroy);  // 根据id删除用户
// router.get('/me', controller.me);  // 返回个人详细信息
// router.put('/:id/password', controller.changePassword); //修改用户 密码
router.get('/:id', controller.list);  // 根据id查询单个某个权限组 的信息
router.post('/', controller.create);  //创建一个 新权限组

// router.get('/', auth.hasRole('admin'), controller.index);
// router.delete('/:id', auth.hasRole('admin'), controller.destroy);
// router.get('/me', auth.isAuthenticated(), controller.me);
// router.put('/:id/password', auth.isAuthenticated(), controller.changePassword);
// router.get('/:id', auth.isAuthenticated(), controller.show);
// router.post('/', controller.create);

module.exports = router;
