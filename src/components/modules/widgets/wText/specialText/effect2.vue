<!--
 * @Author: ShawnPhang
 * @Date: 2021-08-03 15:19:32
 * @Description: 特效文字
 * @LastEditors: ShawnPhang
 * @LastEditTime: 2022-02-20 21:37:03
 * @site: book.palxp.com / blog.palxp.com
-->
<template>
  <div class="effect__text" :style="{ '--stroke_1': stroke + 'px', '--stroke_2': stroke * ratio + 'px' }">
    <span class="editable-text" style="color: transparent">{{ params.text }}</span>
    <div :style="{ fontFamily: params?.fontClass?.value }" class="editable-text t3">{{ params.text }}</div>
    <div :style="{ fontFamily: params?.fontClass?.value }" class="editable-text t2">{{ params.text }}</div>
    <div :style="{ fontFamily: params?.fontClass?.value }" class="editable-text t1">{{ params.text }}</div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, toRefs, reactive, watch, onMounted, nextTick } from 'vue'

export default defineComponent({
  props: {
    params: {
      default: {
        text: 'A',
        degree: 20,
        fontSize: 21,
      },
    },
  },
  setup(props) {
    const ratio = ref(10 / 2) // 强度依据的图层宽度比值
    const state = reactive({
      stroke: 0,
    })

    onMounted(async () => {
      await nextTick()
      if (props.params.degree) {
        const base = props.params.fontSize / 10
        state.stroke = base * (props.params.degree / 100)
      }
    })

    watch(
      () => props.params.fontSize,
      (fontSize) => {
        const base = fontSize / 10
        const degree = props.params.degree
        state.stroke = base * (degree / 100)
      },
    )
    watch(
      () => props.params.degree,
      (degree) => {
        const base = props.params.fontSize / 10
        state.stroke = base * (degree / 100)
      },
    )
    return {
      ...toRefs(state),
      ratio,
    }
  },
})
</script>


<style lang="less" scoped>
.effect {
  &__text {
    position: relative;
    div,
    pre {
      position: absolute;
      top: 0;
      left: 0;
    }
  }
}

.t1 {
  // font-weight: normal;
  // color: #ffffff;
  -webkit-text-stroke: var(--stroke_1) #2d951b;
}
.t2 {
  // font-weight: normal;
  // color: #ffffff;
}
.t3 {
  // font-weight: normal;
  // color: #ffffff;
  -webkit-text-stroke: var(--stroke_2) #ffffff;
}
</style>