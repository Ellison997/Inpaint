let db = require('../../common/mysql')
let log = require('../../common/log')
let utils = require('../../common/utils')


// 查询列表
let queryList = async(index, size) => {
    let sql = `SELECT * FROM ADVERTISING a where 1=1 ORDER BY a.sort limit ?,?`
    let sqlCount = `SELECT * FROM ADVERTISING a where 1=1 `

    let data = null
    let dbcount = [];
    let count = 0;
    try {
        data = await db.query(sql, [index, size], 'queryAdvertisingList')
        dbcount = await db.query(sqlCount, [], 'queryListCount')
        count = dbcount[0].count;
    } catch (error) {
        log.error('queryUserList', error)
    }
    return { data, count }
}




// 查询ID 
let queryById = async(id) => {
    let sql = `
        select * from ADVERTISING where id = ? `
    let values = [id]
    let dbres = null;
    try {
        dbres = await db.query(sql, values, 'queryById')
    } catch (error) {
        log.error('queryById', error)
    }
    return dbres
}


// 修改
let update = async(a) => {
    let updateLoginSql = `UPDATE ADVERTISING SET sort=?,atext=?,imgUrl=? where id = ? `;
    let dbres = null
    try {
        dbres = await db.query(updateLoginSql, [a.sort, a.atext, a.imgUrl, a.id], 'updateAdvertising')

    } catch (error) {
        log.error('updateAdvertising', error)
    }
    return dbres
}


// 添加
let insert = async(a) => {
    let sql = `INSERT INTO ADVERTISING(id,createTime,sort,atext,imgUrl)
    VALUE (UUID(),NOW(),?,?,?')`
    let values = [a.sort, a.atext, a.imgUrl]
    let dbres = null;
    try {
        dbres = await db.query(sql, values, 'insertAdvertising')
    } catch (error) {
        log.error('insertAdvertising', error)
    }
    return dbres
}

module.exports = {
    insert,
    update,
    queryList,
    queryById
}