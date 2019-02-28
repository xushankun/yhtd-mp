// miniprogram/pages/mine/mine.js
const app = getApp();
const db = wx.cloud.database()
const _ = db.command
Page({
    data: {
        isLogin: false,
        userInfo: null
    },
    onLoad: function(options) {

    },
    onShow: function() {
        let _isLogin = wx.getStorageSync('isLogin');
        if (!_isLogin) {
            wx.showToast({
                title: '您还未登录,请先登录~',
                icon: 'none',
                duration: 800
            })
            setTimeout(() => {
                wx.navigateTo({
                    url: '../login/login',
                })
            }, 800)
        }  else {
            this.setData({
                isLogin: true,
                userInfo: wx.getStorageSync('userInfo')
            })
        }
    },
    // 关于
    showInfo() {
        wx.showModal({
            title: '开心每一天',
            content: '博客：https://shankun.top',
            showCancel: false
        })
    },
    connectAuther() {
        wx.showModal({
            title: '快去博客给他留言吧',
            content: 'https://shankun.top',
            confirmText:"复制地址",
            // showCancel: false,
            success(res) {
                if (res.confirm) {
                    wx.setClipboardData({
                        data: 'https://shankun.top',
                        success(res) {
                            wx.getClipboardData({
                                success(res) {
                                    wx.showToast({
                                        title: 'url复制成功',
                                        icon: "none"
                                    })
                                }
                            })
                        }
                    })
                } else if (res.cancel) {
                    console.log('用户点击取消')
                }
            }
        })
    },
    goDefriend(){
        wx.navigateTo({
            url: 'defriendList/defriendList',
        })
    },
    backPage(){
        wx.navigateBack({
            delta: 1
        })
    }
})
