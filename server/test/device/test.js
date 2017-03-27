const app = require('../../app')
const request = require('supertest').agent(app.listen())
const mongoose = require('mongoose');
const Model = mongoose.model('Device');
const Role = mongoose.model('Roles');
var async = require('async');
var userFunc = require('../lib/common').userFunc;
var userService = require('../../api/user/service');
var expect = require('chai').expect;
var should = require('chai').should();


describe('经络仪管理', function() {

    before(function(done) {
        done();
    });

    // 测试增加device
    it('post /api/devices,添加经络仪', function(done) {

        var model = {
            deviceId: 'test12345', // 0. 经络仪ID
            type: 0, //型号，类型，0 个人、 1 店铺
            lastUseDate: 1483509639679, //最后使用时间,
            maintenanceTimes: 12, //维护次数
            adjustTimes: 12, //校正次数
            adjustCount: 12, // 校正量
            user: 'testUser', //使用者
            tel: '10000000000', //联系电话
            idCardNumber: '1234567891011', //身份证号 
            enterTime: '1483509639679',
            // image: String,  // 经络仪图像
            // devices: [String],  //注册经络仪
            status: 0
        };
        Model.remove({ 'deviceId': 'test12345' }, function(err) {
            userFunc(function(userInfos) {
                // //console.log(userInfos)
                // //console.log('token'+userInfos.testAdminToken);
                request
                    .post('/api/devices')
                    .set({
                        'Content-Type': 'application/json',
                        'x-access-token': userInfos.testAdminToken
                    })
                    .send(model)
                    .expect(200)
                    .end(function(err, res) {
                        should.not.exist(err);
                        expect(res.body.code).to.be.equal(0);
                        expect(res.body.result).to.be.include.keys('_id');
                        expect(res.body.result.isUsed).to.equal(1);
                        done();
                    })
            })
        })

    })

    // 测试修改shop
    it('patch /api/devices/:id,修改经络仪信息', function(done) {

        var model = {
            deviceId: 'test12345', // 0. 经络仪ID
            type: 1, //型号，类型，0 个人、 1 店铺
            lastUseDate: 1483509639669, //最后使用时间,
            maintenanceTimes: 11, //维护次数
            adjustTimes: 11, //校正次数
            adjustCount: 11, // 校正量
            user: 'testUser1', //使用者
            tel: '10000000001', //联系电话
            idCardNumber: '1234567891012', //身份证号 
            enterTime: 1483509639672,
            // image: String,  // 经络仪图像
            // devices: [String],  //注册经络仪
            status: 1
        };
        userFunc(function(userInfos) {
            // //console.log(userInfos)
            Model.findOne({ deviceId: 'test12345' }, function(err, doc) {
                // //console.log('token'+userInfos.testAdminToken);
                request
                    .patch('/api/devices/' + doc._id)
                    .set({
                        'Content-Type': 'application/json',
                        'x-access-token': userInfos.testAdminToken
                    })
                    .send(model)
                    .expect(200)
                    .end(function(err, res) {
                        // //console.log(res.body)
                        should.not.exist(err);
                        expect(res.body.code).to.be.equal(0);
                        expect(res.body.result).to.be.include.keys('_id');
                        for (var key in model) {
                            expect(res.body.result[key]).to.be.equal(model[key]);
                        }

                        done();
                    })
            })

        })

    })

    // 经络仪详情
    it('get /api/devices/:id,经络仪详情', function(done) {

        var model = {
            deviceId: 'test12345', // 0. 经络仪ID
            type: 1, //型号，类型，0 个人、 1 店铺
            lastUseDate: 1483509639669, //最后使用时间,
            maintenanceTimes: 11, //维护次数
            adjustTimes: 11, //校正次数
            adjustCount: 11, // 校正量
            user: 'testUser1', //使用者
            tel: '10000000001', //联系电话
            idCardNumber: '1234567891012', //身份证号 
            enterTime: 1483509639672,
            // image: String,  // 经络仪图像
            // devices: [String],  //注册经络仪
            status: 1
        };
        userFunc(function(userInfos) {
            // //console.log(userInfos)
            Model.findOne({ deviceId: 'test12345' }, function(err, doc) {
                // //console.log('token'+userInfos.testAdminToken);
                request
                    .patch('/api/devices/' + doc._id)
                    .set({
                        'Content-Type': 'application/json',
                        'x-access-token': userInfos.testAdminToken
                    })
                    .send(model)
                    .expect(200)
                    .end(function(err, res) {
                        // //console.log(res.body)
                        should.not.exist(err);
                        expect(res.body.code).to.be.equal(0);
                        expect(res.body.result).to.be.include.keys('_id');
                        for (var key in model) {

                            expect(res.body.result[key]).to.be.equal(model[key]);
                        }

                        done();
                    })
            })

        })

    })

    it('get /api/devices, 查询经络仪', function(done) {
        var url = '/api/devices?' + 'easyQuery=test12345&&' +
            'deviceId=12345&&' + 'type=1&&' +
            'address=test&&' + 'user=test&&' + 'startTime=1483509629672' +
            '&&endTime=1483509649672';
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
                    expect(res.body.result.docs[0].deviceId).to.be.equal('test12345');
                    should.not.exist(err);
                    done();
                })
        })
    })

    // 经络仪删除
    it('delete /api/devices/:id,删除经络仪', function(done) {

        userFunc(function(userInfos) {
            // //console.log(userInfos)
            Model.findOne({ deviceId: 'test12345' }, function(err, doc) {
                // //console.log('token'+userInfos.testAdminToken);
                request
                    .del('/api/devices/' + doc._id)
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


    // 更新经络仪的最后检测时间
    it('zhenyuan:deviceService.updateDeviceLastUseDate(req),更新经络仪的最后检测时间', function(done) {
        var deviceService = require('../../api/device/service');
        var req = {
            headers: {}
        };
        var tool = require('../../utils/tools.js');
        var curTime = tool.getCurUtcTimestamp();
        req.headers['device-id'] = "DEV001";
        deviceService.updateDeviceLastUseDate(req, function(err, doc) {
            should.not.exist(err);
            expect(doc.toObject()).to.be.contain.keys("_id");
            expect(doc.lastUseDate).to.be.gt(curTime);
            done();
        });
    });

})