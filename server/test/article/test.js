const app = require('../../app')
const request = require('supertest').agent(app.listen())
const mongoose = require('mongoose');
const Model = mongoose.model('Article');
const category = mongoose.model('Category');
var async = require('async');
var userFunc = require('../lib/common').userFunc;
var userService = require('../../api/user/service');
var expect = require('chai').expect;
var should = require('chai').should();


describe('资讯管理',function(){
    var testId,categoryId;

    before(function(done){
        var data = {
            name:'养生'
        };
        category.create(data,function(err,doc){
            categoryId = doc._id;
            done();//异步
        });
        // done();
    });
    //测试增加article
    it('post /api/articles, 增加文章',function(done){
        var model = {
            title:'中医养生',
            tag:["hhah","哈哈"],
            image:'http://placehold.it/100*100',
            source:'腾讯',
            author:'三毛',
            pushDate:1564864549845,
            abstract:'这是摘要',
            category:categoryId,
            content:"窗前明月光，疑是地上霜。举头望明月，低头思故乡。"
        };
        userFunc(function(userInfos){
            request
            .post('/api/articles')
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
                //console.log(testId);
                done();
            });
        });
    });
    // //查看列表
    it('get /api/articles 查看列表',function(done){
        var url = '/api/articles?title'+ encodeURI('养生');
        userFunc(function(userInfos){
            request
            .get(url)
            .set({
                'Content-Type':'application/json',
                'x-access-token':userInfos.testAdminToken
            })
            .expect(200)
            .end(function(err,res){
                // //console.log(res.body.result.data);
                expect(res.body.code).to.be.equal(0);
                expect(res.body.result.total).to.be.equal(1);
                expect(res.body.result.data[0].author).to.be.equal('三毛');
                should.not.exist(err);
                done();
            });
        });
    });
    // //查看某一文章
    it('get /api/articles/:id,查看穴位信息',function(done){
        var model = {
            title:'中医养生',
            tag:["hhah","哈哈"],
            image:'http://placehold.it/100*100',
            source:'腾讯',
            author:'三毛',
            pushDate:1564864549845,
            abstract:'这是摘要',
            category:categoryId,
            content:"窗前明月光，疑是地上霜。举头望明月，低头思故乡。"
        };
        userFunc(function(userInfos){
            request
            .get('/api/articles/' + testId)
            .set({
                'Content-Type': 'application/json',
                'x-access-token': userInfos.testAdminToken
            })
            .send(model)
            .expect(200)
            .end(function(err,res){
                // //console.log(res.body.result);
                should.not.exist(err);
                expect(res.body.code).to.be.equal(0);
                expect(res.body.result).to.be.include.keys('_id');
                expect(res.body.result.tag).to.eql(model.tag);
                done();
            });
        });
    });

    // //修改文章
    //测试增加article
    it('patch /api/articles/:id, 修改文章',function(done){
        //console.log(categoryId);
        var model = {
            title:'健康知识',
            tag:["hhah","哈哈"],
            image:'http://placehold.it/50*50',
            source:'阿里巴巴',
            author:'三毛111',
            pushDate:198493473894723,
            abstract:'这是摘要',
            category:categoryId,
            content:"窗前明月光，疑是地上霜。举头望明月，低头思故乡。"
        };
        userFunc(function(userInfos){
            request
            .patch('/api/articles/'+testId)
            .set({
                'Content-Type':'application/json',
                'x-access-token':userInfos.testAdminToken
            })
            .send(model)
            .expect(200)
            .end(function(err,res){
                //console.log(res.body.result);
                should.not.exist(err);
                expect(res.body.code).to.be.equal(0);
                expect(res.body.result).to.be.include.keys('_id');
                expect(res.body.result.title).to.be.equal('健康知识');
                expect(res.body.result.author).to.be.equal('三毛111');
                done();
            });
        });
    });

    // 置顶文章
    it('patch /api/articles/top/:ids 置顶文章',function(done){
        var model = {
            top:1
        };
        userFunc(function(userInfos){
            request
            .del('/api/articles/top/'+ testId)
            .set({
                'Content-Type': 'application/json',
                'x-access-token': userInfos.testAdminToken
            })
            .send(model)
            .expect(200)
            .end(function(err,res){
                should.not.exist(err);
                expect(res.body.code).to.be.equal(0);
                expoct(res.body.result.top).to.eql(1);
                done();
            });
        });
    });
    // 推荐文章
    it('patch /api/articles/highlight/:ids 置顶文章',function(done){
        var model = {
            highlight:1
        };
        userFunc(function(userInfos){
            request
            .del('/api/articles/highlight/'+ testId)
            .set({
                'Content-Type': 'application/json',
                'x-access-token': userInfos.testAdminToken
            })
            .send(model)
            .expect(200)
            .end(function(err,res){
                should.not.exist(err);
                expect(res.body.code).to.be.equal(0);
                expoct(res.body.result.highlight).to.eql(1);
                done();
            });
        });
    });

    //删除文章
    it('delete /api/articles/:id 删除文章',function(done){
        //console.log(testId);
        userFunc(function(userInfos){
            request
            .del('/api/articles/'+ testId)
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

    //批量删除文章
    it('delete /api/batch/articles/:ids 批量删除反馈',function(done){
        userFunc(function(userInfos){
            request
            .del('/api/batch/articles/'+ testId)
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
        category.remove({"_id":categoryId},function(err,doc){
            if (!err&&doc) {
                //console.log('删除成功！');
                done();
            }
        });
    });
});
