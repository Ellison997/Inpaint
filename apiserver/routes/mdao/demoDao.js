let db = require('../../common/mysql')
let log = require('../../common/log')
let utils = require('../../common/utils')

// 查询列表
let queryList = async(index, size, realname, phone) => {
    let sqlrealname = (realname == '' ? `and 1=1` : `and u.realname like '%${realname}%'`)
    let sqlphone = (phone == '' ? `and 1=1` : `and u.phone like '%${phone}%'`)

    let sql = `select u.* from GY_LOGIN u where u.usertype=1 ${sqlrealname} ${sqlphone} limit ?,?`
    let values = [index, size]

    let sqlCount = `select count(*) as count from GY_LOGIN u where u.usertype=1 ${sqlrealname} ${sqlphone}`
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
let update = async(u) => {
    let updateLoginSql = `update GY_LOGIN set realname=?,username=?,phone=?,password=? where id=?`;
    let dbres = null
    try {
        dbres = await db.query(updateLoginSql, [u.realname, u.username, u.phone, utils.md5(u.password), u.id], 'update')

    } catch (error) {
        log.error('update', error)
    }
    return dbres
}


// 添加
let insert = async(u) => {
    let sql = `insert into 
                GY_UNIT(id,createtime,unitname,unittype,unitaddress,unitcontact,unitphone,photoUrl)
                values
                (uuid(),now(),?,?,?,?,?,?)`
    let values = [u.unitname, 1, u.unitaddress, u.unitcontact, u.unitphone, u.photoUrl]


    let dbres = null;
    try {
        dbres = await db.query(sql, values, 'insert')
    } catch (error) {
        log.error('insert', error)
    }
    return dbres
}

module.exports = {
    insert,
    update,
    queryList,
    queryById
}