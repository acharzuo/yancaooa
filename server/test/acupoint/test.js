const app = require('../../app')
const request = require('supertest').agent(app.listen())
const mongoose = require('mongoose');
var async = require('async');
var userFunc = require('../lib/common').userFunc;
var userService = require('../../api/user/service');
var expect = require('chai').expect;
var should = require('chai').should();


describe('穴位管理',function(){
    var testId;
    before(function(done){
        done();
    });
    //测试增加acupoint
    it('post /api/acupoints, 添加穴位',function(done){
        var model = {
            acupointName:'兑端穴',
            phoneticize:'duiduanxue',
            image:'http://placehold.it/100X100',
            otherName:'卡卡卡卡',
            internationalCode:'010010',
            englishName:'duiduanxue',
            location:'面部',
            anatomy:'直接上刀子了',
            indication:'主治睡眠不良',
            operation:'这我就没有办法编下去了。。'
        };
        userFunc(function(userInfos){
            request
            .post('/api/acupoints')
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

    //测试修改acupoint
    it('patch /api/acupoints/:id,修改穴位信息',function(done){
        var model = {
            acupointName:'兑端穴',
            phoneticize:'duiduanxue',
            image:'http://placehold.it/100X100',
            otherName:'卡卡卡卡',
            internationalCode:'154315',
            englishName:'duiduanxue',
            location:'在腿上',
            anatomy:'直接上刀子了',
            indication:'主治睡眠不良',
            operation:'相信自己可以编下去的。。'
        };
        userFunc(function(userInfos){
            request
            .patch('/api/acupoints/'+testId)
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


    //查看某一穴位
    it('get /api/acupoints/:id,查看穴位信息',function(done){
        var model = {
            acupointName:'兑端穴',
            phoneticize:'duiduanxue',
            image:'http://placehold.it/100X100',
            otherName:'卡卡卡卡',
            internationalCode:'154315',
            englishName:'duiduanxue',
            location:'在腿上',
            anatomy:'直接上刀子了',
            indication:'主治睡眠不良',
            operation:'相信自己可以编下去的。。'
        };
        userFunc(function(userInfos){
            request
            .get('/api/acupoints/'+testId)
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
    it('get /api/acupoints 查看列表',function(done){
        var url = '/api/acupoints?'+'internationalCode=154315&'+'acupointName='+encodeURI('端')+'&operation='+encodeURI('相信');
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
                expect(res.body.result.docs[0].acupointName).to.be.equal('兑端穴');
                should.not.exist(err);
                done();
            });
        });
    });
    //常见穴位 pc
    it('get /api/pc/acupoints 查看列表',function(done){
        userFunc(function(userInfos){
            request
            .get('/api/acupoints')
            .set({
                'Content-Type': 'application/json;charset=utf-8',
                'x-access-token': userInfos.testAdminToken
            })
            .expect(200)
            .end(function(err,res){
                expect(res.body.code).to.be.equal(0);
                expect(res.body.result.total).to.be.equal(1);
                should.not.exist(err);
                done();
            });
        });
    });

    // 删除
    it('delete /api/acupoints/:id 删除穴位',function(done){
        userFunc(function(userInfos){
            request
            .del('/api/acupoints/'+ testId)
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
    //批量删除
    it('delete /api/batch/acupoints/:ids 批量删除穴位',function(done){
        userFunc(function(userInfos){
            request
            .del('/api/batch/acupoints/'+ testId)
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
