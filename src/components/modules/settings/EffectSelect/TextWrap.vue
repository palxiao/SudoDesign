<!--
 * @Author: ShawnPhang
 * @Date: 2021-08-09 14:00:23
 * @Description: 文字特效选择框组件
 * @LastEditors: ShawnPhang
 * @LastEditTime: 2022-01-17 15:36:08
 * @site: book.palxp.com / blog.palxp.com
-->
<template>
  <el-card class="box-card" shadow="hover" :body-style="{ padding: effectSelect ? '20px' : 0 }">
    <template #header>
      <div class="card-header">
        <template v-if="effectSelect">
          <component :is="effectSelect" class="demo" />
        </template>
        <div v-show="!effectSelect">无</div>
        <span class="title">文字特效</span>
        <el-popover :visible="visiable" placement="bottom-end" :width="220" trigger="click">
          <div class="select__box">
            <div class="select__box__select-item" @click="select(null, { color: textColor })">无</div>
            <div class="select__box__select-item">
              <effect class="e-box" @click="select('effect', { color: '#ffffff' })" />
            </div>
            <div class="select__box__select-item">
              <effect2 class="e-box" @click="select('effect2', { color: '#ffffff' })" />
            </div>
          </div>
          <template #reference>
            <el-button class="button" type="text" @click="visiable = !visiable">{{ visiable ? '取消' : '选择' }}</el-button>
          </template>
        </el-popover>
      </div>
    </template>
    <div v-show="effectSelect" class="text item">
      <span class="strength">强度</span>
      <el-slider v-model="strength" show-input input-size="mini" :show-input-controls="false"> </el-slider>
    </div>
  </el-card>
</template>

<script lang="ts">
import { defineComponent, toRefs, reactive, watch, onMounted, nextTick } from 'vue'

export default defineComponent({
  props: ['modelValue', 'degree', 'textColor'],
  emits: ['select'],
  setup(props, context) {
    const state = reactive({
      strength: 20, // 强度
      effectSelect: '', // 选择的模板
      visiable: false, // 弹出选择层控制
    })
    const select = (value: string = '', style: any) => {
      state.effectSelect = value
      state.visiable = false
      context.emit('select', { key: 'isEffect', value, style })
      context.emit('select', { key: 'degree', value: 20 })
    }
    onMounted(async () => {
      await nextTick()
      state.effectSelect = props?.modelValue || ''
      state.strength = props?.degree || state.strength
    })
    watch(
      () => props.degree,
      (value) => {
        state.strength = props?.degree || state.strength
      },
    )
    watch(
      () => props.modelValue,
      (value) => {
        state.effectSelect = value || ''
      },
    )
    watch(
      () => state.strength,
      (strength) => {
        context.emit('select', { key: 'degree', value: strength }) // 组件改变强度
      },
    )
    return {
      ...toRefs(state),
      select,
    }
  },
  methods: {},
})
</script>

<style lang="less" scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.text {
  font-size: 14px;
}

.item {
  display: flex;
  align-items: center;
}

.box-card {
  width: 100%;
}

.demo {
  margin: 0 0 0 0.15rem;
  font-size: 27px;
  color: #ffffff;
}
.title {
  font-size: 14px;
  font-weight: 600;
  color: #33383e;
}
.strength {
  width: 80px;
}
.select__box {
  display: flex;
  flex-wrap: wrap;
  // height: 60px;
  &__select-item {
    cursor: pointer;
    position: relative;
    height: 40px;
    width: 25%;
    align-items: center;
    justify-content: center;
    display: flex;
    .e-box {
      font-size: 21px;
      color: #ffffff;
    }
  }
  &__select-item:hover {
    background: rgba(0, 0, 0, 0.07);
  }
}
</style>