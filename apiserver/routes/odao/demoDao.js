/**
 * 库房管理
 */


let db = require('../../common/oracle')

// 查询列表
let queryList = async(paging) => {
    let sql = `select 
        ID,NAME,SELFRFID,ROOMRFID,JLV,LNG,LAT,TO_CHAR(SELFRFIDUPDATETIME, 'YYYY-MM-DD HH24:MI:SS') as SELFRFIDUPDATETIME,
        OUTALARM,AVALARM,JLVALARM,RFIDFLAG,JLVFLAG,AVFLAG,TO_CHAR(CREATETIME, 'YYYY-MM-DD HH24:MI:SS') as CREATETIME,VIDEOID,ROOMTYPE
        from ROOM`
    let sqlCount = `select count(*) as count from ROOM`
    let values = []

    let data = null;
    let dbcount = null;
    let count = 0;

    data = await db.query('queryRoom', sql, values, paging)
    dbcount = await db.query('queryRoomCount', sqlCount, values)
    count = dbcount[0].COUNT;

    return { data, count }
}


//  插入
let insert = async(rd) => {
    let sql = `insert into 
               ROOMDATA (ID,ROOMID,JLV,CREATETIME)
               VALUES
               (lower(sys_guid()),:roomId,:jlv,SYSDATE)`
    let updateRoomSql = `update ROOM set JLV=:jlv where ID=:id`

    let values = [rd.id, rd.jlv]
    let updateValues = [rd.jlv, rd.id]
    let data = null;
    data = await db.query('insertRoomData', sql, values)
    await db.query('updateRoom', updateRoomSql, updateValues)
    return data
}

// 查询
let queryById = async(roomId, paging) => {
    let sql = `select 
                ID,ROOMID,JLV,TO_CHAR(CREATETIME, 'YYYY-MM-DD HH24:MI:SS') as CREATETIME 
                from 
                ROOMDATA where ROOMID=:roomId ORDER BY CREATETIME desc`

    let values = [roomId]
    let data = null;

    data = await db.query('queryRoom', sql, values, paging)

    return data
}

// 修改
let update = async(roomId) => {
    let sql = `update ROOM set RESETALARM=1 where ID=:roomId`

    let values = [roomId]
    let data = null;

    data = await db.query('updateResetAlarm', sql, values)

    return data
}

module.exports = {
    queryList,
    insert,
    queryById,
    update
}