<!--
 * @Author: ShawnPhang
 * @Date: 2022-03-07 17:25:19
 * @Description: 图层组件
 * @LastEditors: ShawnPhang
 * @LastEditTime: 2022-03-07 18:30:23
 * @site: book.palxp.com / blog.palxp.com
-->
<template>
  <ul class="widget-list">
    <!-- <li :class="['widget', { active: dActiveElement.uuid === dPage.uuid && dSelectWidgets.length === 0 }]" @click="selectLayer(dPage)" @mouseover="hoverLayer('-1')" @mouseout="hoverLayer('-1')">
      <span class="widget-type"></span>
      <span class="widget-name">{{ dPage.name }}</span>
      <div
        class="widget-out"
        :data-type="dPage.type"
        :data-uuid="dPage.uuid"
        :style="{
          marginLeft: '-10px',
        }"
      ></div>
    </li> -->

    <li v-for="widget in getWidgets" :key="widget.uuid" :class="['widget', { active: getIsActive(widget.uuid) }, widget.parent === '-1' ? 'item-one' : 'item-two']" @click="selectLayer(widget)" @mouseover="hoverLayer(widget.uuid)" @mouseout="hoverLayer('-1')">
      <span class="widget-type"></span>
      <span class="widget-name">{{ widget.name }}</span>
      <div
        class="widget-out"
        :data-type="widget.type"
        :data-uuid="widget.uuid"
        :style="{
          marginLeft: widget.parent === '-1' ? '-25px' : '-40px',
        }"
      ></div>
    </li>
  </ul>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import { useStore } from 'vuex'

export default defineComponent({
  props: ['data'],
  setup(props) {
    const store = useStore()
    const getWidgets = computed(() => {
      let widgets = []
      let len = props.data.length
      const childs = [] // 临时子组件桶
      for (let i = len - 1; i >= 0; --i) {
        let widget = JSON.parse(JSON.stringify(props.data[i]))
        if (widget.parent != -1) {
          childs.push(widget)
        } else {
          widgets.push({ childs: [], ...widget })
        }
      }
      for (const item of childs) {
        // widgets[widgets.findIndex((x) => x.uuid === item.parent)].childs.push(item)
        const index = widgets.findIndex((x) => x.uuid === item.parent)
        widgets.splice(index + 1, 0, item)
      }
      return widgets
    })

    const getIsActive = (uuid: number) => {
      if (store.getters.dSelectWidgets.length > 0) {
        let widget = store.getters.dSelectWidgets.find((item: any) => item.uuid === uuid)
        if (widget) {
          return true
        }
        return false
      } else {
        return uuid === store.getters.dActiveElement.uuid
      }
    }

    const selectLayer = (widget: any) => {
      store.dispatch('selectWidget', { uuid: widget.uuid })
    }
    const hoverLayer = (uuid: number) => {
      store.dispatch('updateHoverUuid', uuid)
    }

    return { selectLayer, hoverLayer, getIsActive, getWidgets }
  },
})
</script>

<style lang="less" scoped>
@color0: #ffffff; // Appears 5 times
@color1: #999999; // Appears 3 times
@color2: #d7d7d7; // Appears 2 times

.widget-list {
  width: 100%;
  .widget {
    align-items: center;
    background-color: #efefef;
    border-bottom: 1px solid @color2;
    color: @color1;
    cursor: pointer;
    display: flex;
    padding: 10px;
    position: relative;
    width: 100%;
    .widget-type {
      align-items: center;
      background-color: @color0;
      color: @color1;
      display: flex;
      height: 20px;
      justify-content: center;
      margin-right: 10px;
      width: 20px;
    }
    .widget-name {
      flex: 1;
      font-size: 14px;
    }
    .widget-out {
      height: 100%;
      position: absolute;
      width: 100%;
    }
  }
  .widget.active {
    background-color: #262c33;
    color: @color0;
  }
  .item-one {
    padding-left: 25px;
  }
  .item-two {
    padding-left: 40px;
  }
}
</style>