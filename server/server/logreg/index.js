'use strict';

// var User = require('../api/user/user.model').User;
var User = require('mongoose').model('User');
var message = require('../../utils/statusMessage');
var validate = require('../../utils/validate');
var jwt = require('jsonwebtoken');
var setting = require('../../config/setting');
var tokenManager = require('../../utils/token_manager');


