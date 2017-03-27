const app = require('../../app');
const request = require('supertest').agent(app.listen())
const mongoose = require('mongoose');
const User = mongoose.model('User');
const Role = mongoose.model('Roles');
var async = require('async');
var userFunc = require('../lib/common').userFunc;
var userService = require('../../api/user/service');
var expect = require('chai').expect;
var should = require('chai').should();
var _ = require('lodash');


global.TEST_USER = {
    tel: '10000000001',
    password: '123456'
};

describe('用户管理', function() {

    before(function(done) {

        done();
    })

    beforeEach(function(done) {
        done();
    })

    after(function(done) {

        // User.remove({'tel': '10000000009', 'canLogin':false}).exec(function(err){
        //     done();
        // })
        done();
    })

    // 测试登陆 获取token
    it('post /api/pc/user_tokens,普通用户登录', function(done) {

        request
            .post('/api/pc/user_tokens')
            .set({ 'Content-Type': 'application/json' })
            .send({ tel: '10000000001', password: '123456' })
            .expect(200)
            .end(function(err, res) {
                //console.log(res.body);
                should.not.exist(err);
                var token = res.body.result.token;
                var user = res.body.result.user;
                expect(token).to.be.a('string');
                expect(user).to.be.include.keys('_id');
                global.userToken = token;
                done();
            })
    })

    // 测试登陆 获取管理员token
    it('post /api/admin_tokens, 获取管理员token', function(done) {

        request
            .post('/api/admin_tokens')
            .set({ 'Content-Type': 'application/json' })
            .send({ tel: '10000000000', password: '123456' })
            .expect(200)
            .end(function(err, res) {
                should.not.exist(err);
                var token = res.body.result.token;
                var user = res.body.result.user;
                expect(token).to.be.a('string');
                expect(user).to.be.include.keys('_id');
                global.adminToken = token;
                done();
            })
    })

    // 增加普通用户
    it('post /api/users, 增加普通用户', function(done) {

        request
            .post('/api/users')
            .set({
                'Content-Type': 'application/json',
                'x-access-token': adminToken
            })
            .send({ tel: '10000000002', password: '123456' })
            .expect(200)
            .end(function(err, res) {
                expect(res.body.code).to.be.equal(0);
                should.not.exist(err);
                expect(res.body.result).to.be.include.keys('_id');
                done();
            })
    })


    it('delete /api/users, 删除普通用户', function(done) {
        User.findOne({ tel: '10000000002' }, function(err, user) {
            // expect(err).to.be.empty;
            // // //console.log(user);
            var reqUrl = '/api/users/' + user._id;
            // // //console.log(reqUrl);
            request
                .del(reqUrl)
                .set({
                    'Content-Type': 'application/json',
                    'x-access-token': adminToken
                })
                // .send({tel: '10000000002',password: '123456'})
                .expect(200)
                .end(function(err, res) {
                    // // //console.log(res);
                    // // //console.log('11111111111111111')


                    expect(res.body.code).to.be.equal(0);
                    should.not.exist(err);
                    // var token = res.body.result.token;
                    // var user = res.body.result.user;
                    // expect(token).to.be.a('string');
                    // expect(res.body.result).to.be.include.keys('_id');
                    done();
                })
        })

    })

    it('patch /api/users, 修改普通用户', function(done) {
        User.findOne({ tel: '10000000001' }, function(err, user) {
            // expect(err).to.be.empty;
            // // //console.log(user);
            // // //console.log(adminToken);
            var reqUrl = '/api/users/' + user._id;
            // //console.log(reqUrl);
            request
                .patch(reqUrl)
                .set({
                    'Content-Type': 'application/json',
                    'x-access-token': adminToken
                })
                .send({ sex: 1 })
                .expect(200)
                .end(function(err, res) {
                    // // //console.log(res);
                    // // //console.log('3333333')
                    expect(res.body.code).to.be.equal(0);
                    expect(res.body.result.sex).to.be.equal(1);
                    should.not.exist(err);
                    // var token = res.body.result.token;
                    // var user = res.body.result.user;
                    // expect(token).to.be.a('string');
                    // expect(res.body.result).to.be.include.keys('_id');
                    done();
                })
        })
    });

    it('/api/users, 查询普通用户', function(done) {
        var url = '/api/users?' + 'easyQuery=100&&' +
            'tel=10000000001&&' + 'name=test&&' +
            'name=test&&' + 'userType=1&&' + 'sex=1';
        request
            .get('/api/users')
            .set({
                'Content-Type': 'application/json',
                'x-access-token': adminToken
            })
            // .send({tel: '10000000001',password: '123456'})
            .expect(200)
            .end(function(err, res) {
                // // //console.log(JSON.stringify(res.body));
                expect(res.body.code).to.be.equal(0);
                expect(res.body.result).to.be.include.keys('total');
                expect(res.body.result.docs[0].tel).to.be.equal("10000000001");
                expect(res.body.result.docs[0].adminType).to.be.equal(1);
                should.not.exist(err);

                done();
            })
    });

    it('get /api/users/:id, 查询单个普通用户', function(done) {
        async.waterfall([
            function(cb) { // 获取登陆token
                userFunc(function(userInfos) {
                    cb(null, userInfos);
                });
            },
            function(userInfos, cb) { // 开始测试
                _beginTest(userInfos);
            }
        ]);

        function _beginTest(userInfos) {
            User.findOne({ tel: '10000000001' }, function(err, user) {
                var url = '/api/users/' + user._id;

                request
                    .get(url)
                    .set({
                        'Content-Type': 'application/json',
                        'x-access-token': userInfos.testAdminToken
                    })
                    // .send({tel: '10000000001',password: '123456'})
                    .expect(200)
                    .end(function(err, res) {
                        console.log(err)
                        expect(res.body.code).to.be.equal(0);
                        // //console.log(res.body.result._id == user._id)
                        // //console.log(user._id)
                        expect(res.body.result._id == user._id).to.equal(true);
                        // expect(res.body.result.docs[0].tel).to.be.equal("10000000001");
                        // expect(res.body.result.docs[0].adminType).to.be.equal(1);
                        should.not.exist(err);

                        done();
                    })
            })
        }

    });

    it('post /api/:user_id/families, 添加家人', function(done) {

        userFunc(function(userInfos) {

            var familyUser = {
                name: '测试家人用户',
                tel: '10000000009',
                avator: 'a/b/c',
                birthday: 1484045462024,
                sex: 2,
                checkType: 1,
                relation: '父亲'
            };

            var url = '/api/users/' + userInfos.testUser._id + '/families';

            request
                .post(url)
                .set({
                    'Content-Type': 'application/json',
                    'x-access-token': userInfos.testAdminToken
                })
                .send(familyUser)
                .expect(200)
                .end(function(err, res) {
                    // 1 没有错误
                    should.not.exist(err);
                    // 2 返回值为0
                    expect(res.body.code).to.be.equal(0);
                    // 3 家人用户不能登录
                    expect(res.body.result.canLogin).to.equal(false); // 家人用户不能登录
                    // 4 家人用户的所属家人列表中属性添加成功
                    expect(res.body.result.asFamilies[0].user).to.equal(userInfos.testUser._id.toString());
                    expect(res.body.result.asFamilies[0].relation).to.equal(familyUser.relation);
                    expect(res.body.result.asFamilies[0].checkType).to.equal(familyUser.checkType);

                    // 5 检查当前用户的family列表中包含新增的家人id
                    User.findById(userInfos.testUser._id).lean(true).exec(function(err, doc) {
                        // // //console.log(doc);
                        should.not.exist(err);
                        expect(doc.families[0].toString()).to.be.equal(res.body.result._id);
                        done();
                    });
                });
        });
    });

    it('patch /api/:user_id/families/:id, 修改家人', function(done) {

        userFunc(function(userInfos) {

            var familyUser = {
                name: '测试家人用户修改',
                tel: '10000000019',
                avator: 'a/b/c/d',
                birthday: 1484045462124,
                sex: 1,
                checkType: 0,
                relation: '母亲'
            };
            User.findById(userInfos.testUser._id)
                .lean(true)
                .exec(function(err, doc) {
                    var url = '/api/users/' + userInfos.testUser._id +
                        '/families/' + doc.families[0].toString();
                    request
                        .patch(url)
                        .set({
                            'Content-Type': 'application/json',
                            'x-access-token': userInfos.testAdminToken
                        })
                        .send(familyUser)
                        .expect(200)
                        .end(function(err, res) {
                            should.not.exist(err);
                            // // //console.log(res.body);
                            expect(res.body.code).to.be.equal(0);
                            // // //console.log(res.body.result._id == user._id)
                            // // //console.log(user._id)
                            expect(res.body.result.canLogin).to.equal(false); // 家人用户不能登录
                            expect(res.body.result.adminType).to.equal(1); //
                            expect(res.body.result.userType).to.equal(0); //

                            expect(res.body.result.name).to.equal(familyUser.name);
                            expect(res.body.result.tel).to.equal(familyUser.tel);
                            expect(res.body.result.avator).to.equal(familyUser.avator);
                            expect(res.body.result.birthday).to.equal(familyUser.birthday);
                            expect(res.body.result.sex).to.equal(familyUser.sex);
                            expect(res.body.result.asFamilies[0].checkType).to.equal(familyUser.checkType);
                            expect(res.body.result.asFamilies[0].relation).to.equal(familyUser.relation);

                            done();
                        });
                });
        });
    });

    it('delete /api/:user_id/families/:id, 删除家人', function(done) {

        userFunc(function(userInfos) {

            var familyUser = {
                name: '测试家人用户修改',
                tel: '10000000019',
                avator: 'a/b/c/d',
                birthday: 1484045462124,
                sex: 1,
                checkType: 0,
                relation: '母亲'
            };
            User.findById(userInfos.testUser._id)
                .lean(true)
                .exec(function(err, doc) {
                    var url = '/api/users/' + userInfos.testUser._id +
                        '/families/' + doc.families[0].toString();
                    request
                        .del(url)
                        .set({
                            'Content-Type': 'application/json',
                            'x-access-token': userInfos.testAdminToken
                        })
                        .send(familyUser)
                        .expect(200)
                        .end(function(err, res) {
                            should.not.exist(err);
                            // // //console.log(res.body);
                            expect(res.body.code).to.be.equal(0);
                            // // //console.log(res.body.result._id == user._id)
                            // // //console.log(user._id)
                            async.waterfall([
                                function a(cb) { // 检查家人是否被删除
                                    // User.findById(doc.families[0].toString(), function(err, family){
                                    //     should.not.exist(err);
                                    //     expect(family).to.not.be.exist;
                                    //     cb();
                                    // });
                                    cb();
                                },
                                function b(cb) { // 检测用户家人列表是否清除了被删家人id
                                    User.findById(userInfos.testUser._id).lean(true).exec(function(err, doc) {
                                        // // //console.log(doc);
                                        should.not.exist(err);
                                        var found = _.find(doc.families, function(o) {
                                            o.toString() == res.body.result._id;
                                        });
                                        expect(found).to.not.be.exist;
                                        // expect(doc.families[0].toString()).to.be.equal(res.body.result._id); 
                                        done();
                                    });
                                }
                            ], function(err, result) {

                            })

                        });
                });
        });
    });


    function addTestFamily(count, userId, token, callback) {
        var i = 0;
        var families = [];
        async.whilst(
            function() { return i < 10; },
            function(cb) {
                i++;
                _addFamily(i, function(family) {
                    families.push(family);
                    cb(null, i);
                });
            },
            function(err, result) {
                //console.log('批量建家人成功'+result);
                callback(families);
            }
        )

        function _addFamily(i, callback) {
            var familyUser = {
                name: '家人列表' + i,
                tel: '10000000019',
                avator: 'a/b/c',
                birthday: 1484045462024,
                sex: 2,
                checkType: 1,
                relation: '父亲'
            };
            var url = '/api/users/' + userId + '/families';
            request
                .post(url)
                .set({
                    'Content-Type': 'application/json',
                    'x-access-token': token
                })
                .send(familyUser)
                .expect(200)
                .end(function(err, res) {
                    callback(res.body.result);
                });
        }

    }


    it('get /api/:user_id/families, 获取家人列表', function(done) {

        userFunc(function(userInfos) {

            async.waterfall([
                function(cb) { // 添加测试用户
                    addTestFamily(10, userInfos.testUser._id, userInfos.testAdminToken, function() {
                        cb();
                    });
                },
                function(cb) { // 开始测试
                    var url = '/api/users/' + userInfos.testUser._id + '/families';
                    console.log('获取家人列表 ' + url + " " + userInfos.testAdminToken);
                    request
                        .get(url)
                        .set({
                            'Content-Type': 'application/json',
                            'x-access-token': userInfos.testAdminToken
                        })
                        // .send(familyUser)
                        .expect(200)
                        .end(function(err, res) {
                            // 在断言前删除测试用户

                            // 1 没有错误
                            should.not.exist(err);
                            // 2 返回值为0
                            expect(res.body.code).to.be.equal(0);
                            expect(res.body.result.docs).to.be.exists;
                            // // //console.log(res.body.result.docs);
                            expect(res.body.result.docs.length).to.be.above(5);
                            expect(res.body.result.total).to.be.exists;
                            // //console.log('------------------------------');
                            cb();

                        });
                }

            ], function(err, result) {
                User.remove({ 'tel': '10000000019', 'canLogin': false }).exec(function(err) {
                    done();
                })

            })


        });
    });


    it('get /api/:user_id/families/:id, 获取家人详情', function(done) {

        userFunc(function(userInfos) {

            async.waterfall([
                function(cb) { // 添加测试用户
                    addTestFamily(1, userInfos.testUser._id, userInfos.testAdminToken, function(families) {
                        cb(null, families);
                    })
                },
                function(families, cb) { // 开始测试
                    var url = '/api/users/' + userInfos.testUser._id + '/families/' + families[0]._id;
                    request
                        .get(url)
                        .set({
                            'Content-Type': 'application/json',
                            'x-access-token': userInfos.testAdminToken
                        })
                        // .send(familyUser)
                        .expect(200)
                        .end(function(err, res) {
                            // 在断言前删除测试用户
                            User.remove({ 'tel': '10000000019', 'canLogin': false }).exec(function(err) {
                                // 1 没有错误
                                should.not.exist(err);
                                // 2 返回值为0
                                expect(res.body.code).to.be.equal(0);
                                expect(res.body.result).to.be.contain.keys('_id');
                                // // //console.log(res.body.result.docs);
                                // expect(res.body.result.docs.length).to.be.above(5);
                                // expect(res.body.result.total).to.be.exists;
                                cb();
                            })
                        });
                }

            ], function(err, result) {
                User.remove({ 'tel': '10000000019', 'canLogin': false }).exec(function(err) {
                    done();
                })

            })


        });
    });

    it('post /api/app/users, app注册 未输入校验码注册失败', function(done) {
        // userFunc(function(userInfos){

        var appUser = {
            name: '测试app用户',
            tel: '10000000029',
            avator: 'a/b/c',
            birthday: 1484045462024,
            sex: 2,
            checkType: 1,
            address: '北京市 朝阳区'
        };

        var url = '/api/app/users';

        request
            .post(url)
            .set({
                'Content-Type': 'application/json',
                // 'x-access-token': userInfos.testAdminToken
            })
            .send(appUser)
            .expect(200)
            .end(function(err, res) {

                // 1 没有错误
                should.not.exist(err);
                // 2 返回值为0
                expect(res.body.code).to.be.equal(2);

                expect(res.body.result).to.be.null;
                done();
                // // 3 app用户可以登录
                // expect(res.body.result.canLogin).to.equal(true);
                // // 4 app用户的adminType
                // expect(res.body.result.adminType).to.equal(1);  
                // // 删除测试用户
                // User.findByIdAndRemove(res.body.result._id, function(){
                //     done();
                // })  
            });
    })

    function getVerificationCode(tel, callback) {
        request
            .post('/api/app/verification_codes')
            .set({
                'Content-Type': 'application/json',
                // 'x-access-token': userInfos.testAdminToken
            })
            .send({ tel: tel })
            .expect(200)
            .end(function(err, res) {
                // // //console.log('res'+JSON.stringify(res.body));
                callback(err, res.body.result);
            });
    }

    function createAppUser(appUser, callback) {

        async.waterfall(
            [
                function(cb) { // 先删除一下
                    User.remove({ tel: appUser.tel }, function(err, doc) {
                        cb(err);
                    });
                },
                function(cb) {
                    getVerificationCode(appUser.tel, cb);
                },
                _validateApi
            ]
        );


        function _validateApi(verificationCode, cb) {
            var url = '/api/app/users';
            // // //console.log('verificationCode'+verificationCode);
            appUser.verificationCode = verificationCode;
            request
                .post(url)
                .set({
                    'Content-Type': 'application/json',
                    // 'x-access-token': userInfos.testAdminToken
                })
                .send(appUser)
                .expect(200)
                .end(function(err, res) {

                    callback(err, res);
                    // done();
                });
        }
    }
    var appUser = {
        "name": "测试app用户",
        "tel": "10000000119",
        "password": "123456",
        "avator": "a/b/c",
        "birthday": 1484045462024,
        "sex": 2,
        "checkType": 1,
        "address": "北京市 朝阳区",

    };
    it('post /api/app/users, app注册 使用手机校验码', function(done) {


        createAppUser(appUser, function(err, res) {
                // // //console.log("===-----"+res);
                // 1 没有错误
                should.not.exist(err);
                // 2 返回值为0
                expect(res.body.code).to.be.equal(0);

                expect(res.body.result).to.not.be.null;
                // 3 app用户可以登录
                expect(res.body.result.canLogin).to.equal(true);
                // 4 app用户的adminType
                expect(res.body.result.adminType).to.equal(1);
                // 删除测试用户
                User.findByIdAndRemove(res.body.result._id, function() {
                    done();
                });
                // Use
                // done();
            })
            // var sms = require('../../api/message/sms');

        // var verificationCode = sms.sendSMSCode('10000000029', 1); // 模拟发送验证码
        // // //console.log('verificationCode:'+verificationCode);

    });

    function loginWithVerificationCode(tel, callback) {
        var url = '/api/app/user_tokens';
        async.waterfall([
            function(cb) { // 先注册
                createAppUser(appUser, function(err, res) {
                    // //console.log('createAppUser+'+res);
                    cb(err, res);
                });
            },
            function(res, cb) {
                getVerificationCode(tel, cb); // 先获取验证码
            },
            function(verificationCode, cb) { // 登陆
                // //console.log('getVerificationCode+'+verificationCode);
                var data = {
                    "tel": tel,
                    "password": appUser.password,
                    "verificationCode": verificationCode
                };
                request
                    .post(url)
                    .set({
                        'Content-Type': 'application/json',
                        // 'x-access-token': userInfos.testAdminToken
                    })
                    .send(data)
                    .expect(200)
                    .end(function(err, res) {
                        callback(err, res);
                    });
            }
        ]);
    }
    it('post /api/app/user_tokens, app手机号 验证码登陆', function(done) {

        loginWithVerificationCode(appUser.tel, function(err, res) {
            // 1 没有错误
            should.not.exist(err);
            // //console.log("++++++++="+JSON.stringify(res.body));
            // 2 返回值为0
            expect(res.body.code).to.be.equal(0);

            expect(res.body.result).to.not.be.null;

            expect(res.body.result).to.contain.keys('token', 'user');

            done();
        })
    });

    it.skip('patch /api/app/users, 修改app用户的手机号 修改后的手机号已经存在', function(done) {
        var oldTel = appUser.tel;
        appUser.tel = "1000000099";
        async.waterfall([
            function(cb) {
                createAppUser(appUser, function(err, res) {

                    cb();
                });
            },
            function(cb) {
                loginWithVerificationCode(appUser.tel, function(err, res) {
                    appUser.tel = oldTel;
                    var appUserNewTel = "1000000099";
                    // //console.log('============'+JSON.stringify(res.body));
                    var token = res.body.result.token;
                    getVerificationCode(appUserNewTel, function(err, verificationCode) {
                        // 获取校验码
                        request
                            .patch('/api/app/users')
                            .set({
                                'Content-Type': 'application/json',
                                'x-access-token': token
                            })
                            .send({ tel: appUserNewTel, verificationCode: verificationCode })
                            .expect(200)
                            .end(function(err, res) {
                                // //console.log('----'+JSON.stringify(res.body));
                                // 1 没有错误
                                should.not.exist(err);
                                // //console.log(res.body);
                                // 2 返回值为0
                                expect(res.body.code).to.be.equal(11000);

                                expect(res.body.result).to.be.null;
                                User.remove({ tel: '1000000099' }, function(err, doc) {
                                    done();
                                });
                            });
                    });
                });
            }
        ]);
    });

    it('patch /api/app/users, 修改app用户的手机号', function(done) {
        loginWithVerificationCode(appUser.tel, function(err, res) {
            var appUserNewTel = "1000000099";
            // //console.log('============'+JSON.stringify(res.body));
            var token = res.body.result.token;
            getVerificationCode(appUserNewTel, function(err, verificationCode) {
                // 获取校验码
                request
                    .patch('/api/app/users')
                    .set({
                        'Content-Type': 'application/json',
                        'x-access-token': token
                    })
                    .send({ tel: appUserNewTel, verificationCode: verificationCode })
                    .expect(200)
                    .end(function(err, res) {
                        // //console.log('----'+JSON.stringify(res));
                        // 1 没有错误
                        should.not.exist(err);
                        // //console.log(res.body);
                        // 2 返回值为0
                        expect(res.body.code).to.be.equal(0);

                        expect(res.body.result).to.not.be.null;
                        done();
                    });
            });
        });
    });
    it('patch /api/app/users, 修改app用户的密码', function(done) {
        done();
    });



    it('delete /api/app/user_tokens, app端注销', function(done) {
        done();
    });

    it('patch /api/app/app_users, 修改app用户的手机号', function(done) {
        User.findOne({ tel: '10000000001' }, function(err, user) {
            // expect(err).to.be.empty;
            // // //console.log(user);
            // // //console.log(adminToken);
            var reqUrl = '/api/users/' + user._id;
            // //console.log(reqUrl);
            request
                .patch(reqUrl)
                .set({
                    'Content-Type': 'application/json',
                    'x-access-token': adminToken
                })
                .send({ sex: 1 })
                .expect(200)
                .end(function(err, res) {
                    // // //console.log(res);
                    // // //console.log('3333333')
                    expect(res.body.code).to.be.equal(0);
                    expect(res.body.result.sex).to.be.equal(1);
                    should.not.exist(err);
                    // var token = res.body.result.token;
                    // var user = res.body.result.user;
                    // expect(token).to.be.a('string');
                    // expect(res.body.result).to.be.include.keys('_id');
                    done();
                })
        });
    });

})