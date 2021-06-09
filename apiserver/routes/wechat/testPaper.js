let express = require('express');
let router = express.Router();
let utils = require('../../common/utils')
let log = require('../../common/log')
let {
    Transaction,
    query
} = require('../../common/mysql')
const {
    secretKey
} = require('./../../common/constant');
const jwt = require("jsonwebtoken");
let multer = require('multer')
let testPaperDao = require('../mdao/testPaperDao');
let questionDao = require('../mdao/questionDao');
const uuidv4 = require('uuid/v4');



router.get('/list', async function(req, res, next) {
    let {
        size,
        testType
    } = req.query;
    let token = utils.getRequestToken(req);

    let resJson = {
        code: 20000,
        msg: '获取试卷列表成功',
        data: null,
        count: 0
    }

    try {
        // 获取喜欢列表
        let user = jwt.verify(token, secretKey);
        let userId = user.userId

        // 获取题目列表
        let dbres = await testPaperDao.queryList(0, Number(size), testType)
        if (dbres != null) {

            resJson.data = dbres.data;
            resJson.count = dbres.count;
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



router.get('/questionListById', async function(req, res, next) {
    let {
        id
    } = req.query;
    let token = utils.getRequestToken(req);

    let resJson = {
        code: 20000,
        msg: '根据试卷ID查询题目列表成功',
        data: null
    }

    try {
        // 获取喜欢列表
        let user = jwt.verify(token, secretKey);
        // 获取题目列表
        let dbres = await testPaperDao.queryQuestionById(id)
        if (dbres != null) {
            for (const q of dbres) {
                let oares = await questionDao.queryOptionAndAnswer(q.id)
                q.options = oares.option;
                q.ansewers = oares.answer;
            }
            resJson.data = dbres;
        } else {
            resJson.code = 50000;
            resJson.msg = '根据试卷ID查询题目列表失败'
        }
    } catch (error) {
        log.error(error)
        resJson.code = 50000;
        resJson.msg = error
    }


    res.json(resJson)
});


function isContain(arr1, arr2) {
    for (var i = arr2.length - 1; i >= 0; i--) {
        if (!arr1.includes(arr2[i])) {
            return false;
        }
    }
    return true;
}

router.post('/uploadTestPaper', async function(req, res, next) {
    let {
        testPaper,
        questions
    } = req.body;
    let token = utils.getRequestToken(req);


    let resJson = {
        code: 20000,
        msg: '上传试卷成功！',
        data: null
    }

    try {
        // 获取喜欢列表
        let user = jwt.verify(token, secretKey);
        let t = new Transaction();
        // 插入试卷纪录
        let utrId = uuidv4();
        t.query(`INSERT INTO USER_TEST_RECORD(id,createTime,userId,userTestPaperId,startTime,totalTime,totalScore,score)
        VALUES(?,NOW(),?,?,?,?,?,?)`, [utrId, user.userId, testPaper.id, testPaper.startTime, testPaper.endTime, testPaper.score, testPaper.resultScore])
        for (const q of questions) {
            let answerId = q.qtype == 2 ? q.check.toString() : q.radio;
            let isTrue = q.isTrue ? 1 : 0;

            t.query(`INSERT INTO USER_QUESTION(id,createTime,userId,userTestQuestionId,questionId,answerId,isTrue,type)
            VALUES(UUID(),NOW(),?,?,?,?,?,?)`, [user.userId, utrId, q.id, answerId, isTrue, 3])
        }
        await t.exec()
        console.log('执行完了')
    } catch (error) {
        log.error(error)
        resJson.code = 50000;
        resJson.msg = error
    }

    res.json(resJson)
});



router.get('/recordByUserId', async function(req, res, next) {
    let {
        size
    } = req.query;
    let token = utils.getRequestToken(req);

    let resJson = {
        code: 20000,
        msg: '查询用户考试纪录成功',
        data: null
    }

    try {
        // 获取喜欢列表
        let user = jwt.verify(token, secretKey);
        // 获取题目列表
        let dbres = await testPaperDao.queryRecordByUserId(user.userId)
        if (dbres != null) {
            resJson.data = dbres;
        } else {
            resJson.code = 50000;
            resJson.msg = '查询用户考试纪录失败'
        }
    } catch (error) {
        log.error(error)
        resJson.code = 50000;
        resJson.msg = error
    }


    res.json(resJson)
});



router.get('/userQuestion', async function(req, res, next) {
    let {
        id
    } = req.query;
    let token = utils.getRequestToken(req);

    let resJson = {
        code: 20000,
        msg: '获取用户做过的试卷题目成功',
        data: null
    }

    try {
        // 获取喜欢列表
        let user = jwt.verify(token, secretKey);
        let userId = user.userId

        // 获取题目列表
        let dbres = await questionDao.queryTestPaperQuestion(id)
        if (dbres != null) {
            for (const q of dbres) {
                let oares = await questionDao.queryOptionAndAnswer(q.id)
                q.options = oares.option;
                q.ansewers = oares.answer;
            }
            resJson.data = dbres;
        } else {
            resJson.code = 50000;
            resJson.msg = '获取用户做过的试卷题目成功'
        }
    } catch (error) {
        log.error(error)
        resJson.code = 50000;
        resJson.msg = error
    }


    res.json(resJson)
});



router.delete('/tdelete/:id', async function(req, res, next) {
    let {
        id
    } = req.params;
    let token = utils.getRequestToken(req);


    let resJson = {
        code: 20000,
        msg: '删除考试试卷成功！',
        data: null
    }

    try {
        let t = new Transaction();
        t.query(`DELETE FROM USER_QUESTION WHERE userTestQuestionId=?`, [id])
        t.query(`DELETE FROM USER_TEST_RECORD WHERE id=?`, [id])
        await t.exec()
        console.log('删除考试试卷执行完了')
    } catch (error) {
        log.error(error)
        resJson.code = 50000;
        resJson.msg = error
    }

    res.json(resJson)
});







module.exports = router;