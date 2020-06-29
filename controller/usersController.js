const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const { registModel, findModel, updateModel } = require("../model/usersModel")
const http = require('http')
const URL = require("url").URL
//注册
const registCtr = async function (req, res) {
    //通过req.body获取客户端通过post请求提交的数据
    const { username, password } = req.body;
    if (!username || !password) {
        //如果用户名和密码其中一项没传,那么就返回错误
        res.send({ state: true, status: 101, msg: "用户名或密码少传递了" })
    }
    const info = { username, password }
    //查询用户名是否冲突
    const isUnique = await findModel({ username })
    //处理三段逻辑 1.返回的数组中有值
    if (Array.isArray(isUnique)) {
        if (!isUnique.length) {
            //数组长度为0表示数据库中没有该数据 可以注册
            //对密码进行加密
            let { password } = info;
            let saltRounds = 10;
            const hashPass = bcrypt.hashSync(password, saltRounds)

            info.password = hashPass;//将明文的密码变成hash
            //调用model层的方法 返回注册结果
            //给每个用户多添加一个唯一的id
            info.unid = Math.random().toString(36).substr(2)

            const result = await registModel(info)
            if (result) {
                res.send({ state: true, status: 200, msg: "注册成功" })
            } else {
                res.send({ state: false, status: 101, msg: "注册出错" })
            }
        } else {// 2.返回数组中没有值
            res.send({ state: false, status: 102, msg: "用户名重复" })
        }
    } else {//3.数据库抛出异常
        res.send({ state: false, status: 102, msg: "查找出错" })
    }
}

//登入
const loginCtr = async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        //如果用户名和密码其中一项没传,那么就返回错误
        res.send({ state: false, status: 101, msg: "用户名或密码少传递了" })
    }
    const query = { username, password }

    //登入之前可以去session中查看 用户是否登入
    if (req.session['userInfo']) {
        if (username === req.session['userInfo']['username']) {
            //session中有userInfo说明重复登入
            res.send({ state: true, status: 105, msg: "不要重复登入" })
            return
        }
    }

    //由于需要取出加密的密码校验 所以先判断是否有当前用户

    const isUser = await findModel({ username })
    if (Array.isArray(isUser)) {
        if (!isUser.length) {
            //没有该用户
            res.send({ state: false, status: 101, msg: "没有该用户" })
        } else {
            //有该用户 取出当前用户的hash密码进行校验
            let hashPass = isUser[0]['password']
            let validatePass = bcrypt.compareSync(password, hashPass)
            if (validatePass) {//密码校验成功

                //生成token
                let { username, unid, nickname, phone } = isUser[0]
                let payload = {
                    username,
                    unid,
                    nickname,
                    phone
                }
                // console.log(payload)
                const secret = "MY_NAME_IS_HANMEIMEI"
                const token = jwt.sign(payload, secret, {
                    expiresIn: 60 //token生效时间,单位是秒
                })

                //将用户信息挂载在session缓存 通过req.session可以得到session内容

                let userInfo = {
                    unid,
                    username,
                    nickname,
                    phone
                }
                req.session.userInfo = userInfo;
                // console.log(req.session)
                res.send({ state: true, status: 200, msg: "登入成功", token })
            } else {
                res.send({ state: false, status: 101, msg: "密码错误" })
            }
        }
    }
}
//更新密码
const updatePswCtr = async (req, res) => {
    //接收到用户名 旧密码 新密码 
    /**
     * @param {String} password 用户的旧密码
     * @param {String} newPassword 用户要更新的密码
     * @param {String} username 用户名
     */
    let { password, newPassword, username } = req.body;
    //判断前端是否传递了必传字段


    //1.确认数据库有这个用户名
    const isUser = await findModel({ username });
    if (Array.isArray(isUser)) {
        if (isUser.length) { //查找到了结果
            //有此用户,执行更新密码逻辑
            //2.验证旧密码是否正确
            let hashPass = isUser[0]['password']
            let validatePass = bcrypt.compareSync(password, hashPass) //校验旧密码是否正确
            if (validatePass) {
                //旧密码校验正确 修改密码
                //更新之前 对密码进行加密
                const salt = 10;
                let newHashPass = bcrypt.hashSync(newPassword, salt)
                let updateRes = await updateModel({ username }, { $set: { password: newHashPass } }) //通过用户名查询 更新密码
                console.log(updateRes);
                if (updateRes.n) {//更新成功
                    res.send({ state: true, status: 200, msg: "密码修改成功" })
                } else {
                    res.send({ state: false, status: 101, msg: "密码修改失败" })
                }
            } else {
                res.send({ state: false, status: 101, msg: "密码错误" })
            }
        } else {
            //没有此用户
            res.send({ state: false, status: 101, msg: "没有此用户" })
        }
    } else {
        res.send({ state: false, status: 101, msg: "数据库更新出错" })
    }

}

//获取所有的用户接口
const getAllUsersCtr = async (req, res) => {
    let result = await findModel()
    if (Array.isArray(result)) {
        res.send({ state: true, status: 200, data: result })
    } else {
        res.send({ state: false, status: 101, msg: "数据库查询出错" })
    }
}
//定义一个 用于生成微信扫参数对象
class CreateScanCodeParams {
    /**
     * 
     * @param {String} appid 公众号的唯一标识
     * @param {String} redirect_uri 授权后重定向的回调链接地址， 请使用 urlEncode 对链接进行处理
     * @param {String} response_type 返回类型，请填写code
     * @param {String} scope 应用授权作用域，snsapi_base （不弹出授权页面，直接跳转，只能获取用户openid），snsapi_userinfo （弹出授权页面，可通过openid拿到昵称、性别、所在地。并且， 即使在未关注的情况下，只要用户授权，也能获取其信息 ）
     * @param {String} state 重定向后会带上state参数，开发者可以填写a-zA-Z0-9的参数值，最多128字节
     */
    constructor(appid = "%", redirect_uri = "%", response_type = "code", scope = "snsapi_base", state = "1730255954") {
        this.appid = appid;
        this.redirect_uri = redirect_uri;
        this.response_type = response_type;
        this.scope = scope;
        this.state = state
    }
}
//创建一个方法 生成url
function createScanCodeUrl({ appid, redirect_uri, response_type, scope, state }) {
    return `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${appid}&redirect_uri=${redirect_uri}&response_type=${response_type}&scope=${scope}&state=${state}#wechat_redirect`
}
//微信扫码登入
let appid = "wxed58e834201d0894";
let redirect_uri = "http://chst.vip/wechatCallBack.html"
let scope = "snsapi_userinfo"
let secret = '1479691513627d91af5eb9d6b8c9106e'
const wechatLoginCtr = (req, res) => {
    //定义一个类 用于生成URL扫码地址
    // https://open.weixin.qq.com/connect/oauth2/authorize?appid=APPID&redirect_uri=REDIRECT_URI&response_type=code&scope=SCOPE&state=STATE#wechat_redirect  
    console.log(req.query)

    let scanParams = new CreateScanCodeParams(appid, redirect_uri, scope)
    let scanCodeUrl = createScanCodeUrl(scanParams)
    res.send({ state: true, status: 200, scanCodeUrl })
}

//处理微信回调页面控制层
const wechatCallBackCtr = (req, res) => {
    console.log(req.query)
    let { code } = req.query;//获取code之后去换access_token
   let requ =  https.request(`https://api.weixin.qq.com/sns/oauth2/access_token?appid=${appid}&secret=${secret}&code=${code}&grant_type=authorization_code`, function (res) {
        res.on('data', chunk => {
            console.log(chunk)
        })
        res.on('end', () => {
            console.log('响应结束')
        })
    })
    requ.end()
}
module.exports = {
    registCtr,
    loginCtr,
    updatePswCtr,
    getAllUsersCtr,
    wechatLoginCtr,
    wechatCallBackCtr
}