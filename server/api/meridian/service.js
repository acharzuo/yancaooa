
var _ = require('lodash');
var JingLuo = require('./data/十二经络')["十二经络"];

// 根据经络名称返回经络的相关数据
exports.getMeridian = function(name){
    var record = _.find(JingLuo, function(obj) { return obj["meridianName"].indexOf(name) > -1; });

    return record;
} 