const app = require('../../app')
const request = require('supertest').agent(app.listen())
const mongoose = require('mongoose');
const Edition = mongoose.model('Edition');
var async = require('async');
var userFunc = require('../lib/common').userFunc;
var userService = require('../../api/user/service');
var expect = require('chai').expect;
var should = require('chai').should();

var Edition_id;
describe('版本管理', function(){

    before(function(done){
        // var data = {
        //     name:'测试店铺',
        //     shopId:'1657'
        // }
        // Shop.create(data,function(err,doc){
        //         //console.log(err);
        //         shop_id = doc._id
        //         done();
        // });
        done();
    });

    // 测试增加device
    it('post /api/editions,添加版本', function(done){

        var model = {
            version:'0.1.0',//版本号
            updateContent:'暂时无更新介绍',//更新内容
        };
        userFunc(function(userInfos){
            // //console.log(userInfos)
            // //console.log('token'+userInfos.testAdminToken);
            request
            .post('/api/editions')
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

    // // 测试修改shop
    // it('patch /api/editions/:id,修改案例', function(done){

    //    var model = {
    //         version:'0.1.1',//版本号
    //         updateContent:'暂时无更新介绍',//更新内容
    //     };
    //     userFunc(function(userInfos){
    //         // //console.log(userInfos)
    //         Edition.findOne({version:"0.1.0"}, function(err, doc){
    //             // //console.log('修改123+'+doc)
    //             // //console.log('token'+userInfos.testAdminToken);
    //             request
    //             .patch('/api/editions/'+doc._id)
    //             .set({
    //                     'Content-Type': 'application/json',
    //                     'x-access-token': userInfos.testAdminToken
    //                 })
    //             .send(model)
    //             .expect(200)
    //             .end(function(err, res){
    //                 Edition.findOne({_id:doc._id},function(error,result){
    //                     // //console.log('修改+'+JSON.stringify(model))
    //                     // //console.log('修改+++'+JSON.stringify(result))
    //                     // //console.log('修改++++'+JSON.stringify(res.body))
    //                     should.not.exist(error);
    //                     expect(res.body.code).to.be.equal(0);
    //                     expect(result.Edition).to.be.equal(model.Edition);
    //                     expect(result.answer).to.be.a('Array');
    //                     done();
    //                 })
                    
    //             })
    //         })
            
    //     })
        
    // })

    // // 查询案例
    // it('get /api/editions/:id,查询案例', function(done){

    //     var model = {
    //         version:'0.1.0',//版本号
    //         updateContent:'暂时无更新介绍',//更新内容
    //     };
    //     userFunc(function(userInfos){
    //         // //console.log(userInfos)
    //         Edition.findOne({Edition:"生病了1"}, function(err, doc){
    //             // //console.log('修改123+'+doc)
    //             // //console.log('token'+userInfos.testAdminToken);
    //             request
    //             .get('/api/editions/'+doc._id)
    //             .set({
    //                     'Content-Type': 'application/json',
    //                     'x-access-token': userInfos.testAdminToken
    //                 })
    //             .expect(200)
    //             .end(function(err, res){
    //                     // //console.log('修改+'+JSON.stringify(model))
    //                     // //console.log('修改+++'+JSON.stringify(result))
    //                     // //console.log('修改++++'+JSON.stringify(res.body))
    //                     should.not.exist(err);
    //                     expect(res.body.code).to.be.equal(0);
    //                     expect(res.body.result.Edition).to.be.equal(model.Edition);
    //                     expect(res.body.result.answer).to.be.a('Array');
    //                     done();    
    //             })
    //         })
            
    //     })
        
    // })

    // 条件查询广告
    it('get /api/editions,条件查询版本', function(done){
        var url = '/api/editions?easyQuery='+encodeURI('0.1.0');
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

    

    // 增加版本下载数
    it('patch /api/editions/:id,增加下载次数', function(done){
            userFunc(function(userInfos){
            // //console.log(doc)
                request
                .patch('/api/app/editions')
                .set({
                        'Content-Type': 'application/json',
                        'x-access-token': userInfos.testAdminToken
                    })
                .expect(200)
                .end(function(err, res){
                        // //console.log('修改+'+JSON.stringify(model))
                        // //console.log('修改+++'+JSON.stringify(result))
                        // //console.log('增加++++'+JSON.stringify(res.body.result))
                        should.not.exist(err);
                        expect(res.body.code).to.be.equal(0);
                        done();    
                })
            })
        
    })

    // 删除广告
    it('delete /api/editions/:id,删除版本', function(done){
        Edition.findOne({version:"0.1.0"},function(err,doc){
            userFunc(function(userInfos){
            // //console.log(doc)
                request
                .del('/api/editions/'+doc._id)
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
