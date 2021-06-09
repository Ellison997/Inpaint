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
let concernModel = require('../../models/concern');
let commentModel = require('../../models/comment');
let replyModel = require('../../models/reply');
let replyLikeModel = require('../../models/replyLike');
const {
    secretKey
} = require('./../../common/constant');
const jwt = require("jsonwebtoken");
const concern = require('../../models/concern');
const topicLikeModel = require('../../models/topicLike');
const topicCollectModel = require('../../models/topicCollect');
let userDao = require('../mdao/userDao');
let messageModel = require('../../models/message');
const commentLikeModel = require('../../models/commentLike');

/**
 * @api {GET} /topic/list    获取问答列表
 * @apiDescription 获取问答列表
 * @apiName topicList
 * @apiParam (query参数) {Number} limit 一页几条数据
 * @apiParam (query参数) {Number} page 第几页
 * @apiSampleRequest /topic/list
 * @apiGroup topic
 * @apiVersion 1.0.0
 */
router.get('/list', async function(req, res, next) {
    let {
        pageSize,
        pageIndex
    } = req.query;
    let token = utils.getRequestToken(req);
    let resJson = {
        code: 20000,
        msg: '获取问答列表成功',
        data: null,
    }

    try {
        let user = jwt.verify(token, secretKey);
        let topics = await topicModel.find().sort({
            'createAt': -1
        }).skip(Number(pageIndex - 1) * Number(pageSize)).limit(Number(pageSize))
        for (const t in topics) {
            topics[t] = topics[t].toJSON()
            topics[t].user = await userDao.queryMongoUserById(topics[t].userId)

            //评论
            let comments = await commentModel.find({
                topicId: topics[t].id
            }).sort({
                'createAt': -1
            })
            for (const c in comments) {
                comments[c] = comments[c].toJSON()
                comments[c].user = await userDao.queryMongoUserById(comments[c].userId)
            }

            topics[t].comments = comments
        }
        resJson.data = topics
    } catch (error) {
        console.log('报错了', error)
        resJson.code = 50000;
        resJson.msg = '获取问答列表失败';
        resJson.data = error
    }
    res.json(resJson)
});



router.delete('/deletee', async function(req, res, next) {
    let { topicId } = req.query;
    let token = utils.getRequestToken(req);
    let resJson = {
        code: 20000,
        msg: '删除问答讨论成功！',
        data: null
    }

    try {
        // 删除相关评论通知
        await messageModel.deleteMany({
            topicId
        })

        // 删除讨论点赞
        await topicLikeModel.deleteMany({
            topicId
        })

        // 删除讨论收藏
        await topicCollectModel.deleteMany({
            topicId
        })

        // 删除评论
        let comments = await commentModel.find({
            topicId
        })
        for (const c in comments) {
            comments[c] = comments[c].toJSON()
            await deleteComment(comments[c].id, topicId)
        }

        // 删除讨论
        await topicModel.deleteOne({
            _id: topicId
        })

        console.log('删除问答讨论执行完了')
    } catch (error) {
        log.error(error)
        resJson.code = 50000;
        resJson.msg = error
    }

    res.json(resJson)
});



router.delete('/deleteComment', async function(req, res, next) {
    let { commentId, topicId } = req.query;
    let token = utils.getRequestToken(req);
    let resJson = {
        code: 20000,
        msg: '删除评论成功！',
        data: null
    }

    try {
        await deleteComment(commentId, topicId)

        console.log('删除评论执行完了')
    } catch (error) {
        log.error(error)
        resJson.code = 50000;
        resJson.msg = error
    }

    res.json(resJson)
});


async function deleteComment(commentId, topicId) {
    // 删除相关评论回复通知
    await messageModel.deleteMany({
        commentId
    })

    // 删除评论点赞
    await commentLikeModel.deleteMany({
        commentId
    })

    // 删除评论回复
    await replyModel.deleteMany({
        commentId
    })

    // 删除评论
    await commentModel.deleteOne({
        _id: commentId
    })

    // 评论数 -1
    await topicModel.updateOne({
        _id: topicId
    }, {
        $inc: {
            commentNum: -1
        }
    });
}

module.exports = router;