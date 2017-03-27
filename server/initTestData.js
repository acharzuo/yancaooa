const app = require('./app');
    // const request = require('supertest').agent(app.listen())
    const mongoose = require('mongoose');
    // const User = mongoose.model('User');
    // const Role = mongoose.model('Roles');
    const Role = require('./api/roles/model').Roles;
    const User = require('./api/user/model').User;
    var setting = require('./config/setting');
    // var db = require('./utils/mongodb')(setting.database);

    var async = require('async');
    async.waterfall([
        function(cb){  // 创建管理员用户
            var data = {
                _id: setting.test_admin_id,
                name: 'testAdmin',
                password:'123456',
                adminType: 0,
                // status: this.status,
                tel: '10000000000',
                sex: 0,
                role: setting.admin_role_id,
                email: 'testAdmin@yty.com'
                };
            var user = new User(data);
            user.save(function(err){
                global.ADMIN_USER = user;
                cb(err);
            });
        },
        function(cb){  // 创建普同注册用户
            var data = {
                _id: setting.test_user_id,
                name: 'testUser',
                userType: 1,
                password:'123456',
                adminType: 1,
                // status: this.status,
                tel: '10000000001',
                sex: 0,
                role: setting.admin_role_id,
                email: 'testUser@yty.com'
                };
            var user = new User(data);
            user.save(function(err){
                global.TECH_USER = user;
                cb(err);
            });
        }
    ], function(err, results){
        if(err){
            console.log(err);
        }else{
            console.log('初始化测试数据完毕');
            
            // shell.exec('set NODE_ENV=test& mocha test/**/test.js  ');
            // shell.exit(0);
            process.exit(0);
        }
    });