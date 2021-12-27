// pages/webView/webView.js
//获取应用实例
const app = getApp()
Page({
  data: {
    src: ''
  },
  onLoad: function (options) {
    console.log(options)
    let { url } = options
    if(url) {
      this.setData({ src: decodeURIComponent(url) })
    }
  }
})