const mongoose = require('mongoose');
const moment = require('moment')
const db = require('../common/mongoose');

const Schema = mongoose.Schema;

const ModelSchema = new Schema({
    userId: String,
    toUserId: String,
    topicId: String,
    commentId: String,
    type: Number,
    text: String,
    createAt: {
        type: Date,
        default: Date.now,
        get: v => moment(v).format('MM-DD HH:mm')
    }
}, { toJSON: { getters: true } });

// type    1.关注   2.收藏   3.评论   4.动态点赞  5.评论点赞  6.回复 7 回复讨论


module.exports = db.model('Message', ModelSchema);