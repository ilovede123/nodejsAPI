//1.引入mongoose
const mongoose = require("mongoose")
//2.创建连接
mongoose.connect("mongodb://localhost:27017/H52001", { useNewUrlParser: true, useUnifiedTopology: true })

const db = mongoose.connection;
//处理成功和失败的信息
db.on("open", function () { //表示连接数据库成功
    console.log("数据库连接成功")
})

db.on("error", function (err) {
    throw err
})

module.exports = {
    mongoose
}