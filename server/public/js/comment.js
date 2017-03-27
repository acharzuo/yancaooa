function GetQueryString(name){//获取URL中的ID
    var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);
    if(r!=null)return  unescape(r[2]); return null;
}

function createXMLHTTPRequest() { //创建XML请求
    var xmlHttpRequest;  
    if (window.XMLHttpRequest) {     
    xmlHttpRequest = new XMLHttpRequest();     
        if (xmlHttpRequest.overrideMimeType) {     
            xmlHttpRequest.overrideMimeType("text/xml");     
        }     
    } else if (window.ActiveXObject) {     
        var activexName = [ "MSXML2.XMLHTTP", "Microsoft.XMLHTTP" ];     
        for ( var i = 0; i < activexName.length; i++) {     
            try {     
                xmlHttpRequest = new ActiveXObject(activexName[i]);   
                if(xmlHttpRequest){  
                    break;  
                }  
            } catch (e) {   }     
        }     
    }     
    return xmlHttpRequest;  
}     

function classInner(className,str){ //更改class名对应的第一个元素的innerhtml值
    document.getElementsByClassName(className)[0].innerHTML = str;
}

var _url='http://192.168.0.77:8029';