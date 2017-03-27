
const mongoose = require('mongoose');
const User = mongoose.model('User');
const Role = mongoose.model('Roles');
var tokenManager = require('../../utils/token_manager');
var async = require('async');
var setting = require('../../config/setting');

var getter = exports.userFunc= function(callback){


    // //console.log('---------------------------')
    async.waterfall([
        function(cb){    // testUser
            User.findById(setting.test_user_id).exec(function(err, doc){
                //console.log('11111'+doc);
                cb(err, doc);
            });
        },
        function(testUser,cb){  // testAdmin
            User.findById(setting.test_admin_id).exec(function(err, doc){
            //console.log('22222222   '+doc);
                cb(err, testUser, doc);
            });
        },
        function(testUser, testAdmin, cb){ // testUserToken
            tokenManager.saveToken(testUser, function(token){
                cb(null, testUser,testAdmin,token);
            });
        },
        function(testUser,testAdmin,testUserToken,cb){ // testAdminToken
            tokenManager.saveToken(testAdmin, function(token){
                cb(null, testUser,testAdmin,testUserToken,token);
            });
        }      
    ], function(err, testUser,testAdmin,testUserToken,testAdminToken){
        // //console.log(results);
        // console.log("999999"+testUser,testAdmin,testUserToken,testAdminToken);
        // //console.log('++++++++++++++++++++++++++++=')
        if(!testUser||!testAdmin||!testUserToken||!testAdminToken||err){
            console.error('XXXXXXXXXXXXXXXXXXXXXXXXXX');
        }
        callback( {
            testUser: testUser,
            testAdmin: testAdmin,
            testUserToken: testUserToken,
            testAdminToken: testAdminToken          
        });
        // //console.log('000000000000');
        // exports.testUser = testUser;
        // exports.testAdmin = testAdmin;
        // exports.testUserToken = testUserToken;
        // exports.testAdminToken = testAdminToken;
    });   
};
// //console.log('000000000000');
// //console.log(getter());

