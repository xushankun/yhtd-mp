//app.js
//app.js
const apiConfig = require('./utils/request.js').apiConfig;
const api = require('./utils/api.js');
const util = require('./utils/util.js');

App({
    apiConfig: apiConfig,
    api: api,
    util: util,
    onLaunch: function () {

        if (!wx.cloud) {
            console.error('请使用 2.2.3 或以上的基础库以使用云能力')
        } else {
            // 小程序在开始使用云能力前需进行初始化【全局初始化】
            wx.cloud.init({
                env: 'shankun-r-7ee811',     // 这里填写【环境ID】 而不是环境名
                traceUser: true,    // 是否在将用户访问记录到用户管理中，在控制台中可见
            })
        }

        this.globalData = {}
    }
})
