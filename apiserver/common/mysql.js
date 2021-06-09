const mysql = require('mysql')
const mysqlConfig = require('./../config').mysqlConfig;
const log = require('./log')
let util = require('./utils')

const pool = mysql.createPool(mysqlConfig)
let query = function (sql, values, note) {
    return new Promise((resolve, reject) => {
        pool.getConnection(function (err, connection) {
            if (err) {
                reject(err)
            } else {
                log.info(note, sql, util.nullStrToNull(values))
                connection.query(sql, util.nullStrToNull(values), (err, rows) => {
                    if (err) {
                        reject(err)
                    } else {
                        resolve(rows)
                    }
                    connection.release()
                })
            }
        })
    })
}


const raw_query = (connection, sql, params) => {
    return new Promise((resolve, reject) => {
        connection.query(sql, params, function (error, results, fields) {
            if (error) {
                reject(error)
            } else {
                resolve(results)
            }
        })
    })
}
class Transaction {
    constructor() {
        this.connection = mysql.createConnection(mysqlConfig);
        this.stack = [];
    }
    query(sql, params) {
        this.stack.push({
            statement: sql,
            params
        })
    }
    exec() {
        let that = this;
        return new Promise((resolve, reject) => {
            that.connection.beginTransaction(async (err) => {
                if (err) {
                    reject(err)
                }
                for (let i in that.stack) {
                    log.info(that.stack[i].statement, that.stack[i].params)
                    try {
                        await raw_query(that.connection, that.stack[i].statement, that.stack[i].params)
                    } catch (error) {
                        that.rollback()
                        console.log("回滚事务了")
                        reject(error)
                        break;
                    }

                }
                that.connection.commit((err) => {
                    if (err) {
                        console.log('提交事务报错了')
                        reject(err)
                    } else {
                        console.log('提交事务完成了')
                        resolve(true)
                    }
                    console.log('断开连接吗')
                    that.connection.end()
                })
            })
        })

    }
    /**
       * 回滚事务
       */
    rollback() {
        this.connection.rollback()
    }


}
module.exports = {
    Transaction,
    query
}