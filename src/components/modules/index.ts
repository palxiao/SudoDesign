/*
 * @Author: ShawnPhang
 * @Date: 2021-07-13 22:51:29
 * @Description: require.context自动引用
 * @LastEditors: ShawnPhang
 * @LastEditTime: 2021-09-02 14:48:48
 * @site: book.palxp.com / blog.palxp.com
 */
function capitalizeFirstLetter(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1)
}

// 排除要全局引入的组件,可以是目录名也可以是文件名
const exclude = ['settings']

const regex = RegExp('.*^(?!.*?(' + exclude.join('|') + ')).*\\.vue$')

// const requireComponent = require.context('.', true, /\.vue$/) // 找到components文件夹下以.vue命名的文件
const requireComponent = import.meta.globEager('./**/*.vue')

function guide(Vue: Type.Object) {
  for (const fileName in requireComponent) {
    if (regex.test(fileName)) {
      const componentConfig = requireComponent[fileName]
      const componentName = capitalizeFirstLetter(fileName.replace(/^\..*\//, '').replace(/\.\w+$/, ''))
      Vue.component(componentName, componentConfig.default || componentConfig)
    }
  }
}

export default guide
