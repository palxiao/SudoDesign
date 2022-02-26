<!--
 * @Author: ShawnPhang
 * @Date: 2021-07-13 02:48:38
 * @Description: 
 * @LastEditors: ShawnPhang
 * @LastEditTime: 2021-08-27 15:30:25
 * @site: book.palxp.com / blog.palxp.com
-->
<template>
  <router-view />
</template>

<script lang="ts">
import { onMounted, nextTick, getCurrentInstance, ComponentInternalInstance, defineComponent } from 'vue'
export default defineComponent({
  setup() {
    onMounted(() => {
      // const { proxy } = getCurrentInstance() as ComponentInternalInstance
      // console.log(proxy?.$utils.isIOS())
    })
  },
  async created() {
    await nextTick()
    // console.log('Vue3 Setup 写法', this)
  },
})
</script>
