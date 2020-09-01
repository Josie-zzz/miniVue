function MiniVue(options){
  this.$options = options
  this.$data = options.data

  //对MiniVue的实例增加一个属性代理，代理$data属性，这样访问属性就可以`this.xxx`而不是`this.$data.xxx`
  Object.keys(this.$data).forEach(key => {
    this.proxy(key)
  })

  //将所有methods方法挂到minivue实例上
  let meth = options.methods
  for(m in meth){
    if(meth.hasOwnProperty(m)){
      this[m] = meth[m]
    }
  }

  //对data中的所有属性进行监听
  observer(this.$data)

  //解析模板
  new Compile(options.el, this)
}

MiniVue.prototype.proxy = function(key){
  Object.defineProperty(this, key, {
    enumerable: true,
    configurable: false,
    get: function(){
      return this.$data[key]
    },
    set: function(newVal){
      this.$data[key] = newVal
    }
  })
}