// 分支情况处理
// obj.ok?obj.text:'abc'

// 当 obj.ok 为true时, ok和text都会收集到依赖
// 当 obj.ok 变为false的时候, text的依赖还会存在,当改变obj.text的值之后effect还是会执行


// 区分object的key来存储和执行effect
// 按照key收集依赖,防止设置一个不存在的属性导致依赖的执行

//  target      --WeakMap
//      key    --Map
//         fn   --Set
//         fn1   --Set
//      key1
//         fn

// 存储副作用函数
// WeakMap 的key是弱引用,会被垃圾回收
const bucket = new WeakMap()


// 被代理的对象
const actualData = { ok: true, text: 'vue3' }


function track (target, key) {
    if (!activeEffect) return
    // 根据当前对象获取依赖
    let depsMap = bucket.get(target)
    // 如果没有就创建一个空的
    if (!depsMap) {
        bucket.set(target, (depsMap = new Map()))
    }

    // 根据当前访问对象的key 获取属性的依赖
    let deps = depsMap.get(key)
    // 没有找到就创建一个空的
    if (!deps) {
        depsMap.set(key, (deps = new Set()))
    }
    // 将依赖放进Set里
    deps.add(activeEffect)
}

function trigger (target, key) {
    const depsMap = bucket.get(target)
    if (!depsMap) return

    //  根据当前key 取除依赖并执行
    const effects = depsMap.get(key)
    effects && effects.forEach(fn => fn())
}
// 代理对象
const data = new Proxy(actualData, {
    get: (target, key) => {
        console.log('%c【get】 [key]:%s,[value]:%s', 'color:red', key, target[key]);
        track(target, key)
        // 返回被代理对象的值
        return target[key]
    },
    set: (target, key, value) => {
        console.log('%c【set】', 'color:green', target, key, value);
        // 设置被代理对象的值
        target[key] = value
        trigger(target, key)
        return value
    }
})


// 注册副作用函数

// 临时存储副作用函数
let activeEffect

function effect (fn) {
    // 临时存储副作用函数，方便 get的时候添加到 bucket中
    activeEffect = fn
    // 然后立即执行副作用函数,如果整个副作用函数里的操作会触发对象的 get 就会被收集
    fn()
}

// 注册一个副作用函数
effect(() => {
    console.log('effect run')
    // 这里只对text的值进行了读取
    document.body.innerHTML = data.ok ? data.text : 'not'
})

setTimeout(() => {
    // data.text = 'hello vue3'
    // 当对其他非text属性进行设置的时候,还是会取出bucket 里的function进行执行
    // 所以就会执行两遍：1是在40行，2是在55行
    // 主要是因为没区分到底是哪个key变化了
    data.notExist = 'dddd'
    // 这里的 notExist 没有依赖的 effect 所以不会执行两次
    data.text = 'vue3 effect'
    console.log('xxx',bucket)
}, 1000);