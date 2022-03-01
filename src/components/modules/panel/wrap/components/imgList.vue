<!--
 * @Author: ShawnPhang
 * @Date: 2022-02-23 15:48:52
 * @Description: 图片列表组件 Bookshelf Layout 
 * @LastEditors: ShawnPhang
 * @LastEditTime: 2022-03-01 15:42:49
 * @site: book.palxp.com / blog.palxp.com
-->
<template>
  <ul v-infinite-scroll="load" class="img-list-wrap">
    <div class="list">
      <div v-for="(item, i) in list" :key="i + 'i'" :style="{ width: item.listWidth + 'px' }" class="list__img" draggable="true" @click.stop="select(i)" @dragstart="dragStart($event, i)">
        <edit-model v-if="edit" :options="edit" :data="{ item, i }">
          <div v-if="item.isDelect" style="background: rgba(0, 0, 0, 0.7); opacity: 1" class="list__img-mask">已删除</div>
          <img class="img" :src="item.thumb || item.cover || item.url" />
        </edit-model>
        <template v-else>
          <div class="list__img-mask"></div>
          <img class="img" :src="item.thumb || item.cover || item.url" />
        </template>
        <!-- <el-image :src="item.thumb || item.url" fit="cover"></el-image> -->
      </div>
    </div>
    <div v-if="!isDone" v-show="loading" class="loading"><i class="el-icon-loading" /> 拼命加载中</div>
    <div v-else class="loading">全部加载完毕</div>
  </ul>
</template>

<script lang="ts">
import { defineComponent, toRefs, reactive, watch } from 'vue'

export default defineComponent({
  props: {
    listData: {},
    edit: {},
    isDone: {},
  },
  emits: ['load', 'drag', 'select'],
  setup(props, context) {
    const state: any = reactive({
      loading: true,
      list: [],
    })

    watch(
      () => props.listData,
      async (newList: any, oldList: any) => {
        if (newList.length <= 0) {
          state.list.length = 0
          return
        }
        let list = newList.filter((v: any) => !newList.includes(v) || !oldList.includes(v)) // difference
        list = JSON.parse(JSON.stringify(list))
        const limitWidth = 260 // 256
        const marginRight = 6 // 间距
        const standardHeight = 140 // 高度阈值
        const neatArr: any = [] // 整理后的数组
        function factory(cutArr: any) {
          return new Promise((resolve) => {
            const lineup = list.shift()
            if (!lineup) {
              resolve({ height: calculate(cutArr), list: cutArr })
              return
            }
            cutArr.push(lineup)
            const finalHeight = calculate(cutArr)
            if (finalHeight > standardHeight) {
              resolve(factory(cutArr))
            } else {
              resolve({ height: finalHeight, list: cutArr })
            }
          })
        }
        function calculate(cutArr: any) {
          let cumulate = 0
          for (const iterator of cutArr) {
            const { width, height } = iterator
            cumulate += width / height
          }
          return (limitWidth - marginRight * (cutArr.length - 1)) / cumulate
        }
        async function handleList() {
          if (list.length <= 0) {
            return
          }
          const { list: newList, height }: any = await factory([list.shift()])
          neatArr.push(
            newList.map((x: any) => {
              x.listWidth = (x.width / x.height) * height
              return x
            }),
          )
          if (list.length > 0) {
            await handleList()
          }
        }
        await handleList()

        state.list = state.list.concat(neatArr.flat(1))
        state.loading = false
      },
    )

    const load = () => {
      context.emit('load')
    }
    const select = (i: number) => {
      !state.list[i].isDelect && context.emit('select', i)
    }
    const dragStart = (e: Event, i: number) => {
      !state.list[i].isDelect && context.emit('drag', i)
    }
    function delItem(i: number) {
      state.list[i].isDelect = true
    }
    return {
      load,
      dragStart,
      select,
      ...toRefs(state),
      delItem,
    }
  },
})
</script>

<style lang="less" scoped>
.img-list-wrap {
  height: 100%;
  margin-top: 14px;
  overflow-y: scroll;
  padding-bottom: 300px;
}
.img {
  width: 100%;
  height: 100%;
}
.list {
  display: flex;
  flex-wrap: wrap;
  width: 100%;
  line-height: 0;
  padding: 4px 0 0 14px;
  &__img {
    cursor: pointer;
    margin: 0 6px 6px 0;
    // width: 126px;
    // height: auto;
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
      display: flex;
      justify-content: center;
      align-items: center;
      color: rgba(255, 255, 255, 0.7);
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