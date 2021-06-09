const log4js = require('log4js');
const log4jsConfig = require('./../config').log4jsConfig;


log4js.configure({ //配置log4js模块
    appenders: {
        xcLogFile: log4jsConfig,
        xcLogConsole: {
            type: 'console'
        }
    },
    categories: {
        default: {
            appenders: ['xcLogFile', 'xcLogConsole'],
            level: 'all'
        },
        xcLogFile: {
            appenders: ['xcLogFile'],
            level: 'all'
        },
        xcLogConsole: {
            appenders: ['xcLogConsole'],
            level: log4js.levels.ALL
        }
    }
});

module.exports = log4js.getLogger();