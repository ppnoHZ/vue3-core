// 存储副作用函数
const bucket = new Set()

// 被代理的对象
const actualData = { text: 'vue3' }

// 代理对象
const data = new Proxy(actualData, {
    get: (target, key) => {
        console.log('get [key]:%s,[value]:%s',key, target[key]);
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
}, 1000);