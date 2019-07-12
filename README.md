## 相关bolg笔记
- [小程序云开发](https://shankun.top/2019/04/12/%E5%B0%8F%E7%A8%8B%E5%BA%8F%E4%BA%91%E5%BC%80%E5%8F%91/)扫码体验：

![](https://shankun-1257055090.cos.ap-chengdu.myqcloud.com/blog/mpcloud/yhtd-vcode.jpg)

## 微信小程序云开发【硬核天地】

- 云开发入门
- 首页支持模糊查询
- 发布图文
- 删除帖子【管理员可随意删除帖子】
- 管理员可拉黑用户【被拉黑的用户将被禁止发帖】


公共组件display-part-text的使用【pages/components/display-part-text】
第三方天气插件的使用【首页顶部的天气功能】【天气插件名称：MarsWeather】

## 安装使用
- 克隆代码到本地
```
git clone git@github.com:xushankun/yhtd-mp.git
```
- 打开“微信开发者工具”，导入项目
- 填写自己的appid
- 环境ID改为自己的【包括每个云函数index.js里的环境ID】
- 数据库添加集合

```
    defriend【黑名单列表】
    kklist【帖子列表】
    services【功能控制开关】
        "isRelease":true  // 发布状态时改为false【规避微信审核，投机取巧】【原则上个人开发者禁止用户发布信息】
    users【用户列表】
```


## 关于权限
- 数据库表的权限设置：首先将以上几个表权限设为：所有用户可读，仅创建者及管理员可写。
- 表的用户权限设置：常规的权限，这里我们通过简单的users表里的auth字段来控制【权限默认普通用户0，管理员1 ，拉黑用户为2】
- 管理员用户可以删除任意帖子【无论别人还是自己发的】，也可以将其他用户拉入黑名单
- 普通用户只能发帖子以及删除自己发的帖子
- 所有默认注册的用户都是普通用户【包括自己】，如果想将自己设为管理员【将users表里的auth字段设置为1，默认为0注册普通用户】
- 拉黑用户：管理员才能看到拉黑用户的操作按钮，在我的空间，拉黑列表里可以取消拉黑。
- 【数据库直接改吧，没有直接写权限控制的界面，因为给新手学习的项目，不想整太复杂】
## 参考文档

- [云开发文档](https://developers.weixin.qq.com/miniprogram/dev/wxcloud/basis/getting-started.html)

