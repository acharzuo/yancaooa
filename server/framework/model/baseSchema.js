const _ = require('lodash');
const mongoose = require('mongoose');
const util = require('util');
var tool = require('../../utils/tools');
const defaultOptions = {};
var mongoosePaginate = require('mongoose-paginate');

function BaseSchema(properties, options) {
    properties = _.defaults(properties, {
        // Base Properties
        updatedAt: { //11、最近修改时间
            type: Number,
            default: tool.getCurUtcTimestamp
        },
        updatedBy: { //12、最近修改的人
            type: mongoose.SchemaTypes.ObjectId,
            ref: 'User'
        },
        createdBy: { //创建人
            type: mongoose.SchemaTypes.ObjectId,
            ref: 'User'
        },
        createdAt: { //9.创建时间
            type: Number,
            default: tool.getCurUtcTimestamp
        },
        deleted: {
            type: Number,
            default: 0 //0代表存在，1代表已逻辑删除
        }
    });

    options = _.defaults(options, {
        // Base Options
        // timestamps: true
    });

    mongoose.Schema.call(this, properties, options);

    this.pre('save', function(next) {
        this.updatedAt = tool.getCurUtcTimestamp();
        if (!this.isNew) return next();
        next();
        // if (!validatePresenceOf(this.hashedPassword) && authTypes.indexOf(this.provider) === -1)
        //   next(new Error('Invalid password'));
        // else
        //   next();
    });
    this.plugin(mongoosePaginate); //添加分页插件
    this.statics.oldFind = mongoose.Model.find;
    this.statics.find = function(arg) {
        var _self = this;

        // find(condition, callback)
        // find(callback)
        // find(condition).exec(callback)
        // find().exec
        if (arguments.length == 0) {
            return mongoose.Model.find.apply(_self, [{ 'deleted': { $lt: 1 } }]); // _self.find({'deleted':{$lt:1}})
        }

        if(arguments.length == 1){
            if(arguments[0] instanceof Function){
                return mongoose.Model.find.apply(_self,[{'deleted':{$lt:1}},arguments[0]]);
            }else{
                arguments[0].deleted = {$lt:1};
                return mongoose.Model.find.apply(_self,[arguments[0]]);
            }
        }

        if (arguments.length > 1) {
            arguments[0].deleted = { $lt: 1 };
            if (arguments[arguments.length - 1] instanceof Function) {
                return mongoose.Model.find.apply(_self, arguments);
            } else {
                return mongoose.Model.find.apply(_self, arguments);
            }
        }
}
    this.statics.findOne = function(){
        var _self = this;
         if(arguments.length == 0){
            return mongoose.Model.findOne.apply(_self,[{'deleted':{$lt:1}}]);  // _self.findOne({'deleted':{$lt:1}})
        }

        if(arguments.length == 1){
            if(arguments[0] instanceof Function){
                return mongoose.Model.findOne.apply(_self,[{'deleted':{$lt:1}},arguments[0]]);
            }else{
                arguments[0].deleted = {$lt:1};
                return mongoose.Model.findOne.apply(_self,[arguments[0]]);
            }
        }

        if(arguments.length >1){
            arguments[0].deleted = {$lt:1};
            if(arguments[arguments.length-1] instanceof Function){
                return mongoose.Model.findOne.apply(_self, arguments);
            }else{
                return mongoose.Model.findOne.apply(_self, arguments);
            }   
        } 
    }
    // this.statics.findById = function(){
    //     var _self = this;
    //      if(arguments.length == 0){
    //         return mongoose.Model.findOne.apply(_self,[{'deleted':{$lt:1}}]);  // _self.findOne({'deleted':{$lt:1}})
    //     }

    //     if(arguments.length == 1){
    //         if(arguments[0] instanceof Function){
    //             return mongoose.Model.findOne.apply(_self,[{'deleted':{$lt:1}},arguments[0]]);
    //         }else{
    //             arguments[0].deleted = {$lt:1};
    //             return mongoose.Model.findOne.apply(_self,[arguments[0]]);
    //         }
    //     }

    //     if(arguments.length >1){
    //         arguments[0].deleted = {$lt:1};
    //         if(arguments[arguments.length-1] instanceof Function){
    //             return mongoose.Model.findOne.apply(_self, arguments);
    //         }else{
    //             return mongoose.Model.findOne.apply(_self, arguments);
    //         }   
    //     } 
    // }
    }

mongoose.Query.prototype.populated = function(name, cb) {
    var query = this;
    query = query.populate({
        path: name,
        match: { deleted: { $lt: 1 } },
    })
    return query;
}



util.inherits(BaseSchema, mongoose.Schema);

module.exports = BaseSchema;