//Watcher订阅者作为Observer和Compile之间通信的桥梁
//作用：在每一个订阅者实例被创建的时候，向订阅器中添加自己 Dep.target
//待属性变动触发dep.notice()时，能调用自身的update()方法，并触发Compile中绑定的回调

function Wacther(vm, exp, cb){
  this.vm = vm        //MiniVue的实例
  this.exp = exp      //订阅者使用的key
  this.cb = cb        //模板的回调函数，可以更改视图中的相应的数据
  //触发Dep.target,并储存当前使用的key的值
  this.value = this.get()
}

Wacther.prototype = {
  get: function(){
    Dep.target = this
    //此时获取key的值因为Dep.target有值，所以会将当前watcher实例加入当前key的订阅器数组
    var val = this.vm[this.exp]
    //添加完以后一定要释放，否则之后只要获取就会重复添加同一个订阅者
    Dep.target = null
    return val
  },
  update: function(){
    //获取最新值
    var newVal = this.vm[this.exp]
    //将最新值传给回调函数
    this.cb(newVal)
  }
}