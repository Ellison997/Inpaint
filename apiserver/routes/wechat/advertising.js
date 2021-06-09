let express = require('express');
let router = express.Router();
let utils = require('../../common/utils')
let log = require('../../common/log')
let { Transaction, query } = require('../../common/mysql')
let multer = require('multer')
let questionDao = require('../mdao/questionDao');
let advertisingDao = require('../mdao/advertisingDao');


/**
 * @api {GET} /advertising/list    获取列表
 * @apiDescription 获取列表
 * @apiName advertisingList
 * @apiParam (query参数) {Number} limit 一页几条数据
 * @apiParam (query参数) {Number} page 第几页
 * @apiSampleRequest /advertising/list
 * @apiGroup advertising
 * @apiVersion 1.0.0
 */
router.get('/list', async function(req, res, next) {
    let { pageSize, pageIndex } = req.query;
    let resJson = {
        code: 20000,
        msg: '获取列表成功',
        data: null,
    }

    let dbres = await advertisingDao.queryList(pageSize * (pageIndex - 1), Number(pageSize))
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