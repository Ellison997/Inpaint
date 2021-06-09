let express = require('express');
let router = express.Router();
let utils = require('../../common/utils')
let log = require('../../common/log')
let { Transaction, query } = require('../../common/mysql')
let multer = require('multer')

let userDao = require('../mdao/userDao');




/**
 * @api {GET} /question/list    获取列表
 * @apiDescription 获取列表
 * @apiName questionList
 * @apiParam (query参数) {Number} limit 一页几条数据
 * @apiParam (query参数) {Number} page 第几页
 * @apiParam (query参数) {String} realname 姓名
 * @apiParam (query参数) {String} phone 手机号码
 * @apiSampleRequest /question/list
 * @apiGroup question
 * @apiVersion 1.0.0
 */
router.get('/list', async function(req, res, next) {
    let { pageSize, pageIndex, userName } = req.query;
    let resJson = {
        code: 20000,
        msg: '获取列表成功',
        data: null,
    }

    let dbres = await userDao.queryList(pageSize * (pageIndex - 1), Number(pageSize), userName)
    if (dbres.data != null) {
        resJson.data = dbres.data;
        resJson.count = dbres.count;
    } else {
        resJson.code = 50000;
        resJson.msg = '获取列表失败'
        resJson.count = 0;
    }
    res.json(resJson)

});



module.exports = router;