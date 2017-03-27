const app = require('../../app')
const request = require('supertest').agent(app.listen())
const mongoose = require('mongoose');
const Recommend = mongoose.model('Recommend');
const User = mongoose.model('User');
var async = require('async');
var userFunc = require('../lib/common').userFunc;
var userService = require('../../api/user/service');
var expect = require('chai').expect;
var should = require('chai').should();

var user_id;
var id ;
describe('推荐管理', function(){

    before(function(done){
        var data1 = {
            name:'测试名字233'
        }
        User.create(data1,function(err,doc){
                // //console.log(err);
                user_id = doc._id
                // //console.log('user+'+user_id)
                done();
        })
        
    });
    after(function(done){
        User.findOneAndRemove({name:'测试名字233'},function(err,doc){
            ////console.log('删除+'+err);
            done();
        });
    })

    // 测试增加device
    it('post /api/recommends,添加推荐记录', function(done){

        var model = {
            userId:user_id,//用户id
            recommendNum:0,//案例标题
            readNum:0,//标签
            url:'www.baidu.com',//内容
            
        };
        userFunc(function(userInfos){
            // //console.log(userInfos)
            // //console.log('token'+userInfos.testAdminToken);
            request
            .post('/api/app/recommends')
            .set({
                    'Content-Type': 'application/json',
                    'x-access-token': userInfos.testAdminToken
                })
            .send(model)
            .expect(200)
            .end(function(err, res){
                // //console.log('创建+'+user_id)
                id = res.body.result._id;
                should.not.exist(err);
                expect(res.body.code).to.be.equal(0);
                done();
            })
        })
        
    })

    // 测试修改shop
    it('patch /api/recommends/:id,修改阅读数', function(done){

        var model = {
            userId:user_id,//用户id
            recommendNum:0,//案例标题
            readNum:1,//标签
            url:'www.baidu.com',//内容
        }
        userFunc(function(userInfos){
            // //console.log(userInfos)
                //console.log('修改123+'+user_id)
                // //console.log('token'+userInfos.testAdminToken);
                request
                .patch('/api/app/recommends/'+user_id)
                .set({
                        'Content-Type': 'application/json',
                        'x-access-token': userInfos.testAdminToken
                    })
                .expect(200)
                .end(function(err, res){
                    Recommend.findOne({userId:user_id},function(error,result){
                        //console.log('修改+'+res.body)
                        // //console.log('修改+++'+JSON.stringify(result))
                        // //console.log('修改++++'+JSON.stringify(res.body))
                        should.not.exist(error);
                        expect(res.body.code).to.be.equal(0);
                        expect(result.readNum).to.be.equal(model.readNum);
                        done();                  
                })
            })
            
        })
        
    })

    // // 查询案例
    // it('get /api/recommends/:id,查询推荐记录', function(done){

    //     var model = {
    //         userId:diagnosticRecord_id,//用户id
    //         caseName:'没得编了123',//案例标题
    //         label:['测测'],//标签
    //         content:'生病就要吃药',//内容
    //         preview:0,//预览数
    //         imgSrc:'c:\img.jpg',//图片
    //     };
    //     userFunc(function(userInfos){
    //         // //console.log(userInfos)
    //         ExcellentCase.findOne({caseName:"没得编了123"}, function(err, doc){
    //             // //console.log('修改123+'+doc)
    //             // //console.log('token'+userInfos.testAdminToken);
    //             request
    //             .get('/api/recommends/'+doc._id)
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
    //                     expect(res.body.result.label).to.be.a('Array');
    //                     expect(res.body.result.caseName).to.be.equal(model.caseName);
    //                     expect(res.body.result.userId.toString()).to.be.equal(model.userId.toString());
    //                     expect(res.body.result.content).to.be.equal(model.content);
    //                     expect(res.body.result.preview).to.be.equal(model.preview);
    //                     expect(res.body.result.imgSrc).to.be.equal(model.imgSrc);
    //                     done();    
    //             })
    //         })
            
    //     })
        
    // })

    // 条件查询广告
    it('get /api/recommends/:id,条件查询推荐记录', function(done){
        var url = '/api/recommends?easyQuery='+encodeURI('测试名字233');
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
                        //console.log('修改')
                        // //console.log('修改+++'+JSON.stringify(result))
                        // //console.log('查询++++'+JSON.stringify(res.body.result.total))
                        expect(res.body.code).to.be.equal(0);
                        expect(res.body.result.docs[0].userId).to.be.equal(user_id.toString());
                        should.not.exist(err);
                        done();    
                })
            })
    })

    // 删除广告
    it('delete /api/recommends/:id,删除推荐记录', function(done){
        Recommend.findOne({_id:id},function(err,doc){
            userFunc(function(userInfos){
            // //console.log(userInfos)
                request
                .del('/api/recommends/'+doc._id)
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
