function Skate(options = {}) {
    this.$options = options; //将所有属性挂载在了$option上了
    //this._data
    var data = this._data = this.$options.data;
    observe(data);
    //this代理了this._data
    for (let key in data) {
        Object.defineProperty(this, key, {
            enumerable: true,
            get() {
                return this._data[key];
            },
            set(newVal) {
                this._data[key] = newVal;
            }
        })
    }
    new Compile(options.el, this)
}

function Compile(el, vm) {
    // el表示替换的范围
    vm.$el = document.querySelector(el);
    // console.log(vm.$el);
    let fragment = document.createDocumentFragment();
    // console.log(fragment);
    while (child = vm.$el.firstChild) { //将app的内容移入到内存中
        fragment.appendChild(child)
    }
    replace(fragment);

    function replace(fragment) {
        Array.from(fragment.childNodes).forEach(function (node) { //循环每一层
            let text = node.textContent;
            let reg = /\{\{(.*)\}\}/;
            if (node.nodeType === 3 && reg.test(text)) {
                console.log(RegExp.$1);
                let arr = RegExp.$1.split('.');
                let val = vm;
                arr.forEach(function(k){
                    val = val[k];
                })
                //替换的逻辑
                new Watcher(vm,RegExp.$1,function(newVal){//函数里需要接收一个新值
                    console.log('监视器回调');
                    node.textContent = text.replace(/\{\{(.*)\}\}/,newVal);
                });
                node.textContent = text.replace(/\{\{(.*)\}\}/,val);
            }
            if (node.childNodes) {
                replace(node);
            }
        });
    }
    vm.$el.appendChild(fragment);
}
//vm.$options
function Observe(data) { //这里是主要逻辑
    console.log('Observe');
    let dep = new Dep();
    for (let key in data) { //把data属性通过object.defineProperty的方式定义属性
        // console.log(key);
        let val = data[key];
        // console.log(val);
        //递归执行 如果传入的不是一个对象 就不会执行循环
        observe(val);
        Object.defineProperty(data, key, {
            enumerable: true,
            get() {
                Dep.target&&dep.addSub(Dep.target);//监控函数 数组 [watcher]
                return val;
            },
            set(newVal) { //更改值的时候
                // console.log('newVal'+newVal);
                if (newVal === val) {
                    return;
                }
                //这里为什么可以改变data里面属性的值？引用类型的原因
                val = newVal; //以后在获取值的时候讲刚才设置的值丢回去 
                observe(newVal);
                // console.log(dep);
                dep.notify();//让所有的update方法执行即可
            }
        });
    }
}

function observe(data) {
    console.log(data);
    if (typeof data !== 'object') {
        return
    }
    return new Observe(data);
}
//vue不能新增不存在的属性 不存在的属性没有get和set
//深度响应 因为每次赋予一个新对象时 会给这个新对象增加数据劫持defineProperty

//发布订阅者模式
/** 
 * javascript comment 
 * @Author: proto 
 * @Date: 2018-09-03 16:44:51 
 * @Desc: 类创建队列 
 */
function Dep(){
    this.subs = [];
}
/** 
 * javascript comment 
 * @Author: proto 
 * @Date: 2018-09-03 11:15:17 
 * @Desc: 公有方法 订阅 
 */
Dep.prototype.addSub = function(sub){
    this.subs.push(sub);
}
/** 
 * javascript comment 
 * @Author: proto 
 * @Date: 2018-09-03 16:47:24 
 * @Desc: 公有方法 发布 
 */
Dep.prototype.notify = function(){
    this.subs.forEach(sub=>sub.update());
}
/** 
 * javascript comment 
 * @Author: proto 
 * @Date: 2018-09-03 11:20:11 
 * @Desc: Watcher类创建的实例都有update()方法 
 */
function Watcher(vm,exp,fn){
    this.fn = fn;
    this.vm = vm;
    this.exp = exp;//添加到订阅中
    Dep.target = this;
    let val = vm;
    let arr = exp.split('.');
    arr.forEach(function(k){
        val = val[k];
    });
    Dep.target = null;
}

Watcher.prototype.update = function(){
    console.log('watcher update');
    let val = this.vm;
    let arr = this.exp.split('.');
    arr.forEach(function(k){
        val = val[k];
    });
    this.fn(val);//newVal
}