<template>
  <div id="style-panel">
    <div class="style-tab">
      <span :class="['tab', { 'active-tab': activeTab === 0 }]" @click="activeTab = 0">设置</span>
      <span :class="['tab', { 'active-tab': activeTab === 1 }]" @click="activeTab = 1">图层</span>
    </div>
    <div v-show="activeTab === 0" class="style-wrap">
      <div v-show="showGroupCombined" style="padding: 2rem 0">
        <el-button type="primary" class="gounp__btn" plain @click="realCombined">成组</el-button>
        <icon-item-select label="" :data="alignIconList" @finish="alignAction" />
      </div>
      <component :is="dActiveElement.type + '-style'" v-show="!showGroupCombined" v-if="dActiveElement.type" />
    </div>
    <div v-show="activeTab === 1" class="layer-wrap">
      <ul class="widget-list">
        <li :class="['widget', { active: dActiveElement.uuid === dPage.uuid && dSelectWidgets.length === 0 }]" @click="selectLayer(dPage)" @mouseover="hoverLayer('-1')" @mouseout="hoverLayer('-1')">
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
        </li>
        <li
          v-for="widget in getWidgets"
          :key="widget.uuid"
          :class="[
            'widget',
            {
              active: getIsActive(widget.uuid),
            },
            widget.parent === '-1' ? 'item-one' : 'item-two',
          ]"
          @click="selectLayer(widget)"
          @mouseover="hoverLayer(widget.uuid)"
          @mouseout="hoverLayer('-1')"
        >
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
    </div>
  </div>
</template>

<script>
// 样式设置面板
const NAME = 'style-panel'
import { mapGetters, mapActions } from 'vuex'
import alignIconList from '@/assets/data/alignListData'
import iconItemSelect from '../settings/iconItemSelect.vue'

export default {
  name: NAME,
  components: { iconItemSelect },
  data() {
    return {
      activeTab: 0,
      alignIconList,
      showGroupCombined: false,
    }
  },
  computed: {
    ...mapGetters(['dActiveElement', 'dWidgets', 'dPage', 'dSelectWidgets']),
    getWidgets() {
      let widgets = []
      let len = this.dWidgets.length
      let childs = []
      for (let i = len - 1; i >= 0; --i) {
        let widget = JSON.parse(JSON.stringify(this.dWidgets[i]))
        if (widget.parent === '-1') {
          widgets.push(widget)
          if (widget.isContainer) {
            widgets = widgets.concat(childs)
            childs = []
          }
        } else {
          childs.push(widget)
        }
      }
      if (childs.length > 0) {
        widgets = widgets.concat(childs)
      }

      return widgets
    },
  },
  watch: {
    dSelectWidgets: {
      handler(items) {
        setTimeout(() => {
          this.showGroupCombined = items.length > 1
        }, 100)
      },
      deep: true,
    },
  },
  methods: {
    ...mapActions(['selectWidget', 'updateAlign', 'updateHoverUuid', 'getCombined', 'realCombined', 'ungroup', 'pushHistory']),
    selectLayer(widget) {
      this.selectWidget({
        uuid: widget.uuid,
      })
    },
    hoverLayer(uuid) {
      this.updateHoverUuid(uuid)
    },
    getIsActive(uuid) {
      if (this.dSelectWidgets.length > 0) {
        let widget = this.dSelectWidgets.find((item) => item.uuid === uuid)
        if (widget) {
          return true
        }
        return false
      } else {
        return uuid === this.dActiveElement.uuid
      }
    },
    alignAction(item) {
      const sWidgets = JSON.parse(JSON.stringify(this.dSelectWidgets))
      this.getCombined().then((group) => {
        for (let i = 0; i < sWidgets.length; i++) {
          const element = sWidgets[i]
          this.updateAlign({
            align: item.value,
            uuid: element.uuid,
            group,
          })
        }
        this.pushHistory()
      })
    },
  },
}
</script>

<style lang="less" scoped>
// Color variables (appears count calculates by raw css)
@color0: #ffffff; // Appears 5 times
@color1: #999999; // Appears 3 times
@color2: #d7d7d7; // Appears 2 times

#style-panel ::-webkit-scrollbar {
  display: none; /* Chrome Safari */
}
#style-panel {
  background-color: @color0;
  border-left: 1px solid @color2;
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;
  width: 300px;
  .style-tab {
    box-shadow: 0px 1px 5px 1px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: row;
    text-align: center;
    width: 100%;
    z-index: 10;
    .tab {
      background-color: @color0;
      font-size: 15px;
      color: @color1;
      cursor: pointer;
      flex: 1;
      padding: 14px 10px;
    }
    .tab.active-tab {
      // background-color: #3e4651;
      color: #444444;
      font-weight: 600;
    }
  }
  .style-wrap {
    flex: 1;
    overflow: auto;
    width: 100%;
    padding: 0px 20px;
  }
  .layer-wrap {
    flex: 1;
    overflow: auto;
    width: 100%;
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
  }
}

.gounp {
  &__btn {
    width: 100%;
    margin-bottom: 2.7rem;
  }
}
</style>
