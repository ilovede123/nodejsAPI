const express = require("express")

const router = express.Router()

router.get("/h52001", (req, res) => {
    res.render('h52001', { lrc: "99999",todo:["吃饭","睡觉","打王者"],html:"<del>$9998</del>" })
})

module.exports = router