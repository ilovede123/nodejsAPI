const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const { registModel, findModel, updateModel } = require("../model/usersModel")

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
//微信扫码登入
const wechatLoginCtr = (req, res) => {
    console.log(req.quer)
    res.send("success")
}
module.exports = {
    registCtr,
    loginCtr,
    updatePswCtr,
    getAllUsersCtr,
    wechatLoginCtr
}