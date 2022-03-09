/*
 * @Author: ShawnPhang
 * @Date: 2022-03-09 16:29:54
 * @Description: 处理和ctrl建相关的操作
 * @LastEditors: ShawnPhang
 * @LastEditTime: 2022-03-09 17:21:43
 * @site: book.palxp.com / blog.palxp.com
 */
import store from '@/store'

export default function dealWithCtrl(e: any) {
  switch (e.keyCode) {
    case 71: // g
      e.preventDefault()
      store.dispatch('realCombined')
      break
    case 67: // c
      if (store.getters.dActiveElement.uuid === '-1') {
        return
      } else if (store.getters.dActiveElement.isContainer && checkGroupChild(store.getters.dActiveElement.uuid, 'editable')) {
        return
      }
      !store.getters.dActiveElement.editable && store.dispatch('copyWidget')
      break
    case 86: // v
      if (store.getters.dCopyElement.length === 0) {
        return
      } else if (store.getters.dActiveElement.isContainer && checkGroupChild(store.getters.dActiveElement.uuid, 'editable')) {
        return
      }
      !store.getters.dActiveElement.editable && store.dispatch('pasteWidget')
      break
    case 90: // z
      if (e.shiftKey) {
        if (!(store.getters.dHistoryParams.index === store.getters.dHistoryParams.length - 1)) {
          // this.handleHistory('redo')
          store.dispatch('handleHistory', 'redo')
        }
      } else if (!(store.getters.dHistoryParams.index === -1 || (store.getters.dHistoryParams === 0 && store.getters.dHistoryParams.length === 10))) {
        // this.handleHistory('undo')
        store.dispatch('handleHistory', 'undo')
      }
      break
    case 83: // s
      // this.save()
      break
  }
}

/**
 * 对组合的子元素某个值进行判断
 */
function checkGroupChild(pid: number | string, key: any) {
  let itHas = false
  const childs = store.getters.dWidgets.filter((x: any) => x.parent === pid) || []
  childs.forEach((element: any) => {
    element[key] && (itHas = true)
  })
  return itHas
}
