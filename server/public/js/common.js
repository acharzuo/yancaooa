
var headerH = $('#header').height();
var footerH = $('#footer').height();
var bodyH = $('body').height();
var mainH = bodyH - headerH - footerH;
console.log('bodyH:',bodyH,'headerH:',headerH,'footerH:',footerH,'mainH:',mainH);
$('#main').height(mainH);
$('#main').css('top',headerH);

// 返回上一页，js
function back() {
    window.history.go(-1);
}

// 返回上一页，APICloud的方法
function backHistory(){
	api.historyBack({
		frameName:'',
	},function(ret,err){
		if (!ret.status) {
       		api.closeWin();
   		}
	});
}

// 退出程序
function backEnd(){
	api.closeWidget({
	    id: 'A6939656448181',	//项目widget的id号
	    retData: {
	        name: 'closeWidget'
	    },
	    animation: {
	        type: 'flip',
	        subType: 'from_bottom',
	        duration: 500
	    }
	});
}

/**
 * @param  {string} url   打开页面的url链接
 * @param  {string} name  打开页面的名字，自定义
 * @param  {string} param url里的参数，字符串类型
 * @return {void}         void
 */
function openWindow(url,name,param){
    // param = "id=2343432&uid=4444444"
    // param = { id: "23423432", uid : "dddddd"}
    var req = '';
    if(param && typeof param === 'string'){
        req = '?'+ param;
    }
    var path ='/html';
    //alert('api.wgtRootDir:'+api.wgtRootDir + path + url + req);
    console.log('api.wgtRootDir:'+api.wgtRootDir + path + url + req);
    api.openWin({
        name:name,
        url:api.wgtRootDir + path + url + req,
        rect: {
            x: 0,
            y: 0,
        },
        bounces: false, //窗体是否弹动
        bgColor: 'rgba(0,0,0,0)',
        vScrollBarEnabled: true,
        hScrollBarEnabled: true,
        reload:true,
    });
}

// 首页
function openIndex(){
    openWindow('/index/index.html', 'index');
}

/**
 * 报告
 * 报告的用户id，报告本身的id
 * 没有本身id显示列表，如有显示本条报告详细信息
 */
function openReport(){
    openWindow('/report/report.html','report');
}

// 家人
function openFamilyList(){
    openWindow('/family/familyList.html','familyList');
}

// 我的
function openMine(){
    openWindow('/logReg/logReg.html','logReg');
}

/**
 * APICloud  ajax 方法
 * @param  {string}   url      eg: 'http://192.168.0.29:8029'
 * @param  {string}   method   POST、GET等
 * @param  {obj}   	  data     {values:{key:value},}
 * @param  {obj}      callback function
 * eg: apiAjax('/api/app/verification_codes','POST',{
 * 		values:{
 * 			name:"21214",
 * 			pass:"123456"
 * 		}
 * },function(ret,err){
 * 		if(ret){
 * 			do something
 * 		}else{
 * 			do something
 * 		}
 * })
 */
function apiAjax(url,method,data,callback){
	var httpPath = 'http://192.168.0.124:8029';
	// var httpPath = 'http://api.yuntianyuan.net';
	
	switch(method) {
		case "patch":
		case "PATCH":
			$.ajax({
				url: httpPath + url,
				type: method,
				dataType: 'json',
				data: data,//{key:value}
				success: function(ret){
					console.log('success:' + JSON.stringify(ret));
					callback(ret,null);
				},
				error: function(err){
					console.log('error:' + JSON.stringify(err));
					callback(null,err);
				}
			});
			break;
		case 'post':
		case 'POST':
		case 'get':
		case 'GET':
		case 'delete':
		case 'DELETE':
		case 'put':
		case 'PUT':
			api.ajax({
				url: httpPath + url,
				method:method,
				data:data,//{values:{key:value}}
			},function(ret,err) {
				console.log('ret:' + JSON.stringify(ret));
				console.log('err:' + JSON.stringify(err));
				callback ? callback(ret,err) : '';
			});
			break;
		default:
			console.log('ajax请求方式错误，请检查！');
	}
}

function inputChange(e){
    if(e.value.length > 0) {
        document.getElementById('loginBtn').style.backgroundColor = '#00b786';
        //e.nextSbiling().style.display = 'block';
    }else {
        document.getElementById('loginBtn').style.backgroundColor = '#ccc';
        e.nextSbiling('span').style.display = 'none';
    }
}

// 验证码登录
function inputChangeVer(e){
    if(e.value.length > 0) {
        document.getElementById('getVerification').style.backgroundColor = '#00b786';
        document.getElementById('loginBtn').style.backgroundColor = '#00b786';
    }else {
        document.getElementById('loginBtn').style.backgroundColor = '#ccc';
        document.getElementById('getVerification').style.backgroundColor = '#ccc';
    }
}

function removeShow(e){
	if(e.value.length > 0){
		$(e).siblings('span').css('display','block');
	}else {
		$(e).siblings('span').css('display','none');
	}
}

function removeInputText(e){
	$(e).siblings('input')[0].value = '';
	$(e).css('display','none');
}


// 从手机相册、相机获取图片的弹窗
function changeAvator() {
    var str = '<div class="changeAvatorBox" id="changeAvatorBox"><div class="changImgFrom"><p id="fromCamera">拍照</p><p id="fromAlbum">从手机相册选择</p><p class="cancle" id="cancle">取消</p></div></div>';

    $('body').append(str);

    $('#cancle').bind('click', function() {
    	$(this).remove();
    	$('#changeAvatorBox').remove();
    });

    // 从相机
    $('#fromCamera').bind('click',function() {
    	getPicFromCamera();
    	//sendImgUrl('/api/app/users',avator);
    	// $('.avator img').attr('src',avator);
    })

    // 从相册
    $('#fromAlbum').bind('click',function() {
    	// var avator = getPicFromAlbum();
    	getPicFromAlbum();
    	//sendImgUrl('/api/app/users',avator);
    	// $('.avator img').attr('src',avator);
    })
}

//更换头像的api访问
function changeAvatorApi(avator){
	var htmlUrlLong = window.location.href.split('.html');
	var htmlUrlTotal = htmlUrlLong[0].split('/');
	var htmlUrl = htmlUrlTotal[htmlUrlTotal.length-1];
	console.log('htmlUrl:',htmlUrl);
	if(htmlUrl === 'personalData'){
		apiAjax('/api/app/users','PATCH',{
	        id:USER._id,
	        avator:avator,
	    },function(ret,err){
	        console.log('ret:' + ret);
	        if(ret.code === 0) {
	            console.log('修改头像！');
	            console.log('ret:' + JSON.stringify(ret));
	            USER.setData(ret.result);
	            $('#changeAvatorBox').remove();
	            openWindow('/mine/personalData.html','personalData');
	            // $('#changeAvatorBox').remove();
	        } else {
	            console.log('err:' + JSON.stringify(err));
	            alert('修改失败，请重试！');
	        }
	    });
	}else if(htmlUrl==='handleFamily'){
		if(htmlUrlLong[1] != ''){	//存在id，说明修改的是家人的头像
			apiAjax('/api/app/users/'+ USER._id +'/families/' + urlId,'PATCH',{
		        avator:avator,
		    },function(ret,err){
		        console.log('ret:' + ret);
		        if(ret.code === 0) {
		            console.log('修改家人头像！');
		            console.log('ret:' + JSON.stringify(ret));
		            $('#changeAvatorBox').remove();
		            openWindow('/family/familyDetails.html','familyDetails');
		        } else {
		            console.log('err:' + JSON.stringify(err));
		            alert('修改家人头像失败，请重试！');
		        }
		    });
		}else{	//没有id，说明是增加家人信息时上传头像
			$('#changeAvatorBox').remove();
			$('#familyAvator img').attr('src',avator);
		}
	}
} 

// 把图片的base64传入后台，换取url地址
function getImgUrl(base64){
	console.log('传入的base64参数：' + JSON.stringify(base64));
	var avator = '';
	apiAjax('/api/app/files','POST',{
		values:{
			image:base64,
		}
	},function(ret,err){
		console.log('更新头像成功后返回的数据：' + JSON.stringify(ret));
		console.log('更新头像失败后返回的数据：' + JSON.stringify(err));
		if(ret.code == 0){
			avator = ret.result;
			changeAvatorApi(avator);
		}
	})
}

// 从手机相册获取图片
function getPicFromAlbum(){
	var avator = '';
	api.getPicture({
		sourceType:'album',
	    mediaValue: 'pic',
	    destinationType: 'base64',
	    encodingType: 'jpg',
	    allowEdit: true,
	    quality: 50,
	    targetWidth: 100,
	    targetHeight: 100,
	    saveToPhotoAlbum: true,
	},function(ret,err){
		if (ret) {
			console.log("从手机相册获取图片："+JSON.stringify(ret));
			avator = ret.base64Data;
			console.log('avator:' + JSON.stringify(avator));
			getImgUrl(avator);
	    } else {
	        console.log("手机相册error："+JSON.stringify(err));
	    }
	});
}

// 访问手机相机拍照
function getPicFromCamera(){
	var avator = '';
	api.getPicture({
		sourceType:'camera',
	    mediaValue: 'pic',
	    destinationType: 'base64',
	    encodingType: 'jpg',
	    allowEdit: true,
	    quality: 50,
	    targetWidth: 100,
	    targetHeight: 100,
	    saveToPhotoAlbum: false
	},function(ret,err){
		if (ret) {
			console.log("相机拍照success："+JSON.stringify(ret));
			avator = ret.base64Data; 
			console.log('avator:' + JSON.stringify(avator));
			getImgUrl(avator);
	    } else {
	        console.log("相机拍照error："+JSON.stringify(err));
	    }
	});
}


// 判断左滑或右滑
function touchScreen(ele){
	var startPosition,endPosition,deltaX,deltaY,moveLength;
	$(ele).bind('touchstart', function(e) {
	    var touch = e.touches[0];
	    startPosition = {
	        x:touch.pageX,
	        y:touch.pageY
	    }
	}).bind('touchmove',function(e){
	    var touch = e.touches[0];
	    endPosition = {
	        x:touch.pageX,
	        y:touch.pageY
	    };

	    deltaX = endPosition.x - startPosition.x;
	    deltaY = endPosition.y - startPosition.y;
	    moveLength = Math.sqrt(Math.pow(Math.abs(deltaX),2) + Math.pow(Math.abs(deltaY),2))
	}).bind('touchend',function(e){
	    if(deltaX < 0){
	        $(this).children('.deleteButton').show();
	        console.log('向左滑动');
	    } else if (deltaX > 0){
	        $(this).children('.deleteButton').hide();
	        console.log('向右滑动');
	    }
	});
}

// 删除操作时的提示
function deleteTip(){
	var str = '<div></div>';
}

// 弹窗提示
// function popUp(msg){
// 	var str = '<div class="popUpBox"><div class="popUp">'
// 			            +'<p class="popUpTit">提示</p>'
// 			            +'<div class="popUpBody">'+ msg +'</div>'
// 			            +'<div class="popUpBtn">'
// 			            +'    <button class="popUpCancle">取消</button>'
// 			            +'	  <button class="popUpSure">确定</button>'
// 			            +'</div>'
// 			        +'</div>'
// 			    +'</div>';
// 	$('body').append(str);

// 	$('popUpCancle').click(function(){
// 		$('.popUpBox').remove();
// 	})

// 	$('popUpSure').click(function(){
// 		$('.popUpBox').remove();
// 	})
// }

function msgTip(msg,aCallback,bCallback){
	var str = '<div class="msgTip">'
				    +'<div class="mainTip">'
				    +'    <p class="tipDsp">'+ msg +'~</p>'
				    +'    <p class="tipBtn">'
				    +'        <button id="tipNo">取消</button><button id="tipYes">登录</button>'
				    +'    </p>'
				    +'</div>'
				+'</div>';
	$('body').append(str);
	$('#tipNo').click(function(){
		$('.msgTip').remove();
        aCallback ? aCallback() : "";
	});
	$('#tipYes').click(function() {
		$('.msgTip').remove();
        bCallback ? bCallback() : "";
	});
}


// 12时辰和24小时转换
/**
 * @param  {date} 	date [毫秒数]
 * @return {[type]}      [description]
 */
function switchTime(date){
	var newTime = new Date(date);
	var year = newTime.getFullYear();
	var month = newTime.getMonth() > 9 ? (newTime.getMonth()+1) : '0' + (newTime.getMonth()+1);
	var day = newTime.getDate() > 9 ? newTime.getDate() : '0' + newTime.getDate();
	var hours = newTime.getHours() > 9 ? newTime.getHours() : '0' + newTime.getHours();
	var time;
	var timeArr = [{
		'date':'子时',
		'time':'23:00 - 00:59'
	},{
		'date':'丑时',
		'time':'01:00 - 02:59'
	},{
		'date':'寅时',
		'time':'03:00 - 04:59'
	},{
		'date':'卯时',
		'time':'05:00 - 06:59'
	},{
		'date':'辰时',
		'time':'07:00 - 08:59'
	},{
		'date':'巳时',
		'time':'09:00 - 10:59'
	},{
		'date':'午时',
		'time':'11:00 - 12:59'
	},{
		'date':'未时',
		'time':'13:00 - 14:59'
	},{
		'date':'申时',
		'time':'15:00 - 16:59'
	},{
		'date':'酉时',
		'time':'17:00 - 18:59'
	},{
		'date':'戌时',
		'time':'19:00 - 20:59'
	},{
		'date':'亥时',
		'time':'21:00 - 22:59'
	}];
	console.log('timeArr',timeArr);
	for(var i = 0; i < timeArr.length; i++){
		console.log('timeArr[i]:',timeArr[i].time.substr(0,2));
		// if(hours == timeArr[i].time.substr(0,2)){
		// 	time = timeArr[i].date;
		// }
		if(hours>=timeArr[i].time.substr(0,2)&&hours<parseInt(timeArr[i].time.substr(0,2))+2){
			time = timeArr[i].date;
		}
	}
	return year + '-' + month + '-' + day + ' ' + time;
}



// 用户数据存储本地
function objUser() {
	/** 用户的唯一ID */
	this._id = "";
	/** 用户姓名,昵称 */
	this.name = "";
	/** 用户性别 0未设置,1男,2女*/
	this.sex = "";
	/** 用户头像url */
	this.avator = "";
	/** 手机号码 */
	this.tel = "";
	/** 出生日期 */
	this.birthday = "";
	/** 地区 */
	this.address = "";
}

/**
 * 保存数据到对象中
 */
objUser.prototype.setParam = function(_id, name, sex, avator,tel,birthday,address){
	this._id = _id;
	this.name = name;
	this.sex = sex;
	this.avator = avator;
	this.tel = tel;
	this.birthday = birthday;
	this.address = address;

	// 保存数据到localstorage中,localStorage只能保存字符串型数据.
	localStorage.user = JSON.stringify(this);
};



/**
 * 用户登录成功后保存数据,前台会保存到Localstorege中
 * @param data
 */
objUser.prototype.setData = function(data){
	return this.setParam(data._id,
		data.name,
		data.sex,
		data.avator,
		data.tel,
		data.birthday,
		data.address
	);
};

objUser.prototype.clear = function(){
	localStorage.user = undefined;
	//console.log("logout");
	return true;
};



/**
 * 从LocatStorage中读取已经存在的用户信息
 */
objUser.prototype.refresh= function(){
	this.setData(JSON.parse(localStorage.user));
	console.log("Read user: " + JSON.stringify(this));
};


/**
 * 判断用户是否已经登录
 * @returns {boolean} true 已经登录, false 为登录
 */
objUser.prototype.isLogin = function() {
	if(this._id) {
		return true;
	}
	return false;
};

/**
 * 全局变量,存储用户的信息
 * @type {objUser}
 */
var USER;
function userInstance(){
	var strUser = localStorage.user;
	console.log(strUser);
	USER = new objUser();
	if (strUser != 'undefined'&&strUser != undefined) {
		tmpUser = JSON.parse(strUser);
		if(tmpUser && tmpUser._id){		// 用户存在,并且_id不为空则表示用户数据有效
			//console.log("开始" + JSON.stringify(tmpUser));
			USER.setData(tmpUser);
			return;
		}
	}
	return;
}

// 页面打开时都要重新读取用户信息
userInstance();
