const PENDING = 'PENDING'
const RESOLVED = 'RESOLVED'
const REJECTED = 'REJECTED'

const resolvePromise = (promise2,x,resolve,reject) => {
  //判断x是否与promise2为同一个，如果是直接抛出错误
  if(promise2 === x){
    throw new TypeError('Chaining cycle detected for promise #<Promise>')
  }
  if((typeof x === 'object' && x !== null) || typeof x === 'function'){
    let called;  //内部测试的时候，成功和失败都会调用
    try {
      let then = x.then
      if(typeof then === 'function'){
        then.call(x,y => { //y可能还是一个promise
          if (called) return
          called = true //防止多次调用成功和失败
          resolvePromise(promise2, y, resolve, reject)  //采用promise的成功结果向下传递
        },r => {
          if (called) return
          called = true   //防止多次调用成功和失败
          reject(r)       //采用失败结果向下传递
        })
      }else {
        resolve(x)   //普通值
      }
    } catch (error) {
      if(called) return
      called = true    //防止多次调用成功和失败
      reject(error)
    }
  }else{
    resolve(x)   //普通值
  }
}

class Promise {
  constructor(executor){
    this.state = PENDING  //默认是pending状体
    this.value  = undefined   //成功的值
    this.reason = undefined   //失败原因

    this.onResolvedCallbacks = [] //成功的回调数组
    this.onRejectedCallbacks = []  // 失败的回调数组
    //成功函数
    let resolve = (value) => {
      //屏蔽调用
      if(this.state === PENDING){
        this.value = value
        this.state = RESOLVED
        this.onResolvedCallbacks.forEach(fn => fn())
      }
     
    }
    //失败函数
    let reject = (reason) => {
      if (this.state === PENDING) {
        this.reason = reason
        this.state = REJECTED
        this.onRejectedCallbacks.forEach(fn => fn())
      }
    }
    try {
      executor(resolve, reject) //默认执行
    } catch (error) {
      //如果执行失败，默认调用reject
      reject(error)
    }
    
  }
  then(onfulfilled,onrejected){
    // onfulfilled,onrejected 是可选参数，处理不传的情况

    onfulfilled = typeof onfulfilled === 'function' ? onfulfilled : value => value
    onrejected = typeof onrejected === 'function' ? onrejected : err => {
      throw err
    }
    let promise2 = new Promise((resolve,reject) => {
      //解决同步
      if (this.state === RESOLVED) {
        //延时拿到promise2
        setTimeout(() => {
          try {
            let x = onfulfilled(this.value)
            //x可能是普通值或者是promise
            //判断x的值 => promise2的状态
            resolvePromise(promise2, x, resolve, reject)
          } catch (error) {
            reject(error)
          }
          
        },0)
        
        
      }
      if (this.state === REJECTED) {
        setTimeout(() => {
          try {
            let x = onrejected(this.reason)
            //x可能是普通值或者是promise
            //判断x的值 => promise2的状态
            resolvePromise(promise2, x, resolve, reject)
          } catch (error) {
            reject(error)
          }
        }, 0)
        
      }
      //调用异步函数时，把函数先储存起来,等异步结束之后再执行
      if (this.state === PENDING) {
        this.onResolvedCallbacks.push(() => {
          //延时拿到promise2
          setTimeout(() => {
            try {
              let x = onfulfilled(this.value)
              //x可能是普通值或者是promise
              //判断x的值 => promise2的状态
              resolvePromise(promise2, x, resolve, reject)
            } catch (error) {
              reject(error)
            }
          }, 0)
        })
        this.onRejectedCallbacks.push(() => {
          //延时拿到promise2
          setTimeout(() => {
            try {
              let x = onrejected(this.reason)
              //x可能是普通值或者是promise
              //判断x的值 => promise2的状态
              resolvePromise(promise2, x, resolve, reject)
            } catch (error) {
              reject(error)
            }
           
          }, 0)
        })
      }
    })

    return promise2
    

  }
}
// 解决封装嵌套的问题
Promise.defer = Promise.deferred = function () {
  let dfd = {}
  dfd.promise = new Promise((resolve, reject) => {
    dfd.resolve = resolve;
    dfd.reject = reject;
  });
  return dfd;
}

const isPromise = (value) => {
  if ((typeof x === 'object' && x !== null) || typeof x === 'function') {
    if(typeof value.then === 'function'){
      return true
    }
  }else {
    return false
  }
}

//有一个失败就失败
Promise.all = function(values){
  return new Promise((resolve,reject) => {
    let arr = []
    let index = 0  //解决多个异步的并发问题，要使用计数器

    function processData(key,value){
      arr[key] = value
      if(++index === values.length){
        resolve(arr)
      }
    }
    
    for(let i = 0;i<values.length;i++){
      let current = values[i]
      if(isPromise(current)){
        current.then(data => {
          processData(i,data)
        },reject)
      }else {
        processData(i, current)
      }
    }
  })
}

Promise.race = function (promises) {
  return new Promise((resolve, reject) => {
    promises.forEach((promise, index) => {
      promise.then(resolve, reject);
    });
  });
}


Promise.resolve = function (value) {
  return new Promise(resolve => {
    resolve(value);
  });
}

Promise.reject = function (reason) {
  return new Promise((resolve, reject) => {
    reject(reason);
  });
}

Promise.prototype.catch = function (onRejected) {
  return this.then(null, onRejected);
}

Promise.prototype.finally = function (callback){
  let P = this.constructor;
  return this.then(
    value => P.resolve(callback()).then(() => value),
    reason => P.resolve(callback()).then(() => { throw reason })
  );

}

new Promise((resolve,reject) => {
  resolve('10000')
}).then(data => {
  console.log('s', data)
   setTimeout(() => {
    return 4
  },5000)
},err => {
  console.log(err)
  return 100
}).then(data => {
  console.log('ss',data)
})



// 安装包
// npm install -g  promises-aplus-tests
// 并执行
// promises-aplus-tests promise.js


module.exports = Promise