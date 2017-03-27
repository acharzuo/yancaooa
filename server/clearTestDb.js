var mongodb = require('mongodb');
var server = new mongodb.Server('localhost', 27017, {auto_reconnect:true});
var db = new mongodb.Db('yuntianyuan_test', server, {safe:true});
var async = require('async');

db.open(function(err, db){

    if(!err){
        console.log('connect db');
            db.collections(function(err, collections) {
                async.each(collections, function(collection, cb) {
                if (collection.collectionName.indexOf('system') === 0) {
                    return cb()
                }
                collection.remove(cb)
                }, function(err){
                    console.log('！！！！！！！清空数据库');
                    process.exit(0);
                });
            });
    }else{
        console.log(err);
    }

});