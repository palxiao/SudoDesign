<!--
 * @Author: ShawnPhang
 * @Date: 2021-08-19 18:43:22
 * @Description: 
 * @LastEditors: ShawnPhang
 * @LastEditTime: 2022-01-21 15:22:44
 * @site: book.palxp.com / blog.palxp.com
-->
<template>
  <div class="color__select">
    <!-- <span class="label">{{ label }}</span> -->
    <el-color-picker v-model="innerColor" style="width: 100%" show-alpha size="small" :predefine="dColorHistory" @active-change="activeChange"> </el-color-picker>
  </div>
</template>

<script>
// 颜色选择组件
const NAME = 'color-select'
import { mapGetters, mapActions } from 'vuex'

export default {
  name: NAME,
  props: {
    label: {
      default: '',
    },
    modelValue: {
      default: '',
    },
  },
  emits: ['finish', 'update:modelValue'],
  data() {
    return {
      innerColor: '#000000',
      first: true,
    }
  },
  computed: {
    ...mapGetters(['dColorHistory']),
  },
  watch: {
    innerColor(value) {
      if (this.first) {
        this.first = false
        return
      }
      this.$emit('finish', value)
      this.pushColorToHistory(value)
    },
    modelValue(val) {
      val !== this.innerColor && (this.innerColor = val)
    },
  },
  created() {
    this.first = true
    this.innerColor = this.modelValue
  },
  methods: {
    ...mapActions(['pushColorToHistory']),
    updateValue(value) {
      this.$emit('update:modelValue', value)
    },
    activeChange(value) {
      this.updateValue(value)
    },
  },
}
</script>

<style lang="less" scoped>
:deep(.el-color-picker--small .el-color-picker__trigger) {
  width: 100%;
}
.color__select {
  width: 99%;
  align-items: center;
  display: flex;
  .label {
    margin-right: 10px;
  }
}
</style>
