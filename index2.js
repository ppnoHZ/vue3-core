// 区分object的key来存储和执行effect

//  target      --WeakMap
//      key1    --Map
//         fn   --Set
//         fn1   --Set
//      key1
//         fn

// 存储副作用函数
const bucket = new WeakMap()


// 被代理的对象
const actualData = { text: 'vue3' }

// 代理对象
const data = new Proxy(actualData, {
    get: (target, key) => {
        console.log('get [key]:%s,[value]:%s', key, target[key]);
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

        // 返回被代理对象的值
        return target[key]
    },
    set: (target, key, value) => {
        console.log('set', target, key, value);
        // 设置被代理对象的值
        target[key] = value
        const depsMap = bucket.get(target)
        if (!depsMap) return

        //  根据当前key 取除依赖并执行
        const effects = depsMap.get(key)
        effects && effects.forEach(fn => fn())
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
    // 这里只对text的值进行了读取,
    document.body.innerHTML = data.text
})

setTimeout(() => {
    // data.text = 'hello vue3'
    // 当对其他非text属性进行设置的时候,还是会取出bucket 里的function进行执行
    // 所以就会执行两遍：1是在40行，2是在55行
    // 主要是因为没区分到底是哪个key变化了
    data.notExist = 'dddd'
    // 这里的notExist 没有依赖的 effect 所以不会执行两次
    data.text = 'vue3 effect'
}, 1000);