const app = require('../../app')
const request = require('supertest').agent(app.listen())
const mongoose = require('mongoose');
const Problem = mongoose.model('Problem');
var async = require('async');
var userFunc = require('../lib/common').userFunc;
var userService = require('../../api/user/service');
var expect = require('chai').expect;
var should = require('chai').should();

var problem_id;
describe('问题管理', function(){

    before(function(done){
        // var data = {
        //     name:'测试店铺',
        //     shopId:'1657'
        // }
        // Shop.create(data,function(err,doc){
        //         //console.log(err);
        //         shop_id = doc._id
        //         done();
        // });
        done();
    });

    // 测试增加device
    it('post /api/problems,添加问题', function(done){

        var model = {
            problem:'生病了',//标签
            answer:['没得编了'],//案例标题
        };
        userFunc(function(userInfos){
            // //console.log(userInfos)
            // //console.log('token'+userInfos.testAdminToken);
            request
            .post('/api/problems')
            .set({
                    'Content-Type': 'application/json',
                    'x-access-token': userInfos.testAdminToken
                })
            .send(model)
            .expect(200)
            .end(function(err, res){
                should.not.exist(err);
                expect(res.body.code).to.be.equal(0);
                expect(res.body.result[0]).to.be.include.keys('_id');
                done();
            })
        })
        
    })

    // 测试修改shop
    it('patch /api/problems/:id,修改问题', function(done){

       var model = {
            problem:'生病了1',//标签
            answer:['没得编了2'],//案例标题
        };
        userFunc(function(userInfos){
            // //console.log(userInfos)
            Problem.findOne({problem:"生病了"}, function(err, doc){
                // //console.log('修改123+'+doc)
                // //console.log('token'+userInfos.testAdminToken);
                request
                .patch('/api/problems/'+doc._id)
                .set({
                        'Content-Type': 'application/json',
                        'x-access-token': userInfos.testAdminToken
                    })
                .send(model)
                .expect(200)
                .end(function(err, res){
                    Problem.findOne({_id:doc._id},function(error,result){
                        // //console.log('修改+'+JSON.stringify(model))
                        // //console.log('修改+++'+JSON.stringify(result))
                        // //console.log('修改++++'+JSON.stringify(res.body))
                        should.not.exist(error);
                        expect(res.body.code).to.be.equal(0);
                        expect(result.problem).to.be.equal(model.problem);
                        expect(result.answer).to.be.a('Array');
                        done();
                    })
                    
                })
            })
            
        })
        
    })

    // 查询案例
    it('get /api/problems/:id,查询问题', function(done){

        var model = {
            problem:'生病了1',//标签
            answer:['没得编了2'],//案例标题
        };
        userFunc(function(userInfos){
            // //console.log(userInfos)
            Problem.findOne({problem:"生病了1"}, function(err, doc){
                // //console.log('修改123+'+doc)
                // //console.log('token'+userInfos.testAdminToken);
                request
                .get('/api/problems/'+doc._id)
                .set({
                        'Content-Type': 'application/json',
                        'x-access-token': userInfos.testAdminToken
                    })
                .expect(200)
                .end(function(err, res){
                        // //console.log('修改+'+JSON.stringify(model))
                        // //console.log('修改+++'+JSON.stringify(result))
                        // //console.log('修改++++'+JSON.stringify(res.body))
                        should.not.exist(err);
                        expect(res.body.code).to.be.equal(0);
                        expect(res.body.result.problem).to.be.equal(model.problem);
                        expect(res.body.result.answer).to.be.a('Array');
                        done();    
                })
            })
            
        })
        
    })

    // 条件查询广告
    it('get /api/problems,条件查询问题', function(done){
        var url = '/api/problems?easyQuery='+encodeURI('生病了');
        userFunc(function(userInfos){
            // //console.log(userInfos)
                request
                .get(url)
                .set({
                        'Content-Type': 'application/json',
                        'x-access-token': userInfos.testAdminToken
                    })
                .expect(200)
                .end(function(err, res){
                        // //console.log('修改+'+JSON.stringify(model))
                        // //console.log('修改+++'+JSON.stringify(result))
                        // //console.log('查询++++'+JSON.stringify(res.body.result.total))
                        expect(res.body.code).to.be.equal(0);
                        expect(res.body.result.total).to.be.equal(1);
                        should.not.exist(err);
                        done();    
                })
            })
    })

    // 删除广告
    it('delete /api/problems/:id,删除问题', function(done){
        Problem.findOne({problem:"生病了1"},function(err,doc){
            userFunc(function(userInfos){
            // //console.log(doc)
                request
                .del('/api/problems/'+doc._id)
                .set({
                        'Content-Type': 'application/json',
                        'x-access-token': userInfos.testAdminToken
                    })
                .expect(200)
                .end(function(err, res){
                        // //console.log('修改+'+JSON.stringify(model))
                        // //console.log('修改+++'+JSON.stringify(result))
                        //console.log('删除++++'+JSON.stringify(res.body.result._id))
                        should.not.exist(err);
                        expect(res.body.code).to.be.equal(0);
                        done();    
                })
            })
        })
        
    })
})
