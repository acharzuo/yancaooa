var multer = require('../../utils/multerUtil'); //文件上传
var log = require('../../utils/log'); //引进日志

module.exports = function content(req,res,err,message,_url){
	//添加错误处理
	if (err) {
		if (err.code === 'LIMIT_FILE_SIZE') { //上传文件过大
			return res.send(message("LIMIT_FILE_SIZE"));
		} else if (err.code === "LIMIT_FILE_COUNT") { //上传文件数量过多
			return res.send(message("LIMIT_FILE_COUNT"));
		} else {
			return res.send(message("ERROR", null, err));
		}
	} else {
		// 文件信息在req.file或者req.files中显示。
		var data = req.file;
		// 修改返回文件URL为本服务器的URL
		var date = new Date(),
			year = date.getFullYear(),
			month = date.getMonth() + 1,
			day = date.getDate();
		// data.path =" req.headers.origin "+  "/uploads/"+year+"/"+month+"/"+day+"/"+ data.filename ;
		data.path = _url + "/uploads/" + year + "/" + month + "/" + day + "/" + data.filename;

		log.debug("上传文件信息", data); //打印日志

		data.createdBy = (req.user ? req.user.id : null); //上传人
		return data;
	}
};
// module.exports = content;
