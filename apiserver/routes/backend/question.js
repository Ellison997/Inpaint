let express = require('express');
let router = express.Router();
let utils = require('../../common/utils')
let log = require('../../common/log')
let { Transaction, query } = require('../../common/mysql')
let multer = require('multer')
let questionDao = require('../mdao/questionDao');


/**
 * @api {GET} /question/list    获取列表
 * @apiDescription 获取列表
 * @apiName questionList
 * @apiParam (query参数) {Number} limit 一页几条数据
 * @apiParam (query参数) {Number} page 第几页
 * @apiParam (query参数) {String} realname 姓名
 * @apiParam (query参数) {String} phone 手机号码
 * @apiSampleRequest /question/list
 * @apiGroup question
 * @apiVersion 1.0.0
 */
router.get('/list', async function(req, res, next) {
    let { pageSize, pageIndex, qtext, qtype, qcategoryId } = req.query;
    let resJson = {
        code: 20000,
        msg: '获取列表成功',
        data: null,
    }

    let dbres = await questionDao.queryList(pageSize * (pageIndex - 1), Number(pageSize), qtext, qtype, qcategoryId)
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
        msg: '获取题目详情成功！',
        data: null
    }

    let questions = await questionDao.queryById(id)
    if (questions != null && questions.length > 0) {
        let q = questions[0]
        let dbres = await questionDao.queryOptionAndAnswer(id)
        q.options = dbres.option;
        q.answers = dbres.answer
        resJson.data = q;
    } else {
        resJson.code = 50000;
        resJson.msg = '获取题目详情失败！'
    }



    res.json(resJson)
});


router.post('/add', async function(req, res, next) {
    let q = req.body;
    let resJson = {
        code: 20000,
        msg: '添加成功',
        data: null
    }
    let t = new Transaction();
    // 先插入这个问题
    t.query(`INSERT INTO QUESTION(id,createTime,qtext,qtype,categoryId,isChoiceness,qdescribe,score)
    VALUES(?,NOW(),?,?,?,?,?,?)`, [q.id, q.text, q.type, q.categoryId, q.isChoiceness, q.describe, q.score])
        // 在插入选项
    for (const o of q.options) {
        t.query(`INSERT INTO QUESTION_OPTION(id,createTime,questionId,mark,text)
        VALUES(?,NOW(),?,?,?)`, [o.id, q.id, o.mark, o.text])
    }
    // 再插入答案    试题类型   1. 单选题    2.多选题  3. 判断题  4. 填空题  5. 简答题
    if (q.type == 1 || q.type == 3) {
        t.query(`INSERT INTO ANSWER(id,createTime,questionId,optionId)
        VALUES(UUID(),NOW(),?,?)`, [q.id, q.optionRadioTrue])
    } else {
        for (const o of q.optionCheckboxTrue) {
            t.query(`INSERT INTO ANSWER(id,createTime,questionId,optionId)
            VALUES(UUID(),NOW(),?,?)`, [q.id, o])
        }
    }

    try {
        await t.exec()
        console.log('执行完了')
    } catch (error) {
        console.log('抛出错误了')
        console.log(error)
        resJson.code = 50000;
        resJson.msg = '添加失败'
    }

    res.json(resJson)
});
router.post('/addMore', async function(req, res, next) {
    let {
        testPaperId,
        isRelatedPapers,
        data,
    } = req.body;
    let resJson = {
        code: 20000,
        msg: '添加多个成功',
        data: null
    }
    let t = new Transaction();
    for (const q of data) {
        // 先插入这个问题
        t.query(`INSERT INTO QUESTION(id,createTime,qtext,qtype,categoryId,isChoiceness,qdescribe,score)
    VALUES(?,NOW(),?,?,?,?,?,?)`, [q.id, q.text, q.type, q.category, q.isChoiceness, q.describe, q.score])
            // 在插入选项
        for (const o of q.options) {
            t.query(`INSERT INTO QUESTION_OPTION(id,createTime,questionId,mark,text)
        VALUES(?,NOW(),?,?,?)`, [o.id, q.id, o.mark, o.text])
        }
        // 再插入答案    试题类型   1. 单选题    2.多选题  3. 判断题  4. 填空题  5. 简答题
        if (q.type == 1 || q.type == 3) {
            t.query(`INSERT INTO ANSWER(id,createTime,questionId,optionId)
        VALUES(UUID(),NOW(),?,?)`, [q.id, q.optionRadioTrue])
        } else {
            for (const o of q.optionCheckboxTrue) {
                t.query(`INSERT INTO ANSWER(id,createTime,questionId,optionId)
            VALUES(UUID(),NOW(),?,?)`, [q.id, o])
            }
        }
        if (isRelatedPapers) {
            await t.query(`insert into TEST_QUESTION(id,createTime,testPaperId,questionId,sort)
            values(uuid(),now(),?,?,?)`, [testPaperId, q.id, 0], 'insertTEST_QUESTION')
        }
    }
    try {
        await t.exec()
        console.log('执行完了')
    } catch (error) {
        console.log('抛出错误了')
        console.log(error)
        resJson.code = 50000;
        resJson.msg = '添加多个失败'
    }

    res.json(resJson)
});



router.put('/update', async function(req, res, next) {
    let q = req.body;

    let resJson = {
        code: 20000,
        msg: '修改成功',
        data: null
    }
    let t = new Transaction();
    // 先修改这个问题
    t.query(`update QUESTION set qtext=?,qtype=?,categoryId=?,isChoiceness=?,qdescribe=?,score=? where id=?`, [q.text, q.type, q.category, q.isChoiceness, q.describe, q.score, q.id])

    // 再删除所有关联
    t.query(`DELETE FROM USER_QUESTION WHERE questionId=?`, [q.id])
    t.query(`DELETE FROM ANSWER WHERE questionId=?`, [q.id])
    t.query(`DELETE FROM QUESTION_OPTION WHERE questionId=?`, [q.id])

    // 在插入选项
    for (const o of q.options) {
        t.query(`INSERT INTO QUESTION_OPTION(id,createTime,questionId,mark,text)
        VALUES(?,NOW(),?,?,?)`, [o.id, q.id, o.mark, o.text])
    }
    // 再插入答案    试题类型   1. 单选题    2.多选题  3. 判断题  4. 填空题  5. 简答题
    if (q.type == 1 || q.type == 3) {
        t.query(`INSERT INTO ANSWER(id,createTime,questionId,optionId)
        VALUES(UUID(),NOW(),?,?)`, [q.id, q.optionRadioTrue])
    } else {
        for (const o of q.optionCheckboxTrue) {
            t.query(`INSERT INTO ANSWER(id,createTime,questionId,optionId)
            VALUES(UUID(),NOW(),?,?)`, [q.id, o])
        }
    }

    try {
        await t.exec()
        console.log('执行完了')
    } catch (error) {
        console.log('抛出错误了')
        console.log(error)
        resJson.code = 50000;
        resJson.msg = '修改失败'
    }

    res.json(resJson)
});


router.delete('/delete/:id', async function(req, res, next) {
    let { id } = req.params;
    let token = utils.getRequestToken(req);
    let resJson = {
        code: 20000,
        msg: '删除题目成功！',
        data: null
    }

    try {
        let t = new Transaction();
        t.query(`DELETE FROM USER_QUESTION WHERE questionId=?`, [id])
        t.query(`DELETE FROM ANSWER WHERE questionId=?`, [id])
        t.query(`DELETE FROM QUESTION_OPTION WHERE questionId=?`, [id])
        t.query(`DELETE FROM QUESTION WHERE id=?`, [id])
        await t.exec()
        console.log('删除题目执行完了')
    } catch (error) {
        log.error(error)
        resJson.code = 50000;
        resJson.msg = error
    }

    res.json(resJson)
});


module.exports = router;