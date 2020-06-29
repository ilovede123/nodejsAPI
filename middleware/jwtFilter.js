const jwt = require("jsonwebtoken")

/**
 * @param {*} param 将来filter函数被调用的时候 可能要传递进来的参数 
 */
const filter = (param) => (req, res, next) => {
    // console.log(req.session)
    //拦截请求,进行token校验
    //登入和注册不需要校验token
    if (req.path === "/users/login" || req.path === "/users/regist" || req.path === "/users/wechatLogin" || req.path === "/users/wechatCallBack") {
        next()
    } else {
        //开始校验jwt
        //jwt.verify(token,secret,function(err,decode){}) //1.前端请求携带的token 2.加密字符串 3.回调函数
        let token = req.body['token'] || req.query['token'] || req.headers['authorization']
        let secret = "MY_NAME_IS_HANMEIMEI"
        if (token) {
            //前端传递了token 进行校验
            jwt.verify(token, secret, (err, decode) => {
                if (err) {//校验失败 返回错误码 前端=>登入页
                    //err宝石token失效了 同时也要销毁session 释放缓存
                    req.session.destroy()
                    res.send({ state: false, status: 103, msg: "token校验失败" })
                } else { //校验成功 放行
                    console.log(decode)
                    next()
                }
            })
        } else {
            res.send({ state: false, status: 101, msg: "未传递token" })
        }
    }
}

module.exports = filter