const app = require('../../app')
const request = require('supertest').agent(app.listen())
const mongoose = require('mongoose');
const Case = mongoose.model('Case');
var async = require('async');
var userFunc = require('../lib/common').userFunc;
var userService = require('../../api/user/service');
var expect = require('chai').expect;
var should = require('chai').should();

describe('案例管理', function(){

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
    it('post /api/cases,添加案例', function(done){

        var model = {
            label:['头疼','测试'],//标签
            caseName:'没得编了',//案例标题
            file:['c:\test'],//上传文件
            addr:'北京',//地址
            expertName:'莫',//专家名字
            patientName:'系统',//患者名字
            age:18,//年龄
            course:5,//疗程
            startTime:16546864816,//开始时间
            endTime:1685468684,//结束时间
            analysis:0,//分析状态
            content:'感冒',//病症
            detailed:'感冒需要吃药',//详细说明
            left:[['0'],['1'],['2'],['0'],['1'],['2'],['0'],['1'],['2']],
            right:[['0'],['1'],['2'],['0'],['1'],['2'],['0'],['1'],['2']],
        };
        userFunc(function(userInfos){
            // //console.log(userInfos)
            // //console.log('token'+userInfos.testAdminToken);
            request
            .post('/api/cases')
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
    it('patch /api/cases/:id,修改案例', function(done){

        var model = {
            label:['头疼','测试'],//标签
            caseName:'真的编不下去了',//案例标题
            file:['c:\test'],//上传文件
            addr:'北京',//地址
            expertName:'莫',//专家名字
            patientName:'系统',//患者名字
            age:18,//年龄
            course:5,//疗程
            startTime:16546864816,//开始时间
            endTime:1685468684,//结束时间
            analysis:0,//分析状态
            content:'感冒',//病症
            detailed:'感冒需要吃药',//详细说明
            left:[['0'],['1'],['2'],['0'],['1'],['2'],['0'],['1'],['2']],
            right:[['0'],['1'],['2'],['0'],['1'],['2'],['0'],['1'],['2']],
        };
        userFunc(function(userInfos){
            // //console.log(userInfos)
            Case.findOne({caseName:"没得编了"}, function(err, doc){
                // //console.log('修改123+'+doc)
                // //console.log('token'+userInfos.testAdminToken);
                request
                .patch('/api/cases/'+doc._id)
                .set({
                        'Content-Type': 'application/json',
                        'x-access-token': userInfos.testAdminToken
                    })
                .send(model)
                .expect(200)
                .end(function(err, res){
                    Case.findOne({_id:doc._id},function(error,result){
                        // //console.log('修改+'+JSON.stringify(model))
                        // //console.log('修改+++'+JSON.stringify(result))
                        // //console.log('修改++++'+JSON.stringify(res.body))
                        should.not.exist(error);
                        expect(res.body.code).to.be.equal(0);
                        expect(result.toJSON()).to.be.include.keys('_id');
                        expect(result.toJSON().label).to.be.a('Array');
                        expect(result.toJSON().caseName).to.be.equal(model.caseName);
                        expect(result.toJSON().file).to.be.a('Array');
                        expect(result.toJSON().addr).to.be.equal(model.addr);
                        expect(result.toJSON().expertName).to.be.equal(model.expertName);
                        expect(result.toJSON().patientName).to.be.equal(model.patientName);
                        expect(result.toJSON().age).to.be.equal(model.age);
                        expect(result.toJSON().course).to.be.equal(model.course);
                        expect(result.toJSON().startTime).to.be.equal(model.startTime);
                        expect(result.toJSON().endTime).to.be.equal(model.endTime);
                        expect(result.toJSON().analysis).to.be.equal(model.analysis);
                        expect(result.toJSON().content).to.be.equal(model.content);
                        expect(result.toJSON().detailed).to.be.equal(model.detailed);
                        expect(result.toJSON().left).to.be.a('Array');
                        expect(result.toJSON().right).to.be.a('Array');
                        done();
                    })
                    
                })
            })
            
        })
        
    })

    // 查询案例
    it('get /api/cases/:id,查询案例', function(done){

        var model = {
            label:['头疼','测试'],//标签
            caseName:'真的编不下去了',//案例标题
            file:['c:\test'],//上传文件
            addr:'北京',//地址
            expertName:'莫',//专家名字
            patientName:'系统',//患者名字
            age:18,//年龄
            course:5,//疗程
            startTime:16546864816,//开始时间
            endTime:1685468684,//结束时间
            analysis:0,//分析状态
            content:'感冒',//病症
            detailed:'感冒需要吃药',//详细说明
            left:[['0'],['1'],['2'],['0'],['1'],['2'],['0'],['1'],['2']],
            right:[['0'],['1'],['2'],['0'],['1'],['2'],['0'],['1'],['2']],
        };
        userFunc(function(userInfos){
            // //console.log(userInfos)
            Case.findOne({caseName:"真的编不下去了"}, function(err, doc){
                // //console.log('修改123+'+doc)
                // //console.log('token'+userInfos.testAdminToken);
                request
                .get('/api/cases/'+doc._id)
                .set({
                        'Content-Type': 'application/json',
                        'x-access-token': userInfos.testAdminToken
                    })
                .send(model)
                .expect(200)
                .end(function(err, res){
                        // //console.log('修改+'+JSON.stringify(model))
                        // //console.log('修改+++'+JSON.stringify(result))
                        // //console.log('修改++++'+JSON.stringify(res.body))
                        should.not.exist(err);
                        expect(res.body.code).to.be.equal(0);
                        expect(res.body.result).to.be.include.keys('_id');
                        expect(res.body.result.label).to.be.a('Array');
                        expect(res.body.result.caseName).to.be.equal(model.caseName);
                        expect(res.body.result.file).to.be.a('Array');
                        expect(res.body.result.addr).to.be.equal(model.addr);
                        expect(res.body.result.expertName).to.be.equal(model.expertName);
                        expect(res.body.result.patientName).to.be.equal(model.patientName);
                        expect(res.body.result.age).to.be.equal(model.age);
                        expect(res.body.result.course).to.be.equal(model.course);
                        expect(res.body.result.startTime).to.be.equal(model.startTime);
                        expect(res.body.result.endTime).to.be.equal(model.endTime);
                        expect(res.body.result.analysis).to.be.equal(model.analysis);
                        expect(res.body.result.content).to.be.equal(model.content);
                        expect(res.body.result.detailed).to.be.equal(model.detailed);
                        expect(res.body.result.left).to.be.a('Array');
                        expect(res.body.result.right).to.be.a('Array');
                        done();    
                })
            })
            
        })
        
    })

    // 条件查询广告
    it('get /api/cases/:id,条件查询案例', function(done){
        var url = '/api/cases?caseName='+encodeURI('真的编不下去了');
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
    it('delete /api/cases/:id,删除案例', function(done){
        Case.findOne({caseName:"真的编不下去了"},function(err,doc){
            userFunc(function(userInfos){
            // //console.log(userInfos)
                request
                .del('/api/cases/'+doc._id)
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
