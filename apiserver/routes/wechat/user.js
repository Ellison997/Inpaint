/**
 * 登录 获取用户信息   退出登录等程序全局操作
 */

var express = require('express');
var router = express.Router();
let log = require('./../../common/log');
const {
    secretKey
} = require('./../../common/constant');
const jwt = require("jsonwebtoken");
const utils = require('./../../common/utils');
const request = require('./../../common/request');
const wxBizDataCrypt = require('./../../common/wxBizDataCrypt');
const config = require('./../../config');
let path = require('path');
let userDao = require('./../mdao/userDao');
let questionDao = require('./../mdao/questionDao');
let testPaperDao = require('./../mdao/testPaperDao');
const mongoose = require('mongoose');
let ObjectID = require('mongodb').ObjectID;

let {
    Transaction,
    query
} = require('../../common/mysql')

let concernModel = require('../../models/concern');
let topicModel = require('../../models/topic');

/**
 * @api {POST} /wuser/login  微信小程序登录认证
 * @apiDescription 微信小程序登录认证
 * @apiName login
 * @apiParam (body参数) {String} code 授权码
 * @apiSampleRequest /wuser/login
 * @apiGroup Index
 * @apiVersion 1.0.0
 */
router.get('/login', async function(req, res, next) {
    let code = req.query.code;

    log.info('授权码', code)
    let jscode2session = function() {
        return request({
            url: 'https://api.weixin.qq.com/sns/jscode2session',
            method: 'get',
            params: {
                appid: config.appId,
                secret: config.appSecret,
                js_code: code,
                grant_type: 'authorization_code'
            }
        })
    }
    let resd = await jscode2session()
    let users = null;
    log.info('openId', resd.openid)
    if (resd.openid) {
        users = await userDao.queryByOpenId(resd.openid)
        if (users != null && users.length == 0) {
            // 添加新用户
            let insertRes = await userDao.insert(resd.openid)
            if (insertRes != null) {
                users = await userDao.queryByOpenId(resd.openid)
            }
        }
    }
    let resData = {
        code: 50000,
        msg: '程序出现异常！',
        data: null
    }
    console.log('最后的用户', users)
    if (users != null && users.length > 0) {
        let tokenObj = {
                userId: users[0].id,
                openId: users[0].openId,
                lastTime: users[0].lastTime,
                session_key: resd.session_key
            }
            // 验证成功，生成token
        let token = jwt.sign(tokenObj,
            secretKey, {
                expiresIn: 60 * 60 * 10 * 24 // 授权时效10天
                    // expiresIn: 60 * 2
            }
        );
        resData.code = 20000;
        resData.msg = '登录成功！';
        resData.data = {
            access_token: token
        }
    }
    res.json(resData);
});




/**
 * @api {GET} /wuser/getUserInfo   获取登录的人员信息
 * @apiDescription 获取登录的人员信息
 * @apiName getUserInfo
 * @apiParam {String} token 访问令牌
 * @apiSampleRequest /wuser/getUserInfo
 * @apiGroup WUSER
 * @apiVersion 1.0.0
 */
router.post('/getUserInfo', async function(req, res, next) {
    let token = utils.getRequestToken(req);
    let wxuser = req.body;

    log.info('微信传入的用户信息：', wxuser)
    log.info('微信传入的Token：', token)
    let resData = {
        code: 20000,
        msg: '获取用户信息成功',
        data: null
    }

    let user = null;
    try {
        user = jwt.verify(token, secretKey);
        if (user != null) {
            // 更新用户信息
            let u = {
                ...wxuser,
                id: user.userId
            }
            await userDao.update(u)
            user = Object.assign(user, wxuser)

        }
    } catch (error) {
        log.error('getUserInfo', error)
    }

    if (user != null) {
        resData.data = user
    } else {
        resData.code = 50000;
        resData.msg = '获取用户信息失败！'
    }

    res.json(resData)

});



router.get('/getUserData', async function(req, res, next) {
    let token = utils.getRequestToken(req);

    let userId = req.query.userId;

    log.info('微信传入的Token：', token)
    let resData = {
        code: 20000,
        msg: '获取用户数据成功',
        data: null,
        isPay: true
    }

    let user = null;
    try {
        if (userId) {
            user = await userDao.queryMongoUserById(userId)
        } else {
            user = jwt.verify(token, secretKey);
        }
        if (user != null) {
            // 查询答题
            let collectRes = await questionDao.queryUserQuestion(user.userId, 1, 20000)
            user.collect = collectRes.length;
            let info = await testPaperDao.queryInfoByUserId(user.userId)

            // 查询问答
            user.concernCount = await concernModel.count({ userId: user.userId })
            user.fansCount = await concernModel.count({ toUserId: user.userId })
            user.topicCount = await topicModel.count({ userId: user.userId })

            if (info.length > 0) {
                user.examNum = info[0].count;
                user.examRate = 0;
                user.examAve = info[0].avg;
            } else {
                user.examNum = 0;
                user.examRate = 0;
                user.examAve = 0;
            }

        }
    } catch (error) {
        log.error('getUserData', error)
    }

    if (user != null) {
        resData.data = user
    } else {
        resData.code = 50000;
        resData.msg = '获取用户数据失败！'
    }

    res.json(resData)

});



router.get('/examineToken', async function(req, res, next) {
    let token = utils.getRequestToken(req);

    log.info('微信传入的Token：', token)
    let resData = {
        code: 20000,
        msg: 'Token 验证通过',
        data: null
    }

    let user = null;
    try {
        user = jwt.verify(token, secretKey);

    } catch (error) {
        log.error('examineToken', error)
    }

    if (user != null) {
        resData.data = user
    } else {
        resData.code = 50000;
        resData.msg = 'Token 验证失败'
    }

    res.json(resData)

});


router.get('/decodePhone', async function(req, res, next) {
    let token = utils.getRequestToken(req);
    let {
        encryptedData,
        iv
    } = req.query;

    log.info('微信传入的Token：', token)
    let resData = {
        code: 20000,
        msg: '获取手机号成功',
        data: null
    }
    let user = null;
    try {
        user = jwt.verify(token, secretKey);
        let pc = new wxBizDataCrypt(config.appId, user.session_key)
        let data = pc.decryptData(encryptedData, iv)
        console.log('解密后 data: ', data)
        resData.data = data
    } catch (error) {
        resData.code = 50000;
        resData.msg = 'Token 验证失败'
        log.error('examineToken', error)
    }

    res.json(resData)

});




router.post('/update', async function(req, res, next) {
    let token = utils.getRequestToken(req);
    let {
        unit,
        countryCode,
        phone,
        trade,
        addressText,
        addressCode,
        idCard
    } = req.body;

    log.info('微信传入的Token：', token)
    let resData = {
        code: 20000,
        msg: '更新用户基本信息成功',
        data: null
    }
    let user = null;
    try {
        user = jwt.verify(token, secretKey);
        let t = new Transaction();
        t.query(`UPDATE USER SET unit=?,countryCode=?,phone=?,trade=?,addressText=?,addressCode=?,
                cardId=?,
                gender=?,
                birth=?,
                address=?,
                positive_image_path=?,
                negative_image_path=?,
                name=?,
                nationality=?,
                authority=?,
                valid_date=? WHERE id=?`, [unit, countryCode, phone, trade, addressText, addressCode, idCard.id,
            idCard.gender,
            idCard.birth,
            idCard.address,
            idCard.positive_image_path,
            idCard.negative_image_path,
            idCard.name,
            idCard.nationality,
            idCard.authority,
            idCard.valid_date, user.userId
        ])
        await t.exec()
    } catch (error) {
        resData.code = 50000;
        resData.msg = '更新用户基本信息失败'
        log.error('update', error)
    }

    res.json(resData)
});



router.get('/getById', async function(req, res, next) {
    let token = utils.getRequestToken(req);

    let resJson = {
        code: 20000,
        msg: '获取用户信息成功',
        data: null
    }

    let user = null;
    try {
        user = jwt.verify(token, secretKey);
        // 获取题目列表
        let dbres = await userDao.queryById(user.userId)
        if (dbres != null && dbres.length > 0) {
            resJson.data = dbres[0];
        } else {
            resJson.code = 50000;
            resJson.msg = '获取用户信息成功失败'
        }
    } catch (error) {
        log.error(error)
        resJson.code = 50000;
        resJson.msg = error
    }


    res.json(resJson)
});



// 用户关注

router.post('/concern', async function(req, res, next) {
    let token = utils.getRequestToken(req);
    let {
        toUserId
    } = req.body;

    let resJson = {
        code: 20000,
        msg: '关注成功',
        data: null
    }

    let user = null;
    try {
        user = jwt.verify(token, secretKey);
        // user.userId
        let conData = {
            userId: user.userId,
            toUserId
        }
        let concern = new concernModel(conData)
        resJson.data = await concern.save()

        // 添加消息
        await userDao.insertMessage(user.userId, toUserId, 1)
    } catch (error) {
        log.error(error)
        resJson.code = 50000;
        resJson.msg = '关注失败'
    }

    res.json(resJson)
});



router.post('/noconcern', async function(req, res, next) {
    let token = utils.getRequestToken(req);
    let {
        id
    } = req.body;

    let resJson = {
        code: 20000,
        msg: '取消关注成功',
        data: null
    }

    let user = null;
    try {
        user = jwt.verify(token, secretKey);
        resJson.data = await concernModel.deleteOne({
            _id: id
        })
    } catch (error) {
        log.error(error)
        resJson.code = 50000;
        resJson.msg = '取消关注失败'
    }

    res.json(resJson)
});


router.get('/concernList', async function(req, res, next) {
    let token = utils.getRequestToken(req);
    let {
        pageSize,
        pageIndex
    } = req.query;

    let resJson = {
        code: 20000,
        msg: '查询关注列表成功',
        data: null
    }

    let user = null;
    try {
        user = jwt.verify(token, secretKey);
        let concerns = await concernModel.find({
            userId: user.userId
        }).sort({
            'createAt': -1
        }).skip(Number(pageIndex) * Number(pageSize)).limit(Number(pageSize))
        for (const c in concerns) {
            let cc = concerns[c].toJSON()
            concerns[c] = await userDao.queryMongoUserById(cc.toUserId)
            concerns[c].concernId = cc.id
        }
        resJson.data = concerns
    } catch (error) {
        log.error(error)
        resJson.code = 50000;
        resJson.msg = '查询关注列表失败'
    }

    res.json(resJson)
});

router.get('/fansList', async function(req, res, next) {
    let token = utils.getRequestToken(req);
    let {
        pageSize,
        pageIndex
    } = req.query;

    let resJson = {
        code: 20000,
        msg: '查询粉丝列表成功',
        data: null
    }

    let user = null;
    try {
        user = jwt.verify(token, secretKey);
        let concerns = await concernModel.find({
            toUserId: user.userId
        }).sort({
            'createAt': -1
        }).skip(Number(pageIndex) * Number(pageSize)).limit(Number(pageSize))
        for (const c in concerns) {
            let cc = concerns[c].toJSON()
            concerns[c] = await userDao.queryMongoUserById(cc.userId)
            concerns[c].concernId = cc.id
        }
        resJson.data = concerns
    } catch (error) {
        log.error(error)
        resJson.code = 50000;
        resJson.msg = '查询粉丝列表失败'
    }

    res.json(resJson)
});

router.get('/publishlist', async function(req, res, next) {
    let token = utils.getRequestToken(req);
    let {
        pageSize,
        pageIndex,
        userId
    } = req.query;

    let resJson = {
        code: 20000,
        msg: '查询发布问答列表成功',
        data: null
    }

    let user = null;
    try {
        if (userId) {
            user = await userDao.queryMongoUserById(userId)
        } else {
            user = jwt.verify(token, secretKey);
        }
        let topics = await topicModel.find({
            userId: user.userId
        }).sort({
            'createAt': -1
        }).skip(Number(pageIndex) * Number(pageSize)).limit(Number(pageSize))
        for (const t in topics) {
            topics[t] = topics[t].toJSON()
            topics[t].user = await userDao.queryMongoUserById(topics[t].userId)
        }
        resJson.data = topics
    } catch (error) {
        log.error(error)
        resJson.code = 50000;
        resJson.msg = '查询发布问答列表失败'
    }

    res.json(resJson)
});


module.exports = router;