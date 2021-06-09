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
const {
    secretKey
} = require('./../../common/constant');
const jwt = require("jsonwebtoken");
const concern = require('../../models/concern');
const topicLikeModel = require('../../models/topicLike');
const topicCollectModel = require('../../models/topicCollect');
let userDao = require('../mdao/userDao');

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
        }).skip(Number(pageIndex) * Number(pageSize)).limit(Number(pageSize))
        for (const t in topics) {
            topics[t] = topics[t].toJSON()
            topics[t].user = await userDao.queryMongoUserById(topics[t].userId)

            // 是否点赞
            let topicLikes = await topicLikeModel.find({
                topicId: topics[t].id,
                userId: user.userId
            })
            topics[t].isLike = topicLikes.length > 0 ? true : false
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


router.get('/concernlist', async function(req, res, next) {
    let token = utils.getRequestToken(req);
    let {
        pageSize,
        pageIndex
    } = req.query;
    let resJson = {
        code: 20000,
        msg: '获取关注的问答列表成功',
        data: null,
    }

    try {
        let user = jwt.verify(token, secretKey);
        let concernRes = await concernModel.find({
            'userId': user.userId
        }, 'toUserId')
        let concernIds = concernRes.map(i => i.toUserId)

        let topics = await topicModel.find({
                'userId': {
                    $in: concernIds
                }
            })
            .sort({
                'createAt': -1
            }).skip(Number(pageIndex) * Number(pageSize)).limit(Number(pageSize))
        for (const t in topics) {
            topics[t] = topics[t].toJSON()
            topics[t].user = await userDao.queryMongoUserById(topics[t].userId)
                // 是否点赞
            let topicLikes = await topicLikeModel.find({
                topicId: topics[t].id,
                userId: user.userId
            })
            topics[t].isLike = topicLikes.length > 0 ? true : false
        }
        resJson.data = topics
    } catch (error) {
        console.log('报错了', error)
        resJson.code = 50000;
        resJson.msg = '获取关注的问答列表失败';
        resJson.data = error
    }
    res.json(resJson)

});


router.get('/hotlist', async function(req, res, next) {
    let {
        pageSize,
        pageIndex
    } = req.query;
    let token = utils.getRequestToken(req);
    let resJson = {
        code: 20000,
        msg: '获取热门问答列表成功',
        data: null,
    }

    try {
        let user = jwt.verify(token, secretKey);
        let topics = await topicModel.find().sort({
            'commentNum': -1,
            'likeNum': -1,
            'createAt': -1
        }).skip(Number(pageIndex) * Number(pageSize)).limit(Number(pageSize))
        for (const t in topics) {
            topics[t] = topics[t].toJSON()
            topics[t].user = await userDao.queryMongoUserById(topics[t].userId)

            // 是否点赞
            let topicLikes = await topicLikeModel.find({
                topicId: topics[t].id,
                userId: user.userId
            })
            topics[t].isLike = topicLikes.length > 0 ? true : false
        }
        resJson.data = topics
    } catch (error) {
        console.log('报错了', error)
        resJson.code = 50000;
        resJson.msg = '获取热门问答列表失败';
        resJson.data = error
    }
    res.json(resJson)

});



router.post('/create', async function(req, res, next) {
    let token = utils.getRequestToken(req);
    let {
        title,
        text,
        images
    } = req.body;

    let resJson = {
        code: 20000,
        msg: '上传问答成功',
        data: null,
    }
    try {
        let user = jwt.verify(token, secretKey);
        let topicData = {
            title,
            text,
            images,
            userId: user.userId
        }
        let topic = new topicModel(topicData)
        console.log('实例化后的', topic)
        let saveRes = await topic.save()
        console.log('添加的返回', saveRes)
        resJson.data = saveRes
    } catch (error) {
        resJson.code = 50000;
        resJson.msg = '上传问答失败';
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

        let updateRes = await topicModel.updateOne({
            _id: id
        }, {
            $inc: {
                likeNum: status == 0 ? -1 : 1
            }
        });
        console.log('修改的返回', updateRes)
        let res;
        if (status == 1) {

            let topicLikeData = {
                topicId: id,
                userId: user.userId
            }
            let topicLike = new topicLikeModel(topicLikeData)
            console.log('实例化后的', topicLike)
            res = await topicLike.save()
            console.log('添加的返回', res)

            // 添加消息
            await userDao.insertMessage(user.userId, id, 4)
        } else {
            res = await topicLikeModel.deleteMany({
                topicId: id,
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


router.put('/collect', async function(req, res, next) {
    let token = utils.getRequestToken(req);
    let {
        id,
        status
    } = req.body;

    let resJson = {
        code: 20000,
        msg: `${status == 0 ? '取消' : ''}收藏成功`,
        data: null,
    }
    try {
        let user = jwt.verify(token, secretKey);

        let updateRes = await topicModel.updateOne({
            _id: id
        }, {
            $inc: {
                collectNum: status == 0 ? -1 : 1
            }
        });
        console.log('修改的返回', updateRes)

        let res;
        if (status == 1) {
            let topicCollectData = {
                topicId: id,
                userId: user.userId
            }
            let topicCollect = new topicCollectModel(topicCollectData)
            console.log('实例化后的', topicCollect)
            res = await topicCollect.save()
            console.log('添加的返回', res)

            // 添加消息
            await userDao.insertMessage(user.userId, id, 2)
        } else {
            res = await topicCollectModel.deleteMany({
                topicId: id,
                userId: user.userId
            })
            console.log('删除的返回', res)
        }
        resJson.data = res
    } catch (error) {
        resJson.code = 50000;
        resJson.msg = `${status == 0 ? '取消' : ''}收藏失败`,
            resJson.data = error
    }

    res.json(resJson)

});


router.get('/collectList', async function(req, res, next) {
    let {
        pageSize,
        pageIndex
    } = req.query;
    let token = utils.getRequestToken(req);
    let resJson = {
        code: 20000,
        msg: '获取问答收藏列表成功',
        data: null,
    }

    try {
        let user = jwt.verify(token, secretKey);

        let topicCollects = await topicCollectModel.find({
            userId: user.userId
        }).sort({
            'createAt': -1
        }).skip(Number(pageIndex) * Number(pageSize)).limit(Number(pageSize))


        for (const tc in topicCollects) {
            topicCollects[tc] = topicCollects[tc].toJSON()
            console.log('收藏关联', topicCollects[tc].topicId)
            let topicRes = await topicModel.findOne({
                _id: topicCollects[tc].topicId
            })
            let topic = topicRes.toJSON();
            topic.user = await userDao.queryMongoUserById(topic.userId)
            topicCollects[tc].topic = topic

        }
        resJson.data = topicCollects
    } catch (error) {
        console.log('报错了', error)
        resJson.code = 50000;
        resJson.msg = '获取问答收藏列表失败';
        resJson.data = error
    }
    res.json(resJson)
});


router.get('/likeList', async function(req, res, next) {
    let {
        pageSize,
        pageIndex
    } = req.query;
    let token = utils.getRequestToken(req);
    let resJson = {
        code: 20000,
        msg: '获取问答点赞列表成功',
        data: null,
    }

    try {
        let user = jwt.verify(token, secretKey);

        let topicLikes = await topicLikeModel.find({
            userId: user.userId
        }).sort({
            'createAt': -1
        }).skip(Number(pageIndex) * Number(pageSize)).limit(Number(pageSize))


        for (const tc in topicLikes) {
            topicLikes[tc] = topicLikes[tc].toJSON()
            let topicRes = await topicModel.findOne({
                _id: topicLikes[tc].topicId
            })
            let topic = topicRes.toJSON();
            topic.user = await userDao.queryMongoUserById(topic.userId)
            topicLikes[tc].topic = topic

        }
        resJson.data = topicLikes
    } catch (error) {
        console.log('报错了', error)
        resJson.code = 50000;
        resJson.msg = '获取问答点赞列表失败';
        resJson.data = error
    }
    res.json(resJson)
});







module.exports = router;