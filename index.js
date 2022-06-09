const bucket = new Set()


// 被代理的对象
const actualData = { text: 'vue3' }

// 代理对象
const data = new Proxy(actualData, {
    get: (target, key) => {
        console.log('get', target, key);
        // 存储副作用函数
        bucket.add(effect)
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


function effect () {
    document.body.innerHTML = data.text
}

effect()

setTimeout(() => {
    data.text = 'hello vue3'
}, 1000);