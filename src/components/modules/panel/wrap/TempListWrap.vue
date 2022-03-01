<!--
 * @Author: ShawnPhang
 * @Date: 2021-08-27 15:16:07
 * @Description: 模板列表
 * @LastEditors: ShawnPhang
 * @LastEditTime: 2022-03-01 15:33:13
 * @site: book.palxp.com / blog.palxp.com
-->
<template>
  <div class="wrap">
    <search-header v-model="searchKeyword" @change="cateChange" />
    <el-divider v-show="title" style="margin-top: 1.7rem" content-position="left">
      <span style="font-weight: bold">{{ title }}</span>
    </el-divider>

    <ul v-infinite-scroll="load" class="infinite-list" style="overflow: auto">
      <el-space fill wrap :fillRatio="30" direction="horizontal" class="list">
        <div v-for="(item, i) in list" :key="i + 'i'" class="list__img" @click.stop="selectItem(item)">
          <!-- <edit-model @action="action($event, item, i)"> -->
          <div class="list__img-mask"></div>
          <el-image :src="item.cover" fit="cover"></el-image>
          <!-- </edit-model> -->
        </div>
      </el-space>
      <div v-show="loading" class="loading"><i class="el-icon-loading"></i> 拼命加载中</div>
      <div v-show="loadDone" class="loading">全部加载完毕</div>
    </ul>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, toRefs, onMounted } from 'vue'
import { ElDivider } from 'element-plus'
import api from '@/api'
import { mapActions, mapGetters, useStore } from 'vuex'
import { useRoute } from 'vue-router'
// import chooseType from './components/chooseType.vue'
import editModel from './components/editModel.vue'
import searchHeader from './components/searchHeader.vue'

export default defineComponent({
  components: { ElDivider, editModel, searchHeader },
  setup() {
    const route = useRoute()
    const store = useStore()
    const state: any = reactive({
      loading: false,
      loadDone: false,
      list: [],
      title: '推荐模板',
      searchKeyword: '',
    })
    const pageOptions: any = { page: 0, pageSize: 20, cate: 1 }
    const { cate, edit } = route.query
    cate && (pageOptions.cate = cate)
    edit && store.commit('managerEdit', true)

    // onMounted(async () => {})

    const load = async (init: boolean = false, stat: string) => {
      stat && (pageOptions.state = stat)

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

      const res = await api.home.getTempList({ search: state.searchKeyword, ...pageOptions })
      res.list.length <= 0 && (state.loadDone = true)
      state.list = state.list.concat(res.list)

      setTimeout(() => {
        state.loading = false
      }, 100)
    }

    function cateChange(type: any) {
      state.title = type.name
      const init = pageOptions.cate != type.id
      pageOptions.cate = type.id
      load(init, pageOptions.stat)
    }

    return {
      ...toRefs(state),
      load,
      cateChange,
    }
  },
  computed: {
    ...mapGetters(['tempEditing']),
  },
  methods: {
    ...mapActions(['selectWidget', 'updatePageData', 'setTemplate']),
    async selectItem(item: any) {
      this.$store.commit('managerEdit', false)
      this.$store.commit('setShowMoveable', false) // 清理掉上一次的选择框
      this.$store.commit('setDWidgets', [])

      this.setTempId(item.id)

      let result = null
      if (!item.data) {
        const res = await api.home.getTempDetail({ id: item.id })
        result = JSON.parse(res.data)
      } else {
        result = JSON.parse(item.data)
      }
      const { page, widgets } = result
      this.$store.commit('setDPage', page)
      this.setTemplate(widgets)
      setTimeout(() => {
        this.$store.commit('zoomScreenChange')
      }, 300)
      this.selectWidget({
        uuid: '-1',
      })
    },
    // action({ name, value }: any, item: any, index: number) {
    //   switch (name) {
    //     case 'edit':
    //       this.editTemp(item)
    //       break
    //     case 'del':
    //       this.delTemp(item, index)
    //       break
    //     case 'stat':
    //       this.setTempStat(item, value)
    //       break
    //   }
    // },
    // editTemp(item: any) {
    // this.$router.push({ path: '/home', query: { tempid: item.id }, replace: true })
    // this.$store.commit('managerEdit', true)
    // },
    // delTemp({ id }: any, index: number) {
    //   api.home.removeComp({ id })
    //   this.list.splice(index, 1)
    //   this.$store.commit('managerEdit', false)
    // },
    // setTempStat({ id }: any, stat: string) {
    //   api.home.setTempStat({ id, stat })
    // },
    setTempId(tempId: number | string) {
      const { id } = this.$route.query
      this.$router.push({ path: '/home', query: { tempid: tempId, id }, replace: true })
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
  margin-top: 1rem;
  padding-bottom: 300px;
}
.list {
  width: 100%;
  padding: 4px 0 0 10px;
  &__img {
    cursor: pointer;
    width: 128px;
    height: auto;
    position: relative;
    &-mask {
      opacity: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.12);
      position: absolute;
      z-index: 1;
      top: 0;
      left: 0;
    }
  }
  &__img:hover {
    background: rgba(0, 0, 0, 0.04);
  }
  &__img:hover > &__img-mask {
    opacity: 1;
  }
}

.loading {
  padding-top: 1rem;
  text-align: center;
  font-size: 14px;
  color: #999;
}
</style>