const app = require('../../app')
const request = require('supertest').agent(app.listen())
const mongoose = require('mongoose');
const Model = mongoose.model('Area');
var async = require('async');
var userFunc = require('../lib/common').userFunc;
var userService = require('../../api/user/service');
var expect = require('chai').expect;
var should = require('chai').should();

describe('省市管理',function(){
    var testId,parentId;
    before(function(done){
        var data = {
            name:'省市'
        };
        Model.create(data,function(err,doc){
            parentId = doc._id;
            done();//异步
        });
        // done();
    });

    //添加省市
    it('post /api/areas, 新增省市',function(done){
        var model = {
            name:'这是子类',
            parentId:parentId
        };
        userFunc(function(userInfos){
            request
            .post('/api/areas')
            .set({
                'Content-Type':'application/json',
                'x-access-token':userInfos.testAdminToken
            })
            .send(model)
            .expect(200)
            .end(function(err,res){
                should.not.exist(err);
                expect(res.body.code).to.be.equal(0);
                testId = res.body.result._id;
                done();
            });
        });
    });

    //查看列表
    it('get /api/areas 查看列表',function(done){
        var url = '/api/areas';
        userFunc(function(userInfos){
            request
            .get(url)
            .set({
                'Content-Type':'application/json',
                'x-access-token':userInfos.testAdminToken
            })
            .expect(200)
            .end(function(err,res){
                expect(res.body.code).to.be.equal(0);
                expect(res.body.result[0].name).to.be.equal('省市');
                should.not.exist(err);
                done();
            });
        });
    });
    // //查看某一省市内容
    it('get /api/areas/:id,查看省市的子类',function(done){
        var model = {
            name:'这是子类'
        };
        userFunc(function(userInfos){
            request
            .get('/api/areas/' + testId)
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
                expect(res.body.result.tag).to.eql(model.tag);
                done();
            });
        });
    });
    //修改省市
    it('patch /api/areas/:id,修改省市信息',function(done){
        var model = {
            name:'啦啦啦'
        };
        userFunc(function(userInfos){
            request
            .patch('/api/areas/' + testId)
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
                done();
            });
        });
    });

    //移动省市
    it('patch /api/areas/address/:id,修改省市信息',function(done){
        userFunc(function(userInfos){
            request
            .patch('/api/areas/address/' + testId)
            .set({
                'Content-Type': 'application/json',
                'x-access-token': userInfos.testAdminToken
            })
            .expect(200)
            .end(function(err,res){
                should.not.exist(err);
                expect(res.body.code).to.be.equal(0);
                expect(res.body.result).to.be.include.keys('_id');
                done();
            });
        });
    });

    //删除省市
    it('delete /api/areas/:id 删除省市',function(done){
        userFunc(function(userInfos){
            request
            .del('/api/areas/'+ testId)
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



    after(function(done){
        Model.remove({"_id":parentId},function(err,doc){
            if (!err&&doc) {
                //console.log('删除成功！');
                done();
            }
        });
    });
});
