var express = require('express');//express核心
var path = require('path');
var cookieParser = require('cookie-parser');//处理cookie
var logger = require('morgan');//日志模块

//引入路由模块
const h52001 = require("./routes/h52001")
const home = require("./routes/home")
const users = require("./routes/users")
var app = express();
//引入校验token模块的中间件
const jwtFilter = require("./middleware/jwtFilter")

//引入session模块

const session = require("express-session")

// 设置模板引擎

app.set('views', path.join(__dirname, 'views'));//1.'views'意思是设置模板引擎的目录,2.目录的路径
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));//静态资源托管

//app.use app.get app.post app.put.....调用中间件 
//中间件的本质 就是一个函数 一个use中可以传递N个函数
/**
 * @param {function} next 调用此函数,将控制权释放给下一个中间件
 */

 //jsonp处理
// app.get("/jsonp", function (req, res, next) {
//     let cb = req.query['cb']
//     //jsonp响应一个函数回调,并且传入实参
//     let obj = {
//         name: "韩梅梅"
//     }
//     obj = JSON.stringify(obj)
//     res.send(`${cb}(${obj})`)
// })

app.all('*', function (req, res, next) {
    //允许携带凭证(cookie)
    res.header("Access-Control-Allow-Credentials", "true")
    //允许任意源访问
    res.header("Access-Control-Allow-Origin", "*")
    //允许接受的请求头
    res.header("Access-Control-Allow-Headers", "authorization,Content-Type");
    //允许接受的请求方式
    res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By", ' 3.2.1')
    //响应的内容是json 编码是utf-8
    res.header("Content-Type", "application/json;charset=utf-8");
    next();
});

app.use(session({
    secret: 'MY_NAME_IS_HMM', //加密的字符串，里面内容可以随便
    resave: false,//是否允许session重新设置，要保证session有操作的时候必须设置这个属性为true
    saveUninitialized: true, //强制将未初始化的session存储，默认为true
    cookie: { maxAge: 60000 * 2 },//过期时间
    rolling: true
}));

app.use(jwtFilter("hanmeimei"))

app.use("/users", users)

module.exports = app;
