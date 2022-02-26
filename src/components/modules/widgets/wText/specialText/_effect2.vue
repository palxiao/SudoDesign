<!--
 * @Author: ShawnPhang
 * @Date: 2021-08-03 15:19:32
 * @Description: 特效文字
 * @LastEditors: ShawnPhang
 * @LastEditTime: 2021-08-09 15:39:17
 * @site: book.palxp.com / blog.palxp.com
-->
<template>
  <div class="t" :style="{}">
    <div
      :style="{
        width: Math.max(params.fontSize, params.width) + 'px',
        lineHeight: params.fontSize * params.lineHeight + 'px',
        letterSpacing: (params.fontSize * params.letterSpacing) / 100 + 'px',
        fontSize: params.fontSize + 'px',
        color: params.color,
        textAlign: params.textAlign,
        fontWeight: params.fontWeight,
        fontStyle: params.fontStyle,
        textDecoration: params.textDecoration,
      }"
      class="t3"
    >
      {{ params.text }}
    </div>
    <div
      :style="{
        width: Math.max(params.fontSize, params.width) + 'px',
        lineHeight: params.fontSize * params.lineHeight + 'px',
        letterSpacing: (params.fontSize * params.letterSpacing) / 100 + 'px',
        fontSize: params.fontSize + 'px',
        color: params.color,
        textAlign: params.textAlign,
        fontWeight: params.fontWeight,
        fontStyle: params.fontStyle,
        textDecoration: params.textDecoration,
      }"
      class="t2"
    >
      {{ params.text }}
    </div>
    <div
      :style="{
        width: Math.max(params.fontSize, params.width) + 'px',
        lineHeight: params.fontSize * params.lineHeight + 'px',
        letterSpacing: (params.fontSize * params.letterSpacing) / 100 + 'px',
        fontSize: params.fontSize + 'px',
        color: params.color,
        textAlign: params.textAlign,
        fontWeight: params.fontWeight,
        fontStyle: params.fontStyle,
        textDecoration: params.textDecoration,
      }"
      class="t1"
    >
      {{ params.text }}
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  props: {
    params: {
      default: {
        text: 'A',
      },
    },
  },
  setup() {},
})
</script>


<style lang="less" scoped>
.t {
  position: relative;
  font-size: 21px;
}
.t > div {
  position: absolute;
}

.t1 {
  font-weight: normal;
  color: #ffffff;
  -webkit-text-stroke: 2px #2d951b;
}
.t2 {
  font-weight: normal;
  color: #ffffff;
}
.t3 {
  font-weight: normal;
  color: #ffffff;
  -webkit-text-stroke: 10px #ffffff;
}
</style>