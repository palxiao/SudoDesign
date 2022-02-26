import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import utils from './utils'
import elementConfig from './utils/widgets/elementConfig'
import 'normalize.css/normalize.css'
import '@/assets/styles/index.less'
import 'element-plus/packages/theme-chalk/src/base.scss'

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
