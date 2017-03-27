const app = require('../../app')
const request = require('supertest').agent(app.listen())
const mongoose = require('mongoose');
const Disease = mongoose.model('Disease');
const Acupoint = mongoose.model('Acupoint');
var async = require('async');
var userFunc = require('../lib/common').userFunc;
var userService = require('../../api/user/service');
var expect = require('chai').expect;
var should = require('chai').should();


var disease_id;
var point_id
describe('病症管理', function(){

    before(function(done){
        var data = {
            acupointName:'百会穴12'
        }
        Acupoint.create(data,function(err,doc){
                // //console.log(err);
                point_id = doc._id
                done();
        })
        
    });
    after(function(done){
        Disease.findOneAndRemove({_id:disease_id},function(err,doc){
            ////console.log('删除+'+err);
            done();
        });
        
    })

    // 测试增加问诊单
    it('post /api/diseases,添加病症', function(done){

        var model = {
            disease: "感冒2311",  // 病症名称
            main_points:point_id,   //穴位id
            acu_points:[point_id],
        };
        userFunc(function(userInfos){
            // //console.log(userInfos)
            // //console.log('token'+userInfos.testAdminToken);
            request
            .post('/api/diseases')
            .set({
                    'Content-Type': 'application/json',
                    'x-access-token': userInfos.testAdminToken
                })
            .send(model)
            .expect(200)
            .end(function(err, res){ 
                // //console.log('增加+'+JSON.stringify(res.body.result));
                disease_id=res.body.result._id;
                expect(res.body.code).to.be.equal(0);
                expect(res.body.result.disease).to.be.equal(model.disease);
                expect(res.body.result.main_points.toString()).to.be.equal(model.main_points.toString());
                expect(res.body.result.acu_points).to.be.a('Array');
                should.not.exist(err);
                done();
            })
        })
        
    })

    // 查询病症
    it('get /api/diseases/:id,查询病症', function(done){

        var model = {
            disease: '感冒2311',  // 病症名称
            main_points:point_id,   //穴位id
            acu_points:[point_id],
        };
        userFunc(function(userInfos){
            // //console.log(userInfos)
            Disease.findOne({disease:"感冒2311"}, function(err, doc){
                // //console.log('修改123+'+doc)
                // //console.log('token'+userInfos.testAdminToken);
                request
                .get('/api/diseases/'+doc._id)
                .set({
                        'Content-Type': 'application/json',
                        'x-access-token': userInfos.testAdminToken
                    })
                .send(model)
                .expect(200)
                .end(function(err, res){
                        // //console.log('修改+'+JSON.stringify(model))
                        // //console.log('修改+++'+JSON.stringify(result))
                        // //console.log('修改++++'+JSON.stringify(res.body.result))
                        should.not.exist(err);
                        expect(res.body.code).to.be.equal(0);
                        expect(res.body.result).to.be.include.keys('_id');
                        expect(res.body.result.main_points.toString()).to.be.equal(model.main_points.toString());
                        expect(res.body.result.acu_points).to.be.a('Array');
                        done();    
                })
            })
            
        })
        
    })

    // 查询病症
    it('get /api/diseases,查询病症', function(done){
        var url = '/api/diseases?easyQuery='+encodeURI('感冒2311')
        userFunc(function(userInfos){
            // //console.log(userInfos)
                // //console.log('修改123+'+doc)
                // //console.log('token'+userInfos.testAdminToken);
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
                        // //console.log('获取++++'+JSON.stringify(res.body.result))
                        should.not.exist(err);
                        expect(res.body.code).to.be.equal(0);
                        expect(res.body.result.total).to.be.equal(1);
                        done();    
                })
            })      
    })

    // 查询病症
    it('patch /api/diseases/:id,修改病症', function(done){

        var model = {
            disease: '感冒2312',  // 病症名称
            main_points:point_id,   //穴位id
            acu_points:[point_id],
        };
        userFunc(function(userInfos){
            // //console.log(userInfos)
            Disease.findOne({disease:"感冒2311"}, function(err, doc){
                // //console.log('修改123+'+doc)
                // //console.log('token'+userInfos.testAdminToken);
                request
                .patch('/api/diseases/'+doc._id)
                .set({
                        'Content-Type': 'application/json',
                        'x-access-token': userInfos.testAdminToken
                    })
                .send(model)
                .expect(200)
                .end(function(err, res){
                    Disease.findOne({disease:'感冒2312'},function(error,result){
                        // //console.log('修改+'+JSON.stringify(model))
                        // //console.log('修改+++'+JSON.stringify(result))
                        // //console.log('修改++++'+JSON.stringify(res.body.result))
                        should.not.exist(err);
                        expect(res.body.code).to.be.equal(0);
                        expect(result.disease).to.be.equal(model.disease);
                        expect(result.acu_points).to.be.a('Array');
                        done();  
                    })  
                })
            })
            
        }) 
    })

    // 查询病症
    it('get /api/diseases/:id,删除病症', function(done){

        userFunc(function(userInfos){
            // //console.log(userInfos)
            Disease.findOne({disease:"感冒2312"}, function(err, doc){
                // //console.log('修改123+'+doc)
                // //console.log('token'+userInfos.testAdminToken);
                request
                .del('/api/diseases/'+doc._id)
                .set({
                        'Content-Type': 'application/json',
                        'x-access-token': userInfos.testAdminToken
                    })
                .expect(200)
                .end(function(err, res){
                        // //console.log('修改+'+JSON.stringify(model))
                        // //console.log('修改+++'+JSON.stringify(result))
                        // //console.log('修改++++'+JSON.stringify(res.body.result))
                        should.not.exist(err);
                        expect(res.body.code).to.be.equal(0);
                        done();    
                })
            })
            
        })
        
    })
})