let express = require('express');
let router = express.Router();
let utils = require('../common/utils')
let log = require('../common/log')
let multer = require('multer')
let demoDao = require('./mdao/demoDao')

/**
 * @api {GET} /demo/list    获取列表
 * @apiDescription 获取列表
 * @apiName demoList
 * @apiParam (query参数) {Number} limit 一页几条数据
 * @apiParam (query参数) {Number} page 第几页
 * @apiParam (query参数) {String} realname 姓名
 * @apiParam (query参数) {String} phone 手机号码
 * @apiSampleRequest /demo/list
 * @apiGroup demo
 * @apiVersion 1.0.0
 */
router.get('/list', async function (req, res, next) {
    let pageSize = req.query.limit;
    let pageIndex = req.query.page;
    let realname = req.query.realname;
    let phone = req.query.phone;
    let resJson = {
        code: 20000,
        msg: '获取列表成功',
        data: null,
    }

    let dbres = await demoDao.queryList(pageSize * (pageIndex - 1), Number(pageSize), realname, phone)
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
 * @api {POST} /demo/add   添加
 * @apiDescription 添加
 * @apiName add
 * @apiParam (body参数) {String} Ledgername 名称
 * @apiParam (body参数) {Number} Ledgertype 类型
 * @apiParam (body参数) {String} Ledgeraddress 地址
 * @apiParam (body参数) {String} Ledgercontact   联系人
 * @apiParam (body参数) {String} Ledgerphone  联系人电话
 * @apiParam (body参数) {Number} demoname 名
 * @apiParam (body参数) {String} password    密码
 * @apiParam (body参数) {String} photoUrl   照片
 * @apiSampleRequest /demo/add
 * @apiGroup demo
 * @apiVersion 1.0.0
 */
router.post('/add', async function (req, res, next) {
    let Ledger = req.body;
    let dbres = await ledgerDao.insertLedger(Ledger)
    let resJson = {
        code: 20000,
        msg: '添加成功',
        data: null
    }
    if (dbres != null) {
        resJson.data = dbres
    } else {
        resJson.code = 50000;
        resJson.msg = '添加失败'
    }
    res.json(resJson)
});


/**
 * @api {PUT} /demo/update   修改
 * @apiDescription 修改
 * @apiName update
 * @apiParam (body参数) {String} id  ID
 * @apiParam (body参数) {String} realname  真实姓名
 * @apiParam (body参数) {String} demoname 名
 * @apiParam (body参数) {String} phone   手机号
 * @apiParam (body参数) {String} password  密码
 * @apiSampleRequest /demo/updateEpa
 * @apiGroup demo
 * @apiVersion 1.0.0
 */
router.put('/update', async function (req, res, next) {
    let demoBody = req.body;

    let dbres = await demoDao.update(demoBody)
    let resJson = {
        code: 20000,
        msg: '修改成功',
        data: null
    }
    if (dbres != null && dbres.changedRows != 0) {
        resJson.data = dbres;
    } else {
        resJson.code = 50000;
        resJson.msg = '修改失败'
    }
    res.json(resJson)
});

module.exports = router;