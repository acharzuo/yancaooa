const app = require('../../app')
const request = require('supertest').agent(app.listen())
const mongoose = require('mongoose');
var async = require('async');
var Model = mongoose.model('Feedback');
var userFunc = require('../lib/common').userFunc;
var userService = require('../../api/user/service');
var expect = require('chai').expect;
var should = require('chai').should();

describe('信息反馈', function() {

    var testId;
    before(function(done) {
        done();
    });

    //接受反馈
    it('post /api/app/feedbacks 接受反馈', function(done) {
        var model = {
            content: "太好用了！",
            contact: '2919777464'
        };
        userFunc(function(userInfos) {
            request
                .post('/api/app/feedbacks')
                .set({
                    'Content-Type': 'application/json',
                    'x-access-token': userInfos.testAdminToken
                })
                .send(model)
                .expect(200)
                .end(function(err, res) {
                    should.not.exist(err);
                    expect(res.body.code).to.be.equal(0);
                    expect(res.body.result.contact).to.eql('2919777464');
                    testId = res.body.result._id;
                    done();
                });
        });
    });

    //反馈列表
    it('get /api/feedbacks 列表', function(done) {
        var url = '/api/feedbacks?easyQuery = ' + encodeURI('太');
        userFunc(function(userInfos) {
            request
                .get(url)
                .set({
                    'Content-Type': 'application/json',
                    'x-access-token': userInfos.testAdminToken
                })
                .expect(200)
                .end(function(err, res) {
                    should.not.exist(err);
                    expect(res.body.code).to.be.equal(0);
                    expect(res.body.result.docs[0].contact).to.be.equal('2919777464');
                    done();
                });
        });
    });
    //处理反馈
    it('patch /api/feedbacks/dispose/:id 处理反馈', function(done) {
        var model = {
            handle: 1
        };
        userFunc(function(userInfos) {
            request
                .del('/api/feedbacks/dispose/' + testId)
                .set({
                    'Content-Type': 'application/json',
                    'x-access-token': userInfos.testAdminToken
                })
                .send(model)
                .expect(200)
                .end(function(err, res) {
                    should.not.exist(err);
                    expect(res.body.code).to.be.equal(0);
                    expoct(res.body.result.handle).to.eql(1);
                    done();
                });
        });
    });

    //删除一条
    it('delete /api/feedbacks/:id 删除反馈', function(done) {
        userFunc(function(userInfos) {
            request
                .del('/api/feedbacks/' + testId)
                .set({
                    'Content-Type': 'application/json',
                    'x-access-token': userInfos.testAdminToken
                })
                .expect(200)
                .end(function(err, res) {
                    should.not.exist(err);
                    expect(res.body.code).to.be.equal(0);
                    expect(res.body.result.contact).to.eql('2919777464');
                    done();
                });
        });
    });

    //批量删除
    it('delete /api/batch/feedbacks/:ids 批量删除反馈', function(done) {
        userFunc(function(userInfos) {
            request
                .del('/api/batch/feedbacks/' + testId)
                .set({
                    'Content-Type': 'application/json',
                    'x-access-token': userInfos.testAdminToken
                })
                .expect(200)
                .end(function(err, res) {
                    should.not.exist(err);
                    expect(res.body.code).to.be.equal(0);
                    done();
                });
        });
    });





    // after(function(done){
    //     Model.remove({"_id":testId},function(err,doc){
    //         if (!err&&doc) {
    //             //console.log('feedback 删除成功！');
    //             done();
    //         }
    //     });
    // });


});