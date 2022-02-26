<template>
  <div id="page-style">
    <el-collapse v-model="activeNames">
      <el-collapse-item title="画布尺寸" name="1">
        <div class="position-size">
          <number-input v-model="innerElement.width" label="宽" @finish="(value) => finish('width', value)" />
          <number-input v-model="innerElement.height" label="高" @finish="(value) => finish('height', value)" />
        </div>
      </el-collapse-item>
      <el-collapse-item title="背景设置" name="2">
        <color-select v-model="innerElement.backgroundColor" class="select-none" label="背景颜色" @finish="(value) => finish('backgroundColor', value)" />
        <!-- <bg-img-select :img="innerElement.backgroundImage"/> -->
        <div v-if="innerElement.backgroundImage" style="margin-top: 2rem">
          <el-image style="max-height: 428px" :src="innerElement.backgroundImage" fit="contain"></el-image>
          <el-button style="width: 100%; margin-top: 0.7rem" size="mini" @click="finish('backgroundImage', '')">删除</el-button>
        </div>
        <uploader style="width: 100%; margin-top: 0.7rem" @done="uploadImgDone">
          <el-button style="width: 100%" size="mini" plain>{{ innerElement.backgroundImage ? '替换背景' : '上传背景' }}图</el-button>
        </uploader>
      </el-collapse-item>
      <!-- <el-collapse-item title="其他设置" name="3">
        <el-input v-model="innerElement.name" label="名称" @finish="(value) => finish('name', value)" />
      </el-collapse-item> -->
      <!-- <el-collapse-item title="客户端配置(设置客户端是否允许修改)" name="4">
        <setting-switch v-for="item in dActiveElement.setting" :key="item.key" v-model="item.value" :label="item.label" />
      </el-collapse-item> -->
    </el-collapse>
  </div>
</template>

<script>
// 画布组件样式
const NAME = 'page-style'
import { mapGetters, mapActions } from 'vuex'
import numberInput from '../settings/numberInput.vue'
import colorSelect from '../settings/colorSelect.vue'
import uploader from '@/components/common/Uploader/index.vue'
import api from '@/api'

export default {
  name: NAME,
  components: { numberInput, colorSelect, uploader },
  data() {
    return {
      activeNames: ['1', '2', '3', '4'],
      innerElement: {},
      tag: false,
      ingoreKeys: ['backgroundColor', 'name', 'width', 'height'],
    }
  },
  computed: {
    ...mapGetters(['dActiveElement']),
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
  },
  methods: {
    ...mapActions(['updatePageData']),
    change() {
      this.tag = true
      this.innerElement = JSON.parse(JSON.stringify(this.dActiveElement))
    },
    changeValue() {
      if (this.tag) {
        this.tag = false
        return
      }
      for (let key in this.innerElement) {
        if (key !== 'setting' && key !== 'record' && this.innerElement[key] !== this.dActiveElement[key]) {
          if (this.ingoreKeys.indexOf(key) !== -1) {
            this.dActiveElement[key] = this.innerElement[key]
          } else {
            this.updatePageData({
              key: key,
              value: this.innerElement[key],
            })
          }
        }
      }
    },
    finish(key, value) {
      this.updatePageData({
        key: key,
        value: value,
        pushHistory: true,
      })
    },
    async uploadImgDone(img) {
      await api.material.addMyPhoto(img)
      this.updatePageData({
        key: 'backgroundTransform',
        value: {},
      })
      this.finish('backgroundImage', img.url)
    },
  },
}
</script>

<style lang="less" scoped>
#page-style {
  height: 100%;
  width: 100%;
}
.position-size {
  display: flex;
  // justify-content: space-between;
  width: 100%;
  .number-input {
    flex: 0.25;
  }
}
.select {
  margin-bottom: 10px;
}
</style>
