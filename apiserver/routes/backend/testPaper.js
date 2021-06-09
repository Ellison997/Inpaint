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
let testPaperDao = require('../mdao/testPaperDao');
let questionDao = require('../mdao/questionDao');
const uuidv4 = require('uuid/v4');



router.get('/list', async function(req, res, next) {
    let { pageSize, pageIndex, title } = req.query;
    let resJson = {
        code: 20000,
        msg: '获取列表成功',
        data: null,
    }

    let dbres = await testPaperDao.queryList(pageSize * (pageIndex - 1), Number(pageSize), 1, title)
    if (dbres.data != null) {
        resJson.data = dbres.data;
        resJson.count = dbres.count;
    } else {
        resJson.code = 50000;
        resJson.msg = '获取列表失败'
        resJson.count = 0;
    }
    res.json(resJson)
});

router.get('/list/:id', async function(req, res, next) {
    let { id } = req.params;
    let token = utils.getRequestToken(req);
    let resJson = {
        code: 20000,
        msg: '获取题试卷详情成功！',
        data: null
    }

    let testPapers = await testPaperDao.queryById(id)
    if (testPapers != null && testPapers.length > 0) {
        let q = testPapers[0]

        resJson.data = q;
    } else {
        resJson.code = 50000;
        resJson.msg = '获取试卷详情失败！'
    }
    res.json(resJson)
});


router.get('/questionListById', async function(req, res, next) {
    let { id } = req.query;
    let token = utils.getRequestToken(req);

    let resJson = {
        code: 20000,
        msg: '根据试卷ID查询题目列表成功',
        data: null
    }

    try {

        // 获取题目列表
        let dbres = await testPaperDao.queryQuestionById(id)
            // 获取试卷详情
        let testPapers = await testPaperDao.queryById(id)
        if (dbres && testPapers && testPapers.length > 0) {
            for (const q of dbres) {
                let oares = await questionDao.queryOptionAndAnswer(q.id)
                q.options = oares.option;
                q.ansewers = oares.answer;
            }
            resJson.data = dbres;
            resJson.testPaper = testPapers[0]
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



router.delete('/delete/:id', async function(req, res, next) {
    let { id } = req.params;
    let token = utils.getRequestToken(req);
    let resJson = {
        code: 20000,
        msg: '删除试卷成功！',
        data: null
    }

    try {
        let t = new Transaction();
        t.query(`DELETE FROM TEST_QUESTION WHERE testPaperId=?`, [id])
        t.query(`DELETE FROM TEST_PAPER WHERE id=?`, [id])
        await t.exec()
        console.log('删除试卷执行完了')
    } catch (error) {
        log.error(error)
        resJson.code = 50000;
        resJson.msg = error
    }

    res.json(resJson)
});



router.post('/add', async function(req, res, next) {
    let i = req.body;
    let resJson = {
        code: 20000,
        msg: '添加成功',
        data: null
    }
    let dbres = await testPaperDao.insert(i)
    if (dbres != null) {
        resJson.data = dbres;
    } else {
        resJson.code = 50000;
        resJson.msg = '添加失败'
    }
    res.json(resJson)
});


router.post('/addQuestion', async function(req, res, next) {
    let i = req.body;
    let resJson = {
        code: 20000,
        msg: '添加题目成功',
        data: null
    }

    let data = await query(`select * from QUESTION  q where q.categoryId=? ORDER BY sort limit ? `, [i.testCategoryId, Number(i.number)], 'queryQUESTION')
    console.log('添加的题目数量：', data.length)

    try {
        let t = new Transaction();
        for (const d in data) {
            await t.query(`insert into TEST_QUESTION(id,createTime,testPaperId,questionId,sort)
            values(uuid(),now(),?,?,?)`, [i.testPaperId, data[d].id, d], 'insert')
        }
        await t.exec()
        console.log('执行完了')
    } catch (error) {
        resJson.code = 50000;
        resJson.msg = '添加题目失败'
    }

    res.json(resJson)
});


router.put('/update', async function(req, res, next) {
    let i = req.body;

    let resJson = {
        code: 20000,
        msg: '修改成功',
        data: null
    }
    let dbres = await testPaperDao.update(i)
    if (dbres != null && dbres.changedRows != 0) {
        resJson.data = dbres;
    } else {
        resJson.code = 50000;
        resJson.msg = '修改失败'
    }
    res.json(resJson)
});


module.exports = router;