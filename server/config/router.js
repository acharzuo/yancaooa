 /**
  * 路由表
  */
 // module.exports = {
 //    /**
 //    * API
 //    */
 //     /**
 //      * 公用部分
 //      */
 //     // 当前用户帐号
 //     '/api/user': {
 //       get: [100100],
 //       post: [100103]
 //     },
 //     '/api/user/:id': {
 //       delete: [100102],
 //       get: [100100]
 //     },
 //     '/api/user/me': {
 //       get: [100100]
 //     },
 //     '/api/user/:id/password': {
 //       put: [100101]
 //     }
 // };




 var routeMap = [

     /**
      * 权限管理
      */
     //增加权限组
     { route: '/api/roles', method: 'post', authority: 100201, controller: 'api/roles/controller', action: 'create' },
     //删除权限组
     { route: '/api/roles/:id', method: 'delete', authority: 100202, controller: 'api/roles/controller', action: 'delete' },
     //修改权限组
     { route: '/api/roles/:id', method: 'patch', authority: 100203, controller: 'api/roles/controller', action: 'update' },
     //获取权限组列表
     { route: '/api/roles', method: 'get', authority: 100204, controller: 'api/roles/controller', action: 'list' },
     //获取单个权限详细信息
     { route: '/api/roles/:id', method: 'get', authority: 100205, controller: 'api/roles/controller', action: 'detail' },
     //获取所有权限列表json
     { route: '/api/authorities', method: 'get', authority: 100205, controller: 'api/roles/controller', action: 'getAuthorities' },
     /**
      * 用户管理
      */
     //创建新用户
     { route: '/api/users', method: 'post', authority: 100101, controller: 'api/user/controller', action: 'create' },
     //删除用户
     { route: '/api/users/:id', method: 'delete', authority: 100102, controller: 'api/user/controller', action: 'delete' },
     //修改用户
     { route: '/api/users/:id', method: 'patch', authority: 100103, controller: 'api/user/controller', action: 'update' },
     //获取所有用户
     { route: '/api/users', method: 'get', authority: 100104, controller: 'api/user/controller', action: 'list' },
     //获取单个用户信息
     { route: '/api/users/:id', method: 'get', authority: 100105, controller: 'api/user/controller', action: 'detail' },
     // 检测用户是否存在
     { route: '/api/user_exists', method: 'get', authority: 100152, controller: 'api/user/controller', action: 'checkExists' },
     // 增加 家人
     { route: '/api/users/:user_id/families', method: 'post', authority: 100106, controller: 'api/user/controller', action: 'createFamily' },
     // 修改 家人
     { route: '/api/users/:user_id/families/:id', method: 'patch', authority: 100107, controller: 'api/user/controller', action: 'updateFamily' },
     // 删除 家人
     { route: '/api/users/:user_id/families/:id', method: 'delete', authority: 100108, controller: 'api/user/controller', action: 'deleteFamily' },
     // 获取家人列表
     { route: '/api/users/:user_id/families', method: 'get', authority: 100108, controller: 'api/user/controller', action: 'getFamilyList' },
     // 详情
     { route: '/api/users/:user_id/families/:id', method: 'get', authority: 100109, controller: 'api/user/controller', action: 'getFamilyDetail' },
     //----------------------
     // PC端接口
     // pc端创建用户，技师创建普通用户
     { route: '/api/pc/users', method: 'post', authority: 200000, controller: 'api/user/controller', action: 'create' },
     //获取登录用户信息
     { route: '/api/pc/user_infos', method: 'get', authority: 200000, controller: 'api/user/controller', action: 'getLoginInfo' },
     // 检测符合条件的用户是否存在
     { route: '/api/pc/user_exists', method: 'get', authority: 200000, controller: 'api/user/controller', action: 'checkExists' },
     //pc端 用户 获取token 登陆
     { route: '/api/pc/user_tokens', method: 'post', authority: null, controller: 'api/user/controller', action: 'createToken' },
     //pc端 更新token，使用旧的token
     { route: '/api/pc/user_tokens', method: 'patch', authority: 200000, controller: 'api/user/controller', action: 'updateToken' },
     //注销 登出 删除当前登录用户的token
     { route: '/api/pc/user_tokens', method: 'delete', authority: null, controller: 'api/user/controller', action: 'deleteToken' },
     //增加检测次数
     { route: '/api/pc/increase_user_checkcount/:id', method: 'patch', authority: null, controller: 'api/user/controller', action: 'increaseCheckCount' },

     //----------------------
     // app端接口
     // 手机号 密码 注册用户
     // {route:'/api/app/users', method:'post',authority:200000,controller:'api/user/controller',action:'create'},
     //  手机号 验证码 注册 不需要鉴权
     { route: '/api/app/users', method: 'post', authority: null, controller: 'api/user/controller', action: 'createAppUser' },
     //  手机号 验证码 或 手机号 密码 登陆 不需要鉴权
     { route: '/api/app/user_tokens', method: 'post', authority: null, controller: 'api/user/controller', action: 'createToken' },
     //  修改用户自己的信息
     { route: '/api/app/users', method: 'patch', authority: 200000, controller: 'api/user/controller', action: 'updateLogin' },
     //注销 登出 删除当前登录用户的token
     { route: '/api/app/user_tokens', method: 'delete', authority: null, controller: 'api/user/controller', action: 'deleteToken' },
     // 增加 家人
     { route: '/api/app/users/:user_id/families', method: 'post', authority: 200000, controller: 'api/user/controller', action: 'createFamily' },
     // 修改 家人
     { route: '/api/app/users/:user_id/families/:id', method: 'patch', authority: 200000, controller: 'api/user/controller', action: 'updateFamily' },
     // 删除 家人
     { route: '/api/app/users/:user_id/families/:id', method: 'delete', authority: 200000, controller: 'api/user/controller', action: 'deleteFamily' },
     // 获取家人列表
     { route: '/api/app/users/:user_id/families', method: 'get', authority: 200000, controller: 'api/user/controller', action: 'getFamilyList' },
     // 详情
     { route: '/api/app/users/:user_id/families/:id', method: 'get', authority: 200000, controller: 'api/user/controller', action: 'getFamilyDetail' },
     // // qq  注册登录
     // {route:'/api/app/users2', method:'post',authority:200000,controller:'api/user/controller',action:'create'},
     // // 微信 注册登陆
     // {route:'/api/app/users3', method:'post',authority:200000,controller:'api/user/controller',action:'create'},
     // // 忘记密码
     // {route:'/api/app/users4', method:'post',authority:200000,controller:'api/user/controller',action:'create'},
     /**
      * 管理员账号管理
      */
     //创建新用户
     { route: '/api/admins', method: 'post', authority: 100001, controller: 'api/admin/controller', action: 'create' },
     //删除用户
     { route: '/api/admins/:id', method: 'delete', authority: 100002, controller: 'api/admin/controller', action: 'delete' },
     //修改用户
     { route: '/api/admins/:id', method: 'patch', authority: 100003, controller: 'api/admin/controller', action: 'update' },
     //获取所有用户

     { route: '/api/admins', method: 'get', authority: 100004, controller: 'api/admin/controller', action: 'list' },

     { route: '/api/admins/:id', method: 'get', authority: 100005, controller: 'api/admin/controller', action: 'detail' },
     //获取token
     { route: '/api/admin_tokens', method: 'post', authority: null, controller: 'api/admin/controller', action: 'createToken' },
     //注销 登出 删除当前登录用户的token
     { route: '/api/admin_tokens', method: 'delete', authority: null, controller: 'api/admin/controller', action: 'deleteToken' },
     //检查邮箱是否存在
     { route: '/api/admin_emails/:email', method: 'get', authority: 100006, controller: 'api/admin/controller', action: 'checkEmail' },



     /**
      * 设备管理 100300
      */

     //创建新经络仪
     { route: '/api/devices', method: 'post', authority: 100301, controller: 'api/device/controller', action: 'create' },
     //删除经络仪
     { route: '/api/devices/:id', method: 'delete', authority: 100302, controller: 'api/device/controller', action: 'delete' },
     //修改经络仪
     { route: '/api/devices/:id', method: 'patch', authority: 100303, controller: 'api/device/controller', action: 'update' },
     //获取所有经络仪
     { route: '/api/devices', method: 'get', authority: 100304, controller: 'api/device/controller', action: 'list' },
     //获取单个经络仪信息
     { route: '/api/devices/:id', method: 'get', authority: 100305, controller: 'api/device/controller', action: 'detail' },
     //修改经络仪状态
     { route: '/api/batch/devices/:ids', method: 'patch', authority: 100306, controller: 'api/device/controller', action: 'batchUpdate' },
     //获取经络仪类型列表
     { route: '/api/device_types', method: 'get', authority: 100307, controller: 'api/device/controller', action: 'getTypes' },
     /**
      * 店铺管理 100400
      */
     //创建新店铺
     { route: '/api/shops', method: 'post', authority: 100401, controller: 'api/shop/controller', action: 'create' },
     //删除店铺
     { route: '/api/shops/:id', method: 'delete', authority: 100402, controller: 'api/shop/controller', action: 'delete' },
     //修改店铺
     { route: '/api/shops/:id', method: 'patch', authority: 100403, controller: 'api/shop/controller', action: 'update' },
     //获取所有店铺
     { route: '/api/shops', method: 'get', authority: 100404, controller: 'api/shop/controller', action: 'list' },
     //获取单个店铺信息
     { route: '/api/shops/:id', method: 'get', authority: 100405, controller: 'api/shop/controller', action: 'detail' },
     /**
      * 系统备份 100500
      */
     { route: '/api/system/sysBackups', method: 'post', authority: 100501, controller: 'api/system/controller', action: 'sysBackups' },
     // 广告管理 100600
     //创建广告
     { route: '/api/advertisements', method: 'post', authority: 100601, controller: 'api/advertisement/controller', action: 'create' },
     //搜索
     { route: '/api/advertisements', method: 'get', authority: 100602, controller: 'api/advertisement/controller', action: 'list' },
     //获取单个信息
     { route: '/api/advertisements/:id', method: 'get', authority: 100603, controller: 'api/advertisement/controller', action: 'detail' },
     //更新
     { route: '/api/advertisements/:id', method: 'patch', authority: 100604, controller: 'api/advertisement/controller', action: 'update' },
     //删除
     { route: '/api/advertisements/:id', method: 'delete', authority: 100605, controller: 'api/advertisement/controller', action: 'delete' },
     { route: '/api/pc/advertisements', method: 'get', authority: 200000, controller: 'api/advertisement/controller', action: 'find' },
     /**
      * 专家案例管理 100700
      */
     //增加案例
     { route: '/api/cases', method: 'post', authority: 100701, controller: 'api/case/controller', action: 'create' },
     //搜索案例
     { route: '/api/cases', method: 'get', authority: 100702, controller: 'api/case/controller', action: 'list' },
     //获取单个数据
     { route: '/api/cases/:id', method: 'get', authority: 100703, controller: 'api/case/controller', action: 'detail' },
     //分析案例
     { route: '/api/analysiss', method: 'patch', authority: 100704, controller: 'api/case/controller', action: 'analysis' },
     //更新案例
     { route: '/api/cases/:id', method: 'patch', authority: 100705, controller: 'api/case/controller', action: 'update' },
     //删除案例
     { route: '/api/cases/:id', method: 'delete', authority: 100706, controller: 'api/case/controller', action: 'delete' },
     //批量删除
     { route: '/api/batch/cases/:ids', method: 'delete', authority: 100707, controller: 'api/case/controller', action: 'batchDelete' },
     /**
      * 问诊管理 100800
      */
     //增加问诊单
     { route: '/api/diags', method: 'post', authority: 100801, controller: 'api/diag/controller', action: 'create' },
     //搜索问诊单
     { route: '/api/diags', method: 'get', authority: 100802, controller: 'api/diag/controller', action: 'list' },
     //获取单个信息
     { route: '/api/diags/:id', method: 'get', authority: 100803, controller: 'api/diag/controller', action: 'detail' },
     //更新问诊单
     { route: '/api/diags/:id', method: 'patch', authority: 100804, controller: 'api/diag/controller', action: 'update' },
     //删除问诊单
     { route: '/api/diags/:id', method: 'delete', authority: 100805, controller: 'api/diag/controller', action: 'delete' },
     //批量删除
     { route: '/api/batch/diags/:ids', method: 'delete', authority: 1008010, controller: 'api/diag/controller', action: 'batchDelete' },

     /**
      * 问题管理 102500
      */
     //增加问题
     { route: '/api/problems', method: 'post', authority: 102501, controller: 'api/problem/controller', action: 'create' },
     //搜索问题
     { route: '/api/problems', method: 'get', authority: 102502, controller: 'api/problem/controller', action: 'list' },
     //获取单个信息
     { route: '/api/problems/:id', method: 'get', authority: 102503, controller: 'api/problem/controller', action: 'detail' },
     //更新问题
     { route: '/api/problems/:id', method: 'patch', authority: 102504, controller: 'api/problem/controller', action: 'update' },
     //删除问题
     { route: '/api/problems/:id', method: 'delete', authority: 102505, controller: 'api/problem/controller', action: 'delete' },
     //批量删除问题
     { route: '/api/batch/problems/:ids', method: 'delete', authority: 102506, controller: 'api/problem/controller', action: 'batchDelete' },
     /**
      * 诊疗数据管理 100900
      */
     //从pc端传来诊断用户的相关信息并保存
     { route: '/api/pc/diagnostic-records', method: 'post', authority: 200000, controller: 'api/diagnosticRecord/controller', action: 'create' },
     //返回诊断报告的html模板
     { route: '/api/report-template/:id', method: 'get', authority: null, controller: 'api/diagnosticRecord/controller', action: 'detailHtml' },
     //查看所有诊断数据列表，（包含列表分页和简单/高级查询）
     { route: '/api/diagnostic-records', method: 'get', authority: 100901, controller: 'api/diagnosticRecord/controller', action: 'list' },
     //查看所有诊断的用户列表
     { route: '/api/diagnostic-users', method: 'get', authority: 100902, controller: 'api/diagnosticRecord/controller', action: 'listUsers' },
     //检测人数统计
     { route: '/api/pc/diagnostic-records/peoples', method: 'get', authority: null, controller: 'api/diagnosticRecord/controller', action: 'listCount' },

     //给诊断报告添加标签
     { route: '/api/pc/diagnostic-records/:id', method: 'patch', authority: 200000, controller: 'api/diagnosticRecord/controller', action: 'update' },
     //查看pc 诊断列表
     { route: '/api/pc/diagnostic-records', method: 'get', authority: 200000, controller: 'api/diagnosticRecord/controller', action: 'pcList' },
     //查看单个诊断报告
     { route: '/api/pc/diagnostic-records/:id', method: 'get', authority: 200000, controller: 'api/diagnosticRecord/controller', action: 'pcDetail' },
     //查看单个诊断报告
     { route: '/api/diagnostic-records/:id', method: 'get', authority: null, controller: 'api/diagnosticRecord/controller', action: 'detailH' },
     //诊断结果对比
     { route: '/api/pc/diagnostic-records/comparison/:ids', method: 'get', authority: 200000, controller: 'api/diagnosticRecord/controller', action: 'compare' },
     //打印报告详情
     { route: '/api/pc/diagnostic-records/output/:id', method: 'get', authority: 200000, controller: 'api/diagnosticRecord/controller', action: 'print' },
     //数据图表展示、
     //  { route: '/api/pc/diagnostic-records/:id', method: 'get', authority: null, controller: 'api/diagnosticRecord/controller', action: 'detailH' },

     //从app端传来诊断用户的相关信息并保存
     //  { route: '/api/app/diagnostic-records', method: 'post', authority: 200000, controller: 'api/diagnosticRecord/controller', action: 'appCreate' },
     //app端查看诊断报告列表
     { route: '/api/app/diagnostic-records/peoples', method: 'get', authority: 200000, controller: 'api/diagnosticRecord/controller', action: 'appList' },
     //app查看某人下面具体的报告
     { route: '/api/app/diagnostic-records/:id', method: 'get', authority: 200000, controller: 'api/diagnosticRecord/controller', action: 'detail' },
     //app 报告对比
     { route: '/api/app/diagnostic-records/comparison/:ids', method: 'get', authority: 200000, controller: 'api/diagnosticRecord/controller', action: 'compare' },
     //填完问诊单后填写用户信息发给后台，更新用户信息
     { route: '/api/app/diagnostic-records/:id', method: 'patch', authority: 200000, controller: 'api/diagnosticRecord/controller', action: 'appUpdate' },


     /**
      * 诊疗方案管理 101000
      */
     //增加诊疗方案
     { route: '/api/plans', method: 'post', authority: 101001, controller: 'api/plan/controller', action: 'create' },
     //删除诊疗方案
     { route: '/api/plans/:id', method: 'delete', authority: 101002, controller: 'api/plan/controller', action: 'delete' },
     //修改诊疗方案
     { route: '/api/plans/:id', method: 'patch', authority: 101003, controller: 'api/plan/controller', action: 'update' },
     //查看所有诊疗方案列表，（包含列表分页和简单/高级查询）
     { route: '/api/plans', method: 'get', authority: 101004, controller: 'api/plan/controller', action: 'list' },
     //查看某一诊疗方案
     { route: '/api/plans/:id', method: 'get', authority: 101005, controller: 'api/plan/controller', action: 'detail' },


     /**
      * 养生资讯文章管理 101100
      */
     //增加文章
     { route: '/api/articles', method: 'post', authority: 101101, controller: 'api/article/controller', action: 'create' },
     //删除文章
     { route: '/api/articles/:id', method: 'delete', authority: 101102, controller: 'api/article/controller', action: 'delete' },
     //修改文章
     { route: '/api/articles/:id', method: 'patch', authority: 101103, controller: 'api/article/controller', action: 'update' },
     //查看所有文章列表，（包含列表分页和简单/高级查询）
     { route: '/api/articles', method: 'get', authority: 101104, controller: 'api/article/controller', action: 'list' },
     //查看某一文章
     { route: '/api/articles/:id', method: 'get', authority: 101105, controller: 'api/article/controller', action: 'detail' },
     //批量删除
     { route: '/api/batch/articles/:ids', method: 'delete', authority: 101106, controller: 'api/article/controller', action: 'batchDelete' },
     //推荐文章
     { route: '/api/articles/highlight/:ids', method: 'patch', authority: 101107, controller: 'api/article/controller', action: 'highlight' },
     //置顶文章
     { route: '/api/articles/top/:ids', method: 'patch', authority: 101108, controller: 'api/article/controller', action: 'top' },

     //文章列表 pc
     { route: '/api/pc/articles', method: 'get', authority: 200000, controller: 'api/article/controller', action: 'list' },
     // 查看某一文章 pc
     { route: '/api/pc/articles/:id', method: 'get', authority: 200000, controller: 'api/article/controller', action: 'detailpc' },


     /**
      * 穴位管理 101200
      */

     //增加穴位
     { route: '/api/acupoints', method: 'post', authority: 101201, controller: 'api/acupoint/controller', action: 'create' },
     //删除穴位
     { route: '/api/acupoints/:id', method: 'delete', authority: 101202, controller: 'api/acupoint/controller', action: 'delete' },
     //修改穴位
     { route: '/api/acupoints/:id', method: 'patch', authority: 101203, controller: 'api/acupoint/controller', action: 'update' },
     //查看所有穴位列表，（包含列表分页和简单/高级查询）
     { route: '/api/acupoints', method: 'get', authority: 101204, controller: 'api/acupoint/controller', action: 'list' },
     //查看某一穴位
     { route: '/api/acupoints/:id', method: 'get', authority: 101205, controller: 'api/acupoint/controller', action: 'detail' },
     //批量删除
     { route: '/api/batch/acupoints/:ids', method: 'delete', authority: 101206, controller: 'api/acupoint/controller', action: 'batchDelete' },
     //常见穴位  pc
     { route: '/api/pc/acupoints', method: 'get', authority: 200000, controller: 'api/acupoint/controller', action: 'find' },
     //查看某一穴位 pc
     { route: '/api/pc/acupoints/:id', method: 'get', authority: 200000, controller: 'api/acupoint/controller', action: 'detail' },


     /**
      * 经络管理101300
      */
     //增加经络
     { route: '/api/meridians', method: 'post', authority: 101301, controller: 'api/meridian/controller', action: 'create' },
     //删除经络
     { route: '/api/meridians/:id', method: 'delete', authority: 101302, controller: 'api/meridian/controller', action: 'delete' },
     //修改经络
     { route: '/api/meridians/:id', method: 'patch', authority: 101303, controller: 'api/meridian/controller', action: 'update' },
     //查看所有经络列表，（包含列表分页和简单/高级查询）
     { route: '/api/meridians', method: 'get', authority: 101304, controller: 'api/meridian/controller', action: 'list' },
     //查看某一经络
     { route: '/api/meridians/:id', method: 'get', authority: 101305, controller: 'api/meridian/controller', action: 'detail' },
     //批量删除
     { route: '/api/batch/meridians/:ids', method: 'delete', authority: 101306, controller: 'api/meridian/controller', action: 'batchDelete' },

     /**
      * 病症管理 101400
      */
     //增加病症
     { route: '/api/diseases', method: 'post', authority: 101401, controller: 'api/disease/controller', action: 'create' },
     //搜索病症
     { route: '/api/diseases', method: 'get', authority: 101402, controller: 'api/disease/controller', action: 'list' },
     //获取单个信息
     { route: '/api/diseases/:id', method: 'get', authority: 101403, controller: 'api/disease/controller', action: 'detail' },
     //修改病症
     { route: '/api/diseases/:id', method: 'patch', authority: 101404, controller: 'api/disease/controller', action: 'update' },
     //删除病症
     { route: '/api/diseases/:id', method: 'delete', authority: 101405, controller: 'api/disease/controller', action: 'delete' },
     //批量删除病症
     { route: '/api/batch/diseases/:ids', method: 'delete', authority: 101406, controller: 'api/disease/controller', action: 'batchDelete' },
     //搜索病症
     { route: '/api/pc/diseases', method: 'get', authority: 200000, controller: 'api/disease/controller', action: 'find' },
     { route: '/api/pc/diseases/:id', method: 'get', authority: 200000, controller: 'api/disease/controller', action: 'detailPc' },


     /**
      * 文件管理 101500
      */
     //增加文件
     { route: '/api/files', method: 'post', authority: 101501, controller: 'api/file/controller', action: 'create' },
     //富文本添加文件
     { route: '/api/files/rich-texts', method: 'post', authority: 101502, controller: 'api/file/controller', action: 'createRichtext' },

     // //删除文件
     // {route:'/api/files/:id', method:'delete',authority:101501,controller:'api/file/controller',action:'delete'},
     //修改文件
     { route: '/api/files/:id', method: 'patch', authority: 101503, controller: 'api/file/controller', action: 'update' },
     // //查看所有文件列表，
     // {route:'/api/files', method:'get',authority:101503,controller:'api/file/controller',action:'list'},
     // //查看某一文件
     // {route:'/api/files/:id', method:'get',authority:101504,controller:'api/file/controller',action:'detail'},
     //上传头像
     { route: '/api/app/files', method: 'post', authority: 200000, controller: 'api/file/controller', action: 'avatorCreate' },

     /**
      * 分类管理 101600
      */
     //增加分类
     { route: '/api/categories', method: 'post', authority: 101601, controller: 'api/category/controller', action: 'create' },
     //删除分类
     { route: '/api/categories/:id', method: 'delete', authority: 101602, controller: 'api/category/controller', action: 'delete' },
     //修改分类
     { route: '/api/categories/:id', method: 'patch', authority: 101603, controller: 'api/category/controller', action: 'update' },
     //查看所有分类列表，（包含列表分页和简单/高级查询）
     { route: '/api/categories', method: 'get', authority: 101604, controller: 'api/category/controller', action: 'list' },
     //查看某一分类
     { route: '/api/categories/:id', method: 'get', authority: 101605, controller: 'api/category/controller', action: 'detail' },
     //移动分类
     { route: '/api/categories/address/:id', method: 'patch', authority: 101606, controller: 'api/category/controller', action: 'move' },


     /**
      * 问诊单答题 101700
      */
     //PC获取问诊单内容
     { route: '/api/pc/diagnosiss', method: 'get', authority: 200000, controller: 'api/diagnosis/controller', action: 'find' },
     //APP获取问诊单内容
     { route: '/api/app/diagnosiss', method: 'get', authority: 200000, controller: 'api/diagnosis/controller', action: 'find' },
     //PC保存问诊结果
     { route: '/api/pc/diagnosiss', method: 'post', authority: 200000, controller: 'api/diagnosis/controller', action: 'create' },
     //APP保存问诊结果
     { route: '/api/app/diagnosiss', method: 'post', authority: 200000, controller: 'api/diagnosis/controller', action: 'create' },
     //获取诊断结果
     { route: '/api/diagnosiss/:id', method: 'get', authority: null, controller: 'api/diagnosis/controller', action: 'detail' },

     /**
      *原始数据 101800
      */
     //获取前台传来的数据并保存到数据库中
     { route: '/api/pc/datas', method: 'post', authority: 200000, controller: 'api/data/controller', action: 'create' },
     //后台管理系统查看原始数据
     { route: '/api/datas/:id', method: 'get', authority: 101801, controller: 'api/data/controller', action: 'detail' },
     //app 端传来的检测数据
     { route: '/api/app/datas', method: 'post', authority: 200000, controller: 'api/data/controller', action: 'appCreate' },
     // app
     { route: '/api/pc/datas/:name', method: 'get', authority: 200000, controller: 'api/data/controller', action: 'queryByName' },
     { route: '/api/test/helloWorld', method: 'post', authority: 200000, controller: 'api/data/controller', action: 'helloWorld' },
     //数据图表展示、
     { route: '/api/pc/datas/sheet/:id', method: 'get', authority: 200000, controller: 'api/data/controller', action: 'pcDetail' },

     /**
      * 诊断结论 101900
      */
     //根据原始数据经过算法，得到数据结论，创建，并返回到后台管理系统
     { route: '/api/results/:id', method: 'get', authority: 102101, controller: 'api/result/controller', action: 'detail' },

     /**
      * 诊断报告 102000
      */
     //根据诊断结论经过算法，得到诊断报告，创建，并返回到后台管理系统
     { route: '/api/reports/:id', method: 'get', authority: 102001, controller: 'api/report/controller', action: 'detail' },
     // //检测完生成的报告
     // {route:'/api/pc/reports/:id', method:'get',authority:200000,controller:'api/report/controller',action:'detailpc'},


     /**
      * 短信模块
      */
     //发送短信
     { route: '/api/pc/messages', method: 'post', authority: 200000, controller: 'api/message/controller', action: 'send' },
     { route: '/api/app/messages', method: 'post', authority: 200000, controller: 'api/message/controller', action: 'sendApp' },
     // 获取验证码
     { route: '/api/app/verification_codes', method: 'post', authority: null, controller: 'api/message/controller', action: 'sendVerificationCode' },
     // 校验验证码
     { route: '/api/app/verification_codes', method: 'get', authority: null, controller: 'api/message/controller', action: 'checkVerificationCode' },
     //渲染诊断报告页面（PC）
     { route: '/report/:id', method: 'get', controller: 'api/message/controller', action: 'detail' },
     /**
      * 优秀案例
      */
     //增加优秀案例
     { route: '/api/excellents', method: 'post', authority: 101901, controller: 'api/excellent/controller', action: 'create' },
     //获取所有优秀案例
     { route: '/api/excellents', method: 'get', authority: 101902, controller: 'api/excellent/controller', action: 'list' },
     //获取单个优秀案例
     { route: '/api/excellents/:id', method: 'get', authority: 101903, controller: 'api/excellent/controller', action: 'detail' },
     //修改优秀案例
     { route: '/api/excellents/:id', method: 'patch', authority: 101904, controller: 'api/excellent/controller', action: 'update' },
     //删除优秀案例
     { route: '/api/excellents/:id', method: 'delete', authority: 101905, controller: 'api/excellent/controller', action: 'delete' },
     //批量删除优秀案例
     { route: '/api/batch/excellents/:ids', method: 'delete', authority: 101906, controller: 'api/excellent/controller', action: 'batchDelete' },
     //PC获取优秀案例
     { route: '/api/pc/excellents', method: 'get', authority: 200000, controller: 'api/excellent/controller', action: 'list' },
     //PC获取单个优秀案例
     { route: '/api/pc/excellents/:id', method: 'get', authority: 200000, controller: 'api/excellent/controller', action: 'detail' },

     /**
      * 匹配方案 102300
      */
     //匹配方案列表
     { route: '/api/matchings', method: 'get', authority: 102301, controller: 'api/matching/controller', action: 'list' },
     //{ route: '/api/matchings_test', method: 'get', authority: 200000, controller: 'api/matching/controller', action: 'find' },
     //修改后保存
     { route: '/api/matchings/:id', method: 'patch', authority: 102302, controller: 'api/matching/controller', action: 'update' },


     /**
      *  意见反馈 102400
      */
     //删除一个
     { route: '/api/feedbacks/:id', method: 'delete', authority: 102401, controller: 'api/feedback/controller', action: 'delete' },
     //查询列表
     { route: '/api/feedbacks', method: 'get', authority: 102402, controller: 'api/feedback/controller', action: 'list' },
     // 批量删除
     { route: '/api/batch/feedbacks/:ids', method: 'delete', authority: 102403, controller: 'api/feedback/controller', action: 'batchDelete' },
     //处理反馈
     { route: '/api/feedbacks/dispose/:id', method: 'patch', authority: 102404, controller: 'api/feedback/controller', action: 'handle' },

     //app 端获取反馈信息
     { route: '/api/app/feedbacks', method: 'post', authority: 200000, controller: 'api/feedback/controller', action: 'create' },

     /**
      * 三级联动 107500
      */
     //增加省市
     { route: '/api/areas', method: 'post', authority: 107501, controller: 'api/area/controller', action: 'create' },
     //删除省市
     { route: '/api/areas/:id', method: 'delete', authority: 107502, controller: 'api/area/controller', action: 'delete' },
     //修改省市
     { route: '/api/areas/:id', method: 'patch', authority: 107503, controller: 'api/area/controller', action: 'update' },
     //查看第一级
     { route: '/api/areas', method: 'get', authority: 107504, controller: 'api/area/controller', action: 'list' },
     //查看某一分类
     { route: '/api/areas/:id', method: 'get', authority: 107505, controller: 'api/area/controller', action: 'detail' },
     //移动分类
     { route: '/api/areas/address/:id', method: 'patch', authority: 107506, controller: 'api/area/controller', action: 'move' },
     //app 调取三级联动
     { route: '/api/app/areas', method: 'get', authority: 200000, controller: 'api/area/controller', action: 'listapp' },
     //某一省市下面包含地区
     { route: '/api/app/areas/:id', method: 'get', authority: 200000, controller: 'api/area/controller', action: 'detail' },

     /**
      * 推荐模块 105900
      */
     //创建推荐记录
     { route: '/api/app/recommends', method: 'post', authority: 200000, controller: 'api/recommend/controller', action: 'create' },
     //获取推荐记录
     { route: '/api/recommends', method: 'get', authority: 105901, controller: 'api/recommend/controller', action: 'list' },
     //增加推荐记录阅读数
     { route: '/api/app/recommends/:id', method: 'patch', authority: 200000, controller: 'api/recommend/controller', action: 'update' },
     //删除推荐记录
     { route: '/api/recommends/:id', method: 'delete', authority: 105902, controller: 'api/recommend/controller', action: 'delete' },
     //批量推荐记录
     { route: '/api/batch/recommends/:ids', method: 'delete', authority: 105903, controller: 'api/recommend/controller', action: 'batchDelete' },

     /**
      * 更新版本模块 106000
      */
     //创建版本
     { route: '/api/editions', method: 'post', authority: 106001, controller: 'api/edition/controller', action: 'create' },
     //获取版本记录
     { route: '/api/editions', method: 'get', authority: 106002, controller: 'api/edition/controller', action: 'list' },
     //增加下载数
     { route: '/api/app/editions', method: 'patch', authority: 200000, controller: 'api/edition/controller', action: 'down' },
     //删除版本记录
     { route: '/api/editions/:id', method: 'delete', authority: 106003, controller: 'api/edition/controller', action: 'delete' },
     //批量删除版本记录
     { route: '/api/batch/editions/:ids', method: 'delete', authority: 106004, controller: 'api/edition/controller', action: 'batchDelete' },

     /**
      * 五运六气
      */
     //获取全年运气分析
     { route: '/api/pc/quannian', method: 'get', authority: null, controller: 'api/yunqi/controller', action: 'getQuannian' },
     //获取运运气分析
     { route: '/api/pc/wuyun', method: 'get', authority: null, controller: 'api/yunqi/controller', action: 'getWuyun' },
     //获取六气分析
     { route: '/api/pc/liuqi', method: 'get', authority: null, controller: 'api/yunqi/controller', action: 'getLiuqi' },
     // 根据公历获取农历和干支信息
     { route: '/api/pc/nongli/:time', method: 'get', authority: null, controller: 'api/yunqi/controller', action: 'getNongli' },
     //  //获取版本记录
     //  { route: '/api/editions', method: 'get', authority: 105902, controller: 'api/edition/controller', action: 'list' },
     //  //增加下载数
     //  { route: '/api/app/editions', method: 'patch', authority: 200000, controller: 'api/edition/controller', action: 'down' },
     //  //删除版本记录
     //  { route: '/api/editions/:id', method: 'delete', authority: 105903, controller: 'api/edition/controller', action: 'delete' },
     //  //批量删除版本记录
     //  { route: '/api/batch/editions/:ids', method: 'delete', authority: 105904, controller: 'api/edition/controller', action: 'batchDelete' },

     //views诊断报告预览
     { route: '/r', method: "get", authority: null, controller: 'api/diagnosticRecord/controller', action: 'detailH' },

     //  electron 日志崩溃发送接口
     { route: '/crashReporter', method: "post", authority: null, controller: 'logs/crashReporter.js', action: 'acceptLogs' },

     /**
      * 店铺管理接口
      */
     // 获取店铺列表
     { route: '/api/app/shop', method: 'get', authority: null, controller: 'api/shops/controller', action: 'list' },
     // 创建店铺
     { route: '/api/app/shop', method: 'post', authority: null, controller: 'api/shops/controller', action: 'create' },



 ];

 module.exports = routeMap;