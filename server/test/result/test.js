const app = require('../../app')
const request = require('supertest').agent(app.listen())
const mongoose = require('mongoose');
var async = require('async');
var Model = mongoose.model('Result');
var userFunc = require('../lib/common').userFunc;
var userService = require('../../api/user/service');
var expect = require('chai').expect;
var should = require('chai').should();

//TODO 需要创建 data,但是返回值没有result ID,无法获取
describe('诊断结果',function(){
    // var testId;
    // before(function(done){
    //     done();
    // });
    //
    // //查看诊断结果
    // it('get /api/results/:id,查看诊断结果信息',function(done){
    //
    //     userFunc(function(userInfos){
    //         request
    //         .get('/api/results/'+testId)
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
