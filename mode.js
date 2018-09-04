//发布订阅者模式

function Dep(){
    this.subs = [];
}
/** 
 * javascript comment 
 * @Author: proto 
 * @Date: 2018-09-03 11:15:17 
 * @Desc: 订阅 
 */
Dep.prototype.addSub = function(sub){
    this.subs.push(sub);
}

Dep.prototype.notify = function(){
    this.subs.forEach(sub=>sub.update());
}
/** 
 * javascript comment 
 * @Author: proto 
 * @Date: 2018-09-03 11:20:11 
 * @Desc: Watcher类创建的实例都有update()方法 
 */
function Watcher(fn){
    this.fn = fn;
}

Watcher.prototype.update = function(){
    console.log('watcher update');
}

let watcher = new Watcher(function(){ //监听函数
    console.log('init Watcher');
});

/*********************************************/
//这里是测试代码

let dep = new Dep();
dep.addSub(watcher);//将watcher放到数组中
dep.addSub(watcher);
console.log(dep.subs);
dep.notify();//数组关系