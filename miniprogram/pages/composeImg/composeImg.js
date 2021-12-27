// miniprogram/pages/composeImg/composeImg.js
const app = getApp();
const tempCtx = wx.createCanvasContext('teCanvas');
const ctx = wx.createCanvasContext('myCanvas');
import util from '../../utils/util';
const { platform, screenWidth, screenHeight, pixelRatio, statusBarHeight, brand, windowWidth, windowHeight } = wx.getSystemInfoSync();
const db = wx.cloud.database();
let onOff = true;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    deviceRatio: windowWidth / 750,
    imgViewHeight: windowHeight - 160 * (windowWidth / 750),
    photoSrc:'',
    currIndex: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (e) {
    const that = this;
    that.getRahMenType();
  },
  // 获取头像
  getUserProfile() {
    let that = this
    // 推荐使用wx.getUserProfile获取用户信息，开发者每次通过该接口获取用户个人信息均需用户确认
    // 开发者妥善保管用户快速填写的头像昵称，避免重复弹窗
    wx.getUserProfile({
      desc: '用于合成图片', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      success: (res) => {
        console.log(res)
        that.getUpdateImageInFo(res.userInfo.avatarUrl.split("/132")[0] + '/0');
      }
    })
  },

  /**
   * 获取相框
   */
  getRahMenType: function () {
    const that = this;
    db.collection('photoframe').get({
      success: function (res) {
        that.setData({
          highAttr: res.data[0].response
        })
      }
    })
  },
  /**
   * 选择相框
   */
  onImageClicked: function (e) {
    const that = this;
    const url = e.currentTarget.dataset.src;
    let _idx = e.currentTarget.dataset.index

    if (!that.data.photoSrc) {
      wx.showToast({
        title: '请上传图片~',
        icon: 'none'
      })
      return false;
    }
    if (onOff) {
      onOff = false;
      wx.getImageInfo({
        src: url,
        success: function (res) {
          console.log(res)
          onOff = true;
          var initRatio = res.width / windowWidth;
          //保证宽度全显
          //图片显示大小
          that.frameWidth = (res.width / initRatio) //100%;
          that.frameHeight = (res.height / initRatio);
          that.setData({
            isSaveStatus: true,
            frameHeight: that.frameHeight,
            frameSrc: res.path,
            currIndex: _idx
          })
        },
        fail: function (err) {
          console.log("失败：", err)
          onOff = true;
          wx.showToast({
            title: '内部错误,请重试~',
            icon: 'none'
          })
        }
      })
    }
  },
  /**
   * 从相册选择图片
   */
  onUpdateImgClicked: function () {
    const that = this;
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album'],
      success: function (res) {
        const tempFilePaths = res.tempFilePaths[0];
        that.setData({
          isLoadSmallStatus: true
        })
        that.getUpdateImageInFo(tempFilePaths);
      }
    })
  },
  /**
   * 获取上传图片信息
   */
  getUpdateImageInFo: function (tempFilePaths) {
    const that = this;
    wx.getImageInfo({
      src: tempFilePaths,
      success: function (e) {
        var ratio = screenWidth / e.width;
        var height = ratio * e.height;
        that.setData({
          imgWidth: screenWidth,
          imgHeight: height,
          photoSrc: e.path
        })

        that.frameHeight = that.frameHeight ? that.frameHeight : 1000 * that.data.deviceRatio;
        that.initRatio = e.height / that.frameHeight;
        //转换为了px 图片原始大小/显示大小
        if (that.initRatio < e.width / windowWidth) {
          that.initRatio = e.width / windowWidth;
        }
        //图片显示大小
        that.scaleWidth = (e.width / that.initRatio) //100%
        that.scaleHeight = (e.height / that.initRatio)
        that.startX = windowWidth / 2 - that.scaleWidth / 2;
        that.startY = that.frameHeight / 2 - that.scaleHeight / 2;
        that.oldScale = 1;
        that.initScaleWidth = that.scaleWidth
        that.initScaleHeight = that.scaleHeight
        that.setData({
          isLoadSmallStatus: false,
          photoWidth: that.scaleWidth,
          photoHeight: that.scaleHeight,
          photoTop: 0,
          photoLeft: 0,
          // photoTop: that.startY,
          // photoLeft: that.startX,
          frameHeight: that.frameHeight,
        })
      },
      fail: (err)=>{
        wx.showToast({
          title: '图片加载失败,请自行上传图片',
          icon: "none"
        })
      }
    })
  },
  uploadScaleStart(e) {
    const that = this
    let xDistance, yDistance
    let [touch0, touch1] = e.touches
    //that.touchNum = 0 //初始化，用于控制旋转结束时，旋转动作只执行一次

    //计算第一个触摸点的位置，并参照该点进行缩放
    that.touchX = touch0.clientX
    that.touchY = touch0.clientY
    //每次触摸开始时图片左上角坐标
    that.imgLeft = that.startX
    that.imgTop = that.startY

    // 两指手势触发
    if (e.touches.length >= 2) {
      var frameHeight = that.frameHeight ? that.frameHeight : 1000 * that.data.deviceRatio
      that.initLeft = (windowWidth / 2 - that.imgLeft) / that.oldScale
      that.initTop = (frameHeight / 2 - that.imgTop) / that.oldScale
      //计算两指距离
      xDistance = touch1.clientX - touch0.clientX
      yDistance = touch1.clientY - touch0.clientY
      that.oldDistance = Math.sqrt(xDistance * xDistance + yDistance * yDistance)
    }
  },

  uploadScaleMove(e) {
    drawOnTouchMove(this, e)
  },

  uploadScaleEnd(e) {
    const that = this
    that.oldScale = that.newScale || that.oldScale
    that.startX = that.imgLeft || that.startX
    that.startY = that.imgTop || that.startY
  },
  /**
   * 保存到相册
   */
  savePic: function () {
    const that = this;
    if (!that.data.isSaveStatus) {
      wx.showToast({
        title: '请选择相框~',
        icon: 'none'
      })
      return false;
    }
    wx.showLoading({
      title: '保存中',
    })
    util.savePicToAlbum(that.data.photoSrc, that);
  },
  saveImgToPhone() {
    const that = this;
    if (!that.data.isSaveStatus) {
      wx.showToast({
        title: '请选择相框~',
        icon: 'none'
      })
      return false;
    }
    var frameHeight = that.frameHeight ? that.frameHeight : 1000 * that.data.deviceRatio
    that.setData({
      totalHeight: frameHeight
    })
    //照片显示大小
    var sX = Math.max(-that.data.photoLeft * that.initRatio / that.oldScale, 0)
    var sY = Math.max(-that.data.photoTop * that.initRatio / that.oldScale, 0)
    var sW = windowWidth * that.initRatio / that.oldScale
    var sH = (frameHeight) * that.initRatio / that.oldScale

    //canvas显示大小
    var canvasW = windowWidth;
    var canvasH = frameHeight
    var canvasX = Math.max(that.data.photoLeft, 0);
    var canvasY = Math.max(that.data.photoTop, 0);
    //先画照片
    tempCtx.drawImage(that.data.photoSrc, sX, sY, sW, sH, canvasX, canvasY, canvasW, canvasH)
    //再画相框
    tempCtx.drawImage(that.data.frameSrc, 0, 0, canvasW, canvasH)
    tempCtx.draw(true, function () {
      setTimeout(function () {
        wx.canvasToTempFilePath({
          canvasId: 'teCanvas',
          success: function (res) {
            if (that.data.isImageStatus || that.data.isBatchStatus) {
              that.goBack(res.tempFilePath);
            } else {
              wx.showLoading({
                title: '保存中',
              })
              util.savePicToAlbum(res.tempFilePath, that);
            }
          }
        })
      }, 600)
    })
  }
})


function drawOnTouchMove(that, e) {
  let { minScale, maxScale } = that.data;
  let [touch0, touch1] = e.touches
  let xMove, yMove, newDistance, xDistance, yDistance;

  // 单指手势时触发
  if (e.touches.length === 1) {
    //计算单指移动的距离
    xMove = touch0.clientX - that.touchX
    yMove = touch0.clientY - that.touchY
    //转换移动距离到正确的坐标系下
    that.imgLeft = that.startX + xMove
    that.imgTop = that.startY + yMove
    that.setData({
      photoTop: that.imgTop,
      photoLeft: that.imgLeft
    })
  }
  // 两指手势触发
  if (e.touches.length >= 2) {
    var frameHeight = that.frameHeight ? that.frameHeight : 1000 * that.data.deviceRatio
    // 计算二指最新距离
    xDistance = touch1.clientX - touch0.clientX
    yDistance = touch1.clientY - touch0.clientY
    newDistance = Math.sqrt(xDistance * xDistance + yDistance * yDistance)
    //  使用0.005的缩放倍数具有良好的缩放体验
    that.newScale = that.oldScale + 0.005 * (newDistance - that.oldDistance)

    //  设定缩放范围
    that.newScale <= minScale && (that.newScale = minScale)
    that.newScale >= maxScale && (that.newScale = maxScale)

    that.scaleWidth = that.newScale * that.initScaleWidth
    that.scaleHeight = that.newScale * that.initScaleHeight

    that.imgLeft = windowWidth / 2 - that.newScale * that.initLeft
    that.imgTop = frameHeight / 2 - that.newScale * that.initTop
    that.setData({
      photoTop: that.imgTop,
      photoLeft: that.imgLeft,
      photoWidth: that.scaleWidth,
      photoHeight: that.scaleHeight
    })
  }
}
