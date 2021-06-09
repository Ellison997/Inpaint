let db = require('../../common/mysql')
let log = require('../../common/log')
let utils = require('../../common/utils')

// 查询列表
let queryList = async(index, size, title) => {
    let sqltitle = (!title ? `and 1=1` : `and i.title like '%${title}%'`)

    let sql = `SELECT i.id,i.createTime,i.img,i.title,i.synopsis FROM INFORMATION i WHERE TRUE ${sqltitle} ORDER BY i.createTime limit ?,?`
    let values = [index, size]

    let sqlCount = `SELECT COUNT(*) AS count FROM INFORMATION i where TRUE ${sqltitle}`
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
    let sql = `SELECT * FROM INFORMATION WHERE id=?`
    let dbres = null;
    try {
        dbres = await db.query(sql, [id], 'queryById')
    } catch (error) {
        log.error('queryById', error)
    }
    return dbres
}



// 修改
let update = async(i) => {
    let updateSql = `update INFORMATION set title=?,synopsis=?,content=? where id=?`;
    let dbres = null
    try {
        dbres = await db.query(updateSql, [i.title, i.synopsis, i.content, i.id], 'update')

    } catch (error) {
        log.error('update', error)
    }
    return dbres
}


// 添加
let insert = async(i) => {
    let sql = `INSERT INTO INFORMATION(id,createTime,title,synopsis,content)
                VALUE(UUID(),NOW(),?,?,?)`
    let values = [i.title, i.synopsis, i.content]

    let dbres = null;
    try {
        dbres = await db.query(sql, values, 'insert')
    } catch (error) {
        log.error('insert', error)
    }
    return dbres
}

module.exports = {
    queryList,
    insert,
    update,
    queryById

}