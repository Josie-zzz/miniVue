function Compile(el, vm){
  this.$el = document.querySelector(el)
  this.$vm = vm         //MiniVue实例
  if(this.$el){
    this.$fragment = this.nodeToFragment(this.$el)
    this.compileElement(this.$fragment)
    this.$el.appendChild(this.$fragment)
  } else {
    console.log('所选的dom元素不存在！')
  }
}
Compile.prototype = {
  nodeToFragment: function(el){       //将页面中el下面的子元素dom全部移入fragment片段
    var fragment = document.createDocumentFragment()
    var firstChild;
    while(firstChild = el.firstChild){
      fragment.appendChild(firstChild)
    }
    return fragment
  },
  compileElement: function(fragment){
    var childNodes = fragment.childNodes   //文档片片段的子节点们nodeList， 是类数组所以需要稍微处理下，下面用到call
    var reg = /\{\{\s*(.*?)\s*\}\}/;   //匹配{{}}格式的正则

    [].forEach.call(childNodes, node => {
      let text = node.textContent
      //判断是文本节点吗并且是{{}}格式的文本
      if(this.isTextNode(node) && reg.test(text)){
        this.compileText(node, reg.exec(text)[1])
      }
      //检查当前元素是否有指令，并绑定事件
      if(this.isElementNode(node)){
        this.checkAttr(node)
      }
      //继续遍历它的子节点
      if(this.isElementNode(node) && node.childNodes.length){
        this.compileElement(node)     
      }
    })
  },
  compileText: function(node, exp){        //用变量的值替换text内容，并且产生一个订阅者
    this.updateText(node, this.$vm[exp])
    new Wacther(this.$vm, exp, (newVal) => {
      this.updateText(node, newVal)
    })
  },
  updateText: function(node, val){                 //更新视图值的函数
    var value = ''
    if(typeof val === "number" || typeof val === "string"){
      value = val
    }
    node.textContent = value
  },
  isTextNode: function(node){
    return node.nodeType === 3
  },
  isElementNode: function(node){
    return node.nodeType === 1
  },
  checkAttr: function(node){
    [].forEach.call(node.attributes, (val) => {
      var name = val.name
      var value = val.value
      if(name.indexOf('@') !== -1){         //@click形式
        this.directiveEvent(node, name.split('@')[1], value)
      } else if(name.indexOf('v-') !== -1){
        if(name.indexOf(':') !== -1){          //v-bind:name="name"这样的形式
          let dire = name.split(':')
          let dir = dire[0].split('v-')[1]
          switch(dir){
            case 'on': this.directiveEvent(node, dire[1], value);break;
            case 'bind': this.directiveBind(node, dire[1], value);break;
          }
        } else {            //v-html, v-model 这样的形式
          let dir = name.split('v-')[1]
          switch(dir){
            case 'model': this.directiveModel(node, value)
          }
        }
      } else if(name.indexOf(':') !== -1){      //:bind
        this.directiveBind(node, name.split(':')[1], value)
      }
    })
  },
  directiveBind(node, attr, data){        //v-bind,':'指令
    this.updateAttr(node, attr, this.$vm[data])    //初始化
    new Wacther(this.$vm, data, (newVal) => {  //当数据改变的时候回传过来newVal
      this.updateAttr(node, attr, newVal)
    })
  },
  updateAttr(node, attr, val){
    node.setAttribute(attr, val)
  },
  directiveEvent(node, dire, hander){       //@, v-on指令
    node.addEventListener(dire, this.$vm[hander].bind(this.$vm))
  },
  directiveModel(node, value){
    node.value = this.$vm[value]
    new Wacther(this.$vm, value, (newVal) => {  
      node.value = newVal
    })
    node.addEventListener('input', (e) => {
      this.$vm[value] = e.target.value
    })
  }
}

//注意这里不可以使用call或者apply，因为这两个函数会使得this.$vm[dir.hander]立即执行，
//那么此时的第二个参数会是个返回值，不是绑定的回调函数，用bind它会返回一个改变了this的函数