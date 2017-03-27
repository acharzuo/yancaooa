var multer = require('multer');
var path = require('path');
var fs = require('fs');

var setting = require("../config/setting");
var message = require("./statusMessage");
var log = require('./log'); // 日志系统

var storage = multer.diskStorage({
    //设置上传后文件路径。
    // TODO 修改目录为根据日期时间生成的目录,尽量保证每个目录下的文件数量不超过500个.

    destination: function(req, file, callback) {
        //获取时间，根据时间创建文件夹
        var date = new Date(),
            year = date.getFullYear(),
            month = date.getMonth() + 1,
            day = date.getDate();

        var year_uploadPath = setting.upload.path + '/' + year; //创建年号的文件夹
        var month_uploadPath = year_uploadPath + '/' + month; //在年文件夹下创建月文件夹
        var uploadPath = month_uploadPath + '/' + day; //在月文件夹下创建日文件夹，并作为最终上传文件树形目录

        //根据时间每天创建一个文件夹目录，每天上传的文件放到对应的文件夹中，使用时第二个参数可以忽略
        function mkdir(dirpath, dirname) {
            // console.log(dirname);
            //判断是否是第一次调用
            if (typeof dirname === "undefined") { //如果第二个参数不存在
                if (fs.existsSync(dirpath)) { //判断要新建的文件夹是否存在
                    return console.log('此文件夹已经存在');
                } else { //如果不存在，递归，给dirname赋值，执行else
                    mkdir(dirpath, path.dirname(dirpath));
                }
            } else {
                //判断第二个参数是否正常，避免调用时传入错误参数
                if (dirname !== path.dirname(dirpath)) {
                    return mkdir(dirpath);
                }
                if (fs.existsSync(dirname)) { //如果dirname 存在，创建文件夹
                    fs.mkdirSync(dirpath);
                } else { //如果不存在。递归，给dirname赋值，再次执行
                    mkdir(dirpath, path.dirname(dirpath));
                    fs.mkdirSync(dirpath);
                }
            }
        }
        mkdir(path.join(__dirname, '..', year_uploadPath)); //创建年文件夹
        mkdir(path.join(__dirname, '..', month_uploadPath)); //创建月文件夹
        mkdir(path.join(__dirname, '..', uploadPath)); //创建日文件夹

        //定义文件上传的路径
        callback(null, path.join(__dirname,'..', uploadPath));
    },

    //给上传文件重命名，获取添加后缀名
    filename: function(req, file, callback) {
        var fileFormat = (file.originalname).split(".");
        var reName = file.fieldname + '-' + Date.now() + "." + fileFormat[fileFormat.length - 1];
        callback(null, reName);
    }
});
//添加配置文件到muler对象。
module.exports = multer({
    storage: storage,
    limits: {
        files: 3, //一次只允许上传3个文件
        fileSize: 100 * 1024 * 1024 // 设置文件大小不能超过100M
    }
});


// //读取文件
// exports.ReadFile = function(req, res) {
//     var rootFile = __dirname + '/../public/uploads';//远程路径
//
//     function fileList(rootFile){
//         var files=fs.readdirSync(rootFile); //读取文件信息
//         var arr = [];   //新建数组，把读取到的信息保存在数组中
//         for(fn in files){
//             var fname = rootFile+path.sep+files[fn];
//             var stat = fs.lstatSync(fname);
//             if(stat.isDirectory() === true){
//                 fileList(fname);
//             }else{
//                 console.log(fname);
//                 arr.push(fname);
//             }
//         }
//         return arr;
//     }
//     var arrs = fileList(rootFile);
//     res.send(message.createReturn(message.SUCCESS, arrs));
//
// };

//删除文件
// exports.RemoveFile = function(req, res) {
//     var fileName = req.param('fileName');   //要删除的文件名
//     var rootFile = __dirname + '/../public/uploads';
//
//     function fileList(rootFile,fileName){
//         var files=fs.readdirSync(rootFile); //读取文件信息
//         for(fn in files){
//             var fname = rootFile+path.sep+files[fn];
//             var stat = fs.lstatSync(fname);
//             if(stat.isDirectory() === true){
//                 fileList(fname);    //如果下一层目录为文件夹，继续遍历，直至检索到文件
//             }else{
//                 console.log(fname);
//                 var reg = eval("/"+fileName+"/ig");
//                 if (reg.test(fname)) {
//                     fs.unlinkSync(fname);
//                     res.send("删除文件" + fileName + ' 成功');
//                 }else {
//                     res.send('文件不存在！');
//                 }
//             }
//         }
//     }
//     fileList(rootFile,fileName);
// };
