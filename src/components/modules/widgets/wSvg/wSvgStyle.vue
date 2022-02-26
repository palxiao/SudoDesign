<!--
 * @Author: ShawnPhang
 * @Date: 2021-08-09 11:41:53
 * @Description: 
 * @LastEditors: ShawnPhang
 * @LastEditTime: 2022-02-22 15:43:15
 * @site: book.palxp.com / blog.palxp.com
-->
<template>
  <div id="w-image-style">
    <el-collapse v-model="activeNames">
      <el-collapse-item title="位置尺寸" name="1">
        <div class="line-layout">
          <number-input v-model="innerElement.left" label="X" @finish="(value) => finish('left', value)" />
          <number-input v-model="innerElement.top" label="Y" @finish="(value) => finish('top', value)" />
          <number-input v-model="innerElement.width" style="margin-top: 0.5rem" label="宽" @finish="(value) => finish('width', value)" />
          <number-input v-model="innerElement.height" style="margin-top: 0.5rem" label="高" @finish="(value) => finish('height', value)" />
        </div>
      </el-collapse-item>
      <el-collapse-item title="设置" name="2">
        <div class="options">
          <el-button v-show="innerElement.imgUrl" size="small" type="primary" plain @click="innerElement.cropEdit = true">裁剪</el-button>
          <el-button v-show="innerElement.cropEdit" size="small" @click="innerElement.cropEdit = false">完成</el-button>
          <number-slider v-show="innerElement.cropEdit" v-model="innerElement.zoom" class="style-item" label="缩放" :step="0.01" :maxValue="3" />
        </div>
        <number-slider v-model="innerElement.opacity" class="style-item" label="不透明" :step="0.01" :maxValue="1" @finish="(value) => finish('opacity', value)" />
        <el-button v-show="innerElement.imgUrl" size="mini" style="width: 100%; margin-top: 0.5rem" plain @click="change2Img">取消容器</el-button>
      </el-collapse-item>
      <br />
      <icon-item-select class="style-item" label="" :data="layerIconList" @finish="layerAction" />
      <icon-item-select :data="alignIconList" @finish="alignAction" />
      <br />
    </el-collapse>
  </div>
</template>

<script>
// 图片组件样式
const NAME = 'w-image-style'
import { mapGetters, mapActions } from 'vuex'
import numberInput from '../../settings/numberInput.vue'
import iconItemSelect from '../../settings/iconItemSelect.vue'
import numberSlider from '../../settings/numberSlider.vue'
import wImg from '../wImage/wImage.vue'
import { getImage } from '@/common/methods/getImgDetail'

export default {
  name: NAME,
  components: { numberInput, numberSlider, iconItemSelect },
  data() {
    return {
      activeNames: ['1', '2', '3', '4'],
      innerElement: {},
      tag: false,
      ingoreKeys: ['left', 'top', 'name', 'width', 'height', 'radiusTopLeft', 'radiusTopRight', 'radiusBottomLeft', 'radiusBottomRight'],
      layerIconList: [
        {
          key: 'zIndex',
          icon: 'icon-layer-up',
          tip: '上一层',
          value: 1,
        },
        {
          key: 'zIndex',
          icon: 'icon-layer-down',
          tip: '下一层',
          value: -1,
        },
      ],
      alignIconList: [
        {
          key: 'align',
          icon: 'icon-align-left',
          tip: '左对齐',
          value: 'left',
        },
        {
          key: 'align',
          icon: 'icon-align-center-horiz',
          tip: '水平居中对齐',
          value: 'ch',
        },
        {
          key: 'align',
          icon: 'icon-align-right',
          tip: '右对齐',
          value: 'right',
        },
        {
          key: 'align',
          icon: 'icon-align-top',
          tip: '上对齐',
          value: 'top',
        },
        {
          key: 'align',
          icon: 'icon-align-center-verti',
          tip: '垂直居中对齐',
          value: 'cv',
        },
        {
          key: 'align',
          icon: 'icon-align-bottom',
          tip: '下对齐',
          value: 'bottom',
        },
      ],
    }
  },
  computed: {
    ...mapGetters(['dActiveElement', 'dMoving', 'dWidgets']),
  },
  watch: {
    dActiveElement: {
      handler(newValue, oldValue) {
        this.change()
        // 失焦取消编辑模式
        newValue.uuid != -1 && (this.lastUuid = newValue.uuid)
        if (newValue.uuid == -1) {
          this.innerElement.cropEdit = false
          this.updateWidgetData({
            uuid: this.lastUuid,
            key: 'cropEdit',
            value: false,
          })
        }
      },
      deep: true,
    },
    innerElement: {
      handler(newValue, oldValue) {
        this.changeValue()
      },
      deep: true,
    },
  },
  created() {
    this.change()
  },
  methods: {
    ...mapActions(['updateWidgetData', 'updateAlign', 'updateLayerIndex', 'addWidget']),
    change() {
      this.tag = true
      this.innerElement = JSON.parse(JSON.stringify(this.dActiveElement))
    },
    changeValue() {
      if (this.tag) {
        this.tag = false
        return
      }
      if (this.dMoving) {
        return
      }
      for (let key in this.innerElement) {
        if (this.ingoreKeys.indexOf(key) !== -1) {
          this.dActiveElement[key] = this.innerElement[key]
        } else if (key !== 'setting' && key !== 'record' && this.innerElement[key] !== this.dActiveElement[key]) {
          this.updateWidgetData({
            uuid: this.dActiveElement.uuid,
            key: key,
            value: this.innerElement[key],
          })
        }
      }
    },
    finish(key, value) {
      this.updateWidgetData({
        uuid: this.dActiveElement.uuid,
        key: key,
        value: value,
        pushHistory: true,
      })
    },
    layerAction(item) {
      this.updateLayerIndex({
        uuid: this.dActiveElement.uuid,
        value: item.value,
      })
    },
    alignAction(item) {
      this.updateAlign({
        align: item.value,
        uuid: this.dActiveElement.uuid,
      })
    },
    async change2Img() {
      const setting = JSON.parse(JSON.stringify(wImg.setting))
      const index = this.dWidgets.findIndex((x) => x.uuid == this.innerElement.uuid)
      const img = await getImage(this.innerElement.imgUrl)
      setting.width = img.width
      setting.height = img.height
      setting.left = this.innerElement.left
      setting.top = this.innerElement.top
      setting.imgUrl = this.innerElement.imgUrl
      this.dWidgets.splice(index, 1)
      this.addWidget(setting)
    },
  },
}
</script>

<style lang="less" scoped>
#w-image-style {
  height: 100%;
  width: 100%;
}
.line-layout {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
  width: 100%;
}
.style-item {
  margin-bottom: 10px;
}
.setting-list {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
  width: 100%;
}
.options {
  margin-bottom: 0.7rem;
}
</style>