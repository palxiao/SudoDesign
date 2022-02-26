/*
 * @Author: ShawnPhang
 * @Date: 2021-08-27 14:42:15
 * @Description:
 * @LastEditors: ShawnPhang
 * @LastEditTime: 2022-02-24 15:09:09
 * @site: book.palxp.com / blog.palxp.com
 */
import fetch from '@/utils/axios'

// // 获取素材分类：
export const getKinds = (params: Type.Object = {}) => fetch('design/cate', params)

// // 获取素材列表：
export const getList = (params: Type.Object = {}) => fetch('design/material', params)

// 获取字体
export const getFonts = (params: Type.Object = {}) => fetch('design/fonts', params)

// 图库列表
export const getImagesList = (params: Type.Object = {}) => fetch('design/imgs', params, 'get')

// 我的上传列表
export const getMyPhoto = (params: Type.Object = {}) => fetch('design/user/image', params)
export const deleteMyPhoto = (params: Type.Object = {}) => fetch('design/user/image/del', params, 'post')
// 加入图片
export const addMyPhoto = (params: Type.Object = {}) => fetch('design/user/add_image', params)
