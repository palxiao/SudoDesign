<!--
 * @Author: ShawnPhang
 * @Date: 2021-08-09 11:41:53
 * @Description: 
 * @LastEditors: ShawnPhang
 * @LastEditTime: 2022-03-05 17:36:44
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
        <!-- <el-button size="mini" style="width: 100%; margin-top: 0.5rem" plain @click="openCropper">替换图片</el-button> -->
        <div class="options">
          <el-button v-if="innerElement.cropEdit" size="small" type="primary" @click="imgCrop(false)">完成</el-button>
          <el-button v-else size="small" type="primary" plain @click="imgCrop(true)">裁剪</el-button>
          <!-- <el-button disabled size="small" type="primary" plain @click="openCropper">编辑图像</el-button> -->
          <uploader class="options__upload" @done="uploadImgDone">
            <el-button size="small" plain>替换图片</el-button>
          </uploader>
          <number-slider v-show="innerElement.cropEdit" v-model="innerElement.zoom" class="style-item" label="缩放" :step="0.01" :maxValue="3" />
        </div>
        <container-wrap @change="changeContainer" />
        <br />
        <number-slider v-model="innerElement.opacity" class="style-item" label="不透明" :step="0.05" :maxValue="1" @finish="(value) => finish('opacity', value)" />
        <number-slider v-model="innerElement.radius" class="style-item" label="圆角" :maxValue="Math.min(innerElement.record.width, innerElement.record.height)" @finish="(value) => finish('radius', value)" />
      </el-collapse-item>
      <br />
      <icon-item-select class="style-item" label="" :data="layerIconList" @finish="layerAction" />
      <icon-item-select :data="alignIconList" @finish="alignAction" />
      <br />
    </el-collapse>
    <!-- <CropImage ref="crop" @done="cropDone" /> -->
  </div>
</template>

<script>
// 图片组件样式
const NAME = 'w-image-style'
import { mapGetters, mapActions } from 'vuex'
import numberInput from '../../settings/numberInput.vue'
import iconItemSelect from '../../settings/iconItemSelect.vue'
import numberSlider from '../../settings/numberSlider.vue'
// import CropImage from '@/components/business/cropper/CropImage.vue'
import ContainerWrap from '../../settings/EffectSelect/ContainerWrap.vue'
import uploader from '@/components/common/Uploader/index.vue'
import { getImage } from '@/common/methods/getImgDetail'
import api from '@/api'

export default {
  name: NAME,
  components: { numberInput, numberSlider, iconItemSelect, ContainerWrap, uploader },
  data() {
    return {
      activeNames: ['2', '3', '4'],
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
        if (newValue.uuid == -1) {
          this.innerElement.cropEdit = false
          this.updateWidgetData({
            uuid: this.lastUuid,
            key: 'cropEdit',
            value: false,
          })
        } else {
          this.lastUuid = newValue.uuid
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
      console.log(item)
      this.updateLayerIndex({
        uuid: this.dActiveElement.uuid,
        value: item.value,
      })
    },
    async alignAction(item) {
      this.updateAlign({
        align: item.value,
        uuid: this.dActiveElement.uuid,
      })
      await this.$nextTick()
      this.$store.commit('updateRect')
    },
    openCropper() {
      this.$refs.crop.open(this.innerElement, this.innerElement.cropData)
    },
    cropDone({ newImg, data, width, height }) {
      this.innerElement.imgUrl = newImg
      this.innerElement.cropData = data
      this.innerElement.width = width.toFixed(0)
      this.innerElement.height = height.toFixed(0)
    },
    async changeContainer(setting) {
      const index = this.dWidgets.findIndex((x) => x.uuid == this.innerElement.uuid)
      const img = await getImage(setting.svgUrl)
      setting.width = this.innerElement.width
      setting.height = img.height * (this.innerElement.width / img.width)
      setting.left = this.innerElement.left
      setting.top = this.innerElement.top
      setting.imgUrl = this.innerElement.imgUrl
      this.dWidgets.splice(index, 1)
      this.addWidget(setting)
    },
    async uploadImgDone(img) {
      this.$store.commit('setShowMoveable', false)
      await api.material.addMyPhoto(img)
      // this.innerElement.width = img.width
      this.innerElement.height = img.height * (this.innerElement.width / img.width)
      this.innerElement.imgUrl = img.url
      this.$store.commit('setShowMoveable', true)
    },
    imgCrop(val) {
      this.innerElement.cropEdit = val
      this.$store.commit('setShowRotatable', !val)
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
  &__upload {
    width: auto;
    margin-left: 10px;
    display: inline-block;
  }
}
</style>