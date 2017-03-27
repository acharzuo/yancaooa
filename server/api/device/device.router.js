/**
 * 用户管理路由入口
 * Created by achar on 2016/12/5.
 */

'use strict';

var express = require('express');
//var auth = require('../../auth/auth.service');
var log = require(global.ROOT_PATH + "/utils/log"); // 获取日志

var router = express.Router();

log.debug("加载经络仪模块!");

// 注册登录
var controller = require('./device.controller');


router.get('/', controller.index);
router.delete('/:id', controller.destroy);
router.get('/me', controller.me);
router.put('/:id/password', controller.changePassword);
router.get('/:id', controller.show);
router.post('/', controller.create);

// router.get('/', auth.hasRole('admin'), controller.index);
// router.delete('/:id', auth.hasRole('admin'), controller.destroy);
// router.get('/me', auth.isAuthenticated(), controller.me);
// router.put('/:id/password', auth.isAuthenticated(), controller.changePassword);
// router.get('/:id', auth.isAuthenticated(), controller.show);
// router.post('/', controller.create);

module.exports = router;
