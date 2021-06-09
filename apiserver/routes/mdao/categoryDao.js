let db = require('../../common/mysql')
let log = require('../../common/log')
let utils = require('../../common/utils')

// 查询列表
let queryList = async() => {
    let sql = `select * from CATEGORY u where 1=1  ORDER BY u.id`
    let data = null
    try {
        data = await db.query(sql, [], 'queryCategoryList')

    } catch (error) {
        log.error('queryCategoryList', error)
    }
    return data
}


module.exports = {
    queryList
}