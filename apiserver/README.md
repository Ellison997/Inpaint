# Express 最佳实践

## 生成接口文档 hahah

``` 
npm install -g apidoc

apidoc -i ./routes/ -o ./dist/apidoc

```

https://pay.weixin.qq.com/wiki/doc/api/jsapi.php?chapter=9_7

{
 appid: 'wx637a3971e0202244',
 bank_type: 'OTHERS',
 cash_fee: '1',
 fee_type: 'CNY',
 is_subscribe: 'N',
 mch_id: '1604856336',
 nonce_str: 'CcWKIIqJAX9IRJQI',
 openid: 'oSSR-5VB8sxnQXRMVR0RcB02IzKo',
 out_trade_no: '1616254860325',
 result_code: 'SUCCESS',
 return_code: 'SUCCESS',
 sign: '68DE883F1C0859E894C74DBF1025C716',
 time_end: '20210320234130',
 total_fee: '1',
 trade_type: 'JSAPI',
 transaction_id: '4200000879202103208254998715'
}
