<!--
 * @Author: ShawnPhang
 * @Date: 2022-02-13 22:18:35
 * @Description: 我的
 * @LastEditors: ShawnPhang
 * @LastEditTime: 2022-03-01 15:49:52
 * @site: book.palxp.com / blog.palxp.com
-->
<template>
  <div class="wrap">
    <el-tabs v-model="tabActiveName" :stretch="true" class="tabs" @tab-click="handleClick">
      <el-tab-pane label="我的图片" name="pics"> </el-tab-pane>
      <el-tab-pane label="我的作品" name="design"> </el-tab-pane>
    </el-tabs>
    <div v-show="tabActiveName === 'pics'" class="wrap">
      <uploader v-model="percent" class="upload" @done="uploadDone">
        <el-button class="upload-btn" size="small" type="primary">上传图片 <i class="iconfont icon-upload" /></el-button>
      </uploader>
      <img-list v-if="showList" ref="imgListComp" :edit="editOptions" :isDone="isDone" :listData="imgList" @load="load" @drag="dragStart" @select="selectImg" />
    </div>
    <div v-show="tabActiveName === 'design'" class="wrap">
      <img-list v-if="showList" :isDone="isDone" :listData="designList" @load="loadDesign" @select="selectDesign" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, toRefs, watch, nextTick } from 'vue'
import { ElTabPane, ElTabs } from 'element-plus'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import uploader from '@/components/common/Uploader'
import api from '@/api'
import wImage from '../../widgets/wImage/wImage.vue'
import setImageData from '@/common/methods/DesignFeatures/setImage'

export default defineComponent({
  components: { uploader, ElTabPane, ElTabs },
  props: ['active'],
  setup(props) {
    const router = useRouter()
    const store = useStore()
    const state: any = reactive({
      prePath: 'user',
      percent: { num: 0 }, // 当前上传进度
      imgList: [],
      designList: [],
      showList: false,
      isDone: false,
      editOptions: [],
      imgListComp: null,
      tabActiveName: '',
    })
    let loading = false
    let page = 0
    let listPage = 0

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
    const loadDesign = (init: boolean = false) => {
      if (init) {
        state.designList = []
        listPage = 0
        state.isDone = false
      }
      if (state.isDone || loading) {
        return
      }
      loading = true
      listPage += 1
      api.home.getMyDesign({ page: listPage, pageSize: 10 }).then(({ list }: any) => {
        list.length <= 0
          ? (state.isDone = true)
          : (state.designList = state.designList.concat(
              list.map((x: any) => {
                x.cover = x.cover + '?r=' + Math.random()
                return x
              }),
            ))
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
          nextTick(() => {
            state.tabActiveName = 'pics'
          })
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

    const handleClick = () => {
      if (state.tabActiveName === 'design') {
        loadDesign(true)
      }
    }

    const selectDesign = async (index: number) => {
      const { id }: any = state.designList[index]
      window.open(`http://sudo.palxp.com/home?id=${id}`)
    }

    return {
      ...toRefs(state),
      selectDesign,
      loadDesign,
      handleClick,
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
.tabs {
  padding: 0.2rem 0;
}
.upload {
  width: auto;
  margin: 0 0 0 1rem;
  display: inline-block;
  &-btn {
    width: 258px;
    font-size: 14px;
  }
}
.wrap {
  width: 100%;
  height: 100%;
}
</style>