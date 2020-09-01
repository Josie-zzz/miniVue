//监听data所有属性，利用 Object.defineProperty 实现数据劫持
function observer(data){
  if(!data || typeof data !== "object"){
    return
  }
  Object.keys(data).forEach(key => {
    defineReactive(data, key, data[key])
  })
}

function defineReactive(obj, key, val){
  //遍历当前key的值，可能会有object类型，要进行深度遍历
  observer(val)
  //为每一个key，绑定一个订阅器,通过闭包实现，其实就是维护一个数组subs
  var dep = new Dep()
  // 为每一个key设置访问器属性
  Object.defineProperty(obj, key, {
    enumerable: true,      //可以枚举
    configurable: false,   //不可以再重新定义
    get: function(){        //当获取key的值，get就会劫持，并记录当前订阅者
      if(Dep.target){      //用target暂时缓存当前订阅者，让只有初始化的时候才需要将订阅者加入订阅器数组，其他时刻获取此key的值就简单返回val就行
        dep.addSub(Dep.target)
      }
      
      return val
    },
    set: function(newVal){
      if(newVal === val) {
        return
      }
      val = newVal
      dep.notify()       //当前值只要发生变化，set就会劫持，并通知订阅器告诉所有订阅者
    }
  })
}

//消息订阅器, 储存当前key所有的订阅者，等到key值发生变化的时候通知所有订阅者
function Dep(){
  this.subs = []
}
Dep.prototype = {
  addSub: function(sub){    //增加使用当前key的订阅者
    this.subs.push(sub)
  },
  notify: function(){
    this.subs.forEach(sub => {    //通知每一个订阅者去更新
      sub.update()                //每一个订阅者都是一个wactcher
    })
  }
}

//注：watcher是通过获取属性的值（触发get）并设置Dep.target添加订阅者的
