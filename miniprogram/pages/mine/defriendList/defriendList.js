// miniprogram/pages/mine/defriendList/defriendList.js
const app = getApp();
const db = wx.cloud.database();
const _dbc = 'defriend';
Page({
    data: {
        listData: null
    },
    unDefriend(e) {
        let _that = this;
        let _openid = e.currentTarget.dataset.openid
        db.collection(_dbc).where({
            defriendOpendid: _openid
        }).get().then(res => {
            if (res.data.length > 0) {
                db.collection(_dbc).doc(e.currentTarget.dataset.id).remove().then(res => {
                    wx.showToast({
                        title: '操作成功'
                    })
                    _that.getDefriendList();
                })
            }
        })
    },
    getDefriendList() {
        db.collection(_dbc).orderBy('createTime', 'desc').get().then(res => {
            this.setData({
                listData: res.data
            })
        })
    },
    onLoad: function(options) {

    },
    onShow: function() {
        this.getDefriendList();
    },
    onHide: function() {

    },
    onUnload: function() {

    },
    onPullDownRefresh: function() {

    },
    onReachBottom: function() {

    },
    onShareAppMessage: function() {

    }
})