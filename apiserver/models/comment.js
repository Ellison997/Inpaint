const mongoose = require('mongoose');
const moment = require('moment')
const db = require('../common/mongoose');

const Schema = mongoose.Schema;

const ModelSchema = new Schema({
    userId: String,
    topicId: String,
    createAt: {
        type: Date,
        default: Date.now,
        get: v => moment(v).format('MM-DD HH:mm')
    },
    text: String,
    images: {
        type: Array,
        default: []
    },
    replyNum: {
        type: Number,
        default: 0
    },
    likeNum: {
        type: Number,
        default: 0
    }
}, { toJSON: { getters: true } });


module.exports = db.model('Comment', ModelSchema);