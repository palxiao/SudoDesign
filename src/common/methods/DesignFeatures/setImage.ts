/*
 * @Author: ShawnPhang
 * @Date: 2022-02-22 15:06:14
 * @Description: 设置图片类型元素
 * @LastEditors: ShawnPhang
 * @LastEditTime: 2022-03-07 14:16:48
 * @site: book.palxp.com / blog.palxp.com
 */
import store from '@/store'
import { getImage } from '../getImgDetail'
export default async function setItem2Data(item: any) {
  const cloneItem = JSON.parse(JSON.stringify(item))
  const { width: screenWidth, height: screenHeight } = store.getters.dPage
  let { width: imgWidth, height: imgHeight } = item
  if (!imgWidth || !imgHeight) {
    const actual: any = await getImage(item.url)
    imgWidth = actual.width
    imgHeight = actual.height
  }
  let ratio = 1
  // 先限制在画布内，保证不超过边界
  if (imgWidth > screenWidth || imgHeight > screenHeight) {
    ratio = Math.min(screenWidth / imgWidth, screenHeight / imgHeight)
  }
  // 根据画布缩放比例再进行一次调整
  if (ratio < 1) {
    cloneItem.width = item.width * ratio * (store.getters.dZoom / 100)
    cloneItem.height = item.height * ratio * (store.getters.dZoom / 100)
  }
  return cloneItem
}
