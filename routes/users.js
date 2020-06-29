const express = require("express")

const { registCtr, loginCtr, updatePswCtr, getAllUsersCtr, wechatLoginCtr } = require("../controller/usersController")

const router = express.Router()
//注册
router.post("/regist", registCtr)
//登入
router.post("/login", loginCtr)
//更新密码
router.post("/updatePsw", updatePswCtr)
//获取所有的用户
router.get("/getAllUsers", getAllUsersCtr)
//微信扫码登入
router.get("/wechatLogin", wechatLoginCtr)
module.exports = router