let db = require('../../common/mysql')
let log = require('../../common/log')
let utils = require('../../common/utils')

// 查询列表
let queryList = async(index, size, number) => {
    let sqlNumber = (!number ? `and 1=1` : `and o.number like '%${number}%'`)
    let sql = `select o.*,u.userName,u.fetchUrl,u.lastTime from PAY_ORDER o 
                left join USER u
                on o.userId=u.id
                where 1=1  ${sqlNumber}
                order by o.createTime
                limit ?,?`
    let values = [index, size]

    let sqlCount = `select count(*) as count from PAY_ORDER  where 1=1  ${sqlNumber}`
    let data = null
    let dbcount = null;
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
    let sql = `select s.*,u.id as uid,u.unitaddress,u.unitcontact,u.unitname,u.unitphone,u.unittype,
                u.photoUrl as unitPhotoUrl,u.lng as unitLng,u.lat as unitLat from GY_SOURCE s
                left join GY_UNIT u
                on s.unitid=u.id
                where s.id=?`
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
let update = async(p) => {
    let updateSql = `update PAY_ORDER set state=? where number=?`;
    let dbres = null
    try {
        dbres = await db.query(updateSql, [p.state, p.number], 'updatePay')

    } catch (error) {
        log.error('updatePay', error)
    }
    return dbres
}


// 添加
let insert = async(p) => {
    let sql = `insert into PAY_ORDER(id,createTime,number,userId,description,total,state)
    values(uuid(),now(),?,?,?,?,?)`
    let values = [p.number, p.userId, p.description, p.total, p.state]

    let dbres = null;
    try {
        dbres = await db.query(sql, values, 'insertPay')
    } catch (error) {
        log.error('insertPay', error)
    }
    return dbres
}

module.exports = {
    insert,
    update,
    queryList,
    queryById
}