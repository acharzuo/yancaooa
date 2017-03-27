const app = require('../../app')
const request = require('supertest').agent(app.listen())
const mongoose = require('mongoose');
var async = require('async');
var userFunc = require('../lib/common').userFunc;
var userService = require('../../api/user/service');
var expect = require('chai').expect;
var should = require('chai').should();


describe('经络管理',function(){
    var testId;
    before(function(done){
        done();
    });
    //测试增加meridian
    it('post /api/meridians, 添加经络',function(done){
        var model = {
            meridianName:'經絡',
            phoneticize:'duiduanxue',
            image:'http://placehold.it/100X100',
            otherName:'卡卡卡卡',
            internationalCode:'010010',
            englishName:'duiduanxue',
            indication:'主治睡眠不良',
            original:'最初记载',
            path: '循行路线',
            acupoints: ['经络上的穴位'],
            syndromes: '病候',
            verses: '歌诀'
        };
        userFunc(function(userInfos){
            request
            .post('/api/meridians')
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

    //测试修改meridian
    it('patch /api/meridians/:id,修改经络信息',function(done){
        var model = {
            meridianName:'人',
            phoneticize:'duiduanxue',
            image:'http://placehold.it/100X100',
            otherName:'達克賽德好',
            internationalCode:'010010',
            englishName:'duiduanxue',
            indication:'打算',
            original:'最初记载',
            path: '循行路线',
            acupoints: ['兌端穴'],
            syndromes: '病候',
            verses: '歌诀'
        };
        userFunc(function(userInfos){
            request
            .patch('/api/meridians/'+testId)
            .set({
                'Content-Type': 'application/json',
                'x-access-token': userInfos.testAdminToken
            })
            .send(model)
            .expect(200)
            .end(function(err,res){
                //console.log(res.body);
                should.not.exist(err);
                expect(res.body.code).to.be.equal(0);
                // expect(res.body.result).to.be.include.keys('_id');
                done();
            });
        });
    });


    //查看某一经络
    it('get /api/meridians/:id,查看经络信息',function(done){
        var model = {
            meridianName:'人',
            phoneticize:'duiduanxue',
            image:'http://placehold.it/100X100',
            otherName:'達克賽德好',
            internationalCode:'010010',
            englishName:'duiduanxue',
            indication:'打算',
            original:'最初记载',
            path: '循行路线',
            acupoints: ['兌端穴'],
            syndromes: '病候',
            verses: '歌诀'
        };
        userFunc(function(userInfos){
            request
            .get('/api/meridians/'+testId)
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
                expect(res.body.result.verses).to.be.equal('歌诀');
                done();
            });
        });
    });

    // 查看列表
    it('get /api/meridians 查看列表',function(done){
        var url = '/api/meridians?'+'internationalCode=010010&'+'meridianName='+encodeURI('人');
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
                expect(res.body.result.docs[0].meridianName).to.be.equal('人');
                should.not.exist(err);
                done();
            });
        });
    });

    // 删除
    it('delete /api/meridians/:id 删除经络',function(done){
        userFunc(function(userInfos){
            request
            .del('/api/meridians/'+ testId)
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
    it('delete /api/batch/meridians/:ids 批量删除经络',function(done){
        userFunc(function(userInfos){
            request
            .del('/api/batch/meridians/'+ testId)
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
