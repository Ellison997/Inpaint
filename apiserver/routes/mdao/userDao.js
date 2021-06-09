let db = require('../../common/mysql')
let log = require('../../common/log')
let utils = require('../../common/utils')

let userModel = require('../../models/user');
let messageModel = require('../../models/message');
let topicModel = require('../../models/topic');
let commentLikeModel = require('../../models/commentLike');
let commentModel = require('../../models/comment');



// 查询列表
let queryList = async(index, size, userName) => {
    let sqlUserName = (!userName ? `and 1=1` : `and u.userName like '%${userName}%'`)
    let sql = `select * from USER u where 1=1 ${sqlUserName} ORDER BY u.lastTime,u.userName desc limit ?,?`
    let sqlCount = `select count(*) as count from USER u where 1=1 ${sqlUserName}`

    let data = null
    let dbcount = [];
    let count = 0;
    try {
        data = await db.query(sql, [index, size], 'queryUserList')
        dbcount = await db.query(sqlCount, [], 'queryListCount')
        count = dbcount[0].count;
    } catch (error) {
        log.error('queryUserList', error)
    }
    return {
        data,
        count
    }
}


// 查询ID 
let queryByNameAndPwd = async(userName, pwd) => {
    let sql = `
        select * from USER where userName = ? AND pwd = ? `

    let dbres = null;
    try {
        dbres = await db.query(sql, [userName, pwd], 'queryByNameAndPwd')
    } catch (error) {
        log.error('queryByNameAndPwd', error)
    }
    return dbres
}

// 查询ID 
let queryByOpenId = async(openId) => {
    let sql = `
        select * from USER where openId = ? `
    let values = [openId]
    let dbres = null;
    try {
        dbres = await db.query(sql, values, 'queryByOpenId')
    } catch (error) {
        log.error('queryByOpenId', error)
    }
    return dbres
}


let queryById = async(id) => {
    let sql = `
        select * from USER where id = ? `
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
    let updateLoginSql = `
        update USER set userName = ? , fetchUrl = ? , country = ? , province = ? , city = ? , sex = ? , language = ? , lastTime = NOW() where id = ? `;
    let dbres = null
    try {
        dbres = await db.query(updateLoginSql, [u.nickName, u.avatarUrl, u.country, u.province, u.city, u.gender, u.language, u.id], 'update')

    } catch (error) {
        log.error('update', error)
    }
    return dbres
}


// 添加
let insert = async(openId) => {
    let sql = `
        insert into USER(id, createTime, openId) values(uuid(), now(), ? )
        `
    let values = [openId]
    let dbres = null;
    try {
        dbres = await db.query(sql, values, 'insertUser')
    } catch (error) {
        log.error('insertUser', error)
    }
    return dbres
}

let queryMongoUserById = async(userId) => {
    let resUser = await userModel.findOne({
        userId
    })
    let user = null
    if (resUser) {
        user = resUser.toJSON();
    } else {
        console.log('没查到对象')
            // 从mysql 查出来
        let quser = await db.query('SELECT * FROM USER WHERE id=?', [userId], '根据用户ID 查询用户')
        if (quser && quser.length > 0) {
            let userData = {
                userId: quser[0].id,
                userName: quser[0].userName,
                fetchUrl: quser[0].fetchUrl
            }

            let userM = new userModel(userData)
            let saveRes = await userM.save()
            user = saveRes.toJSON();
        }
    }
    return user;

}

let insertMessage = async(userId, othersId, type, text = null, reserved = null) => {
    let toUserId = null;
    let message = null;
    let topicId = null;
    let commentId = null;
    if (type == 1) {
        toUserId = othersId
    } else if (type == 2 || type == 3 || type == 4) {
        let resTopic = await topicModel.findOne({
            _id: othersId
        })
        if (resTopic) {
            let topic = resTopic.toJSON()
            toUserId = topic.userId
        }
        topicId = othersId;
    } else if (type == 5) {
        let resComment = await commentModel.findOne({
            _id: othersId
        })
        if (resComment) {
            let comment = resComment.toJSON()
            toUserId = comment.userId
        }
        commentId = othersId;
    } else if (type == 6) {
        let resComment = await commentModel.findOne({
            _id: othersId
        })
        if (resComment) {
            let comment = resComment.toJSON()
            toUserId = comment.userId
        }
        commentId = othersId;
    } else {
        toUserId = reserved;
        commentId = othersId;
    }
    if (toUserId && (userId != toUserId)) {
        let messageData = {
            userId,
            toUserId,
            topicId,
            commentId,
            type,
            text
        }
        let messageM = new messageModel(messageData)
        let saveRes = await messageM.save()
        message = saveRes.toJSON();
    }
    return message
}


module.exports = {
    insert,
    update,
    queryByNameAndPwd,
    queryList,
    queryByOpenId,
    queryById,
    queryMongoUserById,
    insertMessage
}