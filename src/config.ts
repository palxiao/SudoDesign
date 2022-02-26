/*
 * @Author: ShawnPhang
 * @LastEditors: ShawnPhang
 * @Description: Setting
 * @Date: 2021-07-13 02:48:38
 * @LastEditTime: 2022-02-25 09:32:50
 * @site: book.palxp.com / blog.palxp.com
 */

// const prefix = import.meta.env
const prefix = process.env

const isDev = prefix.NODE_ENV === 'development'

export default {
  isDev,
  BASE_URL: isDev ? '/' : './',
  VERSION: '0.0.1',
  APP_COPYRIGHT: 'PALXIAO',
  // API_URL: 'https://app.palxp.com:8887',
  API_URL: isDev ? 'http://localhost:9998' : '${API}',
  IMG_URL: 'http://store.palxp.com/',
  ICONFONT_URL: '//at.alicdn.com/t/font_2717063_ypy8vprc3b.css',
}
