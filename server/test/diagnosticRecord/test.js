const app = require('../../app')
const request = require('supertest').agent(app.listen())
const mongoose = require('mongoose');
var async = require('async');
var Model = mongoose.model('DiagnosticRecord');
var userFunc = require('../lib/common').userFunc;
var userService = require('../../api/user/service');
var expect = require('chai').expect;
var should = require('chai').should();

describe('诊断记录',function(){
    var testId;
    before(function(done){
        done();
    });

    //测试增加diagnosticRecord
    it('post /api/pc/diagnostic-records, 添加诊断记录',function(done){
        var model = {
            tel:'1823312124', //病人联系方式
            name: '我是拿破仑',  //病人姓名
            birthday: 14552582245254,//病人出生日期
            idCardNumber: '13060819205201834', //病人身份证号
            selfReported: '抵抗力', //主诉
            medicalHistory: '感冒发烧流鼻涕', //病史
            sex: 1,   //病人性别
        };
        userFunc(function(userInfos){
            request
            .post('/api/pc/diagnostic-records')
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

    // 诊断报告列表
    it('get /api/diagnostic-records 查看列表',function(done){
        var url = '/api/diagnostic-records?'+'tel=1823312124&'+'name='+encodeURI('拿');
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
                // expect(res.body.result.total).to.be.equal(1);
                expect(res.body.result.docs[0].name).to.be.equal('我是拿破仑');
                should.not.exist(err);
                done();
            });
        });
    });

    //返回检测总数
    it('get /api/pc/diagnostic-records/peoples 检测总数',function(done){
        userFunc(function(userInfos){
            request
            .get('/api/pc/diagnostic-records/peoples')
            .set({
                'Content-Type': 'application/json;charset=utf-8',
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

    //给诊断记录添加标签
    it('patch /api/pc/diagnostic-records/:id 添加标签',function(done){
        var model = {
            label : ['lala']
        };
        userFunc(function(userInfos){
            request
            .patch("/api/pc/diagnostic-records/" +testId)
            .set({
                'Content-Type': 'application/json;charset=utf-8',
                'x-access-token': userInfos.testAdminToken
            })
            .send(model)
            .expect(200)
            .end(function(err,res){
                should.not.exist(err);
                expect(res.body.code).to.be.equal(0);
                expect(res.body.result.ok).to.eql(1);
                done();
            });
        });
    });

    //pc端诊断报告
    it('get /api/pc/diagnostic-records 查看pc列表',function(done){
        var url = '/api/pc/diagnostic-records?'+'tel=1823312124&'+'name='+encodeURI('拿');
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
                // expect(res.body.result.total).to.be.equal(1);
                expect(res.body.result.docs[0].name).to.be.equal('我是拿破仑');
                should.not.exist(err);
                done();
            });
        });
    });

    //pc查看一个诊断报告
    it('get /api/pc/diagnostic-records/:id 查看列表',function(done){
        userFunc(function(userInfos){
            request
            .get('/api/pc/diagnostic-records/'+ testId)
            .set({
                'Content-Type': 'application/json;charset=utf-8',
                'x-access-token': userInfos.testAdminToken
            })
            .expect(200)
            .end(function(err,res){
                should.not.exist(err);
                expect(res.body.code).to.be.equal(0);
                expect(res.body.result.name).to.be.equal('我是拿破仑');
                done();
            });
        });
    });

    //pc对比报告
    it('get /api/pc/diagnostic-records/comparison/:ids 查看列表',function(done){
        userFunc(function(userInfos){
            request
            .get('/api/pc/diagnostic-records/comparison/'+ testId)
            .set({
                'Content-Type': 'application/json;charset=utf-8',
                'x-access-token': userInfos.testAdminToken
            })
            .expect(200)
            .end(function(err,res){
                should.not.exist(err);
                expect(res.body.code).to.be.equal(0);
                expect(res.body.result[0].name).to.be.equal('我是拿破仑');
                done();
            });
        });
    });

    after(function(done){
        Model.remove({"_id":testId},function(err,doc){
            //console.log('diagnosticRecord 删除成功！');
            done();
        });
    });

});
