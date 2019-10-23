import { createElement, render,renderDom} from './element'
import diff from './diff'
import patch from './patch'

let vdom1 = createElement('ul',{class:'list'},[
  createElement('li', { class: 'item' }, ['a']),
  createElement('li', { class: 'item' }, ['b']),
  createElement('li', { class: 'item' }, ['c']),
])

let vdom2 = createElement('ul', { class: 'list-group' }, [
  createElement('li', { class: 'item-1' }, ['1']),
  createElement('li', { class: 'item' }, ['b']),
  createElement('li', { class: 'item-1' }, ['3']),
])

let el = render(vdom1)
renderDom(el,window.root)
let patches = diff(vdom1, vdom2)
setTimeout(() => {
  patch(el, patches)
},3000)

console.log(patches) 