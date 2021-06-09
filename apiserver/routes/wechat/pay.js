let express = require('express');
let router = express.Router();
let utils = require('../../common/utils')
let log = require('../../common/log')
let { Transaction, query } = require('../../common/mysql')
let multer = require('multer')
let payDao = require('../mdao/payDao');
let informationDao = require('../mdao/informationDao');
let { partnerKey, appId, mchid } = require('../../config')
const request = require('./../../common/request');
const wxpay = require('./../../common/wxpay');
const jwt = require("jsonwebtoken");
const {
    secretKey
} = require('./../../common/constant');

// 支付订单相关

const config = {
    appid: appId,
    mchid,
    partnerKey

}

const wxpayapi = new wxpay(config, true);

// 添加订单
router.post('/addOrder', async function(req, res, next) {
    let { type } = req.body;
    console.log('支付类型：', type, type == 1 ? 25 * 100 : 48 * 100)
    let resJson = {
        code: 20000,
        msg: '添加订单并小程序支付统一下单成功！',
        data: null,
    }

    try {
        let token = utils.getRequestToken(req);
        let user = jwt.verify(token, secretKey);
        // console.log('当前用户:', user)

        let pay = {
            out_trade_no: utils.ran(13),
            body: '辐考刷题VIP 购买',
            total_fee: type == 1 ? 25 * 100 : 48 * 100,
            // total_fee: type,
            openid: user.openId,
            notify_url: 'https://radial.aixiao.group/wpay/notify'
        }

        // 将订单插入数据库
        await payDao.insert({
            number: pay.out_trade_no,
            userId: user.userId,
            description: type,
            total: pay.total_fee,
            state: 0
        })

        let resd = await wxpayapi.getPayParams(pay);

        console.log('统一下单返回', resd)

        resJson.data = resd;
    } catch (error) {
        log.error(error)
        resJson.code = 50000;
        resJson.msg = error
    }


    res.json(resJson)

});

router.post('/notify', wxpayapi.middlewareForExpress('pay'), async(req, res, next) => {
    console.log('post 支付结果通知：', typeof req.weixin, req.weixin)
    let { result_code, out_trade_no } = req.weixin

    // 业务逻辑...
    if (result_code == 'SUCCESS') {
        await payDao.update({
            number: out_trade_no,
            state: 1
        })
    } else {
        await payDao.update({
            number: out_trade_no,
            state: 2
        })
    }

    // 回复消息(参数为空回复成功, 传值则为错误消息)
    // res.reply('错误消息' || '');
    res.reply();
});


router.get('/isPay', async function(req, res, next) {
    let resJson = {
        code: 20000,
        msg: '成功',
        data: true,
    }
    res.json(resJson)
});


module.exports = router;