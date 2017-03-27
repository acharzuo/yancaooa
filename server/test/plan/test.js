const app = require('../../app')
const request = require('supertest').agent(app.listen())
const mongoose = require('mongoose');
var async = require('async');
var userFunc = require('../lib/common').userFunc;
var userService = require('../../api/user/service');
var expect = require('chai').expect;
var should = require('chai').should();

describe('诊断方案管理',function(){
    var testId;
    before(function(done){
        done();
    });

    //测试增加plan
    it('post /api/plans, 添加诊疗方案',function(done){
        var model = {
            title:'兑端穴',
            conclusion:'duiduanxue',
            disease:'卡卡卡卡',
            emotion:'duiduanxue',
            character:'面部',
            treatPlan:'直接上刀子了',
            healthPlan:'主治睡眠不良',
            dietPlan:'这我就没有办法编下去了。。'
        };
        userFunc(function(userInfos){
            request
            .post('/api/plans')
            .set({
                'Content-Type':'application/json',
                'x-access-token':userInfos.testAdminToken
            })
            .send(model)
            .expect(200)
            .end(function(err,res){
                should.not.exist(err);
                expect(res.body.code).to.be.equal(0);
                expect(res.body.result).to.be.include.keys('_id');
                testId = res.body.result._id;
                done();
            });
        });
    });

    //测试修改plan
    it('patch /api/plans/:id,修改诊疗方案信息',function(done){
        var model = {
            title:'肝经虚症',
            conclusion:'duiduanxue',
            disease:'卡卡卡卡',
            emotion:'暴躁',
            character:'温和',
            treatPlan:'治疗方案',
            healthPlan:'养生方案',
            dietPlan:'这我就没有办法编下去了。。'
        };
        userFunc(function(userInfos){
            request
            .patch('/api/plans/'+testId)
            .set({
                'Content-Type': 'application/json',
                'x-access-token': userInfos.testAdminToken
            })
            .send(model)
            .expect(200)
            .end(function(err,res){
                should.not.exist(err);
                expect(res.body.code).to.be.equal(0);
                expect(res.body.result).to.be.include.keys('_id');
                for(var key in model){
                    expect(res.body.result[key]).to.be.equal(model[key]);
                }
                done();
            });
        });
    });


    //查看某一诊疗方案
    it('get /api/plans/:id,查看诊疗方案信息',function(done){
        var model = {
            title:'肝经虚症',
            conclusion:'duiduanxue',
            disease:'卡卡卡卡',
            emotion:'暴躁',
            character:'温和',
            treatPlan:'治疗方案',
            healthPlan:'养生方案',
            dietPlan:'这我就没有办法编下去了。。'
        };
        userFunc(function(userInfos){
            request
            .get('/api/plans/'+testId)
            .set({
                'Content-Type': 'application/json',
                'x-access-token': userInfos.testAdminToken
            })
            .send(model)
            .expect(200)
            .end(function(err,res){
                should.not.exist(err);
                expect(res.body.code).to.be.equal(0);
                expect(res.body.result).to.be.include.keys('_id');
                for(var key in model){
                    expect(res.body.result[key]).to.be.equal(model[key]);
                }
                done();
            });
        });
    });

    // 查看列表
    it('get /api/plans 查看列表',function(done){
        var url = '/api/plans?'+'easyQuery=' + encodeURI('肝经虚症');
        userFunc(function(userInfos){
            request
            .get(url)
            .set({
                'Content-Type': 'application/json;charset=utf-8',
                'x-access-token': userInfos.testAdminToken
            })
            .expect(200)
            .end(function(err,res){
                expect(res.body.code).to.be.equal(0);
                expect(res.body.result.total).to.be.equal(1);
                expect(res.body.result.docs[0].character).to.be.equal('温和');
                should.not.exist(err);
                done();
            });
        });
    });


    // 删除
    it('delete /api/plans/:id 删除诊疗方案',function(done){
        userFunc(function(userInfos){
            request
            .del('/api/plans/'+ testId)
            .set({
                'Content-Type': 'application/json',
                'x-access-token': userInfos.testAdminToken
            })
            .expect(200)
            .end(function(err,res){
                should.not.exist(err);
                expect(res.body.code).to.be.equal(0);
                done();
            });
        });
    });


});
