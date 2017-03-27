const app = require('../../app')
const request = require('supertest').agent(app.listen())
const mongoose = require('mongoose');
const Diag = mongoose.model('Diag');
const Problem = mongoose.model('Problem');
var async = require('async');
var userFunc = require('../lib/common').userFunc;
var userService = require('../../api/user/service');
var expect = require('chai').expect;
var should = require('chai').should();

var problem_id;
describe('问诊单', function(){

    before(function(done){
        var data = {
            problem:'测试问题',
            answer:['答案1','答案2']
        }
        Problem.create(data,function(err,doc){
                // //console.log(err);
                problem_id = doc._id
                done();
        });
        
    });
    after(function(done){
        Problem.findOneAndRemove({problem:'测试问题'},function(err,doc){
            ////console.log('删除+'+err);
            done();
        });
        
    })

    // 测试增加问诊单
    it('post /api/diags,添加问诊单', function(done){

        var model = {
            diagName: '测试问诊单',  // 问诊单名称
            problem:problem_id,   //问题id
            serial: ['1'],    //序号
        };
        userFunc(function(userInfos){
            // //console.log(userInfos)
            // //console.log('token'+userInfos.testAdminToken);
            request
            .post('/api/diags')
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
    it('patch /api/diags/:id,修改问诊单', function(done){

        var model = {
            diagName: '测试问诊1',  // 问诊单名称
            problem:problem_id,   //问题id
            serial: ['2'],    //序号
        };
        userFunc(function(userInfos){
            // //console.log(userInfos)
            Diag.findOne({diagName:"测试问诊单"}, function(err, doc){
                // //console.log('修改123+'+doc)
                // //console.log('token'+userInfos.testAdminToken);
                request
                .patch('/api/diags/'+doc._id)
                .set({
                        'Content-Type': 'application/json',
                        'x-access-token': userInfos.testAdminToken
                    })
                .send(model)
                .expect(200)
                .end(function(err, res){
                    Diag.findOne({_id:doc._id},function(error,result){
                        // //console.log('修改+'+JSON.stringify(model))
                        // //console.log('修改+++'+JSON.stringify(result))
                        // //console.log('修改++++'+JSON.stringify(res.body))
                        should.not.exist(error);
                        expect(res.body.code).to.be.equal(0);
                        expect(result.toJSON()).to.be.include.keys('_id');
                        expect(result.toJSON().diagName).to.be.equal(model.diagName);
                        expect(result.toJSON().problem).to.be.a('Array');
                        expect(result.toJSON().serial).to.be.a('Array');
                        done();
                    })
                    
                })
            })
            
        })
        
    })

    // 查询广告
    it('get /api/diags/:id,查询问诊单', function(done){

        var model = {
            diagName: '测试问诊1',  // 问诊单名称
            problem:problem_id,   //问题id
            serial: ['2'],    //序号
        };
        userFunc(function(userInfos){
            // //console.log(userInfos)
            Diag.findOne({diagName:"测试问诊1"}, function(err, doc){
                // //console.log('修改123+'+doc)
                // //console.log('token'+userInfos.testAdminToken);
                request
                .get('/api/diags/'+doc._id)
                .set({
                        'Content-Type': 'application/json',
                        'x-access-token': userInfos.testAdminToken
                    })
                .send(model)
                .expect(200)
                .end(function(err, res){
                        // //console.log('修改+'+JSON.stringify(model))
                        // //console.log('修改+++'+JSON.stringify(result))
                        // //console.log('修改++++'+JSON.stringify(res.body))
                        should.not.exist(err);
                        expect(res.body.code).to.be.equal(0);
                        expect(res.body.result).to.be.include.keys('_id');
                        expect(res.body.result.diagName).to.be.equal(model.diagName);
                        expect(res.body.result.problem).to.be.a('Array');
                        expect(res.body.result.serial).to.be.a('Array');
                        done();    
                })
            })
            
        })
        
    })

    // 条件查询广告
    it('get /api/diags/:id,条件查询问诊单', function(done){
        var url = '/api/diags?easyQuery='+encodeURI('测试问诊1');
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
    it('delete /api/diags/:id,删除广告', function(done){
        Diag.findOne({diagName:"测试问诊1"},function(err,doc){
            userFunc(function(userInfos){
            // //console.log(userInfos)
                request
                .del('/api/diags/'+doc._id)
                .set({
                        'Content-Type': 'application/json',
                        'x-access-token': userInfos.testAdminToken
                    })
                .expect(200)
                .end(function(err, res){
                        // //console.log('修改+'+JSON.stringify(model))
                        // //console.log('修改+++'+JSON.stringify(result))
                        // //console.log('删除++++'+JSON.stringify(res.body.result._id))
                        should.not.exist(err);
                        expect(res.body.code).to.be.equal(0);
                        done();    
                })
            })
        })
        
    })
})
