//创建路由
const express = require("express")

const router = express.Router()

//处理前端请求

router.get("/h52001", function (req, res) {
    res.send("hello 2001")
})
router.get("/h52002", function (req, res) {
    res.send("hello 2002")
})

module.exports = router