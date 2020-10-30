// 获取帖子列表
const cloud = require('wx-server-sdk')
cloud.init({
    env: 'shankun-r-7ee811',     // 这里填写【环境ID】 而不是环境名
    traceUser: true,    // 是否在将用户访问记录到用户管理中，在控制台中可见
})
const db = cloud.database()
exports.main = async (event, context) => {
    console.log(event)
    console.log(context)
    let {limit,skip} = event
    try {
        return await db.collection('kklist').limit(limit).skip(skip).orderBy('createTime', 'desc').get()
    } catch (e) {
        console.error(e)
    }
}