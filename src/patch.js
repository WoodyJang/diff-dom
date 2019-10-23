import { setAttr } from './utils'
import { render,Element } from './element'
let allPatches
let index = 0   //默认给哪个需要打补丁

function patch(node,patches){
  allPatches = patches
  walk(node)
}


function walk(node){
  let currentPatch = allPatches[index++]
  let childNodes = node.childNodes
  childNodes.forEach(child => walk(child));
  if (currentPatch){
    doPatch(node, currentPatch)
  }
}

function doPatch(node,patches){
  patches.forEach(patch => {
    switch(patch.type){
      case 'ATTRS':
        for(let key in patch.attrs){
          let value = patch.attrs[key]
          if(value){
            setAttr(node,key,value)
          }else{
            node.removeChild(key)
          }
        }
        break;
      case 'TEXT':
        node.textContent = patch.text
        break;
      case 'REPLACE':
        let newNode = (patch.newNode instanceof Element) ? render(patch.newNode) :document.createTextNode(patch.newNode)
        node.parentNode.replaceChild(newNode)
        break;
      case 'REMOVE':
        node.parentNode.removeChild(newNode)
        break;
      default:
        break;
      
    }
  })
}


export default patch