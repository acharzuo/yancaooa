var allAuthorities = require('../../config/authorities.config');
var _ = require('lodash');

exports.getAuthorityObj = function(authority){
  var curObj = allAuthorities;
  var tmpAuthority = curObj.authorities;
  var result = {code: authority};
  return findObj(curObj, authority);
}

function findObj(curObj, authority){
  if(checkAuthority(curObj.code, authority)){
        // result.description = curObj.description;
        return curObj.description;
      }
      if(!curObj.authorities){
        return null;
      }
      var tmp = null;
      for(var i=0;i<curObj.authorities.length;i++){
        tmp =  findObj(curObj.authorities[i], authority);
        if(tmp){
          return tmp
        }
      }
      return tmp;
}

function checkAuthority(codes, authority){
 if(_.isArray(codes)){
      if(_.includes(codes, authority)){ // 是否包含权限码
       
        return true;
      }
    }else{
      if(authority.toString() === codes.toString()){
        return true;
      }
    }
  return false;  
}