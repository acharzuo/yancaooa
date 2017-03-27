const app = require('../../app')
const request = require('supertest').agent(app.listen())
const mongoose = require('mongoose');
const Model = mongoose.model('Category');
var async = require('async');
var userFunc = require('../lib/common').userFunc;
var userService = require('../../api/user/service');
var expect = require('chai').expect;
var should = require('chai').should();

describe('分类管理',function(){
    var testId,parentId,newParentId;
    before(function(done){
        var data = {
            name:'这是父级'
        };
        var newData = {
            name:'这是新父级'
        };

        Model.create(data,function(err,doc){
            parentId = doc._id;
            //console.log('生成的父级',parentId);
            Model.create(newData,function(err,doc){
                newParentId = doc._id;
                //console.log('新生成的newParentId',newParentId);
                done();//异步
            });
        });
        // done();
    });

    //添加分类
    it('post /api/categories, 新增分类',function(done){
        var model = {
            name:'这是子类',
            parentId:parentId
        };
        userFunc(function(userInfos){
            request
            .post('/api/categories')
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
    it('get /api/categories 查看列表',function(done){
        var url = '/api/categories';
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
                expect(res.body.result[0].name).to.be.equal('这是新父级');
                should.not.exist(err);
                done();
            });
        });
    });
    // //查看某一分类内容
    it('get /api/categories/:id,查看分类的子类',function(done){
        var model = {
            name:'这是子类'
        };
        userFunc(function(userInfos){
            request
            .get('/api/categories/' + testId)
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
    //修改分类
    it('patch /api/categories/:id,修改分类信息',function(done){
        var model = {
            name : '啦啦啦',
        };
        userFunc(function(userInfos){
            request
            .patch('/api/categories/' + testId)
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

    //移动分类
    it('patch /api/categories/address/:id,修改分类信息',function(done){
        var data = {
            parentId : newParentId
        };
        userFunc(function(userInfos){
            request
            .patch('/api/categories/address/' + testId)
            .set({
                'Content-Type': 'application/json',
                'x-access-token': userInfos.testAdminToken
            })
            .send(data)
            .expect(200)
            .end(function(err,res){
                should.not.exist(err);
                expect(res.body.code).to.be.equal(0);
                expect(res.body.result).to.be.include.keys('_id');
                done();
            });
        });
    });

    //删除分类
    it('delete /api/categories/:id 删除分类',function(done){
        userFunc(function(userInfos){
            request
            .del('/api/categories/'+ testId)
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
                //console.log('parentId 删除成功！');
                Model.remove({'_id:':newParentId},function(err,doc){
                    //console.log('newParentId 删除成功！');
                    done();
                });
            }
        });
    });
});
