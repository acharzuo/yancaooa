# 云天元后台接口项目


## 架构待完成任务列表
- `OK` 日志文件 
- 日志文件目录不存在时能自动创建目录最好(待定)
- 电话号码验证方法/各种数据的验证方法
- `OK` 自动加载api接口 
- 自动生成文件头部注释(基于webstorm)
- 单元测试代码
- 安全验证 auth/passport
- 运行时多核心多线程运行

##测试用例
node clearTestDb.js 清空数据库
node initTestData.ja 初始化测试数据（一些测试数据可以在这个脚本里添加）
npm test = node initTest.js  开始执行测试 脚本里会执行清空数据库 和 初始化测试数据 然后执行test/test.js开始测试

test/test.js 中是测试用例的入口，各个模块的测试用例需要在引用到这里，测试自己的模块时，可以先把其他模块注释掉

## 后台启动方法
npm install 安装依赖模块
npm start 启动后台程序

## 关于日期的处理
数据库存的日期统一为日期对应的标准时间的UTC秒数，数值类型
前台存日期，需要转换为UTC秒数存入后台
查询的时候，需要用UTC秒数来查询日期
后台返回前台的日期为标准时间的UTC秒数

## 一些参数命名统一规范
1. 高级查询中开始时间startTime，结束时间endTime
2. 关键字查询：easyQuery
3. 一些model公共属性: 
    createdAt,createdBy,updatedAt,updatedBy,
    tel,sex,image
4. 查询返回的结果为：
     {
        docs:docs, //json数组
        total:total  //查询到的全部管理员的数量，不是分页的数量
     }
5. 涉及到状态的用 status，0表示正常状态，1表示其他状态
6. api接口里的资源统一用复数，名词，不建议用动词
7. 排序和选择字段：sort,fields

## 中间件给req添加的属性
1. req.user 获取当前登录用户的信息，id,name等
2. req.check 校验方法，校验规则在utils/validator-config.js中,[教程地址](https://github.com/ctavan/express-validator)

## 身份认证
使用用户邮箱和密码从后台获取token，后面每个接口的访问都必须带上token信息：
    在http header中包含 x-access-token 属性，属性值是token
    返回http status 401 表示鉴权未通过

## 返回内容
    {
        code: 200,
        message: 'success',  //错误码列表中定义，可选，也可以自定义
        result:Object|Array|String|Number|undefined,
        err:err //详细错误信息，可选
    }
代码中使用：
    res.json(returnFactory('PARAM_ERROR',data,err,customMessage));
错误码定义在utils/returnFactory.js中

## API接口写法

API接口按照功能写入`/api`目录中, 服务器启动时会自动加载`confi/router`中配置的路由信息.

如: /api/demo/demo.router.js 

模块中的文件命名规则为:
```
model.js       // 数据模型 model
controller.js  // 控制器   controller 本模块中只允许有暴露在router里的函数，函数定义顺序为create、delete、update、list、detail，后面是模块独有的接口，函数定义驼峰式
service        // 辅助函数  controller里需要的函数，写在这里
config/router.js  // 暴露给前端的接口配置在这里，接口名称全部小写，多个单词用横线连接	
```
注意：
1. controller 本模块中只允许有暴露在router里的函数
2. controller中函数定义顺序为create、delete、update、list、detail
3. 函数定义驼峰式
4. 接口定义全部小写，下划线分割单词，例如：/api/user/:id

## 注释的写法
controller.js 里的注释必须按照jsdoc的标签写，[jsdoc地址](http://www.css88.com/doc/jsdoc/index.html)
示例：

    /**
    * @alias /api/admin/:id[DELETE]
    * @description  删除管理员用户
    * @param {String=} id 要删除的用户id
    * @return {Object} 错误信息
    */

## 数据库collection命名规则
var User = exports.User = mongoose.model('User', UserSchema, "user");
mongoose.model()的第一个参数为mongoose引用名称，首字母大写
第二个参数是schema变量
第三个参数是对应的mongodb的collection命名，单数，小写

## Log日志模块使用方法

在头部引用
```
var log = require(global.ROOT_PATH + "/utils/log"); // 获取日志
```

使用日志
```
log.trace('Trace info: log.trace(message)');        // 跟踪日志
log.debug('Debug info: log.debug(message)');        // DEBUG 调试日志
log.info('Info info: log.info(message)');           // 信息日志
log.warn('Warn info: log.warn(message)');           // 警告日志
log.error('Error info: log.error(message)');        // 错误日志
```
如果是错误的输出,则使用 log.error
平常调试代码的信息,使用 log.debug



## 文档标准

1. 文件开头写头注释
```javascript
/**
 * 用户管理控制器 <简述此文件功能>
 *
 * @author 左李峰   <文件建立者>
 * @date 2016-12-01 <文件建立时间>
 */

```

1. ES5严格模式
```javascript
'use strict';
```


## 文件介绍


---
|  +-- config
|        +-- setting.js 参数设置


# 技术番外

- nodejs开启gzip压缩，使用compression包
![compression](https://github.com/expressjs/compression/)

- Multer 是一个 node.js 中间件，用于处理 multipart/form-data 类型的表单数据, 它主要用于上传文件. 它是写在 busboy 之上非常高效。
https://github.com/expressjs/multer/blob/master/doc/README-zh-cn.md

- mongose
http://ourjs.com/detail/53ad24edb984bb4659000013