'use strict';

var _ = require('lodash');
var buffer = require('buffer');
var fs = require('fs');
var Buffer = buffer.Buffer;
var file = require('./model');
var setting = require('../../config/setting');
var message = require('../../utils/returnFactory'); //返回状态模块
var multer = require('../../utils/multerUtil'); //文件上传
var log = require('../../utils/log'); //引进日志
var service = require('./service');
var _url = setting.file_url;
//添加文件-----------post-------------------------------------

/**
 * @alias /api/files[POST]
 * @description  添加文件
 * @param {String} fieldname form表单name属性值
 *
 * @return {Object} 文件信息
 *@example
{
    "__v": 0,
    "fieldname": "file",
    "originalname": "QQ截图20161220104051.png",
    "encoding": "7bit",
    "mimetype": "image/png",
    "destination": "F:\\turnround\\yuntianyuan_api\\public\\uploads\\2016\\12\\23",
    "filename": "file-1482464639951.png",
    "path": "F:\\turnround\\yuntianyuan_api\\public\\uploads\\2016\\12\\23\\file-1482464639951.png",
    "size": 35181,
    "_id": "585c9d7f83f52d27ec2b59cb"
}
 */

exports.create = function(req, res) {
    // 单文件上传
    var fieldname = req.body.fieldname;
    var name = req.body.fieldname ? req.body.fieldname : 'file';
    var upload = multer.single(name);

    upload(req, res, function(err) {

        var data = service(req,res,err,message,_url);
        //将文件信息保存到数据库中
        file.create(data, function(err, doc) {
            if (err) {
                return res.send(message("ERROR", null, err));
            } else if (!doc) {
                return res.send(message("NOT_FOUND", null));
            }
            res.send(message("SUCCESS", doc));
        });
    });
};

//添加富文本文件-----------post-------------------------------------

/**
 * @alias /api/files/rich-texts[POST]
 * @description  添加文件
 * @param {String} fieldname form表单name属性值
 *
 * @return {Object} 文件信息

 */
exports.createRichtext = function(req, res) {
    // 单文件上传
    var fieldname = req.body.fieldname;
    var name = req.body.fieldname ? req.body.fieldname : 'file';
    var upload = multer.single(name);

    upload(req, res, function(err) {
        var data = service(req,res,err,message,_url);

        //将文件信息保存到数据库中
        file.create(data, function(err, doc) {
            if (err) {
                return res.send(message("ERROR", null, err));
            } else if (!doc) {
                return res.send(message("NOT_FOUND", null));
            }
            res.send(doc.path);
        });

    });
};

//头像传更新-------------------------------------
/**
 * @alias /api/files/:id[PATCH]
 * @description  添加文件
 * @param {String} fieldname form表单name属性值
 * @param {String} title 添加的文件名
 *
 * @return {Object} 文件信息
 */
exports.update = function(req, res) {
    var upload = multer.single("file");
    upload(req, res, function(err) {
        //添加错误处理
        if (err) {
            if (err.code === 'LIMIT_FILE_SIZE') { //上传文件过大
                return res.send(message.createReturn(message.LIMIT_FILE_SIZE));
            } else if (err.code === "LIMIT_FILE_COUNT") { //上传文件数量过多
                return res.send(message.createReturn(message.LIMIT_FILE_COUNT));
            }
        }
        // 文件信息在req.file或者req.files中显示。
        log.debug("上传文件信息", req.file); //打印日志
        //更改信息
        file.findById(req.params.id, function(err, doc) {
            if (err) {
                return res.send(message("ERROR", null, err));
            }
            var updateData = req.file;
            var data = _.merge(doc, updateData); //将传入的参数合并到原来的数据上
            data.updatedBy = (req.user ? req.user.id : null); //修改人
            // 写入数据库
            file.update({ "_id": req.params.id }, data, function(err) {
                if (!err) {
                    file.findById(req.params.id, function(err, doc) {
                        if (!err && doc) {
                            res.send(message("SUCCESS", doc));
                        } else {
                            return res.send(message("ERROR", null, err));
                        }
                    });
                } else {
                    return res.send(message("ERROR", null, err));
                }
            });
        });
    });
};

//创建头像-----------------------------------
/**
 * @alias /api/app/files[post]
 * @description  添加文件
 * @param {String} image Base64
 *
 * @return {Object} 文件信息
 */
exports.avatorCreate = function(req,res){

    //接收前台POST过来的base64
    var imgData = req.body.image;
    //过滤data:URL
    var base64Data = imgData.replace(/^data:image\/\w+;base64,/, "");
    var dataBuffer = new Buffer(base64Data, 'base64');
    var re1=/jpeg/ig,re2=/png/ig,re3=/gif/ig;
    var suffix;
    if (re1.test(imgData)) {
        suffix = Date.now() + ".jpeg";
    }
    if (re2.test(imgData)) {
        suffix = Date.now() + ".png";
    }
    if (re3.test(imgData)) {
        suffix = Date.now() + ".gif";
    }
    //给上传文件重命名，获取添加后缀名
    var filePath = "avator/" +suffix;

    fs.writeFile("public/avator/"+suffix , dataBuffer, function(err) {
        if(err){
          res.send("ERROR",null,err);
        }else{
          res.send(message("SUCCESS",_url +"/"+ filePath));
        }
    });
};
