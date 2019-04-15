const html2nodes = require('./Parser.js')
var imgList = [];
Component({
  properties: {
    'html': {
      type: String,
      optionalTypes: [Object, Array],
      value: '',
    },
    'space': {
      type: String,
      optionalTypes: [Boolean],
      value: false,
    },
    'selectable': {
      type: Boolean,
      value: true,
    },
    'preview': {
      type: Boolean,
      value: true,
    }
  },
  data: {
    'nodes': [],
  },
  attached() {
    this.setData({
      space: this.properties.space
    })
  },
  observers: {
    'html': function(html) {
      if (typeof html == 'string') {
        var that = this;
        html2nodes(html, {
          "preview": this.properties.preview,
          "selectable": this.properties.selectable
        }).then(function(e) {
          that.triggerEvent('parse', e)
          imgList = e.imgList;
          that.setData({
            nodes: e.nodes,
          })
        });
      } else if (typeof html == 'object') {
        imgList = html.imgList;
        this.setData({
          nodes: html.nodes
        })
      } else if (typeof html == 'array') {
        imgList = [];
        this.setData({
          nodes: html
        })
      }
    },
  },
  methods: {
    navigate(e){
      if (this.properties.selectable) {
        try {
          wx.navigateTo({
            url: e.target.dataset.href,
          })
        } catch (e) { }
      }
    },
    copyhref(e) {
      if (this.properties.selectable) {
        wx.setClipboardData({
          data: e.target.dataset.href,
        })
      }
    },
    previewImg(e) {
      if (this.properties.preview) {
        wx.previewImage({
          current: e.target.dataset.src,
          urls: imgList.length ? imgList : [e.target.dataset.src],
        })
      }
    }
  }
})