/*
 * @Author: ShawnPhang
 * @Date: 2022-03-03 14:13:16
 * @Description:
 * @LastEditors: ShawnPhang
 * @LastEditTime: 2022-03-05 17:17:02
 * @site: book.palxp.com / blog.palxp.com
 */
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import utils from './utils'
import elementConfig from './utils/widgets/elementConfig'
import 'normalize.css/normalize.css'
import '@/assets/styles/index.less'
import 'element-plus/packages/theme-chalk/src/base.scss'
import '@/assets/element/element-variables.scss'

const app = createApp(App)

elementConfig.components.forEach((component) => {
  app.component(component.name, component)
})

elementConfig.plugins.forEach((plugin: any) => {
  app.use(plugin)
})

app
  .use(store)
  .use(router)
  .use(utils)
  .mount('#app')
