const mongoose = require('mongoose');
const moment = require('moment')
const db = require('../common/mongoose');

const ModelSchema = new mongoose.Schema({
    userId: String,
    createAt: {
        type: Date,
        default: Date.now,
        get: v => moment(v).format('MM-DD HH:mm')
    },
    title: String,
    text: String,
    images: [String],
    // 点赞
    likeNum: {
        type: Number,
        default: 0
    },
    // 评论
    commentNum: {
        type: Number,
        default: 0
    },
    // 收藏
    collectNum: {
        type: Number,
        default: 0
    },
    isAvailable: {
        type: Boolean,
        default: true
    }
}, { toJSON: { getters: true } });

module.exports = db.model('Topic', ModelSchema);