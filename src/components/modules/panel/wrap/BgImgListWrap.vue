<!--
 * @Author: ShawnPhang
 * @Date: 2021-08-27 15:16:07
 * @Description: 素材列表
 * @LastEditors: ShawnPhang
 * @LastEditTime: 2022-02-23 23:38:40
 * @site: book.palxp.com / blog.palxp.com
-->
<template>
  <div class="wrap">
    <div class="color__box">
      <div v-for="c in colors" :key="c" :style="{ background: c }" class="color__item" @click="setBGcolor(c)"></div>
    </div>
    <ul v-if="showList" v-infinite-scroll="loadData" class="infinite-list" style="overflow: auto">
      <el-space fill wrap :fillRatio="30" direction="horizontal" class="list">
        <div v-for="(item, i) in bgList" :key="i + 'i'" draggable="true" @click.stop="selectItem(item)" @dragstart="dragStart($event, item)">
          <el-image class="list__img" :src="item.thumb" fit="cover"></el-image>
        </div>
      </el-space>
      <div v-show="loading" class="loading"><i class="el-icon-loading"></i> 拼命加载中</div>
      <div v-show="loadDone" class="loading">全部加载完毕</div>
    </ul>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, toRefs, watch } from 'vue'
// import { ElDivider } from 'element-plus'
import api from '@/api'
import { mapActions, useStore } from 'vuex'

export default defineComponent({
  props: ['active'],
  // components: { ElDivider },
  setup(props) {
    const store = useStore()
    const state = reactive({
      loading: false,
      loadDone: false,
      bgList: [],
      showList: false,
      colors: ['#000000', '#999999', '#CCCCCC', '#FFFFFF', '#E65353', '#FFD835', '#70BC59', '#607AF4', '#976BEE'],
    })
    const pageOptions = { page: 0, pageSize: 20 }

    watch(
      () => props.active,
      () => {
        if (props.active) {
          state.showList = true
        }
      },
    )

    const loadData = () => {
      if (state.loading) {
        return
      }
      load()
    }

    const load = async (init: boolean = false) => {
      if (state.loadDone) {
        return
      }
      state.loading = true
      pageOptions.page += 1

      if (init) {
        state.bgList = []
        pageOptions.page = 1
      }

      api.material.getImagesList({ cate: 16, page: pageOptions.page }).then(({ list }: any) => {
        state.bgList.push(...list)
        list.length < 0 && (state.loadDone = true)
      })

      setTimeout(() => {
        state.loading = false
      }, 100)
    }

    function setBGcolor(color: string) {
      store.dispatch('updatePageData', {
        key: 'backgroundImage',
        value: '',
      })
      store.dispatch('updatePageData', {
        key: 'backgroundColor',
        value: color,
        pushHistory: true,
      })
      store.dispatch('selectWidget', {
        uuid: '-1',
      })
    }

    return {
      ...toRefs(state),
      load,
      setBGcolor,
      loadData,
    }
  },
  methods: {
    ...mapActions(['selectWidget', 'updatePageData']),
    async selectItem(item: any) {
      // this.$store.commit('setShowMoveable', false) // 清理掉上一次的选择
      this.updatePageData({
        key: 'backgroundTransform',
        value: {},
      })
      this.updatePageData({
        key: 'backgroundImage',
        value: item.url,
        pushHistory: true,
      })
      this.selectWidget({
        uuid: '-1',
      })
    },
    dragStart(e: any, item: any) {
      this.$store.commit('selectItem', { data: {}, type: 'bg' })
    },
  },
})
</script>


<style lang="less" scoped>
.wrap {
  width: 100%;
  height: 100%;
}

.infinite-list {
  height: 100%;
  padding-bottom: 300px;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE 10+ */
}
.infinite-list::-webkit-scrollbar {
  display: none; /* Chrome Safari */
}
.list {
  width: 100%;
  padding: 0 0 0 10px;
  &__img {
    cursor: pointer;
    width: 87px;
    height: 87px;
  }
  &__img:hover {
    background: rgba(0, 0, 0, 0.04);
  }
}

.loading {
  padding-top: 1rem;
  text-align: center;
  font-size: 14px;
  color: #999;
}

.color {
  &__box {
    padding: 1.2rem 0.5rem;
    display: flex;
    flex-wrap: wrap;
  }
  &__item {
    border: 1px solid rgba(0, 0, 0, 0.08);
    margin: 2px;
    width: 43px;
    height: 36px;
    border-radius: 2px;
    cursor: pointer;
  }
}
</style>