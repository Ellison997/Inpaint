/**
 * 登录 获取用户信息   退出登录等程序全局操作
 */

var express = require('express');
var router = express.Router();
let log = require('./../common/log');
const { secretKey } = require('./../common/constant');
const utils = require('./../common/utils');
let path = require('path');
const jwt = require("jsonwebtoken");
let userDao = require('./mdao/userDao');

let multer = require('multer')


let uploadFolder = './uploads'; // 临时文件夹
// 通过 filename 属性定制
let storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, uploadFolder); // 保存的路径，备注：需要自己创建
    },
    filename: function(req, file, cb) {
        // 将保存文件名设置为 字段名 + 时间戳，比如 logo-1478521468943
        cb(null, file.fieldname + '-' + Date.now() + '.' + file.originalname.split('.')[1]);
    }
});

// 通过 storage 选项来对 上传行为 进行定制化
let upload = multer({ storage: storage })



/**
 * @api {GET} // 返回前端页面
 * @apiDescription  返回前端页面
 * @apiName return index.html
 * @apiGroup Index
 * @apiVersion 1.0.0
 */
router.get('/', function(req, res, next) {
    res.sendFile(path.resolve(__dirname, './../dist') + '/index.html')
});

/**
 * @api {GET} /apidoc /apidoc 获取api文档
 * @apiDescription  获取api文档
 * @apiName apidoc
 * @apiGroup Index
 * @apiVersion 1.0.0
 */
router.get('/apidoc', function(req, res, next) {
    log.info(`http://${req.headers.host}/dist/apidoc/index.html`)
    res.redirect(`http://${req.headers.host}/dist/apidoc/index.html`)
});


/**
 * @api {POST} /login  WEB 端人员登录
 * @apiDescription WEB 端人员登录
 * @apiName login
 * @apiParam (body参数) {String} uname 用户手机号
 * @apiParam (body参数) {String} pwd 用户密码
 * @apiSampleRequest /login
 * @apiGroup Index
 * @apiVersion 1.0.0
 */
router.post('/login', async function(req, res, next) {
    let uname = req.body.username;
    let pwd = req.body.password;

    let resData = {
        code: 50000,
        msg: '用户名或密码错误！',
        data: null
    }

    let users = [];

    users = await userDao.queryByNameAndPwd(uname, utils.md5(pwd));

    if (users.length > 0) {
        users[0].username = users[0].username;

        let tokenObj = JSON.parse(JSON.stringify(users[0]));
        let token = jwt.sign(tokenObj,
            secretKey, {
                expiresIn: 60 * 60 * 2 * 24 // 授权时效两天
            }
        );
        resData.code = 20000;
        resData.msg = '登录成功！';
        resData.data = {
            token
        }
    }
    res.json(resData);
});


/**
 * @api {GET} /getUserInfo   获取登录的人员信息
 * @apiDescription 获取登录的人员信息
 * @apiName getUserInfo
 * @apiParam {String} token 访问令牌
 * @apiSampleRequest /getUserInfo
 * @apiGroup Index
 * @apiVersion 1.0.0
 */
router.get('/getUserInfo', async function(req, res, next) {
    let token = utils.getRequestToken(req);
    let user = null;
    try {
        user = jwt.verify(token, secretKey);
    } catch (error) {
        log.error('getUserInfo', error)
    }

    let resJson = {
        code: 20000,
        msg: '获取人员信息',
        data: null
    }

    if (user != null) {
        resJson.data = user

    } else {
        resJson.code = 50000;
        resJson.msg = "获取人员信息失败"

    }
    res.json(resJson)

});



/**
 * @api {POST} /upload    上传图片或文件
 * @apiDescription 上传图片或文件
 * @apiName upload
 * @apiParam (body参数) {File} data  上传图片或文件
 * @apiSampleRequest /upload
 * @apiGroup Index
 * @apiVersion 1.0.0
 */
router.post('/upload', upload.single('data'), function(req, res, next) {
    let file = req.file;
    res.json({
        code: 20000,
        msg: '上传文件成功',
        data: {
            mimetype: file.mimetype,
            originalname: file.originalname,
            size: file.size,
            path: file.path
        },
    })
});



module.exports = router;