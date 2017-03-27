/**
 * 配置文件  默认是开发环境的配置
 *
 *
 * */
var config = {
    redis_server: process.env.REDIS_HOST || "localhost",
    redis_port: 6379,
    database: { // 数据库配置
        host: process.env.MONGO_HOST || "localhost", // 服务器名称或IP
        // host:process.env.MONGO_HOST || "api.yuntianyuan.net",
        port: 27017, // 数据库端口
        database: "yancaooa_dev", // 数据库名
        username: "root", // 数据库链接访问用户名
        password: "" // 数据库访问密码
    },

    session: { // session配置
        secretKey: "YancaoAPI",
        cookieName: "yty",
    },

    upload: { // 文件上传的配置
        path: "/public/uploads",
    },
    verification_code_timeout: 10, //验证码有效时长，分钟
    db_server: "mongo",
    db_port: "27017",
    app_port: "8029",
    root_name: "zhongyi",
    upload_root: __dirname,
    root_app: __dirname + "/widget",
    path_api: __dirname + "/server/common",
    BaseApi: { isDebug: true },
    secretToken: 'aMdoeb5ed87zorRdkD6greDML81DcnrzeSD648ferFejmplx', //token口令秘钥
    app_role_id: "587b7a2f9baef01eb42b4d01", // app用户权限组id  固定不变
    admin_role_id: "587b7a2f9baef01eb42b4d02", // 超级管理员权限组id
    tech_role_id: "587b7a2f9baef01eb42b4d03", // 技师权限组id
    super_admin_id: "587c5463b9a559101081d384",
    test_user_id: "587c5463b9a559101081d385",
    test_admin_id: "587c5463b9a559101081d386",
    // url: "http://192.168.0.29",
    url: "http://localhost",
    // url: "http://192.168.1.200",
    default_plan_id: "58a6bc3e6bc5897918d481ed" // 默认的诊疗方案id
};
config.file_url = process.env.FILE_UPLOAD || (config.url + ":" + config.app_port);

// ***************************
// 全局函数
// 全局函数只能在app.js 中定义,并且必须是大写

global.API_PATH = __dirname + '/../api/'; // API 目录
global.ROOT_PATH = __dirname + '/../'; // 站点根目录
global.TOKEN_EXPIRATION_SEC = 3600; //token有效期
global.DEFAULT_PAGE_COUNT = 500; //分页默认配置

// 测试环境的配置
if (global.ENV == 'test') {
    config.database = {
        host: "127.0.0.1", // 服务器名称或IP
        port: 27017, // 数据库端口
        database: "yuntianyuan_test", // 数据库名
        username: "root", // 数据库链接访问用户名
        password: "" // 数据库访问密码
    };
    config.app_port = "8030";
    config.file_url = config.url + config.app_port;
}

// 正式环境的配置
if (global.ENV == 'production') {
    config.database = {
        host: "127.0.0.1", // 服务器名称或IP
        port: 27017, // 数据库端口
        database: "yuntianyuan", // 数据库名
        username: "root", // 数据库链接访问用户名
        password: "" // 数据库访问密码
    };
    config.app_port = "8031";
    config.file_url = config.url + config.app_port;
    config.verification_code_timeout = 1;
}

module.exports = config;