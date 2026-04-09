// 封装 Axios
// const axios = require('axios');
//
// // fixme 箭头函数的变形要熟悉 下面是原生的 axios练习
//
// // 发送 GET请求
// axios.get('http://localhost:8080/api/v1/')
//     .then(res => {
//         // 处理成功的情况
//         console.log(res.data)
//     })
//     .catch(err => {
//         // 处理错误的情况
//         console.log(err)
//     })
//     .finally(() => {
//         // 总是会执行
//         console.log('执行完毕啦，这里是finally块')
//     });
//
// // 发送 POST请求
// axios.post('/user', {
//     firstName: 'Fred',
//     lastName: 'Flintstone'
// })
//     .then(function (response) {
//         console.log(response);
//     })
//     .catch(function (error) {
//         console.log(error);
//     });

import axios from "axios";
import router from "@/router/router.js";

// 创建axios实例
const request = axios.create({
    baseURL: '/api',
    timeout: 10000,
    // headers: {'X-Custom-Header': 'foobar'}
});

// 请求拦截器 发送请求前做的事
request.interceptors.request.use(config => {
    const token = localStorage.getItem("token");

    if (token) {
        config.headers.Authorization = token;
    }
    // todo 写着玩的
    config.headers.Authorization = 'of course...';

    return config;
})

// 响应拦截器
request.interceptors.response.use(response => {
    console.log('完整的响应信息：', response);
    const {code, msg, data} = response.data;

    // 成功
    if (code === 200) {
        return data;
    }

    // 未登录 统一处理
    if (code === 401) {
        localStorage.removeItem("token");
        router.push("/login");
    }

    // 其他错误
    alert(msg || '请求失败啦')
    return Promise.reject(response.data);
}, error => {
    console.log(error.message || '网络错误');
    return Promise.reject(error);
})

export default request