// miniprogram/pages/home.js
const app = getApp();
const db = wx.cloud.database();
const _ = db.command;
const _dbc = 'kklist';
Page({
    data: {
        openid: '',
        isHeader: false,

        searchValue:'',
        pageIndex: 1,
        pageSize: 10,
        listData: [],
        //无限滚动
        isEmptyData: false,
        searchLoading: true,
        searchLoadingComplete: false,

        isAI:false,
        isRelease: false,
        isRefreshStatus: true,
        // 权限默认普通用户0，管理员1 ，拉黑用户为2
        auth: 0,
        openid: '',
        appid: ''
    },
    onLoad: function(options) {

    },
    onReady: function() {
        this.onGetOpenid();
    },
    onUnload() {

    },
    onShow: function() {
        this.onServices();
        let _isLogin = wx.getStorageSync('isLogin');
        let _userInfo = wx.getStorageSync('userInfo');
        if (_isLogin) {
            this.onQueryUser(_userInfo._openid);
            wx.showShareMenu({
                withShareTicket: true
            })
        }
    },

    // 获取openid 我们可以认为是登录
    onGetOpenid() {
        // 调用云函数
        wx.cloud.callFunction({
            name: 'login',
            data: {}
        }).then(res => {
            app.globalData.openid = res.result.openid;
            app.globalData.appid = res.result.appid

            this.setData({
                openid: res.result.openid,
                appid: res.result.appid
            })
            this.onQuery(false, true);
        }).catch(err => {
            console.error('[云函数] [login] 调用失败', err)
        })
    },
    // 搜索
    bindKeyInput(e){
        console.log(e.detail.value)
        this.setData({
            searchValue: e.detail.value
        },()=>{
            this.onQuery(false, true);
        })
    },
    onQuery(isBottom, isRefresh) {
        if (!isBottom) {
            this.setData({
                pageIndex: 1
            })
        }
        // 分页
        let _skip = (this.data.pageIndex - 1) * this.data.pageSize; // 从多少条开始返回
        let _limit = this.data.pageSize; // 最多返回多少条
        db.collection(_dbc).where({
            // 模糊查询
            content: db.RegExp({
                regexp: this.data.searchValue, //从搜索栏中获取的value作为规则进行匹配。
                options: 'i',    //大小写不区分
            })
        }).limit(_limit).skip(_skip).orderBy('createTime', 'desc').get().then(res => {
            console.log('[数据库] [查询记录] 成功: ', res.data)
            let _res = res.data;
            if (_res.length) {
                _res.map(item => {
                    if (item.createTime) {
                        item.newTime = app.util.timeDiff(item.createTime)
                    }
                })
                let searchList = [];
                //如果isScreen是true则数据等于res.data.rows，否则先从原来的数据继续添加
                if (!isBottom) {
                    searchList = _res;
                } else {
                    searchList = this.data.listData.concat(_res)
                }
                this.setData({
                    listData: searchList,
                    isEmptyData: false,
                    searchLoading: true,
                    searchLoadingComplete: false
                })
                if (_res.length < _limit) {
                    this.setData({
                        searchLoading: false,
                        searchLoadingComplete: true
                    })
                }
            } else {
                if (!isBottom) {
                    // 如果是刷新【下拉等】返回空，则清空所有【pageIndex = 1时】
                    this.setData({
                        listData: []
                    })
                }
                this.setData({
                    isEmptyData: true,
                    searchLoading: false,
                    searchLoadingComplete: true
                });
            }

            if (isRefresh) {
                setTimeout(() => {
                    this.setData({
                        isRefreshStatus: false
                    })
                }, 200)
            }

        }).catch(err => {
            wx.showToast({
                icon: 'none',
                title: '查询记录失败'
            })
            console.error('[数据库] [查询记录] 失败：', err)
        });
    },
    onServices() {
        db.collection('services').get().then(res => {
            if (res.data.length) {
                this.setData({
                  isAI: res.data[0].isAI,
                    isRelease: res.data[0].isRelease
                })
            } else {
                this.setData({
                  isAI:false,
                    isRelease: false
                })
            }
        })
    },
    previewImage(e) {
        let _currUrl = e.currentTarget.dataset.currUrl;
        let _index = e.currentTarget.dataset.index;
        let _imgIndex = e.currentTarget.dataset.imgIndex;
        let _urls = this.data.listData[_index].image;
        wx.previewImage({
            current: _currUrl,
            urls: _urls
        })
    },
    onQueryUser(openid) {
        let _that = this;
        db.collection('users').where({
            _openid: openid
        }).get().then(res => {
            if (res.data.length > 0) {
                wx.setStorageSync('userInfo', res.data[0]);
                _that.setData({
                    auth: res.data[0].auth,
                    openid: res.data[0]._openid
                })
            }
        }).catch(err => {
            console.log(err)
        })
    },
    actionBtn(e) {
        let _that = this;
        let _itemList = [];
        let _isLogin = wx.getStorageSync('isLogin');
        let _openid = e.currentTarget.dataset.openid;
        if (this.data.auth === 1 && _openid !== this.data.openid) {
            _itemList = ['删除', '拉黑该用户'];
        } else {
            _itemList = ['删除'];
        }
        wx.showActionSheet({
            itemList: _itemList,
            success(res) {
                if (!_isLogin) {
                    wx.showToast({
                        title: '您还未登录,请先登录~',
                        icon: 'none'
                    })

                    setTimeout(() => {
                        wx.navigateTo({
                            url: '../login/login',
                        })
                    }, 1000)
                    return;
                }
                if (res.tapIndex === 0) {
                    wx.showModal({
                        title: '警告',
                        content: '删除后不可恢复，继续吗？',
                        success(res) {
                            if (res.confirm) {
                                _that.onDelete(e);
                            }
                        }
                    })
                } else if (res.tapIndex === 1) {
                    wx.showModal({
                        title: '警告',
                        content: '拉黑该用户后，用户将被禁止发帖',
                        success(res) {
                            if (res.confirm) {
                                _that.onDefriend(e);
                            }
                        }
                    })
                }
            }
        })
    },
    // 删除帖子
    onDelete(e) {
        let _that = this;
        let _imgid = e.currentTarget.dataset.imgid;
        wx.cloud.callFunction({
            name: 'delItem',
            data: {
                _id: e.currentTarget.dataset.id,
                _imgid: _imgid
            }
        }).then(res => {
            if (res.result.stats.removed === 1) {
                // 存在图片则删除图片
                if (_imgid.length) {
                    wx.cloud.deleteFile({
                        fileList: _imgid
                    }).then(res => {
                        console.log(res.fileList)
                    }).catch(err => {
                        console.log(err)
                    })
                }
                wx.showToast({
                    title: '操作成功'
                })
                _that.refresh();
            } else {
                wx.showToast({
                    title: '操作失败',
                    icon: "none"
                })
            }
        })
    },
    // 拉黑
    onDefriend(e) {
        let _openid = e.currentTarget.dataset.openid;
        db.collection('users').where({
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
    backTop() {
        wx.pageScrollTo({
            scrollTop: 0
        })
        this.onServices();
        this.refresh();
    },
    onPageScroll: app.util.throttle(function(e) {
        if (e.scrollTop > 60 && !this.data.isHeader) {
            this.setData({
                isHeader: true
            })
        }
        if (e.scrollTop < 60 && this.data.isHeader) {
            this.setData({
                isHeader: false
            })
        }
    }, 10),

    refresh() {
        this.setData({
            searchLoading: true,
            searchLoadingComplete: false,
            isRefreshStatus: true
        })
        this.onGetOpenid();
    },
    onReachBottom() {
        this.setData({
            searchLoading: false,
            searchLoadingComplete: false,
        })
        // 如果非空则可以请求
        if (!this.data.isEmptyData) {
            this.setData({
                searchLoading: true,
                searchLoadingComplete: false,
                pageIndex: this.data.pageIndex + 1 //pageIndex+1  
            });
        } else {
            this.setData({
                searchLoading: false,
                searchLoadingComplete: true
            })
        }
        this.onQuery(true, false)
    }
})