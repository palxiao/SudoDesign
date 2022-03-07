<!--
 * @Author: ShawnPhang
 * @Date: 2022-01-10 14:57:53
 * @Description: Psd文件解析
 * @LastEditors: ShawnPhang
 * @LastEditTime: 2022-03-07 15:52:08
 * @site: book.palxp.com / blog.palxp.com
-->
<template>
  <div id="page-design-index" ref="pageDesignIndex">
    <div class="top-nav">
      <div class="top-nav-wrap">
        <div class="top-left">
          <div class="name">CLOUD DESIGN - 工程版</div>
        </div>
        <div style="flex: 1"><el-button v-show="isDone" type="primary" size="small" @click="clear">重新选择模板</el-button></div>
        <div class="v-tips">Demo v1.0_bata 最后更新时间 01-14</div>
      </div>
    </div>

    <div class="page-design-index-wrap">
      <!-- <widget-panel></widget-panel> -->
      <design-board class="page-design-wrap" pageDesignCanvasId="page-design-canvas">
        <uploader v-if="!isDone" accept=".psd" :hold="true" :drag="true" class="uploader" @load="selectFile">
          <div class="uploader__box"><img style="margin-right: 1rem" src="https://cdn.dancf.com/design/svg/icon_psdimport.37e6f23e.svg" /> 在此拖入或选择PSD文件</div>
        </uploader>
      </design-board>
      <style-panel v-show="isDone"></style-panel>
    </div>
    <!-- 缩放控制 -->
    <zoom-control ref="zoomControl" />
    <!-- 右键菜单 -->
    <right-click-menu />
    <!-- 旋转缩放组件 -->
    <Moveable />
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, toRefs, getCurrentInstance, ComponentInternalInstance } from 'vue'
import { processPSD2Sky } from '@/utils/plugins/psd'

import { mapActions, mapGetters, useStore } from 'vuex'
import RightClickMenu from '@/components/business/right-click-menu/rc-menu.vue'
import Moveable from '@/components/business/moveable/Moveable.vue'
import shortcuts from '@/mixins/shortcuts'
import wText from '@/components/modules/widgets/wText/wText.vue'
import wImage from '@/components/modules/widgets/wImage/wImage.vue'
import useLoading from '@/common/methods/loading'
import uploader from '@/components/common/Uploader/index.vue'

export default defineComponent({
  components: { RightClickMenu, Moveable, uploader },
  mixins: [shortcuts],
  setup() {
    const state = reactive({
      isDone: false,
    })
    const store = useStore()
    const { proxy }: any = getCurrentInstance() as ComponentInternalInstance
    let loading: any = null

    function loadJS() {
      const link_element = document.createElement('script')
      link_element.setAttribute('src', '/psd.js') // 'http://sudo.palxp.com/psd.js.gz'
      document.head.appendChild(link_element)
    }
    async function selectFile(file: any) {
      console.log(111)

      loading = useLoading()
      await loadPSD(file)
      loading.close()
      state.isDone = true
    }
    async function loadPSD(file: any) {
      const data = await processPSD2Sky(file)

      setTimeout(async () => {
        const types: any = {
          text: wText.setting,
          image: wImage.setting,
        }
        for (let i = 0; i < data.clouds.length; i++) {
          const x: any = data.clouds[i]
          const rawData = JSON.parse(JSON.stringify(types[x.type])) || {}
          delete x.type
          x.src && (x.imgUrl = x.src) && delete x.src
          store.dispatch('addWidget', Object.assign(rawData, x))
        }

        const { width, height, background: bg } = data
        store.commit('setDPage', Object.assign(store.getters.dPage, { width, height, backgroundColor: bg.color, backgroundImage: bg.image }))
        await proxy?.loadDone()
      }, 10)
    }

    function clear() {
      state.isDone = false
      store.commit('setDWidgets', [])
      store.commit('setDPage', Object.assign(store.getters.dPage, { width: 1920, height: 1080, backgroundColor: '#ffffff', backgroundImage: '' }))
      store.commit('setShowMoveable', false)
    }

    return {
      ...toRefs(state),
      loadJS,
      selectFile,
      clear,
    }
  },
  computed: {
    ...mapGetters(['dPage']),
  },
  async mounted() {
    document.addEventListener('keydown', this.handleKeydowm, false)
    document.addEventListener('keyup', this.handleKeyup, false)
    this.loadJS()
  },
  beforeUnmount() {
    document.removeEventListener('keydown', this.handleKeydowm, false)
    document.removeEventListener('keyup', this.handleKeyup, false)
    document.oncontextmenu = null
  },
  methods: {
    ...mapActions(['selectWidget']),
    async loadDone() {
      this.selectWidget({
        uuid: '-1',
      })
      await this.$nextTick()
      ;(this.$refs as any).zoomControl.screenChange()
      this.$store.commit('setShowMoveable', false)
    },
  },
})
</script>

<style lang="less" scoped>
@import url('@/assets/styles/design.less');
.uploader {
  position: absolute;
  z-index: 999;
  left: calc(50% - 180px);
  top: calc(50% - 90px);
  &__box {
    color: #666666;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
  }
}
.v-tips {
  padding: 0 1rem;
  font-size: 15px;
  color: #666666;
}
</style>