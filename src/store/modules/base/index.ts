/*
 * @Author: ShawnPhang
 * @Date: 2021-12-16 16:20:16
 * @Description:
 * @LastEditors: ShawnPhang
 * @LastEditTime: 2022-01-12 10:04:40
 * @site: book.palxp.com / blog.palxp.com
 */
import mutations from './mutations'
import actions from './actions'
const all = {
  state: {
    loading: null,
    online: true, // 登录状态，
    user: {
      name: localStorage.getItem('username'),
    }, // 储存用户信息
    scroll: true,
    manager: '', // 是否为管理员模式
    tempEditing: false, // 管理员是否正在编辑模板
  },
  getters: {
    online: (state: Type.Object) => {
      return state.online
    },
    user: (state: Type.Object) => {
      return state.user
    },
    manager: (state: Type.Object) => {
      return state.manager
    },
    tempEditing: (state: Type.Object) => {
      return state.tempEditing
    },
  },
  mutations: {
    ...mutations,
  },
  actions: {
    ...actions,
  },
}
export default all
