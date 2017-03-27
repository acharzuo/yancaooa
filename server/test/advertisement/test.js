const app = require('../../app')
const request = require('supertest').agent(app.listen())
const mongoose = require('mongoose');
const Ad = mongoose.model('Ad');
const Shop = mongoose.model('Shop');
var async = require('async');
var userFunc = require('../lib/common').userFunc;
var userService = require('../../api/user/service');
var expect = require('chai').expect;
var should = require('chai').should();

var shop_id;
describe('广告管理', function(){

    before(function(done){
        var data = {
            name:'测试店铺',
            shopId:'1657'
        }
        Shop.create(data,function(err,doc){
                // //console.log(err);
                shop_id = doc._id
                done();
        });

    });
    after(function(done){
        Shop.findOneAndRemove({shopId:'1657'},function(err,doc){
            ////console.log('删除+'+err);
            done();
        });

    })

    // 测试增加device
    it('post /api/advertisements,添加广告', function(done){

        var model = {
            adName: 'test广告',  // 广告名称
            image:'/test/test.jpg',   //图片路径
            startTime: 1483509639679,    //开始时间
            endTime: 1483509659999,//结束时间
            shopId: [shop_id],//店铺id
            playCount: 13,// 播放次数
            playTime: 1654688, //播放时长
            timeArray: ['165468'],   //周期
        };
        userFunc(function(userInfos){
            // //console.log(userInfos)
            // //console.log('token'+userInfos.testAdminToken);
            request
            .post('/api/advertisements')
            .set({
                    'Content-Type': 'application/json',
                    'x-access-token': userInfos.testAdminToken
                })
            .send(model)
            .expect(200)
            .end(function(err, res){
                should.not.exist(err);
                expect(res.body.code).to.be.equal(0);
                expect(res.body.result[0]).to.be.include.keys('_id');
                done();
            })
        })

    })

    // 测试修改shop
    it('patch /api/advertisements/:id,修改广告', function(done){

        var model = {
            adName: 'test广告11',  // 广告名称
            image:'/test/test.jpg',   //图片路径
            startTime: 1483509639679,    //开始时间
            endTime: 1483509659999,//结束时间
            shopId: [shop_id],//店铺id
            playCount: 15,// 播放次数
            playTime: 1654688, //播放时长
            timeArray: ['165468'],   //周期
        };
        userFunc(function(userInfos){
            // //console.log(userInfos)
            Ad.findOne({adName:"test广告"}, function(err, doc){
                // //console.log('修改123+'+doc)
                // //console.log('token'+userInfos.testAdminToken);
                request
                .patch('/api/advertisements/'+doc._id)
                .set({
                        'Content-Type': 'application/json',
                        'x-access-token': userInfos.testAdminToken
                    })
                .send(model)
                .expect(200)
                .end(function(err, res){
                    Ad.findOne({_id:doc._id},function(error,result){
                        // //console.log('修改+'+JSON.stringify(model))
                        // //console.log('修改+++'+JSON.stringify(result))
                        // //console.log('修改++++'+JSON.stringify(res.body))
                        should.not.exist(error);
                        expect(res.body.code).to.be.equal(0);
                        expect(result.toJSON()).to.be.include.keys('_id');
                        expect(result.toJSON().adName).to.be.equal(model.adName);
                        expect(result.toJSON().image).to.be.equal(model.image);
                        expect(result.toJSON().startTime).to.be.equal(model.startTime);
                        expect(result.toJSON().endTime).to.be.equal(model.endTime);
                        expect(result.toJSON().shopId).to.be.a('Array');
                        expect(result.toJSON().playCount).to.be.equal(model.playCount);
                        expect(result.toJSON().playTime).to.be.equal(model.playTime);
                        expect(result.toJSON().timeArray).to.be.a('Array');
                        done();
                    })

                })
            })

        })

    })

    // 查询广告
    it('get /api/advertisements/:id,查询广告', function(done){

        userFunc(function(userInfos){
            // //console.log(userInfos)
            Ad.findOne({adName:"test广告11"}, function(err, doc){
                // //console.log('修改123+'+doc)
                // //console.log('token'+userInfos.testAdminToken);
                request
                .get('/api/advertisements/'+doc._id)
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
                        done();    
                })
            })
            
        })
        
    })

    // 条件查询广告
    it('get /api/advertisements/:id,查询广告', function(done){
        var url = '/api/advertisements?adName='+encodeURI('test广告11');
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
    it('delete /api/advertisements/:id,删除广告', function(done){
        Ad.findOne({adName:"test广告11"},function(err,doc){
            userFunc(function(userInfos){
            // //console.log(userInfos)
                request
                .del('/api/advertisements/'+doc._id)
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
