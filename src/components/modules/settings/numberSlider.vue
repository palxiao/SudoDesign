<!--
 * @Author: ShawnPhang
 * @Date: 2021-08-09 11:44:29
 * @Description: 数值滑块组件
 * @LastEditors: ShawnPhang
 * @LastEditTime: 2022-02-24 18:14:27
 * @site: book.palxp.com / blog.palxp.com
-->
<template>
  <div id="number-slider">
    <span :style="{ width: labelWidth }" class="label">{{ label }}</span>
    <el-slider v-model="innerValue" :min="minValue" :max="maxValue" :step="step" input-size="mini" show-input :show-tooltip="false" :show-input-controls="false" @change="changeValue"> </el-slider>
  </div>
</template>

<script>
const NAME = 'number-slider'
import { mapGetters, mapActions } from 'vuex'

export default {
  name: NAME,
  props: {
    label: {
      default: '',
    },
    labelWidth: {
      default: '70px',
    },
    modelValue: {
      default: '',
    },
    minValue: {
      default: 0,
    },
    maxValue: {
      default: 100,
    },
    step: {
      default: 1,
    },
  },
  emits: ['update:modelValue', 'finish'],
  data() {
    return {
      innerValue: 0,
      first: true,
    }
  },
  computed: {
    ...mapGetters([]),
  },
  watch: {
    innerValue(value) {
      if (this.first) {
        this.first = false
        return
      }
      this.$emit('update:modelValue', value)
    },
  },
  created() {
    this.first = true
    this.innerValue = this.modelValue
  },
  methods: {
    ...mapActions([]),
    changeValue(value) {
      this.$emit('finish', value)
    },
  },
}
</script>

<style lang="less">
// style fix
.el-slider {
  width: 100%;
  .show-input {
    margin-right: 70px !important;
  }
  .el-slider__input {
    width: 50px !important;
    // .el-input-number__decrease {
    //   width: 16px !important;
    // }
    // .el-input-number__increase {
    //   width: 16px !important;
    // }
    .el-input--mini {
      .el-input__inner {
        padding-left: 10px !important;
        padding-right: 10px !important;
      }
    }
  }
}
</style>

<style lang="less" scoped>
#number-slider {
  align-items: center;
  display: flex;
  .label {
    margin-right: 10px;
  }
}
</style>