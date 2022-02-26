<template>
  <div id="widget-panel">
    <div class="widget-classify">
      <ul class="classify-wrap">
        <li v-for="(item, index) in widgetClassifyList" :key="index" :class="['classify-item', { 'active-classify-item': activeWidgetClassify === index }]" @click="clickClassify(index)">
          <i :class="['iconfont', 'icon', item.icon]"></i>
          <p>{{ item.name }}</p>
        </li>
      </ul>
    </div>
    <div v-show="active" class="widget-wrap">
      <temp-list-wrap :style="getStyle(0)" />
      <graph-list-wrap v-show="+activeWidgetClassify === 1" :active="+activeWidgetClassify === 1" />
      <text-list-wrap v-show="+activeWidgetClassify === 2" :active="+activeWidgetClassify === 2" />
      <photo-list-wrap v-show="+activeWidgetClassify === 3" :active="+activeWidgetClassify === 3" />
      <bg-img-list-wrap v-show="+activeWidgetClassify === 4" :active="+activeWidgetClassify === 4" />
      <!-- <comp-list-wrap2 v-if="+activeWidgetClassify === 5" :style="getStyle(5)" /> -->
      <user-wrap v-show="+activeWidgetClassify === 6" :active="+activeWidgetClassify === 6" />
    </div>
    <div v-show="active" class="side-wrap"><div class="pack__up" @click="active = false">&lt;</div></div>
  </div>
</template>

<script lang="ts">
// 组件面板
const NAME = 'widget-panel'
import widgetClassifyListData from '@/assets/data/widgetClassifyList'
import { reactive, toRefs, onMounted, watch, nextTick, getCurrentInstance, ComponentInternalInstance } from 'vue'
import { mapActions } from 'vuex'

export default {
  name: NAME,
  setup() {
    // const store = useStore()
    const state = reactive({
      widgetClassifyList: widgetClassifyListData,
      activeWidgetClassify: -1,
      active: true,
    })
    const clickClassify = (index: number) => {
      state.activeWidgetClassify = index
      state.active = true
    }
    const getStyle = (index: number) => {
      return {
        display: state.activeWidgetClassify === index ? '' : 'none',
      }
    }

    onMounted(() => {
      state.activeWidgetClassify = 0
    })

    watch(
      () => state.activeWidgetClassify,
      (index) => {
        if (index >= 0 && index < state.widgetClassifyList.length) {
          state.widgetClassifyList[index].show = true
        }
      },
    )
    const { proxy } = getCurrentInstance() as ComponentInternalInstance
    watch(
      () => state.active,
      () => {
        let screen = document.getElementById('page-design')
        nextTick(() => {
          proxy?.updateScreen({
            width: screen.offsetWidth,
            height: screen.offsetHeight,
          })
        })
      },
    )

    return {
      clickClassify,
      getStyle,
      ...toRefs(state),
    }
  },
  methods: {
    ...mapActions(['updateScreen']),
  },
}
</script>

<style lang="less" scoped>
// Color variables (appears count calculates by raw css)
@color0: #3b74f1; // Appears 2 times
@color1: #3e4651; // Appears 2 times

#widget-panel {
  transition: all 1s;
  color: @color1;
  display: flex;
  flex-direction: row;
  font-weight: 600;
  height: 100%;
  position: relative;
  // width: 360px;
  .widget-classify {
    border-right: 1px solid rgba(0, 0, 0, 0.07);
    background-color: #ffffff;
    height: 100%;
    text-align: center;
    width: 60px;
    .icon {
      font-size: 24px;
      color: #070707c9;
    }
    .classify-wrap {
      width: 100%;
      .classify-item {
        align-items: center;
        cursor: pointer;
        display: flex;
        flex-direction: column;
        font-size: 12px;
        height: 68px;
        justify-content: center;
        width: 100%;
        p {
          color: #9da3ac;
          margin-top: 2px;
        }
        &:hover {
          // color: @color-white;
        }
      }
      .active-classify-item {
        // background-color: @active-text-color;
        .icon,
        p {
          color: @active-text-color;
        }
      }
    }
  }
  .widget-wrap {
    width: 300px;
    background-color: @color-white;
    flex: 1;
    height: 100%;
  }
  .side-wrap {
    width: 15px;
    // background-color: red;
    height: 100%;
    display: flex;
    align-items: center;
    .pack__up {
      opacity: 0.7;
      color: rgba(0, 0, 0, 0.5);
      background: @color-white;
      height: 50px;
      width: 15px;
      border-radius: 0 100% 100% 0;
      cursor: pointer;
      line-height: 45px;
    }
    .pack__up:hover {
      color: rgba(0, 0, 0, 0.9);
      opacity: 0.9;
    }
  }
}
</style>
