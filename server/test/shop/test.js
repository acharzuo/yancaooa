const app = require('../../app')
const request = require('supertest').agent(app.listen())
const mongoose = require('mongoose');
const Shop = mongoose.model('Shop');
const Role = mongoose.model('Roles');
var async = require('async');
var userFunc = require('../lib/common').userFunc;
var userService = require('../../api/user/service');
var expect = require('chai').expect;
var should = require('chai').should();


describe('店铺管理', function() {

    before(function(done) {

        done();
    })

    // 测试增加shop
    it('post /api/shops,创建店铺', function(done) {

        var shop = {
            shopId: "test12345",
            name: "testShop", // 1.店铺名称
            address: "testAddress", //2.店铺地址
            responsible: "testResponsible", // 3.负责人名称，是否是注册用户？
            deviceCount: 12, //经络仪数量
            advertiseCount: 12, //广告数量
            technicianCount: 12, //技师数
            expertCount: 12, //专家数量
            tel: "10000000000", //联系电话
            idCardNumber: "123111111111", //身份证号 
            enterTime: 1483442439731, // 入驻时间
            image: "", // 店铺图像
            // devices: [{
            //     type: mongoose.Schema.Types.ObjectId,
            //     ref: 'Device'
            // }],  //注册经络仪
            status: 0,
        };
        userFunc(function(userInfos) {
            // //console.log(userInfos)
            //console.log('token'+userInfos.testAdminToken);
            request
                .post('/api/shops')
                .set({
                    'Content-Type': 'application/json',
                    'x-access-token': userInfos.testAdminToken
                })
                .send(shop)
                .expect(200)
                .end(function(err, res) {
                    should.not.exist(err);
                    console.log(res.body)
                    expect(res.body.code).to.be.equal(0);
                    expect(res.body.result).to.be.include.keys('_id');
                    done();
                })
        })

    })

    // 测试修改shop
    it('patch /api/shops/:id,修改店铺', function(done) {

        var shop = {
            name: "testShop1", // 1.店铺名称
            address: "testAddress1", //2.店铺地址
            responsible: "testResponsible1", // 3.负责人名称，是否是注册用户？
            deviceCount: 13, //经络仪数量
            advertiseCount: 13, //广告数量
            technicianCount: 13, //技师数
            expertCount: 13, //专家数量
            tel: "10000000001", //联系电话
            idCardNumber: "123111111112", //身份证号 
            enterTime: 1483442439732, // 入驻时间
            image: "", // 店铺图像
            // devices: [{
            //     type: mongoose.Schema.Types.ObjectId,
            //     ref: 'Device'
            // }],  //注册经络仪
            status: 1,
        };
        userFunc(function(userInfos) {
            // //console.log(userInfos)
            Shop.findOne({ shopId: 'test12345' }, function(err, doc) {
                // //console.log('token'+userInfos.testAdminToken);
                request
                    .patch('/api/shops/' + doc._id)
                    .set({
                        'Content-Type': 'application/json',
                        'x-access-token': userInfos.testAdminToken
                    })
                    .send(shop)
                    .expect(200)
                    .end(function(err, res) {
                        // //console.log(res.body)
                        should.not.exist(err);
                        expect(res.body.code).to.be.equal(0);
                        expect(res.body.result).to.be.include.keys('_id');
                        for (var key in shop) {

                            expect(res.body.result[key]).to.be.equal(shop[key]);
                        }

                        done();
                    })
            })

        })

    })

    // 店铺详情
    it('get /api/shops/:id,店铺详情', function(done) {

        var shop = {
            name: "testShop1", // 1.店铺名称
            address: "testAddress1", //2.店铺地址
            responsible: "testResponsible1", // 3.负责人名称，是否是注册用户？
            deviceCount: 13, //经络仪数量
            advertiseCount: 13, //广告数量
            technicianCount: 13, //技师数
            expertCount: 13, //专家数量
            tel: "10000000001", //联系电话
            idCardNumber: "123111111112", //身份证号 
            enterTime: 1483442439732, // 入驻时间
            image: "", // 店铺图像
            // devices: [{
            //     type: mongoose.Schema.Types.ObjectId,
            //     ref: 'Device'
            // }],  //注册经络仪
            status: 1,
        };
        userFunc(function(userInfos) {
            // //console.log(userInfos)
            Shop.findOne({ shopId: 'test12345' }, function(err, doc) {
                // //console.log('token'+userInfos.testAdminToken);
                request
                    .get('/api/shops/' + doc._id)
                    .set({
                        'Content-Type': 'application/json',
                        'x-access-token': userInfos.testAdminToken
                    })
                    .send(shop)
                    .expect(200)
                    .end(function(err, res) {
                        // //console.log(res.body)
                        should.not.exist(err);
                        expect(res.body.code).to.be.equal(0);
                        expect(res.body.result).to.be.include.keys('_id');
                        for (var key in shop) {

                            expect(res.body.result[key]).to.be.equal(shop[key]);
                        }

                        done();
                    })
            })

        })

    })

    it('get /api/shops, 查询店铺', function(done) {
        var url = '/api/shops?' + 'easyQuery=testAdd&&' +
            'shopId=12345&&' + 'name=test&&' +
            'address=test&&' + 'responsible=test&&' + 'startTime=1483441439732' +
            '&&endTime=1483443439732';
        userFunc(function(userInfos) {
            request
                .get(url)
                .set({
                    'Content-Type': 'application/json',
                    'x-access-token': userInfos.testAdminToken
                })
                // .send({tel: '10000000001',password: '123456'})
                .expect(200)
                .end(function(err, res) {

                    expect(res.body.code).to.be.equal(0);
                    expect(res.body.result.total).to.be.equal(1);
                    expect(res.body.result.docs[0].tel).to.be.equal("10000000001");
                    expect(res.body.result.docs[0].shopId).to.be.equal('test12345');
                    should.not.exist(err);

                    done();
                })
        })
    })

    // 店铺删除
    it('delete /api/shops/:id,删除店铺', function(done) {


        userFunc(function(userInfos) {
            // //console.log(userInfos)
            Shop.findOne({ shopId: 'test12345' }, function(err, doc) {
                // //console.log('token'+userInfos.testAdminToken);
                request
                    .del('/api/shops/' + doc._id)
                    .set({
                        'Content-Type': 'application/json',
                        'x-access-token': userInfos.testAdminToken
                    })
                    // .send(shop)
                    .expect(200)
                    .end(function(err, res) {
                        // //console.log(res.body)
                        should.not.exist(err);
                        expect(res.body.code).to.be.equal(0);
                        done();
                    });
            });

        });

    });


})