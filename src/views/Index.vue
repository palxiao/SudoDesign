<template>
  <div id="page-design-index" ref="pageDesignIndex">
    <div :style="style" class="top-nav">
      <div class="top-nav-wrap">
        <div class="top-left">
          <div style="font-size: 14px" class="name" @click="jump2home">SODU DESIGN</div>
          <div class="operation">
            <div :class="['operation-item', { disable: !undoable }]" @click="undoable ? handleHistory('undo') : ''"><i class="iconfont icon-undo" /></div>
            <div :class="['operation-item', { disable: !redoable }]" @click="redoable ? handleHistory('redo') : ''"><i class="iconfont icon-redo" /></div>
          </div>
        </div>
        <HeaderOptions ref="options" v-model="isContinue" @change="optionsChange" />
      </div>
    </div>

    <div class="page-design-index-wrap">
      <widget-panel></widget-panel>
      <design-board class="page-design-wrap" pageDesignCanvasId="page-design-canvas"></design-board>
      <style-panel></style-panel>
    </div>
    <!-- 缩放控制 -->
    <zoom-control ref="zoomControl" />
    <!-- 右键菜单 -->
    <right-click-menu />
    <!-- 旋转缩放组件 -->
    <Moveable />
    <!-- 遮罩百分比进度条 -->
    <ProgressLoading :percent="downloadPercent" :text="downloadText" @cancel="downloadCancel" @done="downloadPercent = 0" />
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, toRefs } from 'vue'
import { mapActions, mapGetters } from 'vuex'
import RightClickMenu from '@/components/business/right-click-menu/rc-menu.vue'
import Moveable from '@/components/business/moveable/Moveable.vue'

import shortcuts from '@/mixins/shortcuts'
import wGroup from '@/components/modules/widgets/wGroup/wGroup.vue'
import HeaderOptions from './components/HeaderOptions.vue'
import ProgressLoading from '@/components/common/ProgressLoading/index.vue'

export default defineComponent({
  components: {
    RightClickMenu,
    Moveable,
    HeaderOptions,
    ProgressLoading,
  },
  mixins: [shortcuts],
  setup() {
    const state = reactive({
      style: {
        left: '0px',
      },
      // openDraw: false,
      downloadPercent: 0, // 下载进度
      downloadText: '',
      isContinue: true,
    })
    // const draw = () => {
    //   state.openDraw = true
    // }
    function jump2home() {
      const fullPath = window.location.href.split('/')
      window.open(fullPath[0] + '//' + fullPath[2])
    }
    return {
      ...toRefs(state),
      jump2home,
    }
  },
  computed: {
    ...mapGetters(['dActiveElement', 'dHistoryParams', 'dCopyElement', 'dPage']),
    undoable() {
      return !(this.dHistoryParams.index === -1 || (this.dHistoryParams === 0 && this.dHistoryParams.length === 10))
    },
    redoable() {
      return !(this.dHistoryParams.index === this.dHistoryParams.length - 1)
    },
  },
  // watch: {
  //   $route() {
  //     console.log('change route', this.$route.query)
  //     this.loadData()
  //   },
  // },
  mounted() {
    this.initGroupJson(JSON.stringify(wGroup.setting))
    window.addEventListener('scroll', this.fixTopBarScroll)
    // window.addEventListener('click', this.clickListener)
    document.addEventListener('keydown', this.handleKeydowm, false)
    document.addEventListener('keyup', this.handleKeyup, false)
    this.loadData()
  },
  beforeUnmount() {
    window.removeEventListener('scroll', this.fixTopBarScroll)
    // window.removeEventListener('click', this.clickListener)
    document.removeEventListener('keydown', this.handleKeydowm, false)
    document.removeEventListener('keyup', this.handleKeyup, false)
    document.oncontextmenu = null
  },
  methods: {
    ...mapActions(['selectWidget', 'initGroupJson', 'handleHistory']),
    downloadCancel() {
      this.downloadPercent = 0
      this.isContinue = false
    },
    loadData() {
      const { id, tempid } = this.$route.query
      ;(this.$refs as any).options.load(id, tempid, async () => {
        ;(this.$refs as any).zoomControl.screenChange()
        await this.$nextTick()
        // 初始化激活的控件为page
        this.selectWidget({
          uuid: '-1',
        })
      })
    },
    fixTopBarScroll() {
      const scrollLeft = document.documentElement.scrollLeft || document.body.scrollLeft
      this.style.left = `-${scrollLeft}px`
    },
    clickListener(e) {
      console.log('click listener', e)
    },
    optionsChange({ downloadPercent, downloadText }: any) {
      this.downloadPercent = downloadPercent
      this.downloadText = downloadText
    },
  },
})
</script>

<style lang="less" scoped>
@import url('@/assets/styles/design.less');
</style>