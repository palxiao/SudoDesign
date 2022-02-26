<!--
 * @Author: ShawnPhang
 * @Date: 2021-12-28 09:29:42
 * @Description: 百分比进度条
 * @LastEditors: ShawnPhang
 * @LastEditTime: 2022-01-12 14:07:41
 * @site: book.palxp.com / blog.palxp.com
-->
<template>
  <div v-if="percent" class="mask">
    <el-progress style="width: 100%" :text-inside="true" :stroke-width="20" :percentage="percent" />
    <div class="text">{{ text }} ..</div>
  </div>
</template>

<script lang="ts">
import { defineComponent, watch } from 'vue'
import { ElProgress } from 'element-plus'

export default defineComponent({
  components: { ElProgress },
  props: ['percent', 'text'],
  emits: ['done'],
  setup(props, centext) {
    watch(
      () => props.percent,
      (num) => {
        if (num >= 100) {
          setTimeout(() => {
            centext.emit('done')
          }, 1000)
        }
      },
    )
  },
})
</script>


<style lang="less" scoped>
.mask {
  display: flex;
  justify-content: center;
  flex-direction: column;
  padding: 0 20%;
  width: 100%;
  height: 100%;
  position: fixed;
  z-index: 99999;
  top: 0;
  left: 0;
  background: rgba(0, 0, 0, 0.7);
}
.text {
  margin-top: 2rem;
  width: 100%;
  text-align: center;
  color: #ffffff;
}
</style>