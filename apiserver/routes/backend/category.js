let express = require('express');
let router = express.Router();
let utils = require('../../common/utils')
let log = require('../../common/log')
let { Transaction, query } = require('../../common/mysql')
let multer = require('multer')

let categoryDao = require('../mdao/categoryDao');


router.get('/list', async function(req, res, next) {
    let resJson = {
        code: 20000,
        msg: '获取列表成功',
        data: null,
    }

    let dbres = await categoryDao.queryList()
    if (dbres != null) {
        resJson.data = dbres
    } else {
        resJson.code = 50000;
        resJson.msg = '获取列表失败'
        resJson.count = 0;
    }
    res.json(resJson)

});



module.exports = router;