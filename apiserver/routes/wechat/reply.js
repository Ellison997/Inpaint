let express = require('express');
let router = express.Router();
let utils = require('../../common/utils')
let log = require('../../common/log')
let {
    Transaction,
    query
} = require('../../common/mysql')
const moment = require('moment')
let topicModel = require('../../models/topic');
let userModel = require('../../models/user');
let commentModel = require('../../models/comment');
let replyModel = require('../../models/reply');
let userDao = require('../mdao/userDao');
const topicLikeModel = require('../../models/topicLike');
const topicCollectModel = require('../../models/topicCollect');

const {
    secretKey
} = require('../../common/constant');
const jwt = require("jsonwebtoken");
let concernModel = require('../../models/concern');

/**
 * @api {GET} /topic/list    获取回复列表
 * @apiDescription 获取回复列表
 * @apiName replyList
 * @apiParam (query参数) {Number} limit 一页几条数据
 * @apiParam (query参数) {Number} page 第几页
 * @apiSampleRequest /topic/list
 * @apiGroup topic
 * @apiVersion 1.0.0
 */
router.get('/list', async function(req, res, next) {
    let {
        id
    } = req.query;
    let token = utils.getRequestToken(req);
    let resJson = {
        code: 20000,
        msg: '获取讨论详情与回复列表点赞列表成功',
        data: {
            comment: null,
            replys: null
        },
    }

    try {
        let user = jwt.verify(token, secretKey);
        // .sort({ 'createAt': -1 })
        let comments = await commentModel.findOne({
            _id: id
        })

        if (comments && user) {
            let comment = comments.toJSON()

            comment.user = await userDao.queryMongoUserById(comment.userId)

            //回复
            let replys = await replyModel.find({
                commentId: id
            }).sort({
                'createAt': -1
            })
            for (const c in replys) {
                replys[c] = replys[c].toJSON()
                replys[c].user = await userDao.queryMongoUserById(replys[c].userId)
                console.log('这是回复的用户ID', replys[c].supUserId)
                if (replys[c].supUserId) {
                    let supUser = await userDao.queryMongoUserById(replys[c].supUserId)
                    replys[c].supUserName = supUser.userName;
                } else {
                    replys[c].supUserName = ''
                }
            }

            resJson.data.comment = comment
            resJson.data.replys = replys
        } else {
            resJson.code = 50000;
            resJson.msg = '获取回复详情与回复列表失败';
            resJson.data = null
        }


    } catch (error) {
        console.log('报错了', error)
        resJson.code = 50000;
        resJson.msg = '获取回复详情与回复列表失败';
        resJson.data = error
    }
    res.json(resJson)

});


router.post('/create', async function(req, res, next) {
    let token = utils.getRequestToken(req);
    let {
        commentId,
        text
    } = req.body;

    let resJson = {
        code: 20000,
        msg: '上传讨论回复成功',
        data: null
    }

    try {
        let user = jwt.verify(token, secretKey);
        let updateRes = await commentModel.updateOne({
            _id: commentId
        }, {
            $inc: {
                replyNum: 1
            }
        });
        console.log('修改的返回', updateRes)

        let replyData = {
            commentId,
            text,
            userId: user.userId
        }
        let reply = new replyModel(replyData)
        console.log('实例化后的', reply)
        let saveRes = await reply.save()
        console.log('添加的返回', saveRes)

        await userDao.insertMessage(user.userId, commentId, 6, text)

        resJson.data = saveRes
    } catch (error) {
        resJson.code = 50000;
        resJson.msg = '上传讨论回复失败';
        resJson.data = error
    }
    res.json(resJson)

});



router.post('/replyCreate', async function(req, res, next) {
    let token = utils.getRequestToken(req);
    let {
        commentId,
        text,
        supUserId,
        replyId
    } = req.body;

    let resJson = {
        code: 20000,
        msg: '上传回复成功',
        data: null
    }

    try {
        let user = jwt.verify(token, secretKey);
        let updateRes = await commentModel.updateOne({
            _id: commentId
        }, {
            $inc: {
                replyNum: 1
            }
        });
        console.log('修改的返回', updateRes)

        let replyData = {
            commentId,
            text,
            userId: user.userId,
            supUserId,
            replyId
        }
        let reply = new replyModel(replyData)
        console.log('实例化后的', reply)
        let saveRes = await reply.save()
        console.log('添加的返回', saveRes)
        await userDao.insertMessage(user.userId, commentId, 7, text, supUserId)

        resJson.data = saveRes
    } catch (error) {
        resJson.code = 50000;
        resJson.msg = '上传回复失败';
        resJson.data = error
    }
    res.json(resJson)

});




module.exports = router;