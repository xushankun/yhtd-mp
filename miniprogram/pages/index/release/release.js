// miniprogram/pages/index/release/release.js
const app = getApp()
const db = wx.cloud.database()
const _ = db.command;
Page({
  data: {
    currLength: 0,
    maxlength: 500,

    imgList: [],
    disabled: false,
    isRelease: false
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
  onLoad: function(options) {

  },
  onShow: function() {
    this.onServices();
    let _isLogin = wx.getStorageSync('isLogin');
    let _that = this;
    if (!_isLogin) {
      wx.showToast({
        title: '您还未登录,请先登录~',
        icon: 'none',
        duration: 800
      })
      setTimeout(() => {
        wx.navigateTo({
          url: '../../login/login',
        })
      }, 800)
    } else {
      // 判断是否被拉黑
      db.collection('defriend').where({
          defriendOpenid: wx.getStorageSync('userInfo')._openid
      }).get().then(res => {
        if (res.data.length > 0) {
          wx.showModal({
            title: '您已被禁止发帖',
            content: '道路千万条，发帖不规范，已被封禁，请到-我的-联系作者进行解封',
            showCancel: false,
            success(res) {
              console.log('用户点击确定');
              wx.navigateBack({
                delta: 1
              })
            }
          })
        }
      })
    }
  },
  bindTextarea(e) {
    this.setData({
      currLength: e.detail.cursor
    })
  },
  onSubmit(e) {
    let _imgList = this.data.imgList;
    let _that = this;
    if (_imgList.length > 0) {
      // 先上传再提交表单
      this.lastUpload(e); // 提交时上传图片
    } else {
      // 直接提交表单
      this.submitForm(e, []);
    }
  },
  submitForm(e, imgArr) {
    let _userInfo = wx.getStorageSync('userInfo');
    let _obj = {
      image: imgArr,
      content: e.detail.value.Message,
      nickName: _userInfo.nickName,
      avatarUrl: _userInfo.avatarUrl,
      createTime: db.serverDate()
    }
    _obj.content = _obj.content.trim()
    if (!_obj.content) {
      wx.showToast({
        title: '提交内容不能为空哦',
        icon: 'none'
      })
    } else {
      let _that = this;
      _that.setData({
        disabled: true
      })
      db.collection('kklist').add({
        data: _obj,
        success: res => {
          wx.showToast({
            title: '操作成功',
            duration: 500
          })
          _that.setData({
            disabled: false
          })
          app.prevPage().onGetOpenid();
          setTimeout(() => {
            wx.navigateBack({
              delta: 1
            })
          }, 500)
        },
        fail: e => {
          wx.showToast({
            title: '操作错误',
          })
          console.log(e)
          _that.setData({
            disabled: false
          })
        }
      })
    }
  },
  // -----------------------------------上传图片start----------------------------------
  chooseImage() {
    let _this = this;
    wx.chooseImage({
      count: 9,
      success: function(res) {
        _this.updateImgFile(res);
      }
    })
  },
  // 准备上传图片
  updateImgFile(obj) {
    let _this = this;
    let _imgList = [];
    if (obj.tempFilePaths) {
      obj.tempFilePaths.map((item, index) => {
        _imgList = _this.data.imgList;
        _imgList.push(item); // 临时图片数组
        _this.setData({
          imgList: _imgList
        })
      })
    }
  },

  // 最后上传
  lastUpload(e) {
    let _this = this;
    let _imgList = _this.data.imgList,
      _imgListed = [];
    let _floder = this.getUserId();
    let _openid = wx.getStorageSync('userInfo')._openid;
    wx.showLoading({
      title: '上传中...',
    })
    _imgList.map((item, index) => {
      const cloudPath = 'kklist/' + _openid + '-' + _floder + '/' + index + item.match(/\.[^.]+?$/)[0]
      // 图片开始异步上传
      wx.cloud.uploadFile({
        cloudPath: cloudPath,
        filePath: item,
      }).then(res => {
        if (res.statusCode === 200) {
          _imgListed.push(res.fileID);
          // 所有图片上传结束
          if (_imgList.length === _imgListed.length) {
            _this.submitForm(e, _imgListed);
            wx.hideLoading();
          }
        }
      }).catch(err => {
        console.log(err);
      })
    })

  },
  // 获取随机字符串
  getUserId() {
    let w = "abcdefghijklmnopqrstuvwxyz0123456789",
      firstW = w[parseInt(Math.random() * (w.length))];
    let userId = firstW + (Date.now()) + (Math.random() * 100000).toFixed(0)
    return userId;
  },
  // -----------------------------------上传图片end------------------------------------
  previewImage(e) {
    let _currUrl = e.currentTarget.dataset.currUrl;
    let _urls = this.data.imgList;
    wx.previewImage({
      current: _currUrl,
      urls: _urls
    })
  },
  longpressImage(e) {
    console.log(e);
    let _that = this;
    wx.showModal({
      title: '提示',
      content: '是否删除',
      success: function(res) {
        if (res.confirm) {
          _that.delImg(e);
        }
      }
    })
  },
  delImg(e) {
    let idx = e.currentTarget.dataset.index;
    let _imgList = this.data.imgList;
    _imgList.splice(idx, 1);
    this.setData({
      imgList: _imgList
    })
    console.log(this.data.imgList)
  }
})