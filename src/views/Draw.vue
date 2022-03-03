<template>
  <div id="page-design-index" ref="pageDesignIndex">
    <div class="page-design-index-wrap">
      <design-board class="page-design-wrap fixed-canvas" pageDesignCanvasId="page-design-canvas"></design-board>
    </div>
    <!-- 缩放控制 -->
    <zoom-control />
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, toRefs } from 'vue'
import { mapActions } from 'vuex'
import api from '@/api'
import wGroup from '@/components/modules/widgets/wGroup/wGroup.vue'
import Preload from '@/utils/plugins/preload'
import FontFaceObserver from 'fontfaceobserver'
import { blob2Base64, generateFontStyle } from '@/common/methods/fonts/utils'

export default defineComponent({
  components: {},
  // mixins: [shortcuts],
  setup() {
    const state = reactive({
      style: {
        left: '0px',
      },
    })

    return {
      ...toRefs(state),
    }
  },
  mounted() {
    this.initGroupJson(JSON.stringify(wGroup.setting))
    this.$nextTick(() => {
      this.load()
    })
  },
  methods: {
    ...mapActions(['initGroupJson']),
    async load() {
      let loadFlag = false
      if (this.$route.query.id) {
        const { data } = await api.home.getWorks({ id: this.$route.query.id })
        const content = JSON.parse(data)

        content.page.backgroundImage && (content.page.backgroundImage += '@small')
        this.compressImages(content.widgets)
        this.$store.commit('setDPage', content.page)
        this.$store.commit('setDWidgets', content.widgets)
        await this.$nextTick()

        const imgsData: any = []
        const fontLoaders: any = []
        const fontContent: any = {}
        const fontData: any = []
        content.widgets.forEach((item: any) => {
          if (item.fontClass && item.fontClass.value) {
            const loader = new FontFaceObserver(item.fontClass.value)
            fontData.push(item.fontClass)
            fontLoaders.push(loader.load())
            // 按字体来收集所有文字
            if (fontContent[item.fontClass.value]) {
              fontContent[item.fontClass.value] += item.text
            } else {
              fontContent[item.fontClass.value] = item.text
            }
          }
          // item.imgUrl && imgsData.push(item.imgUrl)
          if (item.imgUrl) {
            const cNodes: any = document.getElementById(item.uuid).childNodes
            for (const el of cNodes) {
              if (el.className === 'img__box') {
                imgsData.push(el.firstChild)
              }
            }
          }
        })

        try {
          await this.font2style(fontContent, fontData)
          console.log('base64字体加载完毕')
          const preload = new Preload(imgsData)
          // await preload.imgs()
          await preload.doms()
          console.log('图片加载完毕')
        } catch (e) {
          console.log(e)
        }
        try {
          await Promise.all(fontLoaders)
          console.log('字体加载完毕')
        } catch (e) {
          console.log(e)
        }
        loadFlag = true
        console.log('--> 可以开始绘制')
        try {
          ;(window as any).loadFinishToInject('done')
        } catch (err) {}
      }
      // 超时
      setTimeout(() => {
        !loadFlag && (window as any).loadFinishToInject('done')
      }, 60000)
    },
    async font2style(fontContent: any, fontData: any = []) {
      return new Promise((resolve: Function) => {
        Promise.all(
          // 拿到所有文字所对应字体子集 base64
          Object.keys(fontContent).map(async (key) => {
            const font = fontData.find((font: any) => font.value === key) as any
            if (font.id) {
              const blob = await api.gaoding.getSubsetFont({
                font_id: font.id,
                content: fontContent[key],
              })
              const base64 = await blob2Base64(blob as unknown as Blob)
              fontContent[key] = base64
              console.log('获取稿定字体: ' + font.id)
            }
          }),
        ).then(() => {
          const fontStyles = Object.keys(fontContent).reduce((pre, cur) => pre + generateFontStyle(cur, fontContent[cur]).outerHTML, '')
          document.body.innerHTML += fontStyles
          resolve()
        })
      })
    },
    compressImages(widgets: any) {
      for (const item of widgets) {
        if (item.imgUrl && item.imgUrl.split('.')[item.imgUrl.split('.').length - 1] === 'png') {
          item.imgUrl += '@small'
        }
      }
    },
  },
})
</script>


<style lang="less" scoped>
@import url('@/assets/styles/design.less');
.fixed-canvas {
  :deep(#page-design-canvas) {
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
  }
}
</style>