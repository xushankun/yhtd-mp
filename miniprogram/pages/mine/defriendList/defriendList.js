// miniprogram/pages/mine/defriendList/defriendList.js
const app = getApp();
const db = wx.cloud.database();
const _dbc = 'defriend';
Page({
    data: {
        listData:null
    },
    unDefriend(e){
        let _openid = e.currentTarget.dataset.openid
        console.log('取消拉黑');
        console.log(_openid)
        db.collection('users').where({
            _openid: _openid
        }).get().then(res=>{
               if (res.data.length > 0) {
                let _duserInfo = res.data[0];
                db.collection('users').doc(res.data[0]._id).update({
                    data: {
                        auth: 0
                    },
                }).then(res => {
                    db.collection(_dbc).where({
                        _openid: _openid
                    }).get().then(res => {
                        if (res.data.length > 0) {
                            db.collection(_dbc).doc(e.currentTarget.dataset.id).remove().then(res=>{
                                wx.showToast({
                                    title: '操作成功'
                                })
                            })
                        }
                    })

                })
            } else {
                console.log('用户不存在')
            }
        }).catch(err => {
            console.log(err)
        })











        db.collection(_dbc).doc(res.data[0]._id).update({
            data: {
                auth: 0
            },
        })

        db.collection(_dbc).where({
            _openid: _openid
        }).then(res=>{
            db.collection(_dbc).doc(res.data[0]._id).update({
                data: {
                    auth: 0
                },
            })
        })
     
    },
    getDefriendList(){
        db.collection(_dbc).orderBy('createTime', 'desc').get().then(res=>{
            console.log(res)
            // this.setData({
            //     listData:res.data
            // })
        })
    },
    onLoad: function (options) {

    },
    onShow: function () {
        this.getDefriendList();
    },
    onHide: function () {

    },
    onUnload: function () {

    },
    onPullDownRefresh: function () {

    },
    onReachBottom: function () {

    },
    onShareAppMessage: function () {

    }
})