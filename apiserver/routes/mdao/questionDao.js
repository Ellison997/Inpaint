let db = require('../../common/mysql')
let log = require('../../common/log')
let utils = require('../../common/utils')

// 查询列表
let queryList = async(index, size, qtext, qtype, qcategoryId) => {
    let sqlqtext = (qtext == '' ? `and 1=1` : `and q.qtext like '%${qtext}%'`)
    let sqlqtype = (qtype == '' ? `and 1=1` : `and q.qtype = ${qtype}`)
    let sqlqcategoryId = (qcategoryId == '' ? `and 1=1` : `and q.categoryId = ${qcategoryId}`)


    let sql = `SELECT q.* FROM QUESTION q WHERE TRUE ${sqlqtext} ${sqlqtype} ${sqlqcategoryId} ORDER BY q.qtext limit ?,?`
    let values = [index, size]

    let sqlCount = `SELECT COUNT(*) AS count FROM QUESTION q where TRUE ${sqlqtext} ${sqlqtype} ${sqlqcategoryId}`
    let data = null
    let dbcount = [];
    let count = 0;
    try {
        data = await db.query(sql, values, 'queryList')
        dbcount = await db.query(sqlCount, [], 'queryListCount')
        count = dbcount[0].count;
    } catch (error) {
        log.error('queryList', error)
    }
    return { data, count }
}


// 查询ID 
let queryById = async(id) => {
    let sql = `SELECT * FROM QUESTION WHERE id=?`
    let dbres = null;
    try {
        dbres = await db.query(sql, [id], 'queryById')
    } catch (error) {
        log.error('queryById', error)
    }
    return dbres
}


// 随机查询列表
let queryRandList = async(index, size, categoryId, isChoiceness) => {
    // AND qtype=1
    let qr = isChoiceness ? ` AND isChoiceness=${isChoiceness}` : `AND 1=1`
    let sql = `SELECT * FROM QUESTION WHERE TRUE AND categoryId=? ${qr}  ORDER BY sort LIMIT ?,?`
    let sqlCount = `select count(*) as count from QUESTION  where TRUE AND categoryId=?`

    let data = null;
    let dbcount = null;
    let count = 0;
    try {
        data = await db.query(sql, [categoryId, index, size], 'queryRandList')
        dbcount = await db.query(sqlCount, [categoryId], 'queryListCount')
        count = dbcount[0].count;
    } catch (error) {
        log.error('queryRandList', error)
    }
    return {
        data,
        count
    }
}

// 根据题目ID查询题目选项与答案
let queryOptionAndAnswer = async(id) => {
    let optionSql = `SELECT * FROM QUESTION_OPTION o WHERE o.questionId=? ORDER BY o.mark`
    let answerSql = `SELECT o.* FROM ANSWER a
                        LEFT JOIN 
                        QUESTION_OPTION o
                        ON a.optionId=o.id
                        WHERE a.questionId=?`
    let option = null;
    let answer = null;

    try {
        option = await db.query(optionSql, [id], 'queryOptionAndAnswer')
        answer = await db.query(answerSql, [id], 'queryOptionAndAnswer')

    } catch (error) {
        log.error('queryOptionAndAnswer', error)
    }
    return { option, answer }
}

let queryCollectByUserId = async(id) => {

    let collectSql = `SELECT uq.questionId FROM USER_QUESTION uq WHERE uq.type=1 AND uq.userId=?`

    let collect = null;
    try {

        collect = await db.query(collectSql, [id], 'queryCollectByUserId')
    } catch (error) {
        log.error('queryCollectByUserId', error)
    }
    return collect;
}

// 用户点赞 错误   和考试存储
let insertUserQuestion = async(uq) => {
    let sql = `INSERT INTO USER_QUESTION(id,createTime,userId,userTestQuestionId,questionId,answerId,type)
    VALUES(UUID(),NOW(),?,?,?,?,?)`
    let insertData = null;
    try {
        insertData = await db.query(sql, [uq.userId, uq.userTestQuestionId, uq.questionId, uq.answerId, uq.type], 'queryCollectByUserId')
    } catch (error) {
        log.error('insertUserQuestion', error)
    }
    return insertData;
}


// 用户点赞 错误   和考试删除
let deleteUserQuestion = async(uq) => {
    let sql = `DELETE FROM  USER_QUESTION
    WHERE userId=? AND questionId=? AND type=?`
    let insertData = null;
    try {
        insertData = await db.query(sql, [uq.userId, uq.questionId, uq.type], 'deleteUserQuestion')
    } catch (error) {
        log.error('deleteUserQuestion', error)
    }
    return insertData;
}


let queryUserQuestion = async(userId, type, size) => {
    let sql = `SELECT q.*,uq.createTime AS uqCreateTime,uq.answerId FROM USER_QUESTION uq
            LEFT JOIN QUESTION q
            ON uq.questionId=q.id
            WHERE uq.userId=? AND uq.type=?  LIMIT ?`
    let data = null
    try {
        data = await db.query(sql, [userId, type, size], 'queryUserQuestion')
    } catch (error) {
        log.error('queryUserQuestion', error)
    }
    return data

}

let queryTestPaperQuestion = async(id) => {
    let sql = `SELECT q.*,uq.createTime AS uqCreateTime,uq.answerId FROM USER_QUESTION uq
                LEFT JOIN QUESTION q
                ON uq.questionId=q.id
                WHERE uq.userTestQuestionId=?`
    let data = null
    try {
        data = await db.query(sql, [id], 'queryTestPaperQuestion')
    } catch (error) {
        log.error('queryTestPaperQuestion', error)
    }
    return data

}


module.exports = {
    queryList,
    queryById,
    queryRandList,
    queryOptionAndAnswer,
    queryCollectByUserId,
    insertUserQuestion,
    deleteUserQuestion,
    queryUserQuestion,
    queryTestPaperQuestion
}