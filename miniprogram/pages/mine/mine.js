// miniprogram/pages/mine/mine.js
const app = getApp();
const db = wx.cloud.database()
const _ = db.command
Page({
    data: {
        isLogin: false,
        userInfo: null,
        statusBarH:20,
        html:`  <section data-id="94534" style="border: 0px none;">
    <section style="width:95%;margin:20px auto;" data-width="95%">
      <section style="box-shadow: 0px 2px 10px #a9cfd5;">
        <section style="display: flex;justify-content: space-between;align-items: center;padding: 10px 5px;">
          <section style="display: inline-block;width: 25px;">
            <section style="width:0.8em;height:0.8em;background: #85b5bc;border-radius:100% ;opacity: 0.6;margin: 0px auto -8px auto;transform: rotate(0deg);-webkit-transform: rotate(0deg);-moz-transform: rotate(0deg);-o-transform: rotate(0deg);"></section>
            <section style="width:5px;height:1.4em;background:#a9cfd5;border-radius:6px ;margin: 0px auto;"></section>
          </section>
          <section style="display: inline-block;width: 25px;">
            <section style="width:0.8em;height:0.8em;background: #85b5bc;border-radius:100% ;opacity: 0.6;margin: 0px auto -8px auto;transform: rotate(0deg);-webkit-transform: rotate(0deg);-moz-transform: rotate(0deg);-o-transform: rotate(0deg);"></section>
            <section style="width:5px;height:1.4em;background:#a9cfd5;border-radius:6px ;margin: 0px auto;"></section>
          </section>
        </section>
        <section style="padding:0.2em 1em;">
          <section data-autoskip="1" style="font-size: 14px;text-align: justify;letter-spacing: 1.5px;line-height: 1.75em;color:#4d909a;padding:0em 1em;">
            <p> 硬核，作为网络流行语的该词，原本的含义为形容说唱音乐和游戏。因此早有硬核说唱和硬核游戏的说法。硬核说唱是更具有力量感的音乐形式，热情奔放猛烈强劲。而硬核游戏存在一定难度并有特定受众的游戏。但是作为网络语而流行起来的“硬核”这个词使用的范围更加广泛，不单单形容说唱和游戏，我们可以把它理解为是一种很厉害、很酷、很彪悍、很刚硬的意思。
            </p>
          </section>
        </section>
        <section style="display: flex;justify-content: space-between;align-items: center;padding: 10px 5px;">
          <section style="display: inline-block;width: 25px;">
            <section style="width:5px;height:1.4em;background:#a9cfd5;border-radius:6px ;margin: 0px auto;"></section>
            <section style="width:0.8em;height:0.8em;background: #85b5bc;border-radius:100% ;opacity: 0.6;margin: -8px auto 0px auto;transform: rotate(0deg);-webkit-transform: rotate(0deg);-moz-transform: rotate(0deg);-o-transform: rotate(0deg);"></section>
          </section>
          <section style="display: inline-block;width: 25px;">
            <section style="width:5px;height:1.4em;background:#a9cfd5;border-radius:6px ;margin: 0px auto;"></section>
            <section style="width:0.8em;height:0.8em;background: #85b5bc;border-radius:100% ;opacity: 0.6;margin:-8px  auto 0px auto;transform: rotate(0deg);-webkit-transform: rotate(0deg);-moz-transform: rotate(0deg);-o-transform: rotate(0deg);"></section>
          </section>
        </section>
      </section>
    </section>
  </section>`
    },
    parse: function (e) {
        console.log(e.detail)
    },
    onLoad: function(options) {
      let _that = this;
      wx.getSystemInfo({
        success(res) {
          // 自定义导航栏时需要获取状态栏高度来做自适应
          _that.setData({
            statusBarH: res.statusBarHeight
          })
        }
      })
    },
    onShow: function() {
        let _isLogin = wx.getStorageSync('isLogin');
        if (!_isLogin) {
            let _duration = 800;
            wx.showToast({
                title: '您还未登录,请先登录~',
                icon: 'none',
                duration: _duration
            })
            setTimeout(() => {
                wx.navigateTo({
                    url: '../login/login',
                })
            }, _duration)
        }  else {
            this.setData({
                isLogin: true,
                userInfo: wx.getStorageSync('userInfo')
            })
        }
    },
    // 关于
    showInfo() {
        wx.showModal({
            title: '开心每一天',
            content: '博客：https://shankun.top',
            showCancel: false
        })
    },
    connectAuther() {
        wx.showModal({
            title: '快去博客给他留言吧',
            content: 'https://shankun.top',
            confirmText:"复制地址",
            // showCancel: false,
            success(res) {
                if (res.confirm) {
                    wx.setClipboardData({
                        data: 'https://shankun.top',
                        success(res) {
                            wx.getClipboardData({
                                success(res) {
                                    wx.showToast({
                                        title: 'url复制成功',
                                        icon: "none"
                                    })
                                }
                            })
                        }
                    })
                } else if (res.cancel) {
                    console.log('用户点击取消')
                }
            }
        })
    },
    goUserList(){
        wx.navigateTo({
            url: 'userList/userList',
        })
    },
    goDefriend(){
        wx.navigateTo({
            url: 'defriendList/defriendList',
        })
    },
    backPage(){
        wx.navigateBack({
            delta: 1
        })
    }
})
