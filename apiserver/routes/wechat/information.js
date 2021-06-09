let express = require('express');
let router = express.Router();
let utils = require('../../common/utils')
let log = require('../../common/log')
let { Transaction, query } = require('../../common/mysql')
let multer = require('multer')
let questionDao = require('../mdao/questionDao');
let informationDao = require('../mdao/informationDao');


/**
 * @api {GET} /information/list    获取列表
 * @apiDescription 获取列表
 * @apiName informationList
 * @apiParam (query参数) {Number} limit 一页几条数据
 * @apiParam (query参数) {Number} page 第几页
 * @apiParam (query参数) {String} realname 姓名
 * @apiParam (query参数) {String} phone 手机号码
 * @apiSampleRequest /information/list
 * @apiGroup information
 * @apiVersion 1.0.0
 */
router.get('/list', async function(req, res, next) {
    let { pageSize, pageIndex, title } = req.query;
    let resJson = {
        code: 20000,
        msg: '获取列表成功',
        data: null,
    }

    let dbres = await informationDao.queryList(pageSize * (pageIndex - 1), Number(pageSize), title)
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



/**
 * @api {GET} /information/list    获取列表
 * @apiDescription 获取列表
 * @apiName informationList
 * @apiParam (path参数) {Number} id 资讯ID
 * @apiSampleRequest /information/list
 * @apiGroup information
 * @apiVersion 1.0.0
 */
router.get('/list/:id', async function(req, res, next) {
    let { id } = req.params;
    let resJson = {
        code: 20000,
        msg: '获取资讯成功',
        data: null,
    }

    let dbres = await informationDao.queryById(id)
    if (dbres != null && dbres.length > 0) {
        resJson.data = dbres[0];
    } else {
        resJson.code = 50000;
        resJson.msg = '获取资讯失败'
    }
    res.json(resJson)

});


module.exports = router;