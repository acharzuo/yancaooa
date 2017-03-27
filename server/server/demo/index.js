var Action = require('../common/common');
var Demo = require('../common/model').Demo;
var demoAction = new Action(Demo);
var status = require('../common/statusMessage');

exports.get = function(req,res){
	// res.send("恭喜你，成功了！");
	res.render('index',{title:'上传文件'});
};
//获取前台数据，req.query()接收
exports.getDemo = function(req,res){
	var data = {
		demoName:"test",
		createAt: new Date()
	};
	demoAction.create(data,function(err,docs){
		res.send(status.createReturn(status.SUCCESS,docs));
    });
};
//前台表单输入，后台处理，并把结果传到后台
exports.setDemo = function(req,res){
    var body = req.body;
	var data = {
		demoName : body.name
	};
    demoAction.create(data,function(err,docs){
		res.send(status.createReturn(status.SUCCESS,docs));
   	});
};
