// 存储副作用函数
const bucket = new Set()

// 被代理的对象
const actualData = { text: 'vue3' }

// 代理对象
const data = new Proxy(actualData, {
    get: (target, key) => {
        console.log('get', target, key);
        // 存储副作用函数
        if (activeEffect) {
            bucket.add(activeEffect)
        }
        // 返回被代理对象的值
        return target[key]
    },
    set: (target, key, value) => {
        console.log('set', target, key, value);
        // 设置被代理对象的值
        target[key] = value

        // 执行副作用函数
        bucket.forEach(fn => fn())
        // 必须返回true 标识成功
        // return true
        return value
    }
})


// 注册副作用函数


let activeEffect

function effect (fn) {
    // 临时存储副作用函数，方便 get的时候添加到 bucket中
    activeEffect = fn
    // 然后立即执行副作用函数,如果整个副作用函数里的操作会触发对象的 get 就会被收集
    fn()
}

effect(() => {
    document.body.innerHTML = data.text
})

setTimeout(() => {
    data.text = 'hello vue3'
}, 1000);