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
const commentLikeModel = require('../../models/commentLike');

const {
    secretKey
} = require('../../common/constant');
const jwt = require("jsonwebtoken");
let concernModel = require('../../models/concern');

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
        id
    } = req.query;
    let token = utils.getRequestToken(req);
    let resJson = {
        code: 20000,
        msg: '获取问答详情与评论列表点赞列表成功',
        data: {
            topic: null,
            comments: null
        },
    }

    try {
        let user = jwt.verify(token, secretKey);
        // .sort({ 'createAt': -1 })
        let topics = await topicModel.findOne({
            _id: id
        })

        if (topics && user) {
            let topic = topics.toJSON()
                // 登陆人是否点赞
            let topicLikes = await topicLikeModel.find({
                topicId: topic.id,
                userId: user.userId
            })
            topic.isLike = topicLikes.length > 0 ? true : false

            // 登陆人是否收藏
            let topicCollects = await topicCollectModel.find({
                topicId: topic.id,
                userId: user.userId
            })
            topic.isCollect = topicCollects.length > 0 ? true : false

            // 登陆人是否关注
            let userConcerns = await concernModel.find({
                userId: user.userId,
                toUserId: topic.userId
            })
            topic.isConcern = userConcerns.length > 0 ? true : false


            topic.user = await userDao.queryMongoUserById(topic.userId)

            //评论
            let comments = await commentModel.find({
                topicId: id
            }).sort({
                'createAt': -1
            })
            for (const c in comments) {
                comments[c] = comments[c].toJSON()
                comments[c].user = await userDao.queryMongoUserById(comments[c].userId)

                // 登录人是否点赞
                let commentLikes = await commentLikeModel.find({
                    commentId: comments[c].id,
                    userId: user.userId
                })
                comments[c].isLike = commentLikes.length > 0 ? true : false


                // 查询回复个数
                comments[c].replyCount = await replyModel.count({ commentId: comments[c].id })
            }

            // 点赞
            let likes = await topicLikeModel.find({
                topicId: id
            }).sort({
                'createAt': 1
            }).skip(0).limit(7)
            for (const c in likes) {
                likes[c] = likes[c].toJSON()

                likes[c].user = await userDao.queryMongoUserById(likes[c].userId)
            }

            resJson.data.topic = topic
            resJson.data.comments = comments
            resJson.data.likes = likes
        } else {
            resJson.code = 50000;
            resJson.msg = '获取问答详情与评论列表失败';
            resJson.data = null
        }


    } catch (error) {
        console.log('报错了', error)
        resJson.code = 50000;
        resJson.msg = '获取问答详情与评论列表失败';
        resJson.data = error
    }
    res.json(resJson)

});


router.post('/create', async function(req, res, next) {
    let token = utils.getRequestToken(req);
    let {
        topicId,
        text
    } = req.body;

    let resJson = {
        code: 20000,
        msg: '上传问答成功',
        data: null,
    }

    try {
        let user = jwt.verify(token, secretKey);
        let updateRes = await topicModel.updateOne({
            _id: topicId
        }, {
            $inc: {
                commentNum: 1
            }
        });
        console.log('修改的返回', updateRes)

        let commentData = {
            topicId,
            text,
            userId: user.userId
        }
        let comment = new commentModel(commentData)
        console.log('实例化后的', comment)
        let saveRes = await comment.save()
        console.log('添加的返回', saveRes)

        // 添加消息
        await userDao.insertMessage(user.userId, topicId, 3, text)

        resJson.data = saveRes
    } catch (error) {
        resJson.code = 50000;
        resJson.msg = '上传评论失败';
        resJson.data = error
    }
    res.json(resJson)

});


router.put('/like', async function(req, res, next) {
    let token = utils.getRequestToken(req);
    let {
        id,
        status
    } = req.body;

    let resJson = {
        code: 20000,
        msg: `${status == 0 ? '取消' : ''}点赞成功`,
        data: null,
    }
    try {
        let user = jwt.verify(token, secretKey);

        let updateRes = await commentModel.updateOne({
            _id: id
        }, {
            $inc: {
                likeNum: status == 0 ? -1 : 1
            }
        });
        console.log('修改的返回', updateRes)
        let res;
        if (status == 1) {

            let commentLikeData = {
                commentId: id,
                userId: user.userId
            }
            let commentLike = new commentLikeModel(commentLikeData)
            console.log('实例化后的', commentLike)
            res = await commentLike.save()
            console.log('添加的返回', res)

            // 添加消息
            await userDao.insertMessage(user.userId, id, 5)
        } else {
            res = await commentLikeModel.deleteMany({
                commentId: id,
                userId: user.userId
            })
            console.log('删除的返回', res)
        }

        resJson.data = res
    } catch (error) {
        resJson.code = 50000;
        resJson.msg = `${status == 0 ? '取消' : ''}点赞失败`;
        resJson.data = error
    }

    res.json(resJson)

});




module.exports = router;