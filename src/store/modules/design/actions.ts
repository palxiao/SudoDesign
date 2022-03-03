import { customAlphabet } from 'nanoid/non-secure'
const nanoid = customAlphabet('1234567890abcdef', 12)

export default {
  /**
   * 保存操作历史，
   * 修改数据、移动完成后都会自动保存
   * 同时会保存当前激活的组件的uuid，方便撤回时自动激活
   */
  pushHistory(store) {
    // 历史记录列表
    const history = store.state.dHistory
    // 历史激活组件记录列表
    const uuidHistory = store.state.dActiveUuidHistory
    // 历史page记录列表
    const pageHistory = store.state.dPageHistory
    // 历史记录列表参数（长度和下标）
    const historyParams = store.state.dHistoryParams
    // 下标不等于-1表示已经存在历史操作记录
    // 下标小于历史列表长度-1，则说明不是在末尾添加记录，需要先删除掉下标之后的数据，否则会出现错乱
    if (historyParams.index < history.length - 1) {
      const index = historyParams.index + 1
      const len = history.length - index
      // 删除下标之后的所有历史记录
      history.splice(index, len)
      // 删除下标之后的所有uuid记录
      uuidHistory.splice(index, len)
      // 删除下标之后的所有page记录
      pageHistory.splice(index + 1, len - 1)
      historyParams.length = history.length
    }
    // 保存当前操作进历史记录
    history.push(JSON.stringify(store.state.dWidgets))
    uuidHistory.push(store.state.dActiveElement.uuid)
    pageHistory.push(JSON.stringify(store.state.dPage))
    // 历史记录最多10条，如果超过则从头部开始删，因为每次都是一条一条加的，所以只需删一条就行
    if (history.length > 10) {
      history.splice(0, 1)
      uuidHistory.splice(0, 1)
      pageHistory.splice(0, 1)
    }
    if (pageHistory.length - 1 > history.length) {
      pageHistory.splice(0, 1)
    }
    historyParams.index = history.length - 1
    historyParams.length = history.length
  },
  /**
   * 操作历史记录
   * action为undo表示撤销
   * action为redo表示重做
   */
  handleHistory(store, action) {
    const history = store.state.dHistory
    const uuidHistory = store.state.dActiveUuidHistory
    const pageHistory = store.state.dPageHistory
    const historyParams = store.state.dHistoryParams

    let uuid = '-1'

    if (action === 'undo') {
      // 下标向前移1
      historyParams.index -= 1
      // 如果下表大于等于0，直接取出历史记录
      if (historyParams.index >= 0) {
        store.state.dWidgets = JSON.parse(history[historyParams.index])
        store.state.dPage = JSON.parse(pageHistory[historyParams.index + 1])
        uuid = uuidHistory[historyParams.index]
      } else if (historyParams.length < 10) {
        // 否则如果历史记录长度小于10，则设置组件为空
        historyParams.index = -1
        store.state.dWidgets = []
        store.state.dPage = JSON.parse(pageHistory[0])
      } else {
        historyParams.index = -1
      }
    } else if (action === 'redo') {
      // 下标向后移1
      historyParams.index += 1
      // 如果下标小于历史记录列表长度，直接取出历史记录
      if (historyParams.index < historyParams.length) {
        store.state.dWidgets = JSON.parse(history[historyParams.index])
        store.state.dPage = JSON.parse(pageHistory[historyParams.index + 1])
        uuid = uuidHistory[historyParams.index]
      } else {
        // 否则设置下标为列表最后一项
        historyParams.index = historyParams.length - 1
        store.state.dWidgets = JSON.parse(history[historyParams.index])
        store.state.dPage = JSON.parse(pageHistory[historyParams.index + 1])
        uuid = uuidHistory[historyParams.index]
      }
    }
    // 激活组件默认为page
    let element = store.state.dPage
    if (uuid !== '-1') {
      element = store.state.dWidgets.find((item) => item.uuid === uuid)
    }
    store.state.dActiveElement = element
  },
  updateZoom(store, zoom) {
    store.state.dZoom = zoom
  },
  updateScreen(store, { width, height }) {
    store.state.dScreen.width = width
    store.state.dScreen.height = height
  },
  updateGridSize(store, { width, height }) {
    store.state.gridSize.width = width
    store.state.gridSize.height = height
  },
  updatePageData(store, { key, value, pushHistory }) {
    const page = store.state.dPage
    if (page[key] !== value || pushHistory) {
      page[key] = value
      store.dispatch('pushHistory')
    }
  },
  updateWidgetData(store, { uuid, key, value, pushHistory }) {
    const widget = store.state.dWidgets.find((item) => item.uuid === uuid)
    if (widget && (widget[key] !== value || pushHistory)) {
      switch (key) {
        case 'width':
          // const minWidth = widget.record.minWidth
          // const maxWidth = store.state.dPage.width - widget.left
          // value = Math.max(minWidth, Math.min(maxWidth, value))
          break
        case 'height':
          // const minHeight = widget.record.minHeight
          // const maxHeight = store.state.dPage.height - widget.top
          // value = Math.max(minHeight, Math.min(maxHeight, value))
          break
        case 'left':
        case 'top':
          if (widget.isContainer) {
            let dLeft = widget.left - value
            let dTop = widget.top - value
            if (key === 'left') {
              dTop = 0
            }
            if (key === 'top') {
              dLeft = 0
            }
            const len = store.state.dWidgets.length
            for (let i = 0; i < len; ++i) {
              const child = store.state.dWidgets[i]
              if (child.parent === widget.uuid) {
                child.left -= dLeft
                child.top -= dTop
              }
            }
          }
          break
      }

      widget[key] = value

      store.dispatch('pushHistory')
      store.dispatch('reChangeCanvas')
    }
  },
  addWidget(store: any, setting: any) {
    setting.uuid = nanoid()
    store.state.dWidgets.push(setting)
    const len = store.state.dWidgets.length
    store.state.dActiveElement = store.state.dWidgets[len - 1]

    store.dispatch('pushHistory')
    store.dispatch('reChangeCanvas')
  },
  addGroup(store: any, group: Type.Object) {
    let parent: any = null
    group.forEach((item: any) => {
      item.uuid = nanoid() // 重设id
      item.type === 'w-group' && (parent = item) // 找出父组件
    })
    group.forEach((item: any) => {
      !item.isContainer && (item.parent = parent.uuid) // 重设父id
      item.text && (item.text = decodeURIComponent(item.text))
      store.state.dWidgets.push(item)
    })
    // 选中组件
    const len = store.state.dWidgets.length
    store.state.dActiveElement = store.state.dWidgets[len - 1]
    store.dispatch('pushHistory')
    store.dispatch('reChangeCanvas')
  },
  // TODO: 选择模板
  setTemplate(store: any, allWidgets: any[]) {
    allWidgets.forEach((item: any) => {
      Number(item.uuid) < 0 && (item.uuid = nanoid()) // 重设id
      item.text && (item.text = decodeURIComponent(item.text))
      store.state.dWidgets.push(item)
    })
    // store.dispatch('pushHistory')
    store.dispatch('reChangeCanvas')
  },
  // TODO 删除
  deleteWidget(store: any) {
    const widgets = store.state.dWidgets
    const selectWidgets = store.state.dSelectWidgets
    const activeElement = store.state.dActiveElement

    let count = 0 // 记录容器里的组件数量
    if (selectWidgets.length !== 0) {
      for (let i = 0; i < selectWidgets.length; ++i) {
        const uuid = selectWidgets[i].uuid
        const index = widgets.findIndex((item) => item.uuid === uuid)
        widgets.splice(index, 1)
        try {
          // 清除掉可能存在的选中框
          document.getElementById(uuid).classList.remove('widget-selected')
        } catch (e) {}
      }
      store.state.dSelectWidgets = []
    } else {
      if (activeElement.type === 'page') {
        return
      }

      const uuid = activeElement.uuid
      const index = widgets.findIndex((item) => item.uuid === uuid)

      // 先删除组件
      widgets.splice(index, 1)

      // 如果删除的是容器，须将内部组件一并删除
      if (activeElement.isContainer) {
        for (let i = widgets.length - 1; i >= 0; --i) {
          if (widgets[i].parent === uuid) {
            widgets.splice(i, 1)
          }
        }
      } else if (activeElement.parent !== '-1') {
        for (let i = widgets.length - 1; i >= 0; --i) {
          if (widgets[i].parent === activeElement.parent) {
            count++
            if (count > 1) {
              break
            }
          }
        }
        if (count <= 1) {
          const index = widgets.findIndex((item) => item.uuid === activeElement.parent)
          widgets.splice(index, 1)
          if (count === 1) {
            const widget = widgets.find((item) => item.parent === activeElement.parent)
            widget.parent = '-1'
          }
          count = 0
        }
      }
    }

    if (count === 0) {
      // 重置 activeElement
      store.state.dActiveElement = store.state.dPage
    } else {
      store.state.dActiveElement = widgets.find((item) => item.uuid === activeElement.parent)
    }

    if (store.state.dActiveElement.uuid !== '-1') {
      store.dispatch('updateGroupSize', store.state.dActiveElement.uuid)
    }

    store.dispatch('pushHistory')
    store.dispatch('reChangeCanvas')
  },
  copyWidget(store) {
    const activeElement = JSON.parse(JSON.stringify(store.state.dActiveElement))
    if (activeElement.type === 'page') {
      return
    }

    const container = []
    const selectWidgets = store.state.dSelectWidgets
    if (selectWidgets.length === 0) {
      const uuid = activeElement.uuid
      container.push(activeElement)
      if (activeElement.isContainer) {
        const widgets = store.state.dWidgets
        for (let i = 0; i < widgets.length; ++i) {
          if (widgets[i].parent === uuid) {
            container.push(widgets[i])
          }
        }
      }
    } else {
      for (let i = 0; i < selectWidgets.length; ++i) {
        const uuid = selectWidgets[i].uuid
        container.push(selectWidgets[i])
        if (selectWidgets[i].isContainer) {
          const widgets = store.state.dWidgets
          for (let i = 0; i < widgets.length; ++i) {
            if (widgets[i].parent === uuid) {
              container.push(widgets[i])
            }
          }
        }
      }
    }
    store.state.dCopyElement = JSON.parse(JSON.stringify(container))
  },
  pasteWidget(store) {
    const copyElement = JSON.parse(JSON.stringify(store.state.dCopyElement))
    const container = copyElement.find((item) => item.isContainer)
    for (let i = 0; i < copyElement.length; ++i) {
      copyElement[i].uuid = nanoid()
      if (container && copyElement[i].uuid !== container.uuid) {
        copyElement[i].parent = container.uuid
      } else {
        copyElement[i].parent = '-1'
      }
      copyElement[i].top += 50
      copyElement[i].left += 50
    }
    store.state.dWidgets = store.state.dWidgets.concat(copyElement)
    store.state.dActiveElement = copyElement[0]
    store.state.dSelectWidgets = copyElement
    if (container) {
      store.state.dActiveElement = container
      store.state.dSelectWidgets = []
    }

    store.dispatch('pushHistory')
    store.dispatch('reChangeCanvas')
  },
  // TODO: 选中元件与取消选中
  selectWidget(store, { uuid }) {
    const alt = store.state.dAltDown
    const selectWidgets = store.state.dSelectWidgets
    const widget = store.state.dWidgets.find((item) => item.uuid === uuid)
    if (alt) {
      if (uuid !== '-1' && widget.parent === '-1' && !widget.isContainer) {
        if (selectWidgets.length === 0) {
          if (store.state.dActiveElement.uuid !== '-1') {
            selectWidgets.push(store.state.dActiveElement)
          }
        }
        const index = selectWidgets.findIndex((item) => {
          return item.uuid === uuid
        })
        // 如果已经存在则取消选择，否则加入选取
        if (index !== -1) {
          selectWidgets.splice(index, 1)
          if (selectWidgets.length === 0) {
            store.state.dActiveElement = store.state.dPage
          }
        } else {
          selectWidgets.push(widget)
        }
        if (selectWidgets.length === 1) {
          store.state.dActiveElement = selectWidgets[0]
          store.state.dSelectWidgets = []
        }
      }
      return
    }
    store.state.dSelectWidgets = []
    if (uuid === '-1') {
      store.state.dActiveElement = store.state.dPage
      const pageHistory = store.state.dPageHistory
      if (pageHistory.length === 0) {
        pageHistory.push(JSON.stringify(store.state.dPage))
      }
      setTimeout(() => {
        store.state.dSelectWidgets = []
      }, 10)
    } else {
      store.state.dActiveElement = widget
    }
  },
  // 多选元素
  selectWidgetsInOut(store, { uuid }) {
    const selectWidgets = store.state.dSelectWidgets
    const widget = store.state.dWidgets.find((item) => item.uuid === uuid)
    if (widget && uuid !== '-1' && widget.parent === '-1' && !widget.isContainer) {
      if (selectWidgets.length === 0) {
        if (store.state.dActiveElement.uuid !== '-1') {
          selectWidgets.push(store.state.dActiveElement)
        }
      }
      const index = selectWidgets.findIndex((item) => {
        return item.uuid === uuid
      })
      // 如果已经存在则取消选择，否则加入选取
      if (index !== -1) {
        selectWidgets.splice(index, 1)
        if (selectWidgets.length === 0) {
          store.state.dActiveElement = store.state.dPage
        }
      } else {
        selectWidgets.push(widget)
      }
      // if (selectWidgets.length === 1) {
      //   store.state.dActiveElement = selectWidgets[0]
      //   store.state.dSelectWidgets = []
      // }
    }
  },
  // 设置 mousemove 操作的初始值
  initDMove(store, payload) {
    const mouseXY = store.state.dMouseXY
    const widgetXY = store.state.dActiveWidgetXY
    mouseXY.x = payload.startX
    mouseXY.y = payload.startY
    widgetXY.x = payload.originX
    widgetXY.y = payload.originY
  },
  // 组件移动结束
  stopDMove(store) {
    if (store.state.dMoving) {
      store.dispatch('pushHistory')
    }
    store.state.dMoving = false
  },
  // 移动组件
  dMove(store, payload) {
    const { donotMove } = payload // 由moveable代理移动
    store.state.dMoving = true

    const page = store.state.dPage

    const target = store.state.dActiveElement
    const mouseXY = store.state.dMouseXY
    const widgetXY = store.state.dActiveWidgetXY

    let parent = page

    if (target.parent !== '-1') {
      parent = store.state.dWidgets.find((item) => item.uuid === target.parent)
    }

    const dx = payload.x - mouseXY.x
    const dy = payload.y - mouseXY.y
    let left = widgetXY.x + Math.floor((dx * 100) / store.state.dZoom)
    let top = widgetXY.y + Math.floor((dy * 100) / store.state.dZoom)

    left = Math.max(Math.min(left, page.width - target.record.width), 0)
    top = Math.max(Math.min(top, page.height - target.record.height), 0)

    if (target.isContainer) {
      const dLeft = target.left - left
      const dTop = target.top - top
      const len = store.state.dWidgets.length
      for (let i = 0; i < len; ++i) {
        const widget = store.state.dWidgets[i]
        if (widget.parent === target.uuid) {
          widget.left -= dLeft
          widget.top -= dTop
        }
      }
    }

    if (!donotMove) {
      target.left = left
      target.top = top
    }

    if (parent.uuid !== '-1') {
      store.dispatch('updateGroupSize', parent.uuid)
    }

    store.dispatch('reChangeCanvas')
  },
  // 设置 resize 操作的初始值
  initDResize(store, payload) {
    const mouseXY = store.state.dMouseXY
    const widgetXY = store.state.dActiveWidgetXY
    const resizeWH = store.state.dResizeWH
    mouseXY.x = payload.startX
    mouseXY.y = payload.startY
    widgetXY.x = payload.originX
    widgetXY.y = payload.originY
    resizeWH.width = payload.width
    resizeWH.height = payload.height
  },
  // 更新组件宽高
  dResize(store, { x, y, dirs }) {
    store.state.dResizeing = true

    const page = store.state.dPage
    const target = store.state.dActiveElement
    const mouseXY = store.state.dMouseXY
    const widgetXY = store.state.dActiveWidgetXY
    const resizeWH = store.state.dResizeWH
    let parent = page

    if (target.parent !== '-1') {
      parent = store.state.dWidgets.find((item) => item.uuid === target.parent)
    }

    const dx = x - mouseXY.x
    const dy = y - mouseXY.y

    let left = 0
    let top = 0

    for (let i = 0; i < dirs.length; ++i) {
      const dir = dirs[i]

      switch (dir) {
        case 'top':
          const t = widgetXY.y + Math.floor((dy * 100) / store.state.dZoom)
          top = Math.max(t, 0)
          top = Math.min(widgetXY.y + resizeWH.height - target.record.minHeight, top)
          target.height += target.top - top
          target.height = Math.max(target.height, target.record.minHeight)
          target.top = top
          break
        case 'bottom':
          top = Math.floor((dy * 100) / store.state.dZoom)
          target.height = resizeWH.height + top
          target.height = Math.max(target.height, target.record.minHeight)
          target.height = Math.min(target.height, page.height - target.top)
          break
        case 'left':
          const tLeft = widgetXY.x + Math.floor((dx * 100) / store.state.dZoom)
          left = Math.max(tLeft, 0)
          target.width += target.left - left
          target.width = Math.max(target.width, target.record.minWidth)
          left = Math.min(widgetXY.x + resizeWH.width - target.record.minWidth, left)
          target.left = left
          break
        case 'right':
          left = Math.floor((dx * 100) / store.state.dZoom)
          target.width = resizeWH.width + left
          target.width = Math.max(target.width, target.record.minWidth)
          target.width = Math.min(target.width, page.width - target.left)
          break
      }
    }
    if (parent.uuid !== '-1') {
      store.dispatch('updateGroupSize', parent.uuid)
    }

    store.dispatch('reChangeCanvas')
  },
  // 组件调整结束
  stopDResize(store) {
    if (store.state.dResizeing) {
      store.dispatch('pushHistory')
    }
    store.state.dResizeing = false
  },
  // 强制重绘画布
  reChangeCanvas(store) {
    const tag = store.state.dPage.tag
    store.state.dPage.tag = tag === 0 ? 0.01 : 0
  },
  pushColorToHistory(store, color) {
    const history = store.state.dColorHistory
    // 如果已经存在就提到前面来，避免重复
    const index = history.indexOf(color)
    if (index !== -1) {
      history.splice(index, 1)
    }
    // 最多保存20种颜色
    if (history.length === 20) {
      history.splice(history.length - 1, 1)
    }
    // 把最新的颜色放在头部
    const head = [color]
    store.state.dColorHistory = head.concat(history)
  },
  updateHoverUuid(store, uuid) {
    store.state.dHoverUuid = uuid
  },
  showRefLine(store, show) {
    store.state.dShowRefLine = show
  },
  updateAlign(store: any, { align, uuid, group }: any) {
    const widgets = store.state.dWidgets
    const target = uuid ? widgets.find((item: any) => item.uuid === uuid) : store.state.dActiveElement
    let parent = group || store.state.dPage

    if (target.parent !== '-1') {
      parent = widgets.find((item: any) => item.uuid === target.parent)
    }

    let left = target.left
    let top = target.top
    let pw = parent.record.width || parent.width
    let ph = parent.record.height || parent.height

    if (parent.uuid === '-1') {
      pw = parent.width
      ph = parent.height
    }

    const targetW = target.width
    const targetH = target.height
    switch (align) {
      case 'left':
        left = parent.left
        break
      case 'ch': // 水平居中
        left = parent.left + pw / 2 - targetW / 2
        break
      case 'right':
        left = parent.left + pw - targetW
        break
      case 'top':
        top = parent.top
        break
      case 'cv': // 垂直居中
        top = parent.top + ph / 2 - targetH / 2
        break
      case 'bottom':
        top = parent.top + ph - targetH
        break
    }

    if (target.left !== left || target.top !== top) {
      if (target.isContainer) {
        const dLeft = target.left - left
        const dTop = target.top - top
        const len = widgets.length
        for (let i = 0; i < len; ++i) {
          const widget = widgets[i]
          if (widget.parent === target.uuid) {
            widget.left -= dLeft
            widget.top -= dTop
          }
        }
      }
      target.left = left
      target.top = top

      store.dispatch('pushHistory')
      store.dispatch('reChangeCanvas')
    }
  },
  getWidgetJsonData(store) {
    const page = JSON.parse(JSON.stringify(store.state.dPage))
    const widgets = JSON.parse(JSON.stringify(store.state.dWidgets))
    page.widgets = widgets

    return page
  },
  // TODO 组合操作
  updateAltDown(store, value) {
    store.state.dAltDown = value
    console.log('控制组合按键, 成组功能为: realCombined')
  },
  realCombined(store: any) {
    const selectWidgets = store.state.dSelectWidgets
    if (selectWidgets.length > 1) {
      const widgets = store.state.dWidgets
      const group = JSON.parse(store.state.dGroupJson)
      group.uuid = nanoid()
      widgets.push(group)
      let left = store.state.dPage.width
      let top = store.state.dPage.height
      let right = 0
      let bottom = 0
      const sortWidgets = [] // 顺序取出元素
      const selectkeys = selectWidgets.map((x: Type.Object) => x.uuid)
      for (const w of widgets) {
        selectkeys.includes(w.uuid) && sortWidgets.push(w)
      }
      for (let i = 0; i < sortWidgets.length; ++i) {
        const uuid = sortWidgets[i].uuid
        const index = widgets.findIndex((item: Type.Object) => item.uuid === uuid)
        const widget = { ...widgets[index] } // clone
        if (widget.isContainer) {
          widgets.splice(index, 1) // 删除旧组合
          for (let i = 0; i < widgets.length; i++) {
            const item = widgets[i]
            item.parent === widget.uuid && (item.parent = group.uuid)
            // if (item.parent === widget.uuid) {
            //   item.parent = group.uuid
            //   // 重新排列
            //   // const index = widgets.findIndex((x) => x.uuid === item.uuid)
            //   // widgets.splice(index, 1)
            //   // widgets.push(item)
            // }
          }
        } else {
          widget.parent = group.uuid
          // 重新排列
          widgets.splice(index, 1)
          widgets.push(widget)
        }

        // sortWidgets.push({
        //   index: index,
        //   widget: widget,
        // })
        left = Math.min(left, widget.left)
        top = Math.min(top, widget.top)
        right = Math.max(right, Number(widget.width || widget.record.width) + Number(widget.left))
        bottom = Math.max(bottom, Number(widget.height || widget.record.height) + Number(widget.top))
      }
      // sortWidgets.sort((a, b) => a.index > b.index)
      // for (let i = 0; i < sortWidgets.length; ++i) {
      //   const index = widgets.findIndex((item) => item.uuid === sortWidgets[i].widget.uuid)
      //     widgets.splice(index, 1)
      //     widgets.push(sortWidgets[i].widget)
      // }

      group.left = left
      group.top = top
      group.width = right - left
      group.height = bottom - top

      store.state.dActiveElement = group
      store.state.dSelectWidgets = []

      store.dispatch('pushHistory')
      // store.dispatch('reChangeCanvas')
    }
  },
  getCombined(store: any) {
    const selectWidgets = store.state.dSelectWidgets
    return new Promise((resolve) => {
      if (selectWidgets.length > 1) {
        const widgets = store.state.dWidgets
        const group = JSON.parse(store.state.dGroupJson)
        group.uuid = nanoid()
        // widgets.push(group)
        let left = store.state.dPage.width
        let top = store.state.dPage.height
        let right = 0
        let bottom = 0
        const sortWidgets = [] // 顺序取出元素
        const selectkeys = selectWidgets.map((x: Type.Object) => x.uuid)
        for (const w of widgets) {
          selectkeys.includes(w.uuid) && sortWidgets.push(w)
        }
        for (let i = 0; i < sortWidgets.length; ++i) {
          const uuid = sortWidgets[i].uuid
          const index = widgets.findIndex((item: Type.Object) => item.uuid === uuid)
          const widget = { ...widgets[index] } // clone
          left = Math.min(left, widget.left)
          top = Math.min(top, widget.top)
          right = Math.max(right, Number(widget.width) + Number(widget.left))
          bottom = Math.max(bottom, Number(widget.height) + Number(widget.top))
        }

        group.left = left
        group.top = top
        group.width = right - left
        group.height = bottom - top

        resolve(group)
      }
    })
  },
  initGroupJson(store, json) {
    store.state.dGroupJson = json
  },
  updateGroupSize(store, uuid) {
    const widgets = store.state.dWidgets
    const group = widgets.find((item) => item.uuid === uuid)
    let left = store.state.dPage.width
    let top = store.state.dPage.height
    let right = 0
    let bottom = 0
    for (let i = 0; i < widgets.length; ++i) {
      if (widgets[i].parent === group.uuid) {
        left = Math.min(left, widgets[i].left)
        top = Math.min(top, widgets[i].top)
        right = Math.max(right, widgets[i].record.width + widgets[i].left)
        bottom = Math.max(bottom, widgets[i].record.height + widgets[i].top)
      }
    }
    group.width = right - left
    group.height = bottom - top
    group.left = left
    group.top = top
  },
  updateLayerIndex(store, { uuid, value, isGroup }) {
    const widgets = store.state.dWidgets
    const widget = widgets.find((item) => item.uuid === uuid)
    const index = widgets.findIndex((item) => item.uuid === uuid)
    let group = []
    if (isGroup) {
      // 组合组件移动
      group = widgets.filter((item) => item.parent === uuid)
      for (let i = 0; i < group.length; ++i) {
        const pos = widgets.findIndex((item) => item.uuid === group[i].uuid)
        widgets.splice(pos, 1)
      }
    }

    // 单个组件移动，组合的把容器内的组件取出来后也相当于是移动单个组件
    let next = index + value
    let move = false
    const maxLen = widgets.length
    let gCount = 1 // 记录跳过的组合数量
    // 循环找出要目标位置并移动（因为存在组合，所以不能直接移动到下一个位置）
    while (next >= 0 && next < maxLen) {
      const nextWidget = widgets[next]
      if (widget.parent !== '-1') {
        // 如果是在容器里面，比较简单，只要目标组件的父容器一样就移动，不一样说明出了容器了就不移动
        if (nextWidget.parent === widget.parent) {
          widgets.splice(index, 1)
          widgets.splice(next, 0, widget)
          move = true
        }
        break
        // 如果父容器一样并且（目标组件不是容器或者先上移动并且目标组件是容器），则是要移动的位置
      } else if (nextWidget.parent === '-1') {
        if ((gCount === 0 && nextWidget.isContainer) || !nextWidget.isContainer || (value < 0 && nextWidget.isContainer)) {
          if (gCount === 0 && value > 0) {
            next -= value
          }
          widgets.splice(index, 1)
          widgets.splice(next, 0, widget)
          move = true
          break
        } else if (nextWidget.isContainer) {
          gCount = 0
        }
      }
      next += value
    }
    next -= value
    if (!move && next !== index) {
      widgets.splice(index, 1)
      widgets.splice(next, 0, widget)
    }

    // 如果是组合，要把里面的组件添加回去
    if (isGroup) {
      const pos = widgets.findIndex((item) => item.uuid === uuid)
      for (let i = group.length - 1; i >= 0; --i) {
        widgets.splice(pos + 1, 0, group[i])
      }
    }
  },
  // TODO: 取消组合
  ungroup(store, uuid) {
    const widgets = store.state.dWidgets
    const index = widgets.findIndex((item) => item.uuid === uuid)
    widgets.splice(index, 1)
    const len = widgets.length

    for (let i = 0; i < len; ++i) {
      if (widgets[i].parent === uuid) {
        widgets[i].parent = '-1'
        // store.state.dAltDown = true
        // store.dispatch('selectWidgetsInOut', { uuid: widgets[i].uuid })
        store.state.dSelectWidgets.push(widgets[i])
      }
    }
    // store.state.dAltDown = false
    store.commit('updateSelect')
    // store.state.dActiveElement = store.state.dPage
  },
}