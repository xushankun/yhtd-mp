// miniprogram/pages/mine/mine.js
const app = getApp();
const db = wx.cloud.database()
const _ = db.command
Page({
    data: {
        isLogin: false,
        userInfo: null,
        isShowForm: false,
        actionKey: ''
    },
    onLoad: function(options) {

    },
    onShow: function() {
        if (!wx.getStorageSync('isLogin')) {
            this.onGetOpenid();
        } else {
            this.setData({
                isLogin: true,
                userInfo: wx.getStorageSync('userInfo')
            })
        }
    },
    // 获取openid并存储
    onGetOpenid() {
        // 调用云函数
        wx.cloud.callFunction({
            name: 'login',
            data: {}
        }).then(res => {
            this.onServices();
            this.onQueryUser(res.result.openid); // 去登录
        }).catch(err => {
            console.error('[云函数] [login] 调用失败', err)
        })
    },
    // 查询用户是否存在
    onQueryUser(openid) {
        let _that = this;
        db.collection('users').where({
            _openid: openid
        }).get().then(res => {
            if (res.data.length > 0) {
                console.log('用户已存在')
                _that.handleUserInfo(res);
            } else {
                console.log('用户不存在')
            }
        }).catch(err => {
            console.log(err)
        })
    },

    // 获取微信用户信息授权
    getUserInfoHandler: function(e) {
        let _that = this;
        if (this.data.userInfo) {
            return;
        }
        if (e.detail.userInfo) {
            let _userInfo = e.detail.userInfo;
            this.onAddUser(_userInfo);
        } else {
            wx.showToast({
                title: '当前登录需授权',
                icon: 'none'
            })
        }
    },
    // 新增用户
    onAddUser(obj) {
        let _that = this;
        obj.auth = 0;           // 权限默认普通用户0，管理员1 ，拉黑用户为2
        obj.createTime = db.serverDate()
        db.collection('users').add({
            data: obj
        }).then(res => {
            db.collection('users').where({
                _id: res._id
            }).get({
                success: res => {
                    console.log('新增用户成功:', res)
                    _that.handleUserInfo(res);
                },
                fail: err => {
                    console.log('users集合_id查询失败')
                }
            })
        }).catch(err => {
            console.log('新增用户失败')
        })
    },
    // 成功回掉
    handleUserInfo(res) {
        this.setData({
            isLogin: true,
            userInfo: res.data[0]
        })
        wx.setStorageSync('isLogin', true)
        wx.setStorageSync('userInfo', res.data[0])
        wx.showToast({
            title: '用户登录成功',
        })
    },
    onUserInfo() {
        wx.showModal({
            title: `我猜你是？`,
            content: `${this.data.userInfo.gender === 1 ? '男' : '女'}的`,
            showCancel: false
        })
    },
    // 关于
    showInfo() {
        wx.showModal({
            title: '开心每一天',
            content: '博客：https://shankun.top',
            showCancel: false
        })
    },
    longpress() {
        this.setData({
            isShowForm: true
        })
    },
    bindActionKey(e) {
        this.setData({
            actionKey: e.detail.value
        })
    },
    submitKey() {
        let _that = this;
        this.setData({
            isShowForm: false
        },()=>{
            if (_that.data.actionKey === '123456'){
                let _url = '../index/re' +'lease/release';
                wx.navigateTo({
                    url: _url,
                })
            }
        })
    },
    goDefriend(){
        wx.navigateTo({
            url: 'defriendList/defriendList',
        })
    }
})
