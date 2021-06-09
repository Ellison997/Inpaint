const mongoose = require('mongoose');
const moment = require('moment')
const db = require('../common/mongoose');

const Schema = mongoose.Schema;

const ModelSchema = new Schema({
    commentId: String,
    createAt: {
        type: Date,
        default: Date.now,
        get: v => moment(v).format('MM-DD HH:mm')
    },
    userId: String,
    text: String,
    supUserId: String,
    replyId: String,
    images: [String],
    likeNum: {
        type: Number,
        default: 0
    },
}, { toJSON: { getters: true } });


module.exports = db.model('Reply', ModelSchema);