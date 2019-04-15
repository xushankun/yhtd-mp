// miniprogram/pages/mine/userList/userList.js
const app = getApp();
const db = wx.cloud.database();
const _dbc = 'users';
Page({
    data: {
        listData: null
    },
    getUserList() {
        db.collection(_dbc).orderBy('createTime', 'desc').get().then(res => {
            console.log()
            res.data.map(item => {
                if (item.createTime) {
                    item.newTime = app.util.formatDate(new Date(item.createTime), 'yy-MM-dd hh:mm');
                   
                }
            })
            this.setData({
                listData: res.data
            })
        })
    },
    // 拉黑
    onDefriend(e) {
        let _openid = e.currentTarget.dataset.openid;
        db.collection(_dbc).where({
            _openid: _openid
        }).get().then(res => {
            if (res.data.length > 0) {
                let _duserInfo = res.data[0];
                db.collection('defriend').where({
                    defriendOpenid: _openid
                }).get().then(res => {
                    if (res.data.length > 0) {
                        wx.showToast({
                            title: '该用户已经被拉黑',
                            icon: "none"
                        })
                    } else {
                        let _obj = {
                            avatarUrl: _duserInfo.avatarUrl,
                            nickName: _duserInfo.nickName,
                            defriendId: _duserInfo._id,
                            defriendOpenid: _openid
                        }
                        wx.cloud.callFunction({
                            name: 'defriend',
                            data: {
                                _obj: _obj
                            }
                        }).then(res => {
                            wx.cloud.callFunction({
                                name: 'updateuser',
                                data: {
                                    _id: _duserInfo._id,
                                    _obj: {
                                        auth: 2
                                    }
                                }
                            }).then(res => {
                                wx.showToast({
                                    title: '操作成功'
                                })
                            })
                        })
                    }
                })
            } else {
                console.log('用户不存在')
            }
        }).catch(err => {
            console.log(err)
        })

    },
    onLoad: function(options) {

    },
    onReady: function() {

    },
    onShow: function() {
        this.getUserList();
    },

    onPullDownRefresh: function() {

    },
    onReachBottom: function() {

    }
})