<!--
 * @Author: ShawnPhang
 * @Date: 2021-08-27 15:16:07
 * @Description: 素材列表
 * @LastEditors: ShawnPhang
 * @LastEditTime: 2022-02-25 00:20:44
 * @site: book.palxp.com / blog.palxp.com
-->
<template>
  <div class="wrap">
    <search-header v-model="searchKeyword" type="none" @change="searchChange" />
    <!-- <div class="types">
      <div v-for="(t, ti) in types" :key="ti + 't'" :style="{ backgroundColor: colors[ti] }" :class="['types__item', { 'types--select': currentType === t.id }]" @click="selectType(t)"></div>
    </div> -->
    <!-- <div class="tags">
      <el-check-tag v-for="(t2, t2i) in sub" :key="t2i + 't2'" :checked="t2.id === currentCheck" class="tags__item" @click="tagsChange(t2.id)">{{ t2.name }}</el-check-tag>
    </div> -->
    <div v-show="!currentCategory" class="content__wrap">
      <div v-for="(t, ti) in types" :key="ti + 't'">
        <div v-if="showList[ti]?.length > 0" class="types__header" @click="selectTypes(t)">
          <span style="flex: 1">{{ t.name }}</span>
          <span class="types__header-more">全部<i class="iconfont icon-right"></i></span>
        </div>
        <div v-else class="loading"><i class="el-icon-loading" /> 拼命加载中</div>
        <div class="list-wrap">
          <div v-for="(item, i) in showList[ti]" :key="i + 'sl'" draggable="true" @click.stop="selectItem(item)" @dragstart="dragStart($event, item)">
            <el-image class="list__img-thumb" :src="item.thumb" fit="contain"></el-image>
          </div>
        </div>
      </div>
    </div>

    <ul v-if="currentCategory" v-infinite-scroll="load" class="infinite-list" style="overflow: auto">
      <span class="types__header-back" @click="back"><i class="iconfont icon-right"></i>{{ currentCategory.name }}</span>
      <el-space fill wrap :fillRatio="30" direction="horizontal" class="list">
        <div v-for="(item, i) in list" :key="i + 'i'" draggable="true" @click.stop="selectItem(item)" @dragstart="dragStart($event, item)">
          <el-image class="list__img" :src="item.thumb" fit="contain"></el-image>
        </div>
      </el-space>
      <div v-show="loading" class="loading"><i class="el-icon-loading" /> 拼命加载中</div>
      <div v-show="loadDone" :style="list.length <= 0 ? 'padding-top: 4rem' : ''" class="loading">全部加载完毕</div>
    </ul>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, toRefs, onMounted, watch } from 'vue'
import api from '@/api'
import wImage from '../../widgets/wImage/wImage.vue'
import wSvg from '../../widgets/wSvg/wSvg.vue'
import { mapActions, mapGetters } from 'vuex'
import setImageData from '@/common/methods/DesignFeatures/setImage'

export default defineComponent({
  props: ['active'],
  setup(props) {
    const colors = ['#f8704b', '#5b89ff', '#2cc4cc', '#a8ba73', '#f8704b']
    const state: any = reactive({
      loading: false,
      loadDone: false,
      sub: [],
      list: [],
      currentType: 2, // 2
      currentCheck: 0,
      colors,
      currentCategory: null,
      types: [],
      showList: [],
      searchKeyword: '',
    })
    const pageOptions = { page: 0, pageSize: 20 }

    watch(
      () => props.active,
      async (active) => {
        if (active) {
          if (!props.active || state.types.length > 0) {
            return
          }
          const types = await api.material.getKinds({ type: 2 })
          types.shift()
          state.types = types
          for (const iterator of types) {
            const { list } = await api.material.getList({
              cate: iterator.id,
              pageSize: 3,
            })
            state.showList.push(list)
          }
        }
      },
    )
    // onMounted(async () => {
    // })

    const load = async (init: boolean = false) => {
      if (init) {
        state.list = []
        pageOptions.page = 0
        state.loadDone = false
      }
      if (state.loadDone || state.loading) {
        return
      }
      state.loading = true
      pageOptions.page += 1
      const list = await api.material.getList({
        ...{ cate: state.currentCategory?.id, search: state.searchKeyword, ...pageOptions },
      })
      if (init) {
        state.list = list?.list
      } else {
        state.list = state.list.concat(list?.list)
      }
      list?.list.length <= 0 && (state.loadDone = true)
      setTimeout(() => {
        state.loading = false
      }, 100)
    }

    const searchChange = (e: any) => {
      state.currentCategory = { name: '搜索结果' }
      load(true)
    }

    const selectTypes = (item: any) => {
      state.currentCategory = item
      load(true)
    }
    const back = () => {
      state.currentCategory = null
    }

    return {
      ...toRefs(state),
      load,
      searchChange,
      selectTypes,
      back,
    }
  },
  computed: {
    ...mapGetters(['dPage']),
  },
  methods: {
    ...mapActions(['addWidget']),
    async selectItem(item: any) {
      console.log(item)
      this.$store.commit('setShowMoveable', false) // 清理掉上一次的选择
      let setting = JSON.parse(JSON.stringify(wImage.setting))
      const img: any = await setImageData(item)
      setting.width = img.width
      setting.height = img.height // parseInt(100 / item.value.ratio, 10)
      const { width: pW, height: pH } = this.dPage
      setting.left = pW / 2 - img.width / 2
      setting.top = pH / 2 - img.height / 2
      setting.imgUrl = item.url
      this.addWidget(setting)
    },
    dragStart(e: any, item: any) {
      this.$store.commit('selectItem', { data: { value: item }, type: 'image' })
      // 临时判断逻辑
      // if (item.firstKindId === '2' && item.content_type.split('/')[1] === 'svg+xml') {
      //   this.$store.commit('selectItem', { data: { value: { url: item.imgUrl } }, type: 'svg' })
      // } else {
      //   this.$store.commit('selectItem', { data: { value: { url: item.imgUrl } }, type: 'image' })
      // }
    },
  },
})
</script>


<style lang="less" scoped>
.wrap {
  width: 100%;
  height: 100%;
}
.types {
  display: flex;
  flex-wrap: wrap;
  padding: 10px 0 0 6px;
  &__item {
    position: relative;
    width: 64px;
    // height: 44px;
    height: 64px;
    display: flex;
    justify-content: center;
    align-items: center;
    color: #fff;
    font-weight: 600;
    font-size: 13px;
    border-radius: 4px;
    cursor: pointer;
    margin: 8px 4px 0 4px;
    background-size: cover;
    background-repeat: no-repeat;
    text-shadow: 0 1px 0 rgb(0 0 0 / 25%);
    opacity: 0.5;
  }
  &--select {
    opacity: 1;
  }
  &__header {
    cursor: pointer;
    margin-bottom: 12px;
    font-size: 13px;
    color: #333333;
    display: flex;
    align-items: center;
    &-more {
      display: flex;
      align-items: center;
      color: #a0a0a0;
      font-size: 13px;
    }
    &-back {
      cursor: pointer;
      padding: 0 0 0 0.6rem;
      display: flex;
      align-items: center;
      color: #333;
      font-size: 16px;
      height: 2.9rem;
      position: absolute;
      z-index: 2;
      background: #ffffff;
      width: 266px;
      .icon-right {
        transform: rotate(180deg);
      }
    }
  }
}

.tags {
  padding: 20px 0 0 10px;
  &__item {
    margin: 0 8px 8px 0;
  }
}

.infinite-list {
  height: 100%;
  padding-bottom: 300px;
}
.list {
  width: 100%;
  padding: 3.1rem 0 0 0.6rem;
  &__img {
    cursor: pointer;
    width: 126px;
    height: 100px;
  }
  &__img-thumb {
    cursor: pointer;
    width: 85px;
    height: 85px;
    padding: 0 8px;
  }
  &__img:hover,
  &__img-thumb:hover {
    background: rgba(0, 0, 0, 0.04);
  }
}
.list-wrap {
  display: flex;
  margin-bottom: 1rem;
}

.loading {
  padding-top: 1rem;
  text-align: center;
  font-size: 14px;
  color: #999;
}

.content {
  &__wrap {
    padding: 1rem;
    height: 100%;
    overflow: auto;
    padding-bottom: 100px;
  }
}
</style>