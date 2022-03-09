/*
 * @Author: ShawnPhang
 * @Date: 2021-07-14 15:16:43
 * @Description:
 * @LastEditors: ShawnPhang
 * @LastEditTime: 2022-03-08 22:14:31
 * @site: book.palxp.com / blog.palxp.com
 */
/**
 * 同步操作 store.commit() 调用
 */
interface Iprops {
  commit: (a: any, b: any) => void
  state: {}
}
export default {
  selectItem(state: Type.Object, { data, type }: any) {
    state.selectItem.data = data
    state.selectItem.type = type
  },
  resize(state: Type.Object, data: Type.Object) {
    const { width, height } = data
    const target = state.dActiveElement
    target.width = width
    target.height = height
  },
  setWidgetStyle(state: Type.Object, { uuid, key, value, pushHistory }: Type.Object) {
    const widget = state.dWidgets.find((item: any) => item.uuid === uuid)
    widget[key] = value
  },
  setMouseEvent(state: Type.Object, e: Event | null) {
    state.activeMouseEvent = e
  },
  setDWidgets(state: Type.Object, e: any) {
    state.dWidgets = e
  },
  setDPage(state: Type.Object, e: any) {
    state.dPage = e
  },
  setShowMoveable(state: Type.Object, e: any) {
    state.showMoveable = e
  },
  setShowRotatable(state: Type.Object, e: any) {
    state.showRotatable = e
  },
  zoomScreenChange(state: Type.Object, e: any) {
    // 画布尺寸适应度强制刷新
    state.zoomScreenChange = Math.random()
  },
  updateRect(state: Type.Object, e: any) {
    // 强制刷新操作框
    state.updateRect = Math.random()
  },
  updateSelect(state: Type.Object, e: any) {
    // 强制触发元素选择
    state.updateSelect = Math.random()
  },
}
