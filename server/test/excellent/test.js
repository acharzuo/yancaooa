const app = require('../../app')
const request = require('supertest').agent(app.listen())
const mongoose = require('mongoose');
const ExcellentCase = mongoose.model('ExcellentCase');
const diagnosticRecord = mongoose.model('DiagnosticRecord');
var async = require('async');
var userFunc = require('../lib/common').userFunc;
var userService = require('../../api/user/service');
var expect = require('chai').expect;
var should = require('chai').should();

var diagnosticRecord_id;
describe('优秀案例管理', function(){

    before(function(done){
        var data1 = {
            name:'测试名字23'
        }
        diagnosticRecord.create(data1,function(err,doc){
                // //console.log(err);
                diagnosticRecord_id = doc._id
                done();
        })
        
    });
    after(function(done){
        diagnosticRecord.findOneAndRemove({name:'测试名字23'},function(err,doc){
            ////console.log('删除+'+err);
            done();
        });
    })

    // 测试增加device
    it('post /api/excellents,添加优秀案例', function(done){

        var model = {
            userId:diagnosticRecord_id,//用户id
            caseName:'没得编了',//案例标题
            label:['测测'],//标签
            content:'生病就要吃药',//内容
            preview:0,//预览数
            imgSrc:'c:\img.jpg',//图片
        };
        userFunc(function(userInfos){
            // //console.log(userInfos)
            // //console.log('token'+userInfos.testAdminToken);
            request
            .post('/api/excellents')
            .set({
                    'Content-Type': 'application/json',
                    'x-access-token': userInfos.testAdminToken
                })
            .send(model)
            .expect(200)
            .end(function(err, res){
                should.not.exist(err);
                expect(res.body.code).to.be.equal(0);
                done();
            })
        })
        
    })

    // 测试修改shop
    it('patch /api/excellents/:id,修改优秀案例', function(done){

        var model = {
            userId:diagnosticRecord_id,//用户id
            caseName:'没得编了123',//案例标题
            label:['测测'],//标签
            content:'生病就要吃药',//内容
            preview:0,//预览数
            imgSrc:'c:\img.jpg',//图片
        }
        userFunc(function(userInfos){
            // //console.log(userInfos)
            ExcellentCase.findOne({caseName:"没得编了"}, function(err, doc){
                // //console.log('修改123+'+doc)
                // //console.log('token'+userInfos.testAdminToken);
                request
                .patch('/api/excellents/'+doc._id)
                .set({
                        'Content-Type': 'application/json',
                        'x-access-token': userInfos.testAdminToken
                    })
                .send(model)
                .expect(200)
                .end(function(err, res){
                    ExcellentCase.findOne({_id:doc._id},function(error,result){
                        // //console.log('修改+'+JSON.stringify(model))
                        // //console.log('修改+++'+JSON.stringify(result))
                        // //console.log('修改++++'+JSON.stringify(res.body))
                        should.not.exist(error);
                        expect(res.body.code).to.be.equal(0);
                        expect(result.label).to.be.a('Array');
                        expect(result.caseName).to.be.equal(model.caseName);
                        expect(result.userId.toString()).to.be.equal(model.userId.toString());
                        expect(result.content).to.be.equal(model.content);
                        expect(result.preview).to.be.equal(model.preview);
                        expect(result.imgSrc).to.be.equal(model.imgSrc);
                        done();
                    })
                    
                })
            })
            
        })
        
    })

    // 查询案例
    it('get /api/excellents/:id,查询优秀案例', function(done){

        var model = {
            userId:diagnosticRecord_id,//用户id
            caseName:'没得编了123',//案例标题
            label:['测测'],//标签
            content:'生病就要吃药',//内容
            preview:0,//预览数
            imgSrc:'c:\img.jpg',//图片
        };
        userFunc(function(userInfos){
            // //console.log(userInfos)
            ExcellentCase.findOne({caseName:"没得编了123"}, function(err, doc){
                // //console.log('修改123+'+doc)
                // //console.log('token'+userInfos.testAdminToken);
                request
                .get('/api/excellents/'+doc._id)
                .set({
                        'Content-Type': 'application/json',
                        'x-access-token': userInfos.testAdminToken
                    })
                .expect(200)
                .end(function(err, res){
                        // //console.log('修改+'+JSON.stringify(model))
                        // //console.log('修改+++'+JSON.stringify(result))
                        // //console.log('修改++++'+JSON.stringify(res.body))
                        should.not.exist(err);
                        expect(res.body.code).to.be.equal(0);
                        expect(res.body.result.label).to.be.a('Array');
                        expect(res.body.result.caseName).to.be.equal(model.caseName);
                        expect(res.body.result.userId.toString()).to.be.equal(model.userId.toString());
                        expect(res.body.result.content).to.be.equal(model.content);
                        expect(res.body.result.preview).to.be.equal(model.preview);
                        expect(res.body.result.imgSrc).to.be.equal(model.imgSrc);
                        done();    
                })
            })
            
        })
        
    })

    // 条件查询广告
    it('get /api/excellents/:id,条件查询案例', function(done){
        var url = '/api/excellents?caseName='+encodeURI('没得编了123');
        userFunc(function(userInfos){
            // //console.log(userInfos)
                request
                .get(url)
                .set({
                        'Content-Type': 'application/json',
                        'x-access-token': userInfos.testAdminToken
                    })
                .expect(200)
                .end(function(err, res){
                        // //console.log('修改+'+JSON.stringify(model))
                        // //console.log('修改+++'+JSON.stringify(result))
                        // //console.log('查询++++'+JSON.stringify(res.body.result.total))
                        expect(res.body.code).to.be.equal(0);
                        expect(res.body.result.total).to.be.equal(1);
                        should.not.exist(err);
                        done();    
                })
            })
    })

    // 删除广告
    it('delete /api/excellents/:id,删除优秀案例', function(done){
        ExcellentCase.findOne({caseName:"没得编了123"},function(err,doc){
            userFunc(function(userInfos){
            // //console.log(userInfos)
                request
                .del('/api/excellents/'+doc._id)
                .set({
                        'Content-Type': 'application/json',
                        'x-access-token': userInfos.testAdminToken
                    })
                .expect(200)
                .end(function(err, res){
                        // //console.log('修改+'+JSON.stringify(model))
                        // //console.log('修改+++'+JSON.stringify(result))
                        // //console.log('删除++++'+JSON.stringify(res.body.result._id))
                        should.not.exist(err);
                        expect(res.body.code).to.be.equal(0);
                        done();    
                })
            })
        })
        
    })
})
