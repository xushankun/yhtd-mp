// miniprogram/pages/home.js
const app = getApp();
const db = wx.cloud.database();
const _dbc = 'kklist';
Page({
  data: {
    openid: '',
    isHeader:false,

    pageIndex: 1,
    pageSize: 8,
    listData: [],
    //无限滚动
    isEmptyData: false,
    searchLoading: true,
    searchLoadingComplete: false,

    isTop: false,
    isRelease: false,
    // 权限默认普通用户0，管理员1 ，拉黑用户为2
    auth: 0,
    openid: ''
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
    }
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
    let _skip = (this.data.pageIndex - 1) * this.data.pageSize; // 从多少条开始返回
    let _limit = this.data.pageSize; // 最多返回多少条
    db.collection(_dbc).limit(_limit).skip(_skip).orderBy('createTime', 'desc').get().then(res => {
      console.log('[数据库] [查询记录] 成功: ', res.data)
      let _res = res.data;
      // _res = []
      if (_res.length) {
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
          wx.hideLoading()
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
  onServices() {
    db.collection('services').get().then(res => {
      if (res.data.length) {
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
  timeDiff(_date) {
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
      _time = hours + "小时"
      if (hours === 0) {
        if (minutes === 0) {
          _time = seconds + "秒钟"
        } else {
          _time = minutes + "分钟"
        }
      }
    } else if (days === -1) {
      _time = Math.abs(seconds - 0) + " 秒"
    } else if (days > 30) {
      if (days > 365) {
        _time = parseInt(days / 365) + "年"
      } else {
        _time = parseInt(days / 30) + "月"
      }
    } else {
      _time = days + "天"
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
    if (this.data.auth === 1) {
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
      },
      fail(res) {
        console.log(res.errMsg)
      }
    })
  },
  // 删除
  onDelete(e) {
    let _imgid = e.currentTarget.dataset.imgid;
    db.collection(_dbc).doc(e.currentTarget.dataset.id).remove().then(res => {
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
      this.refresh();
    }).catch(err => {
      console.log(err)
    })
  },
  // 拉黑
  onDefriend(e) {
    let _openid = e.currentTarget.dataset.openid
    db.collection('users').where({
      _openid: _openid
    }).get().then(res => {
      if (res.data.length > 0) {
        let _duserInfo = res.data[0];
        db.collection('defriend').where({
          defriendOpendid: _openid
        }).get().then(res => {
          if (res.data.length > 0) {
            wx.showToast({
              title: '该用户已经被拉黑',
              icon: "none"
            })
          } else {
            db.collection('defriend').add({
              data: {
                avatarUrl: _duserInfo.avatarUrl,
                nickName: _duserInfo.nickName,
                createTime: db.serverDate(),
                defriendOpendid: _openid
              }
            }).then(res => {
              wx.showToast({
                title: '操作成功'
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
  },
  onPageScroll: function(e) {
    if (e.scrollTop > 0 && !this.data.isHeader) {
      this.setData({
        isHeader: true
      })
    }
    if (e.scrollTop < 70 && this.data.isHeader) {
      this.setData({
        isHeader: false
      })
    }
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
  refresh() {
    wx.showLoading({
      title: '加载中',
    })
    this.onGetOpenid();
  },
  onPullDownRefresh() {
    this.refresh();
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