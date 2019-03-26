// app.util.formatDate(new Date(item.IllegalTime.replace(/-/g, '/')), 'yyyy-MM-dd hh:mm');
let formatDate = (_date, fmt) => {
  var o = {
    "M+": _date.getMonth() + 1,
    "d+": _date.getDate(),
    "h+": _date.getHours(),
    "m+": _date.getMinutes(),
    "s+": _date.getSeconds(),
    "q+": Math.floor((_date.getMonth() + 3) / 3), //季度 
    "S": _date.getMilliseconds() //毫秒 
  };
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(RegExp.$1, (_date.getFullYear() + "").substr(4 - RegExp.$1.length));
  }
  for (var k in o) {
    if (new RegExp("(" + k + ")").test(fmt)) {
      fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    }
  }
  return fmt;
}



// 日期月份/天的显示，如果是1位数，则在前面加上'0'
function getFormatDate(arg) {
  if (arg == undefined || arg == '') {
    return '';
  }
  var re = arg + '';
  if (re.length < 2) {
    re = '0' + re;
  }
  return re;
}


let timeDiff = (_date) => {
    let currTime = new Date(); //开始时间
    let _timeDiff = currTime.getTime() - _date.getTime() //时间差的毫秒数

    //计算出相差天数
    let days = Math.floor(_timeDiff / (24 * 3600 * 1000))

    //计算出小时数
    let leave1 = _timeDiff % (24 * 3600 * 1000) //计算天数后剩余的毫秒数
    let hours = Math.floor(leave1 / (3600 * 1000))
    //计算相差分钟数
    let leave2 = leave1 % (3600 * 1000) //计算小时数后剩余的毫秒数
    let minutes = Math.floor(leave2 / (60 * 1000))
    //计算相差秒数
    let leave3 = leave2 % (60 * 1000) //计算分钟数后剩余的毫秒数
    let seconds = Math.round(leave3 / 1000)
    // console.log(" 相差 " + days + "天 " + hours + "小时 " + minutes + " 分钟" + seconds + " 秒")
    let _time = '';
    if (days === 0) {
        _time = hours + "小时"
        if (hours === 0) {
            if (minutes === 0) {
                _time = "刚刚"
            } else {
                _time = minutes + "分钟"
            }
        }
    } else if (days === -1) {
        _time = Math.abs(seconds - 0) + " 秒"
    } else if (days > 30) {
        if (days > 365) {
            _time = parseInt(days / 365) + "年"
        } else {
            _time = parseInt(days / 30) + "月"
        }
    } else {
        _time = days + "天"
    }

    return _time
}


// 成功与普通提示
let showSuccess = text => wx.showToast({
  title: text,
  icon: 'success'
})

let showInfo = text => wx.showToast({
  title: text,
  icon: 'none'
})

// ----------------------------防抖----------------------------------
/**
 * 防抖函数，返回函数连续调用时，空闲时间必须大于或等于 wait，func 才会执行
 *
 * @param  {function} func        回调函数
 * @param  {number}   wait        表示时间窗口的间隔
 * @param  {boolean}  immediate   设置为ture时，是否立即调用函数
 * @return {function}             返回客户调用函数
 */
// immediate = true;   适合点赞或收藏时的立即执行
// immediate = false;  适合搜索时,输入结束时调用搜索

let debounce = (func, wait = 50, immediate = true) => {
  let timer, context, args

  // 延迟执行函数
  const later = () => setTimeout(() => {
    // 延迟函数执行完毕，清空缓存的定时器序号
    timer = null
    // 延迟执行的情况下，函数会在延迟函数中执行
    // 使用到之前缓存的参数和上下文
    if (!immediate) {
      func.apply(context, args)
      context = args = null
    }
  }, wait)

  // 这里返回的函数是每次实际调用的函数
  return function (...params) {
    // 如果没有创建延迟执行函数（later），就创建一个
    if (!timer) {
      timer = later()
      // 如果是立即执行，调用函数
      // 否则缓存参数和调用上下文
      if (immediate) {
        func.apply(this, params)
      } else {
        context = this
        args = params
      }
      // 如果已有延迟执行函数（later），调用的时候清除原来的并重新设定一个
      // 这样做延迟函数会重新计时
    } else {
      clearTimeout(timer)
      timer = later()
    }
  }
}
// --------------------------------------------防抖end------------------------------------
// 获取当前时间戳
function _now() {
  return +new Date()
}
// ------------------------------------------节流----------------------------------------

/**
 * @param  {function}   func      回调函数
 * @param  {number}     wait      表示时间窗口的间隔
 * @param  {object}     options   如果想忽略开始函数的的调用，传入{leading: false}。
 *                                如果想忽略结尾函数的调用，传入{trailing: false}
 *                                两者不能共存，否则函数不能执行
 * @return {function}             返回客户调用函数   
 */
let throttle = (func, wait, options) => {
  var context, args, result;
  var timeout = null;
  var previous = 0;
  if (!options) options = {};
  var later = function () {
    previous = options.leading === false ? 0 : _now();
    timeout = null;
    result = func.apply(context, args);
    if (!timeout) context = args = null;
  };
  return function () {
    var now = _now();
    if (!previous && options.leading === false) previous = now;
    var remaining = wait - (now - previous);
    context = this;
    args = arguments;
    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      previous = now;
      result = func.apply(context, args);
      if (!timeout) context = args = null;
    } else if (!timeout && options.trailing !== false) {
      timeout = setTimeout(later, remaining);
    }
    return result;
  };
};
// ------------------------------------------节流end-------------------------------------

module.exports = {
  formatDate,
  timeDiff,
  showSuccess,
  showInfo,
  debounce,
  throttle
}
