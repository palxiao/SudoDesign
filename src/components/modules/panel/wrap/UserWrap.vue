<!--
 * @Author: ShawnPhang
 * @Date: 2022-02-13 22:18:35
 * @Description: 我的
 * @LastEditors: ShawnPhang
 * @LastEditTime: 2022-02-24 16:31:02
 * @site: book.palxp.com / blog.palxp.com
-->
<template>
  <div class="wrap">
    <uploader v-model="percent" class="upload" @done="uploadDone">
      <el-button class="upload-btn" size="small" type="primary">上传图片 <i class="iconfont icon-upload" /></el-button>
    </uploader>
    <!-- <img-water-fall :edit="true" :listData="imgList" @delete-img="deleteImg" @select-img="selectImg" /> -->
    <img-list v-if="showList" ref="imgListComp" :edit="editOptions" :isDone="isDone" :listData="imgList" @load="load" @drag="dragStart" @select="selectImg" />
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, toRefs, watch } from 'vue'
import { useStore } from 'vuex'
import uploader from '@/components/common/Uploader'
import api from '@/api'
import wImage from '../../widgets/wImage/wImage.vue'
import setImageData from '@/common/methods/DesignFeatures/setImage'

export default defineComponent({
  components: { uploader },
  props: ['active'],
  setup(props) {
    const store = useStore()
    const state: any = reactive({
      prePath: 'user',
      percent: { num: 0 }, // 当前上传进度
      imgList: [],
      showList: false,
      isDone: false,
      editOptions: [],
      imgListComp: null,
    })
    let loading = false
    let page = 0

    const load = (init: boolean) => {
      if (init) {
        state.imgList = []
        page = 0
        state.isDone = false
      }
      if (state.isDone || loading) {
        return
      }
      loading = true
      page += 1
      api.material.getMyPhoto({ page }).then(({ list }: any) => {
        list.length <= 0 ? (state.isDone = true) : (state.imgList = state.imgList.concat(list))
        setTimeout(() => {
          loading = false
        }, 100)
      })
    }

    watch(
      () => props.active,
      () => {
        if (props.active) {
          state.showList = true
          load(true)
        }
      },
    )

    const selectImg = async (index: number) => {
      const item: any = state.imgList[index]
      store.commit('setShowMoveable', false) // 清理掉上一次的选择
      let setting = JSON.parse(JSON.stringify(wImage.setting))
      const img: any = await setImageData(item)
      setting.width = img.width
      setting.height = img.height // parseInt(100 / item.value.ratio, 10)
      setting.imgUrl = item.url
      const { width: pW, height: pH } = store.getters.dPage
      setting.left = pW / 2 - img.width / 2
      setting.top = pH / 2 - img.height / 2
      store.dispatch('addWidget', setting)
    }
    const deleteImg = ({ i, item }: any) => {
      const arr = item.url.split('/')
      let key = arr.splice(3, arr.length - 1).join('/')
      api.material.deleteMyPhoto({ id: item.id, key })
      state.imgListComp.delItem(i) // 通知标记
    }
    state.editOptions = [
      {
        name: '删除',
        fn: deleteImg,
      },
    ]
    const dragStart = (index: number) => {
      const item = state.imgList[index]
      store.commit('selectItem', { data: { value: item }, type: 'image' })
    }
    const uploadDone = async (res: any) => {
      await api.material.addMyPhoto(res)
      state.imgList = []
      load(true)
    }

    return {
      ...toRefs(state),
      load,
      uploadDone,
      selectImg,
      deleteImg,
      dragStart,
    }
  },
})
</script>

<style lang="less" scoped>
.upload {
  width: auto;
  margin: 1rem 0 0 1rem;
  display: inline-block;
  &-btn {
    font-size: 14px;
  }
}
.wrap {
  width: 100%;
  height: 100%;
}
</style>