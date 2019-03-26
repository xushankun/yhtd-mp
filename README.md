# 微信小程序云开发【硬核天地】

- 云开发入门
- 发布图文
- 删除帖子【管理员可随意删除帖子】
- 管理员可拉黑用户【被拉黑的用户将被禁止发帖】


公共组件display-part-text的使用【pages/components/display-part-text】
第三方天气插件的使用【首页顶部的天气功能】

# 使用
- project.config.json  里的appid改为自己的
- 环境ID改为自己的【包括每个云函数index.js里的环境ID】
- 数据库添加集合
    - defriend【黑名单列表】
    - kklist【帖子列表】
    - services【功能控制开关】
        - "isRelease":true  // 发布状态时改为false【规避微信审核，投机取巧】【原则上个人开发者禁止用户发布信息】
    - users【用户列表】

## 参考文档

- [云开发文档](https://developers.weixin.qq.com/miniprogram/dev/wxcloud/basis/getting-started.html)

