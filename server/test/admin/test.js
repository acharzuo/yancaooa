const app = require('../../app')
const request = require('supertest').agent(app.listen())
const mongoose = require('mongoose');
const User = mongoose.model('User');
const Role = mongoose.model('Roles');
var userFunc = require('../lib/common').userFunc;
var async = require('async');

var userService = require('../../api/user/service');
var expect = require('chai').expect;
var should = require('chai').should();

global.TEST_USER = {
                    tel: '10000000001',
                    password: '123456'
                };

describe('用户管理', function(){

    before(function(done){

        done();
    })

    
     
    it('delete /api/admins, 测试不能删除超级管理员用户', function(done){
        userFunc(function(userInfos){
            User.findOne({email:'admin@yty.com'}, function(err, user){
                // expect(err).to.be.empty;
                // //console.log(user);
                var reqUrl = '/api/admins/'+user._id;
                // //console.log("------"+userInfos.testAdminToken)
                // //console.log(reqUrl);
                request
                .del(reqUrl)
                .set({
                        'Content-Type': 'application/json',
                        'x-access-token': userInfos.testAdminToken
                    })
                .expect(200)
                .end(function(err, res){
                    // //console.log(res.body)
                    expect(res.body.code).to.be.equal(108);
                    should.not.exist(err);
                    
                    done();
                });
            });
        })
    }) 
})
