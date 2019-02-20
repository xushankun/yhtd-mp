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

        count: 0,       // 用作表单id
        imgListed: [] // 已上传
    },
    onLoad: function (options) {
        
    },
    onShow: function () {
        let _isLogin = wx.getStorageSync('isLogin')
        if (!_isLogin) {
            wx.showToast({
                title: '您还未登录,请先登录~',
                icon: 'none'
            })

            setTimeout(() => {
                wx.navigateTo({
                    url: '../../login/login',
                })
            }, 1000)
        } else {
            if(wx.getStorageSync('userInfo').auth === 2){
                wx.showModal({
                    title: '您已被禁止发帖',
                    content: '道路千万条，发帖不规范，已被封禁，请到-我的-联系作者进行解封',
                    showCancel:false,
                    success(res) {
                        console.log('用户点击确定');
                        wx.switchTab({
                            url: '../../mine/mine',
                        })
                    }
                })
                return;
            }
            this.getCount()
        }
    },
    bindTextarea(e) {
        this.setData({
            currLength: e.detail.cursor
        })
    },
    onSubmit (e) {
        let _imgList = this.data.imgList;
        if (_imgList.length > 0) {
            // 先上传再提交表单
            this.lastUpload(e);      // 提交时上传图片
        } else {
            // 直接提交表单
            this.submitForm(e);
        }
    },
    submitForm(e) {
        let _userInfo = wx.getStorageSync('userInfo');
        let _obj = {
            image: this.data.imgListed,
            content: e.detail.value.Message,
            nickName: _userInfo.nickName,
            avatarUrl: _userInfo.avatarUrl,
            id: this.data.count,
            createTime: db.serverDate()
        }

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
            // 提交反馈
            console.log(_obj)
            // return;
            db.collection('kklist').add({
                data: _obj,
                success: res => {
                    wx.showToast({
                        title: '操作成功',
                    })
                    _that.setData({
                        disabled: false
                    })
                    app.prevPage().onGetOpenid();
                    setTimeout(() => {
                        wx.navigateBack({
                            delta: 1
                        })
                    }, 1000)
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
        let _imgList = [],
            _imgListed = [];
        if (obj.tempFilePaths) {
            obj.tempFilePaths.map((item, index) => {
                _imgList = _this.data.imgList;
                _imgListed = _this.data.imgListed;
                _imgList.push(item); // 临时图片数组
                _this.setData({
                    imgList: _imgList
                })
            })
        }
    },

    // 最后上传
    lastUpload(e){
        let _this = this;
        let _imgList = _this.data.imgList,
            _imgListed = [];
        wx.showLoading({
            title: '上传中...',
        })
        _imgList.map((item,index)=>{
            const cloudPath = 'kklist/item' + _this.data.count + '/' + index + item.match(/\.[^.]+?$/)[0]
            // 图片开始异步上传
            wx.cloud.uploadFile({
                cloudPath: cloudPath,
                filePath: item,
            }).then(res => {
                console.log(res)
                _imgListed.push(res.fileID);
                // 所有图片上传结束
                if (_imgList.length === index + 1) {
                    wx.hideLoading()
                    _this.setData({
                        imgListed: _imgListed
                    },()=>{
                        // 可以提交表单了
                        _this.submitForm(e);
                    })
                }
            }).catch(err => {
                console.log(err);
            })
        })
        
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
        // let _Ex_Attach = this.data.releaseParams.Ex_Attach;
        _imgList.splice(idx, 1);
        // _Ex_Attach.splice(idx, 1)
        this.setData({
            imgList: _imgList,
            // 'releaseParams.Ex_Attach': _Ex_Attach
        })
        console.log(this.data.imgList)
    },
    getCount() {
        let _that = this
        db.collection('kklist').count({
            success: res => {
                _that.setData({
                    count: res.total + 1
                })
            }
        })
    }
})