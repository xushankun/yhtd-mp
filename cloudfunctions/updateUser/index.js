const cloud = require('wx-server-sdk')
cloud.init({
    env: 'shankun-r-7ee811',     // 这里填写【环境ID】 而不是环境名
    traceUser: true,    // 是否在将用户访问记录到用户管理中，在控制台中可见
})
const db = cloud.database()
exports.main = async (event, context) => {
    try {
        return await db.collection('users').doc(event_id).update({
            // data 传入需要局部更新的数据
            data: {
                auth:2
            }
        })
    } catch (e) {
        console.error(e)
    }
}