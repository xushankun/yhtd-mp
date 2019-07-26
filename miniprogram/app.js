//app.js
const apiConfig = require('./utils/request.js').apiConfig;
const api = require('./utils/api.js');
const util = require('./utils/util.js');

App({
    apiConfig: apiConfig,
    api: api,
    util: util,
    onLaunch: function () {
      this.checkUpdate()
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
    },
    // prevPage
    prevPage: function () {
        let pages = getCurrentPages(); //当前页面
        return pages[pages.length - 2]; //上一页面
    },
    checkUpdate(){
      const updateManager = wx.getUpdateManager()

      updateManager.onCheckForUpdate(function (res) {
        // 请求完新版本信息的回调
        if (!res.hasUpdate){
          console.log('当前已是最新版本')
        } else {
          console.log('您有新版本需要更新')
        }
      })

      updateManager.onUpdateReady(function () {
        wx.showModal({
          title: '更新提示',
          content: '新版本已经准备好，是否重启应用？',
          showCancel: false,
          success(res) {
            if (res.confirm) {
              // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
              updateManager.applyUpdate()
            }
          }
        })
      })

      updateManager.onUpdateFailed(function () {
        // 新版本下载失败
        console.log('意外：新版本下载失败')
      })
    }
})
