const app = require('../../app')
const request = require('supertest').agent(app.listen())
const mongoose = require('mongoose');
var async = require('async');
var Model = mongoose.model('Report');
var userFunc = require('../lib/common').userFunc;
var userService = require('../../api/user/service');
var expect = require('chai').expect;
var should = require('chai').should();

//TODO 需要创建 data,但是返回值没有report ID,无法获取
describe('诊断报告',function(){
    // var testId;
    // before(function(done){
    //     done();
    // });
    //
    // //查看诊断报告
    // it('get /api/reports/:id,查看报告信息',function(done){
    //
    //     userFunc(function(userInfos){
    //         request
    //         .get('/api/reports/'+testId)
    //         .set({
    //             'Content-Type': 'application/json',
    //             'x-access-token': userInfos.testAdminToken
    //         })
    //         .send(model)
    //         .expect(200)
    //         .end(function(err,res){
    //             should.not.exist(err);
    //             expect(res.body.code).to.be.equal(0);
    //             expect(res.body.result).to.be.include.keys('_id');
    //             for(var key in model){
    //                 expect(res.body.result[key]).to.be.equal(model[key]);
    //             }
    //             done();
    //         });
    //     });
    // });
    //
    // after(function(done){
    //     done();
    // });
});
