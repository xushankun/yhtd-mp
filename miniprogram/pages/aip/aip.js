// miniprogram/pages/aip/aip.js
const app = getApp()
const db = wx.cloud.database()
const _ = db.command;
Page({
  data: {
    statusBarH: 20,
    objectArray: [],
    typeIndex: 0,


    imgList: [],
    disabled: false,
    isRelease: false,
    baseUrl:'',


    result: []    // 识别数据
  },
  onLoad: function (options) {
    this.onServices();
  },
  onServices() {
    db.collection('services').get().then(res => {
      if (res.data.length) {
        this.setData({
          isRelease: res.data[0].isRelease,
          baseUrl: res.data[0].baseUrl,
          objectArray: res.data[0].aipType
        })
      } else {
        this.setData({
          isRelease: false
        })
      }
    })
  },
  onShow: function () {
  },
  // 选择
  bindPickerChange: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      typeIndex: e.detail.value
    })
    this.onSubmit()
  },
  onSubmit(e) {
    let _imgList = this.data.imgList;
    let _that = this;
    if (_imgList.length > 0) {
      // 先上传再提交表单
      this.lastUpload(e); // 提交时上传图片
    }
  },
  // -----------------------------------上传图片start----------------------------------
  chooseImage() {
    let _this = this;
    wx.chooseImage({
      count: 1,
      success: function (res) {
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
        // _imgList = _this.data.imgList;
        _imgList=[]
        _imgList.push(item); // 临时图片数组
        _this.setData({
          imgList: _imgList
        })
        _this.onSubmit()
      })
    }
  },

  // 最后上传
  lastUpload(e) {
    let _this = this;
    let _imgList = _this.data.imgList,
      _imgListed = [];
      _this.setData({
        disabled:true
      })
    wx.showLoading({
      title: '识别中...',
    })
    _imgList.map((item, index) => {
      // 图片开始异步上传
      _this.aip(item)
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
      success: function (res) {
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
  },
  //-------------------------------上传并识别----------------------------------
  aip(filePath) {
    let _that = this
    // let _baseUrl = 'http://127.0.0.1:3001'
    let _baseUrl = _that.data.baseUrl
    wx.uploadFile({
      url: _baseUrl + '/baiduai/aip' + '?type=' + _that.data.objectArray[_that.data.typeIndex - 0].type, 
      filePath: filePath,
      name: 'file',
      formData: {
        'type': _that.data.objectArray[_that.data.typeIndex - 0].type
      },
      success(res) {
         //do something
        _that.setData({
          disabled: false
        })
        wx.hideLoading();  // 成功后隐藏
        res = JSON.parse(res.data)
        console.log(res)
        if (res.success) {
          if (res.data.result.length) {
            res.data.result.map(item=>{
              if (item.score) {
                item.score = ((item.score - 0) * 100).toFixed(2) + '%'
              }
              if (item.probability) {
                item.probability = ((item.probability-0) * 100).toFixed(2) + '%'
              }
            })
          }
          _that.setData({
            result:res.data.result
          })
        }
      }
    })
  },
  backPage() {
    wx.navigateBack({
      delta: 1
    })
  }
})