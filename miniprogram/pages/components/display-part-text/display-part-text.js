// pages/components/display-part-text/display-part-text.js
Component({
  properties: {
    // 默认行高52rpx
    textLineHeight:{
      type: Number,
      value: 52
    },
    // 默认行数2行
    lineNumber:{
      type: Number,
      value: 2
    },
    // 显示按钮文本
    showBtnText:{
      type: String,
      value: '更多内容'
    },
    hideBtnText: {
      type: String,
      value: '收起来'
    },
    // 按钮显示位置【默认底部】可选右下角值为：rightBottom
    btnShowPosition:{
      type: String,
      value: 'rightBottom'
    }
  },
  data: {
    isShowAllText:false,
    initTextClass:'',
    showAllClass:''
  },
  methods: {
    showAllText(){
      let _isShowAllText = !this.data.isShowAllText;
      if (_isShowAllText) {
        this.ctrlShowText();
        this.ctrlShowTextActive();
      } else {
        this.ctrlShowText();
      }
      this.setData({
        isShowAllText: _isShowAllText
      })
      this.triggerEvent("actionHandle", _isShowAllText)
    },
    ctrlShowText(){
      let _textLineHeight = this.data.textLineHeight, _lineNumber = this.data.lineNumber, 
          _maxHeight = `max-height:${_textLineHeight * (_lineNumber + 1)}rpx`,
          _lineHeight = `line-height:${_textLineHeight}rpx`,
          _btnTop = `top:${_textLineHeight * _lineNumber}rpx`;

      this.setData({
        initTextClass: `${_maxHeight};${_lineHeight}`,
        showAllClass: `${_btnTop};height:${_textLineHeight}rpx;${_lineHeight}`
      })
    },
    ctrlShowTextActive(){
      this.setData({
        initTextClass: `${this.data.initTextClass};max-height:none;overflow:inherit;`,
        showAllClass: `${this.data.initTextClass}`
      })
    }
  },
  attached(){
    this.ctrlShowText()
  }
})
