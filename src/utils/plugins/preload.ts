/*
 * @Author: ShawnPhang
 * @Date: 2021-12-24 15:13:58
 * @Description:
 * @LastEditors: ShawnPhang
 * @LastEditTime: 2022-02-25 14:09:46
 * @site: book.palxp.com / blog.palxp.com
 */
export default class PreLoad {
  private i: number
  private arr: any[]
  constructor(arr: string[]) {
    this.i = 0
    this.arr = arr
  }
  public imgs() {
    return new Promise((resolve: any) => {
      const work = (src: string) => {
        if (this.i < this.arr.length) {
          const img = new Image()
          img.src = src
          if (img.complete) {
            work(this.arr[this.i++])
          } else {
            img.onload = () => {
              work(this.arr[this.i++])
              img.onload = null
            }
          }
          // console.log(((this.i + 1) / this.arr.length) * 100);
        } else {
          resolve()
        }
      }
      work(this.arr[this.i])
    })
  }
  public doms() {
    return new Promise((resolve: Function) => {
      const work = () => {
        if (this.i < this.arr.length) {
          this.arr[this.i].complete && this.i++
          setTimeout(() => {
            work()
          }, 100)
        } else {
          resolve()
        }
      }
      work()
    })
  }
}
