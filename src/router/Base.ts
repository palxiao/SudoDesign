/*
 * @Author: ShawnPhang
 * @Date: 2021-08-19 18:43:22
 * @Description: 路由
 * @LastEditors: ShawnPhang
 * @LastEditTime: 2022-01-24 09:11:25
 * @site: book.palxp.com / blog.palxp.com
 */
export default [
  {
    path: '/',
    name: 'main',
    redirect: 'home',
    component: () => import('@/views/Ready.vue'),
    children: [
      {
        name: 'Home',
        path: '/home',
        component: () => import(/* webpackChunkName: 'base' */ '@/views/Index.vue'),
      },
    ],
  },
  {
    path: '/draw',
    name: 'Draw',
    component: () => import(/* webpackChunkName: 'draw' */ '@/views/Draw.vue'),
  },
  {
    path: '/psd',
    name: 'Psd',
    component: () => import(/* webpackChunkName: 'psd' */ '@/views/Psd.vue'),
  },
]
