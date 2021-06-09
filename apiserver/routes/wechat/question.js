let express = require('express');
let router = express.Router();
let utils = require('../../common/utils')
let log = require('../../common/log')
let { Transaction, query } = require('../../common/mysql')
const {
    secretKey
} = require('./../../common/constant');
const jwt = require("jsonwebtoken");
let multer = require('multer')
let questionDao = require('../mdao/questionDao');

router.get('/list', async function(req, res, next) {
    let { index = 1, size, isChoiceness, category } = req.query;
    let token = utils.getRequestToken(req);

    let resJson = {
        code: 20000,
        msg: '获取随机获取题目列表成功',
        data: null,
        collects: null
    }

    try {
        // 获取喜欢列表
        let user = jwt.verify(token, secretKey);
        let userId = user.userId
        if (userId) {
            let collect = await questionDao.queryCollectByUserId(userId)
            resJson.collects = collect.map(c => c.questionId)
        }
        // 获取题目列表
        let dbres = await questionDao.queryRandList(size * (index - 1), Number(size), category, isChoiceness)
        let { data, count } = dbres
        if (data) {
            for (const q of dbres.data) {
                let oares = await questionDao.queryOptionAndAnswer(q.id)
                q.options = oares.option;
                q.ansewers = oares.answer;
            }
            resJson.data = data;
            resJson.count = count;
        } else {
            resJson.code = 50000;
            resJson.msg = '获取列表失败'
        }
    } catch (error) {
        log.error(error)
        resJson.code = 50000;
        resJson.msg = error
    }


    res.json(resJson)
});


router.get('/list/:id', async function(req, res, next) {
    let { id } = req.params;

    let resJson = {
        code: 20000,
        msg: '根据ID 获取题目信息成功',
        data: null
    }

    try {
        // 获取题目列表
        let dbres = await questionDao.queryById(id)
        if (dbres != null) {
            for (const q of dbres) {
                let oares = await questionDao.queryOptionAndAnswer(q.id)
                q.options = oares.option;
                q.ansewers = oares.answer;
            }
            resJson.data = dbres;
        } else {
            resJson.code = 50000;
            resJson.msg = '根据ID 获取题目信息失败'
        }
    } catch (error) {
        log.error(error)
        resJson.code = 50000;
        resJson.msg = error
    }


    res.json(resJson)
});



router.post('/action', async function(req, res, next) {
    let { userTestQuestionId, questionId, answerId, type, insert } = req.body;
    // 类型  1. 收藏   2.错题  3. 考试题
    let token = utils.getRequestToken(req);

    let resJson = {
        code: 20000,
        msg: '添加题目操作成功',
        data: null
    }

    try {
        let user = jwt.verify(token, secretKey);
        let userId = user.userId
        let uq = {
            userId,
            userTestQuestionId: userTestQuestionId ? userTestQuestionId : null,
            questionId: questionId ? questionId : null,
            answerId: answerId ? answerId : null,
            type: type ? type : null
        }

        switch (type) {
            case 1:
                // 喜欢
                log.info('喜欢一个题')
                break;

            case 2:
                // 错题
                log.info('答错了一个题')
                break;

            default:
                break;
        }

        let dbres;
        if (insert == 1) {
            // 添加
            if (uq.type == 2) {
                // 如果事错题  先删除再添加
                await questionDao.deleteUserQuestion(uq)
            }
            dbres = await questionDao.insertUserQuestion(uq)
        } else {
            // 删除
            dbres = await questionDao.deleteUserQuestion(uq)
        }
        if (dbres != null) {
            resJson.data = dbres;
        } else {
            resJson.code = 50000;
            resJson.msg = '操作失败'
        }
    } catch (error) {
        log.error(error)
        resJson.code = 50000;
        resJson.msg = error
    }


    res.json(resJson)
});



router.get('/userQuestion', async function(req, res, next) {
    let { size, type } = req.query;
    let token = utils.getRequestToken(req);

    let resJson = {
        code: 20000,
        msg: '获取用户收藏或错误的题目成功',
        data: null,
        collects: null
    }

    try {
        // 获取喜欢列表
        let user = jwt.verify(token, secretKey);
        let userId = user.userId
        if (userId) {
            let collect = await questionDao.queryCollectByUserId(userId)
            resJson.collects = collect.map(c => c.questionId)
        }
        // 获取题目列表
        let dbres = await questionDao.queryUserQuestion(userId, Number(type), Number(size))
        if (dbres != null) {
            for (const q of dbres) {
                let oares = await questionDao.queryOptionAndAnswer(q.id)
                q.options = oares.option;
                q.ansewers = oares.answer;
            }
            resJson.data = dbres;
        } else {
            resJson.code = 50000;
            resJson.msg = '获取用户收藏或错误的题目失败'
        }
    } catch (error) {
        log.error(error)
        resJson.code = 50000;
        resJson.msg = error
    }


    res.json(resJson)
});



module.exports = router;