function patchChildren(
  prevChildFlags,
  nextChildFlags,
  prevChildren,
  nextChildren,
  container
) {
  switch (prevChildFlags) {
    // 旧的 children 是单个子节点，会执行该 case 语句块
    case ChildrenFlags.SINGLE_VNODE:
      switch (nextChildFlags) {
        case ChildrenFlags.SINGLE_VNODE:
          // 新的 children 也是单个子节点时，会执行该 case 语句块
          patch(prevChildren, nextChildren, container)
          break
        case ChildrenFlags.NO_CHILDREN:
          // 新的 children 中没有子节点时，会执行该 case 语句块
          container.removeChild(prevChildren.el)
          break
        default:
          // 但新的 children 中有多个子节点时，会执行该 case 语句块
          container.removeChild(prevChildren.el)
          for (let i = 0; i < nextChildren.length; i++) {
            mount(nextChildren[i], container)
          }
          break
      }
      break
    // 旧的 children 中没有子节点时，会执行该 case 语句块
    case ChildrenFlags.NO_CHILDREN:
      switch (nextChildFlags) {
        case ChildrenFlags.SINGLE_VNODE:
          // 新的 children 是单个子节点时，会执行该 case 语句块
          mount(nextChildren, container)
          break
        case ChildrenFlags.NO_CHILDREN:
          // 新的 children 中没有子节点时，会执行该 case 语句块
          break
        default:
          // 但新的 children 中有多个子节点时，会执行该 case 语句块
          for (let i = 0; i < nextChildren.length; i++) {
            mount(nextChildren[i], container)
          }
          break
      }
      break
    // 旧的 children 中有多个子节点时，会执行该 case 语句块
    default:
      switch (nextChildFlags) {
        case ChildrenFlags.SINGLE_VNODE:
          for (let i = 0; i < prevChildren.length; i++) {
            container.removeChild(prevChildren[i].el)
          }
          mount(nextChildren, container)
          break
        case ChildrenFlags.NO_CHILDREN:
          for (let i = 0; i < prevChildren.length; i++) {
            container.removeChild(prevChildren[i].el)
          }
          break
        default:
           /* ------------------------react-diff------------------ */
          // 但新的 children 中有多个子节点时，会执行该 case 语句块
          let lastIndex = 0
          for (let i = 0; i < nextChildren.length; i++) {
            const nextVNode = nextChildren[i]
            let j = 0,
              find = false
            for (j; j < prevChildren.length; j++) {
              const prevVNode = prevChildren[j]
              if (nextVNode.key === prevVNode.key) {
                find = true
                patch(prevVNode, nextVNode, container)
                if (j < lastIndex) {
                  // 需要移动
                  const refNode = nextChildren[i - 1].el.nextSibling
                  container.insertBefore(prevVNode.el, refNode)
                  break
                } else {
                  // 更新 lastIndex
                  lastIndex = j
                }
              }
            }
            if (!find) {
              // 挂载新节点
              const refNode =
                i - 1 < 0
                  ? prevChildren[0].el
                  : nextChildren[i - 1].el.nextSibling
              mount(nextVNode, container, false, refNode)
            }
          }
          // 移除已经不存在的节点
          for (let i = 0; i < prevChildren.length; i++) {
            const prevVNode = prevChildren[i]
            const has = nextChildren.find(
              nextVNode => nextVNode.key === prevVNode.key
            )
            if (!has) {
              // 移除
              container.removeChild(prevVNode.el)
            }
          }

          /* ------------------------vue-diff------------------ */
          // 当新的 children 中有多个子节点时，会执行该 case 语句块
          let oldStartIdx = 0
          let oldEndIdx = prevChildren.length - 1
          let newStartIdx = 0
          let newEndIdx = nextChildren.length - 1
          let oldStartVNode = prevChildren[oldStartIdx]
          let oldEndVNode = prevChildren[oldEndIdx]
          let newStartVNode = nextChildren[newStartIdx]
          let newEndVNode = nextChildren[newEndIdx]

          while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
            if (!oldStartVNode) {
              oldStartVNode = prevChildren[++oldStartIdx]
            } else if (!oldEndVNode) {
              oldEndVNode = prevChildren[--oldEndIdx]
            } else if (oldStartVNode.key === newStartVNode.key) {
              patch(oldStartVNode, newStartVNode, container)
              oldStartVNode = prevChildren[++oldStartIdx]
              newStartVNode = nextChildren[++newStartIdx]
            } else if (oldEndVNode.key === newEndVNode.key) {
              patch(oldEndVNode, newEndVNode, container)
              oldEndVNode = prevChildren[--oldEndIdx]
              newEndVNode = newEndVNode[--newEndIdx]
            } else if (oldStartVNode.key === newEndVNode.key) {
              patch(oldStartVNode, newEndVNode, container)
              container.insertBefore(
                oldStartVNode.el,
                oldEndVNode.el.nextSibling
              )
              oldStartVNode = prevChildren[++oldStartIdx]
              newEndVNode = nextChildren[--newEndIdx]
            } else if (oldEndVNode.key === newStartVNode.key) {
              patch(oldEndVNode, newStartVNode, container)
              container.insertBefore(oldEndVNode.el, oldStartVNode.el)
              oldEndVNode = prevChildren[--oldEndIdx]
              newStartVNode = nextChildren[++newStartIdx]
            } else {
               //四种情况均不符合
              // 遍历旧 children，试图寻找与 newStartVNode 拥有相同 key 值的元素
              const idxInOld = prevChildren.findIndex(
                node => node.key === newStartVNode.key
              )
              if (idxInOld >= 0) {
                // vnodeToMove 就是在旧 children 中找到的节点，该节点所对应的真实 DOM 应该被移动到最前面
                const vnodeToMove = prevChildren[idxInOld]
                // 调用 patch 函数完成更新
                patch(vnodeToMove, newStartVNode, container)
                // 把 vnodeToMove.el 移动到最前面，即 oldStartVNode.el 的前面
                container.insertBefore(vnodeToMove.el, oldStartVNode.el)
                // 由于旧 children 中该位置的节点所对应的真实 DOM 已经被移动，所以将其设置为 undefined
                prevChildren[idxInOld] = undefined
              } else {
                // 新增节点，挂载到oldStartVNode.el前面
                // 使用 mount 函数挂载新节点
                mount(newStartVNode, container, false, oldStartVNode.el)
              }
              // 将 newStartIdx 下移一位
              newStartVNode = nextChildren[++newStartIdx]
            }
          }
          //新增节点
          if (oldEndIdx < oldStartIdx) {
            // 添加新节点
            for (let i = newStartIdx; i <= newEndIdx; i++) {
              mount(nextChildren[i], container, false, oldStartVNode.el)
            }
          } else if (newEndIdx < newStartIdx) {
            // 移除操作
            for (let i = oldStartIdx; i <= oldEndIdx; i++) {
              container.removeChild(prevChildren[i].el)
            }
          }
          break
      }
      break
  }
}
