const axios = require('axios')

// 创建axios实例
const service = axios.create({
    timeout: 30000 // 请求超时时间
})

// request拦截器
service.interceptors.request.use(
    config => {

        config.headers['authorization'] = 'authorization' // 让每个请求携带自定义token 请根据实际情况自行修改

        return config
    },
    error => {
        // Do something with request error
        Promise.reject(error)
    }
)

// response 拦截器
service.interceptors.response.use(
    response => {
        response.data
        return response.data

    },
    error => {
        console.log(`error:${error}`) // for debug
        return Promise.reject(error)
    }
)
module.exports = service