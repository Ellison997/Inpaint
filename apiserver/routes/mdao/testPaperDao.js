let db = require('../../common/mysql')
let log = require('../../common/log')
let utils = require('../../common/utils')

// 查询列表
let queryList = async(index, size, testType, title = '') => {
    //试卷类型  1. 自主模考    2. 押题模考
    let sqltitle = (title == '' ? `and 1=1` : `and tp.title like '%${title}%'`)

    let sql = `SELECT tp.*,
                (SELECT COUNT(*) AS count FROM TEST_QUESTION tq
                LEFT JOIN QUESTION q
                ON tq.questionId=q.id
                WHERE tq.testPaperId=tp.id) AS count,
                (SELECT SUM(q.score) AS score FROM TEST_QUESTION tq
                LEFT JOIN QUESTION q
                ON tq.questionId=q.id
                WHERE tq.testPaperId=tp.id) AS score,  
                (SELECT text FROM CATEGORY g
                WHERE tp.testCategoryId=g.id limit 1) AS testCategory   
                FROM TEST_PAPER tp
                WHERE TRUE AND tp.testType=?  ${sqltitle}
                ORDER BY tp.sort limit ?,?`
    let values = [testType, index, size]

    let sqlCount = `SELECT COUNT(*) AS count FROM TEST_PAPER tp WHERE TRUE AND tp.testType=?  ${sqltitle}`
    let data = null
    let dbcount = [];
    let count = 0;
    try {
        data = await db.query(sql, values, 'queryList')
        dbcount = await db.query(sqlCount, [testType], 'queryListCount')
        count = dbcount[0].count;
    } catch (error) {
        log.error('queryList', error)
    }
    return { data, count }
}


// 查询ID 
let queryQuestionById = async(id) => {
    let sql = `SELECT q.* FROM TEST_QUESTION tq
                LEFT JOIN QUESTION q
                ON tq.questionId = q.id
                WHERE tq.testPaperId=?
                ORDER BY tq.sort`
    let dbres = null;
    try {
        dbres = await db.query(sql, [id], 'queryQuestionById')
    } catch (error) {
        log.error('queryQuestionById', error)
    }
    return dbres
}

// 查询用户考试记录
let queryRecordByUserId = async(userId) => {
    let sql = `SELECT utr.*,tp.title FROM USER_TEST_RECORD utr
                LEFT JOIN TEST_PAPER tp
                ON utr.userTestPaperId=tp.id
                WHERE utr.userId=?
                ORDER BY utr.createTime`
    let dbres = null;
    try {
        dbres = await db.query(sql, [userId], 'queryRecordByUserId')
    } catch (error) {
        log.error('queryRecordByUserId', error)
    }
    return dbres
}




let queryInfoByUserId = async(userId) => {
    let sql = `SELECT COUNT(*) as count,AVG(utr.score) AS avg FROM USER_TEST_RECORD utr
                WHERE utr.userId=?
                GROUP BY utr.userId`
    let dbres = null;
    try {
        dbres = await db.query(sql, [userId], 'queryInfoByUserId')
    } catch (error) {
        log.error('queryInfoByUserId', error)
    }
    return dbres
}





// 修改
let update = async(a) => {
    let updateLoginSql = `UPDATE TEST_PAPER SET
     title=?,testCategoryId=?,testNum=?,testType=?,testTimeText=?,testTime=?,provenance=?,sort=?
     where id=?`;
    let dbres = null
    try {
        dbres = await db.query(updateLoginSql, [a.title, a.testCategoryId, a.testNum, a.testType, a.testTimeText, a.testTime, a.provenance, a.sort, a.id], 'updateTestPaper')
    } catch (error) {
        log.error('updateTestPaper', error)
    }
    return dbres
}


// 添加
let insert = async(a) => {
    let sql = `INSERT INTO TEST_PAPER(id,createTime,title,testCategoryId,testNum,testType,testTimeText,testTime,provenance,sort)
    VALUES(UUID(),NOW(),?,?,?,?,?,?,?,?)`
    let values = [a.title, a.testCategoryId, a.testNum, a.testType, a.testTimeText, a.testTime, a.provenance, a.sort]
    let dbres = null;
    try {
        dbres = await db.query(sql, values, 'insertTestPaper')
    } catch (error) {
        log.error('insertTestPaper', error)
    }
    return dbres
}



let queryById = async(id) => {
    let sql = `select tp.*,
               (SELECT text FROM CATEGORY g
               WHERE tp.testCategoryId=g.id limit 1) AS testCategory 
               from TEST_PAPER tp where tp.id=?`
    let dbres = null;
    try {
        dbres = await db.query(sql, [id], 'queryTestPaperById')
    } catch (error) {
        log.error('queryTestPaperById', error)
    }
    return dbres
}


module.exports = {
    insert,
    update,
    queryList,
    queryQuestionById,
    queryRecordByUserId,
    queryInfoByUserId,
    queryById
}