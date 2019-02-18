// Created by shankun on 2018/8/22
const request = require('./request.js').sendRequest;

var API = {
  // -------------------业务模块start-----------------------------------------
  // 此处定义


  // -------------------业务模块end-----------------------------------------

  // -------------------示例-------------------------------------
  // 【GET】
  loginwx: (obj) => {
    return request('/user/wx/loginwx', "POST", obj)
  },
  // 【POST】
  sendSms:(obj) => {
    return request('/system/sms/SendSmsForBindWeixin',"GET",obj)
  },
  // POST但数据格式为 字段对应有数组的情况下 改用'application/json'【此处特殊情况，遇到可尝试】
  commitQuestion: (obj) => {
    return request('/question/CommitQuestion', 'POST', obj, {
      header: {
        'Content-Type': 'application/json'
      }
    })
  }
}

module.exports = API;
