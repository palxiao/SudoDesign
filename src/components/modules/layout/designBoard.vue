<template>
  <div id="page-design" ref="page-design">
    <div
      class="out-page"
      :style="{
        width: (dPage.width * dZoom) / 100 + 120 + 'px',
        height: (dPage.height * dZoom) / 100 + 120 + 'px',
        opacity: 1 - (dZoom < 100 ? dPage.tag : 0),
      }"
    >
      <slot />
      <div
        :id="pageDesignCanvasId"
        class="design-canvas"
        :data-type="dPage.type"
        :data-uuid="dPage.uuid"
        :style="{
          width: dPage.width + 'px',
          height: dPage.height + 'px',
          transform: 'scale(' + dZoom / 100 + ')',
          transformOrigin: (dZoom >= 100 ? 'center' : 'left') + ' top',
          backgroundColor: dPage.backgroundColor,
          backgroundImage: `url(${dPage?.backgroundImage})`,
          backgroundSize: dPage?.backgroundTransform?.x ? 'auto' : 'cover',
          backgroundPositionX: (dPage?.backgroundTransform?.x || 0) + 'px',
          backgroundPositionY: (dPage?.backgroundTransform?.y || 0) + 'px',
          opacity: dPage.opacity + (dZoom < 100 ? dPage.tag : 0),
        }"
        @dragover="allowDrop($event)"
        @drop="drop($event)"
      >
        <!-- <grid-size /> -->

        <!-- :class="{
            layer: true,
            'layer-active': getIsActive(layer.uuid),
            'layer-hover': layer.uuid === dHoverUuid || dActiveElement.parent === layer.uuid,
          }" -->
        <component :is="layer.type" v-for="layer in getlayers()" :id="layer.uuid" :key="layer.uuid" class="layer" :data-title="layer.type" :params="layer" :parent="dPage" :data-type="layer.type" :data-uuid="layer.uuid">
          <template v-if="layer.isContainer">
            <!-- :class="{
                layer: true,
                'layer-active': getIsActive(widget.uuid),
                'layer-no-hover': dActiveElement.uuid !== widget.parent && dActiveElement.parent !== widget.parent,
                'layer-hover': widget.uuid === dHoverUuid,
              }" -->
            <component :is="widget.type" v-for="widget in getChilds(layer.uuid)" :key="widget.uuid" class="layer" :data-title="widget.type" :params="widget" :parent="layer" :data-type="widget.type" :data-uuid="widget.uuid" />
          </template>
        </component>

        <!-- <ref-line v-if="dSelectWidgets.length === 0" /> -->
        <!-- <size-control v-if="dSelectWidgets.length === 0" /> -->
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent } from 'vue'
import { mapGetters, mapActions } from 'vuex'
import { getTarget } from '@/common/methods/target'
import setImageData from '@/common/methods/DesignFeatures/setImage'

// 页面设计组件
const NAME = 'page-design'

import { move, moveInit } from '@/mixins/move'
import wText from '../widgets/wText/wText.vue'
import wImage from '../widgets/wImage/wImage.vue'
import wSvg from '../widgets/wSvg/wSvg.vue'

export default defineComponent({
  name: NAME,
  mixins: [moveInit],
  props: ['pageDesignCanvasId'],
  data() {
    return {}
  },
  computed: {
    ...mapGetters(['dPage', 'dZoom', 'dScreen', 'dWidgets', 'dActiveElement', 'dHoverUuid', 'dSelectWidgets', 'dAltDown']),
  },
  mounted() {
    this.getScreen()
    document.getElementById('page-design').addEventListener('mousedown', this.handleSelection, false)
  },
  beforeUnmount() {},
  methods: {
    ...mapActions(['updateScreen', 'selectWidget', 'deleteWidget', 'addWidget', 'addGroup']),
    allowDrop(e) {
      e.preventDefault()
    },
    async drop(e) {
      this.$store.commit('setShowMoveable', false) // 清理上一次的选择
      let lost = e.target.className !== 'design-canvas' // className === 'design-canvas' , id: "page-design-canvas"
      e.stopPropagation()
      e.preventDefault()
      const { data: item, type } = this.$store.getters.selectItem
      let setting = {}
      if (!type) {
        return
      }
      if (type === 'text') {
        !item.fontFamily && !item.color ? (setting = JSON.parse(JSON.stringify(wText.setting))) : (setting = item)
        !setting.text ? (setting.text = '双击编辑文字') : (setting.text = decodeURIComponent(setting.text)) // item.text
        setting.fontSize = item.fontSize
        setting.fontWeight = item.fontWeight
      }
      if (type === 'image') {
        setting = JSON.parse(JSON.stringify(wImage.setting))
        const img = await setImageData(item.value)
        setting.width = img.width
        setting.height = img.height // parseInt(100 / item.value.ratio, 10)
        setting.imgUrl = item.value.url
      }
      if (type === 'svg') {
        setting = JSON.parse(JSON.stringify(wSvg.setting))
        const img = await setImageData(item.value)
        setting.width = img.width
        setting.height = img.height // parseInt(100 / item.value.ratio, 10)
        setting.svgUrl = item.value.url
      }
      // 绝对坐标
      const lostX = e.x - document.getElementById('page-design-canvas').getBoundingClientRect().left
      const lostY = e.y - document.getElementById('page-design-canvas').getBoundingClientRect().top
      // 放置组合
      if (type === 'group') {
        let parent = {}
        item.forEach((element) => {
          if (element.type === 'w-group') {
            parent.width = element.width
            parent.height = element.height
          }
        })
        const half = { x: parent.width ? (parent.width * this.$store.getters.dZoom) / 100 / 2 : 0, y: parent.height ? (parent.height * this.$store.getters.dZoom) / 100 / 2 : 0 }
        item.forEach((element) => {
          element.left += (lost ? lostX - half.x : e.layerX - half.x) * (100 / this.$store.getters.dZoom)
          element.top += (lost ? lostY - half.y : e.layerY - half.y) * (100 / this.$store.getters.dZoom)
        })
        this.addGroup(item)
      }
      // 设置坐标
      const half = { x: setting.width ? (setting.width * this.$store.getters.dZoom) / 100 / 2 : 0, y: setting.height ? (setting.height * this.$store.getters.dZoom) / 100 / 2 : 0 }
      setting.left = (lost ? lostX - half.x : e.layerX - half.x) * (100 / this.$store.getters.dZoom)
      setting.top = (lost ? lostY - half.y : e.layerY - half.y) * (100 / this.$store.getters.dZoom)
      if (lost && type === 'image') {
        // 如果不从画布加入，且不是图片类型，则判断是否加入到svg中
        const target = await getTarget(e.target)
        const targetType = target.getAttribute('data-type')
        const uuid = target.getAttribute('data-uuid')
        if (targetType === 'w-svg') {
          this.$store.commit('setShowMoveable', true) // 恢复选择
          let widget = this.dWidgets.find((item) => item.uuid === uuid)
          widget.imgUrl = item.value.url
          // if (e.target.className.baseVal) {
          //   !widget.imgs && (widget.imgs = {})
          //   widget.imgs[`${e.target.className.baseVal}`] = item.value.url
          // }
        } else {
          this.addWidget(setting) // 正常加入面板
        }
      } else if (type === 'bg') {
        console.log('背景图片放置')
      } else if (type !== 'group') {
        console.log(setting)
        this.addWidget(setting) // 正常加入面板
      }
      // 清除临时数据
      this.$store.commit('selectItem', {})
    },
    getScreen() {
      let screen = this.$refs['page-design']
      this.updateScreen({
        width: screen.offsetWidth,
        height: screen.offsetHeight,
      })
    },
    async handleSelection(e) {
      if (e.which === 3) {
        return
      }
      // 处理复杂子节点组件
      // let target = e.target
      let target = await getTarget(e.target)
      let type = target.getAttribute('data-type')

      if (type) {
        let uuid = target.getAttribute('data-uuid')
        if (uuid !== '-1' && !this.dAltDown) {
          let widget = this.dWidgets.find((item) => item.uuid === uuid)
          if (widget.parent !== '-1' && widget.parent !== this.dActiveElement.uuid && widget.parent !== this.dActiveElement.parent) {
            uuid = widget.parent
          }
        }

        // 设置选中元素
        // this.$store.commit('setMoveable', false)
        this.selectWidget({
          uuid: uuid,
        })

        if (uuid !== '-1') {
          this.initmovement && this.initmovement(e) // 参见 mixins
        }
      } else {
        // 取消选中元素
        this.selectWidget({
          uuid: '-1',
        })
      }
    },
    getlayers() {
      return this.dWidgets.filter((item) => item.parent === this.dPage.uuid)
    },
    getChilds(uuid) {
      return this.dWidgets.filter((item) => item.parent === uuid)
    },
    getIsActive(uuid) {
      if (this.dSelectWidgets.length > 0) {
        let widget = this.dSelectWidgets.find((item) => item.uuid === uuid)
        if (widget) {
          return true
        }
        return false
      } else {
        return uuid === this.dActiveElement.uuid
      }
    },
  },
})
</script>

<style lang="less" scoped>
#page-design {
  height: 100%;
  // display: flex;
  // align-items: center;
  overflow: auto;
  position: relative;
  width: 100%;
  .out-page {
    margin: 0 auto;
    padding: 60px;
    position: relative;
    .design-canvas {
      // transition: all 0.3s;
      background-position: center;
      background-repeat: no-repeat;
      background-size: cover;
      box-shadow: 1px 1px 10px 3px rgba(0, 0, 0, 0.1);
      margin: 0 auto;
      position: relative;
      overflow: hidden;
    }
    // .design-canvas ::-webkit-scrollbar {
    //   display: none; /* Chrome Safari */
    // }
  }
}
</style>