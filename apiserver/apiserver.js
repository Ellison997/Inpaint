let createError = require('http-errors');
let express = require('express');
let fs = require('fs'); //用于读写文件 (node原生模块)
let path = require('path');
let logger = require('morgan');
const config = require('./config');
const httpError = require('http-errors');
let log = require('./common/log');
const jwtAuth = require('./common/jwt');
const utils = require('./common/utils');
const OS = require('os');
const Cluster = require('cluster');
const {
    secretKey
} = require('./common/constant');
const jwt = require("jsonwebtoken");
const ueditor_backend = require('ueditor-backend')
const bodyParser = require('body-parser')

// let { createOraclePool, closePoolAndExit } = require('./common/oracle')
let indexRouter = require('./routes/index');
let demoRouter = require('./routes/demo');
let questionRouter = require('./routes/backend/question');
let informationRouter = require('./routes/backend/information');
let userRouter = require('./routes/backend/user');
let advertisingRouter = require('./routes/backend/advertising');
let testPaperRouter = require('./routes/backend/testPaper');
let topicRouter = require('./routes/backend/topic');
let payRouter = require('./routes/backend/pay');
let categoryRouter = require('./routes/backend/category');



let wUserRouter = require('./routes/wechat/user');
let wQuestionRouter = require('./routes/wechat/question');
let wTestPaperRouter = require('./routes/wechat/testPaper');
let wInformationRouter = require('./routes/wechat/information');
let wAdvertisingRouter = require('./routes/wechat/advertising');
let wTopicRouter = require('./routes/wechat/topic');
let wCommentRouter = require('./routes/wechat/comment');
let wMessageRouter = require('./routes/wechat/message');
let wReplyRouter = require('./routes/wechat/reply');
let wPayRouter = require('./routes/wechat/pay');


let app = express();
let http = require('http');
// let https = require('https');

// 本地调试

// let privateKey = fs.readFileSync(path.join(__dirname, config.privateKeyPath), 'utf8');
// let certificate = fs.readFileSync(path.join(__dirname, config.certificatePath), 'utf8');


// let credentials = { key: privateKey, cert: certificate };

// 启动数据库连接池
// createOraclePool();

let httpServer = http.createServer(app)
    // let httpsServer = http.createServer(app)

//let httpsServer = https.createServer(credentials, app);

httpServer.listen(config.port, () => {
    log.info('http服务端口号 : ' + config.port);
});

// 创建https服务器
// httpsServer.listen(config.sslport, () => {
//     log.info('https服务端口号 : ' + config.sslport);
// });


// 将所有的http请求自动重定向到https
// app.get('*', function(req, res, next) {
//     if (req.protocol != 'https') {
//         // log.info(`https://${req.headers.host.split(':')[0]}:${config.sslport}${req.url}`)
//         res.redirect(`https://${req.headers.host.split(':')[0]}:${config.sslport}${req.url}`)
//     } else
//         next() /* Continue to other routes if we're not redirecting */
// })

//使服务可被跨域请求
let allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With , X-Token');
    res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
    if (req.method == 'OPTIONS') {
        res.sendStatus(200)
            //让options请求快速返回 s
    } else {
        next();
    };
}

app.use(allowCrossDomain);


app.use(bodyParser.text({ type: '*/xml' }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false }));

// 配置静态资源

app.use('/favicon.ico', express.static(path.join(__dirname, 'dist/favicon.ico')));
app.use('/dist', express.static(path.join(__dirname, 'dist')));
app.use('/static', express.static(path.join(__dirname, 'dist/static')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/ueditor-upload', express.static(path.join(__dirname, 'ueditor-upload')));



app.use(function(req, res, next) {
    log.info(`访问 ${req.path} 接口`);
    next();
});



app.use(jwtAuth);


app.use('/', indexRouter);


// 引用富文本编辑器
ueditor_backend(app)

// 二级路由转发
app.use('/demo', demoRouter);
app.use('/question', questionRouter);
app.use('/information', informationRouter);
app.use('/users', userRouter);
app.use('/advertising', advertisingRouter)
app.use('/testPaper', testPaperRouter)
app.use('/topic', topicRouter)
app.use('/pay', payRouter)
app.use('/category', categoryRouter)

app.use('/wuser', wUserRouter);
app.use('/wquestion', wQuestionRouter);
app.use('/wtestPaper', wTestPaperRouter);
app.use('/winformation', wInformationRouter);
app.use('/wadvertising', wAdvertisingRouter);
app.use('/wtopic', wTopicRouter);
app.use('/wcomment', wCommentRouter);
app.use('/wmessage', wMessageRouter);
app.use('/wreply', wReplyRouter);
app.use('/wpay', wPayRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
    log.info('404了吧')
    next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
    log.error(err)
        // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    if (err.name === 'UnauthorizedError') {
        //这个需要根据自己的业务逻辑来处理（ 具体的err值 请看下面）
        res.status(200).json({
            code: 50014,
            data: null,
            msg: "登录凭据无效，请重新登录..."
        })
    } else {
        res.status(err.status || 500).json({ error: err.message })
    }
});

module.exports = app;