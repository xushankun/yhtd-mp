// miniprogram/pages/home.js
const app = getApp();
const db = wx.cloud.database();
const _dbc = 'kklist';
Page({
    data: {
        openid: '',

        pageIndex: 1,
        pageSize:8,
        listData: [],
        //无限滚动
        isEmptyData: false,
        searchLoading: true,
        searchLoadingComplete: false,

        isTop:false,

        isRelease:false

    },
    onLoad: function(options) {

    },
    onReady: function() {
      this.onGetOpenid();
    },
    onShow: function() {
  
    },
    // 获取openid 我们可以认为是登录
    onGetOpenid() {
        // 调用云函数
        wx.cloud.callFunction({
            name: 'login',
            data: {}
        }).then(res => {
            app.globalData.openid = res.result.openid
            this.setData({
                openid: res.result.openid
            })
            this.onQuery(false, true);
            this.onServices();
        }).catch(err => {
            console.error('[云函数] [login] 调用失败', err)
        })
    },
    onQuery(isBottom, isRefresh) {
        if (!isBottom) {
            this.setData({
                pageIndex: 1
            })
        }
        // 分页
        let _skip = (this.data.pageIndex - 1) * this.data.pageSize;     // 从多少条开始返回
        let _limit = this.data.pageSize;    // 最多返回多少条
        db.collection(_dbc).limit(_limit).skip(_skip).orderBy('createTime','desc').get().then(res => {
            console.log('[数据库] [查询记录] 成功: ', res.data)
            let _res = res.data;
            // _res = []
            if(_res.length){
                _res.map(item => {
                    if (item.createTime) {
                        item.newTime = this.timeDiff(item.createTime)
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
                    searchLoading: false,
                    searchLoadingComplete: true
                })
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
                    wx.stopPullDownRefresh();
                }, 500)
            }
           
        }).catch(err => {
            wx.showToast({
                icon: 'none',
                title: '查询记录失败'
            })
            console.error('[数据库] [查询记录] 失败：', err)
        });
    },
    onServices(){
        db.collection('services').get().then(res=>{
            console.log(res)
            if(res.data.length) {
                this.setData({
                    isRelease: res.data[0].isRelease
                })
            } else {
                this.setData({
                    isRelease: false
                })
            }
        })
    },
    timeDiff (_date) {
        let currTime = new Date(); //开始时间
        let _timeDiff = currTime.getTime() - _date.getTime() //时间差的毫秒数

        //计算出相差天数
        let days = Math.floor(_timeDiff / (24 * 3600 * 1000))

        //计算出小时数
        let leave1 = _timeDiff % (24 * 3600 * 1000) //计算天数后剩余的毫秒数
        let hours = Math.floor(leave1 / (3600 * 1000))
        //计算相差分钟数
        let leave2 = leave1 % (3600 * 1000) //计算小时数后剩余的毫秒数
        let minutes = Math.floor(leave2 / (60 * 1000))
        //计算相差秒数
        let leave3 = leave2 % (60 * 1000) //计算分钟数后剩余的毫秒数
        let seconds = Math.round(leave3 / 1000)
        // console.log(" 相差 " + days + "天 " + hours + "小时 " + minutes + " 分钟" + seconds + " 秒")
        let _time = '';
        if (days === 0) {
            _time = hours + "小时 " + minutes + "分钟 "
            if (hours === 0) {
                if (minutes === 0){
                    _time = seconds + "秒 "
                } else {
                    _time = minutes + "分钟 "
                }
            }
        } else if (days === -1) {
            _time = Math.abs(seconds - 0) + " 秒"
        } else {
            _time = days + "天 "
        }

        return _time
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
    backTop () {
        wx.pageScrollTo({
            scrollTop: 0
        })
    },
    onPageScroll: function (e) {
        if (e.scrollTop > 280) {
            this.setData({
                isTop: true
            });
        } else {
            this.setData({
                isTop: false
            });
        }
    },
    onPullDownRefresh() {
        wx.showToast({
            title: '加载中...',
            icon: 'loading'
        })
        this.onGetOpenid();
        setTimeout(()=>{
            wx.stopPullDownRefresh();
        },1500)
    } ,
    onReachBottom(){
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