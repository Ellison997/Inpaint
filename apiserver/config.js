let oracleConfig = {
    user: 'demo',
    //用户名
    password: 'demo',
    //密码
    //IP:数据库IP地址，PORT:数据库端口，SCHEMA:数据库名称
    //connectString: 'localhost:1521/oral'
    connectString: '(DESCRIPTION =(ADDRESS_LIST =(ADDRESS = (PROTOCOL = TCP)(HOST = 60.12.236.227)(PORT = 1521)))(CONNECT_DATA = (SID = oral)))',
    // edition: 'ORA$BASE', // used for Edition Based Redefintion
    // events: true, // whether to handle Oracle Database FAN and RLB events or support CQN
    // externalAuth: false, // whether connections should be established using External Authentication
    // homogeneous: true, // all connections in the pool have the same credentials
    // poolAlias: 'default', // set an alias to allow access to the pool via a name.
    // poolIncrement: 1, // only grow the pool by one connection at a time
    // poolMax: 4, // maximum size of the pool. Increase UV_THREADPOOL_SIZE if you increase poolMax
    // poolMin: 0, // start with no connections; let the pool shrink completely
    // poolPingInterval: 60, // check aliveness of connection if idle in the pool for 60 seconds
    // poolTimeout: 60, // terminate connections that are idle in the pool for 60 seconds
    // queueTimeout: 60000, // terminate getConnection() calls in the queue longer than 60000 milliseconds
    // sessionCallback: myFunction, // function invoked for brand new connections or by a connection tag mismatch
    // stmtCacheSize: 30 // number of statements that are cached in the statement cache of each connection
}


// "oracledb": "^4.0.1",





let log4jsConfig = {
    type: "dateFile",
    filename: './logs/apiserver', //您要写入日志文件的路径,格式为  '路径/文件名'
    alwaysIncludePattern: true, //（默认为false） - 将模式包含在当前日志文件的名称以及备份中
    //compress: true,//（默认为false） - 在滚动期间压缩备份文件（备份文件将具有.gz扩展名）
    pattern: "-yyyy-MM-dd.log", //（可选，默认为.yyyy-MM-dd） - 用于确定何时滚动日志的模式。格式:.yyyy-MM-dd-hh:mm:ss.log
    encoding: 'utf-8', //default "utf-8"，文件的编码
    // maxLogSize: 1000 //文件最大存储空间，当文件内容超过文件存储空间会自动生成一个文件xxx.log.1的序列自增长的文件
}


// 测试
// const appId = 'wxd107cbeae6bbcccf'
// const appSecret = '21456f9b9b6b8e3044b14a57589e0b08'

// 辐考刷题
const appId = 'wx637a3971e0202244'
const appSecret = '6cc5e9fd947ad2bc08e64f04ced375b1'
const partnerKey = '24122959740a11eba66a0242ac110003'
const mchid = '1604856336'



// 线上
// let mysqlConfig = require('../../config/mdbconfig').fukaoDbConfig
// let portObj = require('../../config/mportconfig').portObj
// let auth = require('../../config/config').auth

// let privateKeyPath = '../../' + auth.erpPrivateKeyPath;
// let certificatePath = '../../' + auth.erpCertificatePath;

// const port = portObj.fkPort;
// const sslport = portObj.fkSslPort;


//------------------------------------------------------------

// 本地调试
let mysqlConfig = {
    host: '39.100.202.213',
    user: 'root',
    password: 'xccloud',
    database: 'radial',
    timezone: '+08:00',
    dateStrings: true,
    connectionLimit: 20
}


let privateKeyPath = './certificate/com.key';
let certificatePath = './certificate/com.crt';
const port = 1013;
const sslport = 1201;


module.exports = {
    oracleConfig,
    mysqlConfig,
    log4jsConfig,
    port,
    sslport,
    appId,
    appSecret,
    mchid,
    partnerKey,
    privateKeyPath,
    certificatePath

}