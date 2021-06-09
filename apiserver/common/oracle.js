const oracledb = require('oracledb');
const oracleConfig = require('./../config').oracleConfig;
const log = require('./log')

async function createOraclePool() {
    try {
        // Create a connection pool which will later be accessed via the
        // pool cache as the 'default' pool.
        await oracledb.createPool(oracleConfig);
        oracledb.maxRows = 0;
        oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
        oracledb.autoCommit = true;
        log.info('Connection pool started');

        // Now the pool is running, it can be used
        // await dostuff();

    } catch (err) {
        log.error('init() error: ' + err.message);
    }
}
/**
 * 
 * @param {*} note 查询说明
 * @param {*} sql 执行的sql语句
 * @param {*} options oracle执行选项
 * @param {*} values 可选，插入sql中的值，默认为[]
 * @param {*} iflog 可选，是否生成执行日志，默认为true
 */
async function query(note, sql, values = [], paging = [], options = {}, iflog = false) {
    let connection;
    let pagingSql = null;
    try {

        // Get a connection from the default pool
        connection = await oracledb.getConnection(oracleConfig);
        oracledb.maxRows = 0;
        oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
        oracledb.autoCommit = true;
        log.info('Connection started');
        log.info('======> 获取数据库连接')
            // const sql = `SELECT sysdate FROM dual WHERE :b = 1`;
            // const values = [1];
            // const options = { outFormat: oracledb.OUT_FORMAT_OBJECT };


        if (paging.length != 0) { // 分页sql
            let start = Number(paging[0]) * Number(paging[1]);
            let end = start + Number(paging[1]);
            pagingSql = `SELECT *
                        FROM (SELECT A.*, ROWNUM RN
                                FROM (${sql}) A
                            WHERE ROWNUM <= ${end})
                        WHERE RN > ${start}`
        }
        if (iflog) {
            log.info(note, (pagingSql != null ? pagingSql : sql), values, options)
        }
        const result = await connection.execute((pagingSql != null ? pagingSql : sql), values, options);

        if (result.hasOwnProperty('rows')) { // 查询
            log.info('数据条数：', result.rows.length)
            return result.rows;
        } else {
            log.info(result)
            return result;
        }
    } catch (err) {
        log.info(note, (pagingSql != null ? pagingSql : sql), values, options)
        log.error(note, 'ERROR===>', err);
    } finally {
        if (connection) {
            try {
                // Put the connection back in the pool
                await connection.close();
                log.info('======> 关闭数据库连接')
            } catch (err) {
                log.error(err);
            }
        }
    }
}

async function closePoolAndExit() {
    log.info('\nTerminating');
    try {
        // Get the pool from the pool cache and close it when no
        // connections are in use, or force it closed after 10 seconds
        // If this hangs, you may need DISABLE_OOB=ON in a sqlnet.ora file
        await oracledb.getPool().close(10);
        log.info('Pool closed');
        process.exit(0);
    } catch (err) {
        log.error(err.message);
        process.exit(1);
    }
}





module.exports = { createOraclePool, closePoolAndExit, query }