const mongoose = require('mongoose');
const moment = require('moment')
const db = require('../common/mongoose');

const Schema = mongoose.Schema;

// 用户关注

const ModelSchema = new Schema({
    createAt: {
        type: Date,
        default: Date.now,
        get: v => moment(v).format('MM-DD HH:mm')
    },
    userId: String,
    toUserId: String
}, {
    toJSON: {
        getters: true
    }
}, { toJSON: { getters: true } });


module.exports = db.model('Concern', ModelSchema);