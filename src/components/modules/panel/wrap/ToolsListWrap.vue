<!--
 * @Author: ShawnPhang
 * @Date: 2022-02-11 18:48:23
 * @Description: 组件列表
 * @LastEditors: ShawnPhang
 * @LastEditTime: 2022-03-13 14:43:49
 * @site: book.palxp.com / blog.palxp.com
-->
<template>
  <div class="wrap">
    <div class="header">组件</div>
    <div class="item">
      <i class="icon sd-qrcode" />
      <div class="text"><span>二维码</span><span class="desc">生成二维码在设计中使用</span></div>
    </div>
  </div>
</template>

<script>
// 图片列表
const NAME = 'tool-list-wrap'
import api from '@/api'
import { mapActions, mapGetters } from 'vuex'

export default {
  name: NAME,
  props: ['active'],
  data() {
    return {
      loadDone: false,
      showList: false,
    }
  },
  computed: {
    ...mapGetters(['dPage']),
  },
  watch: {
    active(val) {
      if (this.active) {
        this.showList = true
      }
    },
  },
  mounted() {
    // this.getDataList()
  },
  methods: {
    ...mapActions(['addWidget']),
    async getDataList() {
      if (this.loadDone || this.loading) {
        return
      }
      this.loading = true
      this.page += 1
      // let { list = [], total } = await api.material.getImagesList({ page: this.page, pageSize: 30 })
      // list.length <= 0 ? (this.loadDone = true) : (this.recommendImgList = this.recommendImgList.concat(list))
      // setTimeout(() => {
      //   this.loading = false
      // }, 100)
    },
    async selectItem(index) {
      // const item = this.recommendImgList[index]
      // this.$store.commit('setShowMoveable', false) // 清理掉上一次的选择
      // let setting = JSON.parse(JSON.stringify(wImage.setting))
      // const img = await setImageData(item) // await getImage(item.url)
      // setting.width = img.width
      // setting.height = img.height // parseInt(100 / item.value.ratio, 10)
      // setting.imgUrl = item.url
      // const { width: pW, height: pH } = this.dPage
      // setting.left = pW / 2 - img.width / 2
      // setting.top = pH / 2 - img.height / 2
      // this.addWidget(setting)
    },
  },
}
</script>

<style lang="less" scoped>
.wrap {
  width: 100%;
  height: 100%;
}
.header {
  padding: 17px 1rem;
  height: 56px;
  display: flex;
  position: relative;
  font-size: 16px;
  color: #333333;
  font-weight: bold;
  display: flex;
  align-items: center;
  user-select: none;
}
.item {
  opacity: 0.85;
  position: relative;
  border-radius: 4px;
  font-size: 15px;
  height: 72px;
  color: #33383e;
  display: flex;
  align-items: center;
  cursor: pointer;
  margin: 0 1rem 12px;
  user-select: none;
  background-color: #f6f7f9;
}
.item:hover {
  opacity: 1;
}
.icon {
  margin: 0 1rem;
  font-size: 32px;
}
.text {
  display: flex;
  flex-direction: column;
}
.desc {
  padding-top: 0.5rem;
  color: #7f8792;
  font-size: 12px;
}
</style>
