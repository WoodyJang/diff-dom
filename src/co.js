let fsPromises = require('fs').promises
// co实现
 function co(it){
  return new Promise((resolve,reject) => {
    function next(data){
      let {
        value,
        done
      } = it.next()
      if(!done){
        Promise.resolve(value).then(data => next(data), reject)
      }else{
        resolve(data)
      }
    }
    next()
  })
}

function *read (){
  let content = yield fsPromises.readFile('./name.txt','utf-8')
  return content
}

co(read()).then(data => console.log(data),err => console.log(err))