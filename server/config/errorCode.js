exports.errCodeMap = {
    SUCCESS: { code: 0, content: "成功" },
    ERROR: { code: 1, content: "错误" },
    PARAM_ERROR: { code: 2, content: "参数校验错误" },
    PARAM_IS_LOSE: { code: 100, content: "参数不完整" },
    NOT_FOUND: { code: 101, content: "未找到对象" },
    DB_ACCESS_ERROR: { code: 107, content: "数据库访问错误" },
    WRONG_LOGIN: { code: 102, content: "用户认证失败" },
    NO_VERI_CODE: { code: 103, content: "未找到验证码" },
    PWD_VERI_LOST: { code: 104, content: "需要密码或者手机验证码" },
    //用户管理错误码
    // EMAIL_IN_USE:'The specified email address is already in use.',
    //权限管理错误码
    DUPLICATE_KEY: { code: 11000, content: '对象重复' },
    MODIFY_ADMIN: { code: 108, content: '不能修改或删除超级管理员' },
    INVALIDE_VERYFI_CODE: { code: 109, content: '验证码校验失败' },
    NOT_LOGIN: { code: 110, content: '没有登陆' },
    BOTH_TEL_PWD: { code: 111, content: '不能同时修改手机号和密码' },
    DUP_SHOPID: { code: 112, content: 'shopId重复' },
    // INVALIDE_AUTH_INFO: {code: 110, content:'用户认证失败'},
};