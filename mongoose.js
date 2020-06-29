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
//3.创建模型 相当于建表
const h5Schema = mongoose.Schema({
    name: String,
    age: Number
})

//创建集合
const Collection = mongoose.model("childs", h5Schema) //名字通通加上s
//4.实例化模型 保存数据的时候 一定要用实例化的模型对象调用插入方法

const h52001 = new Collection({ name: "李雷", age: 19 }) //传入需要插入到数据库的内容

//调用保存方法
h52001.save() //pendding resolve reject promise.all() promise.race()
    .then(res => {
        console.log(res)
    })

//查找数据 使用find方法 (find update delete方法都用集合调用而不是实例)

Collection.find()
    .then(res => {
        console.log(res)
    })

