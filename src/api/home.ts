/*
 * @Author: ShawnPhang
 * @Date: 2021-08-19 18:43:22
 * @Description:
 * @LastEditors: ShawnPhang
 * @LastEditTime: 2022-03-03 10:29:37
 * @site: book.palxp.com / blog.palxp.com
 */
import fetch from '@/utils/axios'

// const isDev = process.env.NODE_ENV === 'development'
// export const download = (params: Type.Object = {}) => `http://localhost:7001/api/screenshots?id=${params.id}&width=${params.width}&height=${params.height}`
export const download = (params: Type.Object = {}) => `http://app.palxp.com:7001/api/screenshots?id=${params.id}&width=${params.width}&height=${params.height}`

// 获取模板列表
// export const getTempList = (params: Type.Object = {}) => fetch('https://app.palxp.com:8887/spider/list', params, 'get')
export const getTempList = (params: Type.Object = {}) => fetch('design/list', params, 'get')
export const getTempDetail = (params: Type.Object = {}) => fetch('design/temp', params, 'get')
export const getCategories = (params: Type.Object = {}) => fetch('design/cate', params, 'get')
// 保存模板
export const saveTemp = (params: Type.Object = {}) => fetch('design/edit', params, 'post')
// export const delTemp = (params: Type.Object = {}) => fetch('/api/template/temp_del', params)

// 组件相关接口
// export const getCompList = (params: Type.Object = {}) => fetch('http://localhost:9998/spider/list', params, 'get')
export const getCompList = (params: Type.Object = {}) => fetch('design/list', params, 'get')
export const removeComp = (params: Type.Object = {}) => fetch('design/del', params, 'post')
// export const getCompDetail = (params: Type.Object = {}) => fetch('/api/template/temp_info', params, 'get')

// 保存作品
export const saveWorks = (params: Type.Object = {}) => fetch('design/save', params, 'post')

// 获取作品
export const getWorks = (params: Type.Object = {}) => fetch('design/poster', params, 'get')

// 作品列表
export const getMyDesign = (params: Type.Object = {}) => fetch('design/my', params, 'get')
