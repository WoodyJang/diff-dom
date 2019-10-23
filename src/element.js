import { setAttr } from './utils'

class Element {
  constructor(type,props,children){
    this.type = type
    this.props = props
    this.children = children
  }
}

//返回虚拟节点的object
function createElement(type, props, children){
  return new Element(type,props,children)
}

//渲染方法
function render(eleObj){
  let el = document.createElement(eleObj.type)
  for(let key in eleObj.props){
    setAttr(el, key, eleObj.props[key])
  }
  //遍历儿子，如果是虚拟dom继续渲染，不是就代表的是文本节点
  eleObj.children.forEach(child => {
    child = (child instanceof Element) ? render(child) : document.createTextNode(child)
    el.appendChild(child)
  })
  return el
}

//将元素插入到页面内
function renderDom(el,target){
  target.appendChild(el)
}

export { createElement, render, Element, renderDom}