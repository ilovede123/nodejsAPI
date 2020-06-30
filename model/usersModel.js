const { mongoose } = require("../utils/mongoose")
//创建模型 相当于建表
const usersChema = mongoose.Schema({
    unid: { type: String, required: true },
    username: { type: String, required: true },
    password: { type: String, required: true },
    nickname: { type: String, required: false },
    phone: { type: String, required: false },
    email: { type: String, required: false },
    openid: String,
    sex: Number,
    language: String,
    city: String,
    province: String,
    country: String,
    headimgurl: String,
    privilege: Array
})

//创建集合
const Collection = mongoose.model("users", usersChema) //名字通通加上s
//实例化模型 保存数据的时候 一定要用实例化的模型对象调用插入方法


//注册
/**
 * 
 * @param {Object} info 前端注册传入的用户信息比如 用户名 密码等
 */

const registModel = (info) => {
    console.log("这是model层")
    const users = new Collection(info) //传入需要插入到数据库的内容
    return users.save()
        .then(res => res)
        .catch(err => {
            //数据存储的过程出错
            console.log(err)
            return false;
        })
}

//查询数据库
/**
 * 
 * @param {Object} query 查询的条件 
 */
const findModel = (query = {}) => {
    return Collection.find(query)
        .then(res => res)
        .catch(err => {
            console.log(err)
            return false
        })
}


//更新

const updateModel = (query, updated) => {
    return Collection.updateMany(query, updated)
        .then(res => res)
        .catch(err => {
            console.log(err)
            return false
        })
}


module.exports = {
    registModel,
    findModel,
    updateModel

}