// 被代理的对象
const actualData = {}

// 代理对象
const data = new Proxy(actualData, {
    get: (target, key) => {
        console.log('get', target, key);
        // 返回被代理对象的值
        return target[key]
    },
    set: (target, key, value) => {
        console.log('set', target, key, value);
        // 设置被代理对象的值
        target[key] = value

        // 必须返回true 标识成功
        // return true
        return value
    }
})

// 设置值
data.p = 'a' // set {} p a
// 访问整个对象,不会触发get
console.log(data) // Proxy {p: 'a'}
// 触发get
console.log(data.p) // get {p: 'a'} p
// a