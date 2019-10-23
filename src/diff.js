

let Index = 0

function diffAttr(oldAttrs,newAttrs){
  let patch = {}
  for(let key in oldAttrs){
    if(oldAttrs[key] !== newAttrs[key]){
      patch[key] = newAttrs[key]    //有可能是undefined
    }
  }
  for (let key in newAttrs) {
    //老节点没有新节点属性
    if (!oldAttrs.hasOwnProperty(key)) {
      patch[key] = newAttrs[key]    //有可能是undefined
    }
  }
  return patch
}

function diffChildren(oldChildren,newChildren,patches){
  oldChildren.forEach((child,idx) => {
    walk(child, newChildren[idx], ++Index,patches)
  })
}

function isString(node){
  return Object.prototype.toString.call(node) === '[object String]'
}

function walk(oldNode,newNode,index,patches){
  let currentPatch = []
  //1、新节点没有
  //2、判断是否都是文本节点，如果都是文本节点并且不同，直接修改
  //3、节点相同，属性不同
  //4、其他情况均替换
  if(!newNode){
    currentPatch.push({ type: 'REMOVE', index })
  }else if(isString(oldNode) && isString(newNode)){
    if(oldNode !== newNode){
      currentPatch.push({type:'TEXT',text:newNode})
    }
  }else if(oldNode.type === newNode.type){
    let attrs = diffAttr(oldNode.props,newNode.props)
    if(Object.keys(attrs).length){
      currentPatch.push({ type: 'ATTRS', attrs})
    }
    //如果有子节点，遍历子节点
    diffChildren(oldNode.children, newNode.children, patches)
  }else {
    //替换
    currentPatch.push({ type: 'REPLACE', newNode })
  }



  if(currentPatch.length){ //当前元素有补丁，再放大补丁包中
    patches[index] = currentPatch
  }
  
}

function diff(oldTree,newTree){
  let patches = {}
  let index = 0

  walk(oldTree,newTree,index,patches)

  return patches
}


export default diff