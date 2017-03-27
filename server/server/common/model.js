'use strict';

var mongoose = require("mongoose");
var config = require('../common/config');
var Schema = mongoose.Schema;

// var userSchema = new Schema({
// 	email:String,//邮箱
// 	password:String,
// 	username:String,
// 	birthday:Date,
// 	sex:Number,
// 	emailVerified:Boolean,//邮箱是否验证
//     isRegister:Boolean, //用户是否注册
// 	authData:{
// 		qq:{
// 			openid:String,
// 			access_token:String,
// 			expires_in:String,
// 			nickname:String,
// 			img:String
// 		},
// 		wx:{
// 			openid: String,        			//字符串类型；普通用户的标识，对当前开发者帐号唯一
// 			nickname: String,      			//字符串类型；普通用户昵称
// 			sex: Number,           			//数字类型；普通用户性别，1为男性，2为女性
// 			headimgurl: String,    			//字符串类型；用户头像，最后一个数值代表正方形头像大小（有0、46、64、96、132数值可选，0代表640*640正方形头像），用户没有头像时该项为空
// 			privilege: [],     				//数组类型；用户特权信息，如微信沃卡用户为（chinaunicom）
// 			unionid: String,        		//字符串类型；用户统一标识。针对一个微信开放平台帐号下的应用，同一用户的unionid是唯一的。
// 			accessToken: String,			// 客户端获取的Access Token
// 			fristTokenDate: Date,			// 首次获取Access Token的时间,也就是获取dynamic的时间
// 			lastTokenDate: Date,			// 最近一次获取Access Token的时间, AccessToken的默认有效期是7200s
// 			dynamicToken: String			// 动态Token
// 		}
// 	},
// 	mobilePhoneNumber:String,
// 	mobilePhoneVerified:Boolean,
// 	createdAt:Date,   //用户创建时间
// 	lastLogin:Date,   //最后登录时间
// 	role:Number,  //角色，0管理员 1普同用户
// 	intro:String,//个人介绍
// 	avator:String,  //头像地址
// 	friendList:[],
// 	// payedplate:[pays],//键为pid值为购买价格price
// 	// collections:[collects],//收藏的模板

// 	// wbopenID:String,
// 	// wbname:String,
// 	// wbImg:String,
// 	// forgotid:String,
// 	// forgotTime:Date,
// 	// qqopenID:String,
// 	// qqnickname:String,
// 	// qqImg:String,

// },{_id:true});
// var User = config.BaseApi.User =  exports.User = mongoose.model("User",userSchema,"user");



//demo
var demoSchema = new Schema({
	//demo 集合
	demoName:String,
	createAt:Date,
	demoValue:Number,
	demoData:String
});
var Demo = exports.Demo = config.BaseApi.Demo = mongoose.model("Demo",demoSchema,"demo");

//广告
var adListSchema = new Schema({
	adName:String,  //广告名称
	adImg:String,	//广告封面图
	createAt:{startAt:Date,endAt:Date}, 	//创建时间
	shopId:[],		//广告投放的店铺集合
	playCount:Number,  //播放总次数
	playTime:Number, 		//播放总时长
	timeArray:[]  	//统计周期

});
var AdList = exports.AdList = config.BaseApi.AdList = mongoose.model("AdList",adListSchema,"adList");
