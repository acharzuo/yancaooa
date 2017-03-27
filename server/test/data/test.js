const app = require('../../app')
const request = require('supertest').agent(app.listen())
const mongoose = require('mongoose');
const Model = mongoose.model('Data');
const diagRcd = mongoose.model('DiagnosticRecord');
var async = require('async');
var userFunc = require('../lib/common').userFunc;
var userService = require('../../api/user/service');
var expect = require('chai').expect;
var should = require('chai').should();

describe('原始数据',function(){
    var testId ,diagRcdId;
    before(function(done){
        var data = {
            name:'这是患者',
            tel:'13546131654'
        };
        diagRcd.create(data,function(err,doc){
            diagRcdId = doc._id;
            done();
        });
    });

    //测试增加data
    it('post /api/pc/datas 增加原始数据',function(done){
        var model = {
            diagnosticRecord:diagRcdId,
            datas : [11,44,333]
        };
        userFunc(function(userInfos){
            request
            .post('/api/pc/datas')
            .set({
                'Content-Type':'application/json',
                'x-access-token':userInfos.testAdminToken
            })
            .send(model)
            .expect(200)
            .end(function(err,res){
                should.not.exist(err);
                expect(res.body.code).to.be.equal(0);
                testId = res.body.result.rawData._id;
                // console.log("这是诊断报告",res.body.resu);
                done();
            });
        });
    });
    //查看原始数据
    it('get /api/datas/:id,查看原始数据',function(done){
        //为了做数据验证
        var model = {
            diagnosticRecord : diagRcdId,
            datas : [11,44,333]
        };
        userFunc(function(userInfos){
            request
            .get('/api/datas/' + testId)
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
                expect(res.body.result.origin).to.eql(model.datas);
                done();
            });
        });
    });


    after(function(done){
        diagRcd.remove({"_id":diagRcdId},function(err,doc){
            if (!err&&doc) {
                //console.log('diagnosticRecord删除成功！');
                Model.remove({"_id":testId},function(err,docs){
                    //console.log('data删除成功！');
                    done();
                });
            }
        });
    });
});
