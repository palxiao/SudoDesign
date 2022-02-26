/*
 * @Author: ShawnPhang
 * @Date: 2021-08-29 20:35:31
 * @Description: 七牛上传方法
 * @LastEditors: ShawnPhang
 * @LastEditTime: 2022-02-13 22:34:00
 * @site: book.palxp.com / blog.palxp.com
 */
import dayjs from 'dayjs'
import api from '@/api/album'

interface Options {
  bucket: string
  prePath?: string
}

export default {
  upload: async (file: File, options: Options, cb?: Function) => {
    const win: any = window
    const suffix = file.type.split('/')[1] // 文件后缀
    // const DT: any = await exifGetTime(file) // 照片时间
    const DT: any = new Date()
    const YM = `${dayjs(DT).format('YYYY')}/${dayjs(DT).format('MM')}/` // 文件时间分类
    const keyName = YM + new Date(DT).getTime() + `.${suffix}` // 文件名
    const prePath = options.prePath ? options.prePath + '/' : ''
    const token = await api.getToken({ bucket: options.bucket, name: `${prePath}${keyName}` })
    const exOption = {
      useCdnDomain: true, // 使用cdn加速
    }
    const observable = win.qiniu.upload(file, `${prePath}${keyName}`, token, {}, exOption)
    return new Promise((resolve: Function, reject: Function) => {
      observable.subscribe({
        next: (result: any) => {
          cb && cb(result) // result.total.percent -> 展示进度
        },
        error: (e: any) => {
          reject(e)
        },
        complete: (result: any) => {
          resolve(result)
          // cb && cb(result) // result.total.percent -> 展示进度
        },
      })
    })
  },
}

// function exifGetTime(img: any) {
//   const win = window as any
//   return new Promise((resolve) => {
//     const file = img.originFileObj || img
//     win.EXIF.getData(file, function() {
//       const DT = win.EXIF.getAllTags(this).DateTimeOriginal || win.EXIF.getAllTags(this).DateTime
//       if (DT) {
//         if (DT.split(' ').length > 1) {
//           const date = DT.split(' ')[0].replace(/:/g, '/')
//           const time = DT.split(' ')[1]
//           resolve(dayjs(`${date} ${time}`).isValid() ? `${date} ${time}` : date)
//         } else {
//           resolve(DT)
//         }
//       } else {
//         resolve(new Date())
//       }
//     })
//   })
// }
