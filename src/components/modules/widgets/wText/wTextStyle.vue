<template>
  <div id="w-text-style">
    <el-collapse v-model="activeNames">
      <el-collapse-item title="位置尺寸" name="1">
        <div class="line-layout">
          <number-input v-model="innerElement.left" label="X" @finish="(value) => finish('left', value)" />
          <number-input v-model="innerElement.top" label="Y" @finish="(value) => finish('top', value)" />
          <number-input v-model="innerElement.width" style="margin-top: 0.5rem" label="宽" :editable="true" @finish="(value) => finish('width', value)" />
          <number-input v-model="innerElement.height" style="margin-top: 0.5rem" label="高" :editable="true" @finish="(value) => finish('height', value)" />
        </div>
      </el-collapse-item>
      <!-- <el-collapse-item title="样式设置" name="2"> -->
      <div class="line-layout style-item">
        <value-select v-model="innerElement.fontClass" label="文字" :data="fontClassList" inputWidth="167px" :readonly="true" @finish="(font) => finish('fontClass', font)" />
        <value-select v-model="innerElement.fontSize" label="大小" suffix="px" :data="fontSizeList" @finish="(value) => finish('fontSize', value)" />
      </div>

      <icon-item-select class="style-item" :data="styleIconList1" @finish="textStyleAction" />
      <icon-item-select class="style-item" :data="styleIconList2" @finish="textStyleAction" />

      <!-- <div style="flex-wrap: nowrap" class="line-layout style-item">
        <value-select v-model="innerElement.lineHeight" label="行距" suffix="倍" :data="lineHeightList" @finish="(value) => finish('lineHeight', value)" />
        <value-select v-model="innerElement.letterSpacing" label="字距" suffix="%" :data="letterSpacingList" @finish="(value) => finish('letterSpacing', value)" />
      </div> -->
      <!-- <el-collapse-item title="位置尺寸" name="1"> -->
      <div class="style-item slide-wrap">
        <number-slider v-model="innerElement.letterSpacing" style="font-size: 14px" label="字距" labelWidth="40px" :step="0.05" :maxValue="100" @finish="(value) => finish('letterSpacing', value)" />
        <number-slider v-model="innerElement.lineHeight" style="font-size: 14px" label="行距" labelWidth="40px" :step="0.05" :maxValue="2.5" @finish="(value) => finish('lineHeight', value)" />
      </div>
      <!-- </el-collapse-item> -->

      <div class="line-layout style-item">
        <effect-wrap v-model="innerElement.isEffect" :textColor="innerElement.color" :degree="innerElement.degree" @select="testEffect" />
      </div>
      <div style="flex-wrap: nowrap" class="line-layout style-item">
        <color-select v-model="innerElement.color" label="字体颜色" @finish="(value) => finish('color', value)" />
        <color-select v-model="innerElement.backgroundColor" label="背景颜色" @finish="(value) => finish('backgroundColor', value)" />
      </div>
      <icon-item-select class="style-item" :data="layerIconList" @finish="layerAction" />
      <icon-item-select class="style-item" :data="alignIconList" @finish="alignAction" />

      <!-- v-show="!innerElement.editable"  -->
      <!-- <div style="margin-top: 10px" class="line-layout style-item">
        <text-input-area v-model="innerElement.text" @finish="(value) => finish('text', value)" />
      </div> -->
      <!-- </el-collapse-item> -->
    </el-collapse>
  </div>
</template>

<script>
// 文本组件样式
const NAME = 'w-text-style'
import api from '@/api'
import _config from '@/config'
import { mapGetters, mapActions } from 'vuex'
import { styleIconList1, styleIconList2, alignIconList } from './iconsData'
import numberInput from '../../settings/numberInput.vue'
import numberSlider from '../../settings/numberSlider.vue'
import colorSelect from '../../settings/colorSelect.vue'
import iconItemSelect from '../../settings/iconItemSelect.vue'
import textInputArea from '../../settings/textInputArea.vue'
import valueSelect from '../../settings/valueSelect.vue'
import effectWrap from '../../settings/EffectSelect/TextWrap.vue'
// import { useFontStore } from '@/common/methods/fonts'

export default {
  name: NAME,
  components: { numberInput, colorSelect, iconItemSelect, textInputArea, valueSelect, effectWrap, numberSlider },
  data() {
    return {
      activeNames: [],
      innerElement: {},
      tag: false,
      ingoreKeys: ['left', 'top', 'name', 'width', 'height', 'text', 'color', 'backgroundColor'],
      fontSizeList: [12, 14, 24, 26, 28, 30, 36, 48, 60, 72, 96, 108, 120, 140, 180, 200, 250, 300, 400, 500],
      fontClassList: [
        // {
        //   id: 206607,
        //   alias: '思源黑体 常规',
        //   value: 'SourceHanSansSC-Regular',
        //   url: 'https://st0.dancf.com/csc/213/fonts/229/20210601-182228-08fb.woff',
        // },
      ], // 不允许空字体，因为截图服务的默认字体无法保证一致
      lineHeightList: [1, 1.5, 2],
      letterSpacingList: [0, 10, 25, 50, 75, 100, 200],
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
      styleIconList1,
      styleIconList2,
      alignIconList,
    }
  },
  computed: {
    ...mapGetters(['dActiveElement', 'dMoving']),
    isDraw() {
      return this.$route.name === 'Draw'
    },
  },
  watch: {
    dActiveElement: {
      handler(newValue, oldValue) {
        this.change()
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
    this.loadFonts()
  },
  methods: {
    ...mapActions(['updateWidgetData', 'updateAlign', 'updateLayerIndex']),
    testEffect({ key, value, style }) {
      const uuid = this.dActiveElement.uuid
      this.$store.commit('setWidgetStyle', { uuid, key, value })
      if (style) {
        this.finish('color', style.color || '')
      }
    },
    async loadFonts() {
      // if (!this.isDraw) {
      // useFontStore().init()
      const localFonts = localStorage.getItem('FONTS') ? JSON.parse(localStorage.getItem('FONTS') || '') : []
      const fontLists = { 中文: [], 英文: [] }
      for (const font of localFonts) {
        const { id, name: value, url, alias, preview, lang } = font
        lang === 'zh' ? fontLists['中文'].push({ id, value, url, alias, preview }) : fontLists['英文'].push({ id, value, url, alias, preview })
      }
      this.fontClassList = fontLists
      // }
      // const isDev = process.env.NODE_ENV === 'development'
      // if (!isDev) {
      //   const { list } = await api.material.getFonts() // { name: 'SourceHanSansCN-Normal' }
      //   this.fontClassList = this.fontClassList.concat(list)
      // }
    },
    change() {
      this.tag = true
      this.innerElement = JSON.parse(JSON.stringify(this.dActiveElement))
      this.changeStyleIconList()
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
    async textStyleAction(item) {
      let value = item.key === 'textAlign' ? item.value : item.value[item.select ? 1 : 0]
      this.innerElement[item.key] = value
      await this.$nextTick()
      this.$store.commit('updateRect')
    },
    async alignAction(item) {
      this.updateAlign({
        align: item.value,
        uuid: this.dActiveElement.uuid,
      })
      await this.$nextTick()
      this.$store.commit('updateRect')
    },
    changeStyleIconList() {
      for (let i = 0; i < this.styleIconList1.length; ++i) {
        let key = this.styleIconList1[i].key
        this.styleIconList1[i].select = false
        switch (key) {
          case 'fontWeight':
          case 'fontStyle':
            if (this.innerElement[key] !== 'normal') {
              this.styleIconList1[i].select = true
            }
            break
          case 'textDecoration':
            if (this.innerElement[key] !== this.styleIconList1[i].value[0] && this.innerElement[key] == this.styleIconList1[i].value[1]) {
              this.styleIconList1[i].select = !this.styleIconList1[i].select
            }
            break
          case 'writingMode':
            if (this.innerElement[key] !== this.styleIconList1[i].value[0]) {
              this.styleIconList1[i].select = true
            }
            break
        }
      }
      for (let i = 0; i < this.styleIconList2.length; i++) {
        let key = this.styleIconList2[i].key
        this.styleIconList2[i].select = false
        if (key === 'textAlign' && this.innerElement[key] === this.styleIconList2[i].value) {
          this.styleIconList2[i].select = true
          continue
        }
      }
    },
  },
}
</script>

<style scoped>
:deep(.el-collapse-item__header) {
  padding: 0;
  font-size: 14px;
  color: #666666;
}
</style>

<style lang="less" scoped>
#w-text-style {
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
  margin-bottom: 12px;
}
.setting-list {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
  width: 100%;
}

.slide-wrap {
  width: 100%;
  padding: 16px;
  background: #f3f5f7;
  border-radius: 6px;
}
</style>
