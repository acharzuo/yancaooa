const app = require('../../app')
const request = require('supertest').agent(app.listen())
const mongoose = require('mongoose');
const Diag = mongoose.model('Diag');
const Diagnosis = mongoose.model('Diagnosis');
const diagnosticRecord = mongoose.model('DiagnosticRecord');
var async = require('async');
var userFunc = require('../lib/common').userFunc;
var userService = require('../../api/user/service');
var expect = require('chai').expect;
var should = require('chai').should();


var diag_id;
var diagnosticRecord_id;
describe('问诊结果', function(){

    before(function(done){
        var data1 = {
            name:'测试名字'
        }
        diagnosticRecord.create(data1,function(err,doc){
                // //console.log(err);
                diagnosticRecord_id = doc._id
                done();
        })
        
    });
    after(function(done){
        diagnosticRecord.findOneAndRemove({name:'测试名字'},function(err,doc){
            ////console.log('删除+'+err);
            done();
        });
        
    })

    // 测试增加问诊单
    it('post /api/diagnosiss,添加问诊结果', function(done){

        var model = {
            diagId: '586f36fe399d463254d38ae8',  // 问诊单名称
            diagnosticRecord:diagnosticRecord_id,   //问题id
            diagName:'测试问诊单',
            problemData:['1','2','3']
        };
        userFunc(function(userInfos){
            // //console.log(userInfos)
            // //console.log('token'+userInfos.testAdminToken);
            request
            .post('/api/pc/diagnosiss')
            .set({
                    'Content-Type': 'application/json',
                    'x-access-token': userInfos.testAdminToken
                })
            .send(model)
            .expect(200)
            .end(function(err, res){ 
                // //console.log('增加+'+JSON.stringify(res.body));
                expect(res.body.code).to.be.equal(0);
                expect(res.body.result.diagId).to.be.equal(model.diagId);
                expect(res.body.result.diagName).to.be.equal(model.diagName);
                expect(res.body.result.problemData).to.be.a('Array');
                should.not.exist(err);
                done();
            })
        })
        
    })

    // 查询广告
    it('get /api/diagnosiss/:id,查询问诊单', function(done){

        var model = {
            diagId: '586f36fe399d463254d38ae8',  // 问诊单名称
            diagnosticRecord:diagnosticRecord_id,   //问题id
            diagName:'测试问诊单',
            problemData:['1','2','3']
        };
        userFunc(function(userInfos){
            // //console.log(userInfos)
            Diagnosis.findOne({diagnosticRecord:diagnosticRecord_id}, function(err, doc){
                // //console.log('修改123+'+doc)
                // //console.log('token'+userInfos.testAdminToken);
                request
                .get('/api/diagnosiss/'+doc._id)
                .set({
                        'Content-Type': 'application/json',
                        'x-access-token': userInfos.testAdminToken
                    })
                .expect(200)
                .end(function(err, res){
                        // //console.log('修改+'+JSON.stringify(model))
                        // //console.log('修改+++'+JSON.stringify(result))
                        //console.log('修改++++'+JSON.stringify(res.body.result))
                        should.not.exist(err);
                        expect(res.body.code).to.be.equal(0);
                        expect(res.body.result).to.be.include.keys('_id');
                        expect(res.body.result.problemData).to.be.a('Array');
                        done();    
                })
            })
            
        })
        
    })
})