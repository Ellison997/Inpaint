const mongoose = require('mongoose');
const moment = require('moment')
const db = require('../common/mongoose');

const Schema = mongoose.Schema;

const ModelSchema = new Schema({
    userId: String,
    createAt: {
        type: Date,
        default: Date.now,
        get: v => moment(v).format('MM-DD HH:mm')
    },
    userName: String,
    fetchUrl: String
}, {
    toJSON: {
        getters: true
    }
});


module.exports = db.model('User', ModelSchema);