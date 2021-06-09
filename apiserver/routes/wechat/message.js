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
let messageModel = require('../../models/message');
let userModel = require('../../models/user');
let commentModel = require('../../models/comment');
let userDao = require('../mdao/userDao');
const topicLikeModel = require('../../models/topicLike');
const topicCollectModel = require('../../models/topicCollect');

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
        pageSize,
        pageIndex
    } = req.query;
    let token = utils.getRequestToken(req);
    let resJson = {
        code: 20000,
        msg: '获取消息列表成功！',
        data: null,
    }

    try {
        let user = jwt.verify(token, secretKey);
        let messages = await messageModel.find({
                toUserId: user.userId
            }).sort({
                'createAt': -1
            })
            .skip(Number(pageIndex) * Number(pageSize)).limit(Number(pageSize))


        for (const m in messages) {
            messages[m] = messages[m].toJSON()
            messages[m].user = await userDao.queryMongoUserById(messages[m].userId)
            let type = messages[m].type
            if (type == 2 || type == 3 || type == 4) {
                let resTopic = await topicModel.findOne({
                    _id: messages[m].topicId
                })
                if (resTopic) {
                    let topic = resTopic.toJSON()
                    messages[m].topic = topic
                }

            } else if (type == 5) {
                let resComment = await commentModel.findOne({
                    _id: messages[m].commentId
                })
                if (resComment) {
                    let comment = resComment.toJSON()
                    messages[m].comment = comment
                }
            } else {
                console.log('关注的消息')
            }
        }

        resJson.data = messages

    } catch (error) {
        console.log('报错了', error)
        resJson.code = 50000;
        resJson.msg = '获取消息列表失败！';
        resJson.data = error
    }
    res.json(resJson)

});


module.exports = router;