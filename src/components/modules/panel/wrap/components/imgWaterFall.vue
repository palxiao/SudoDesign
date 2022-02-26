<!--
 * @Author: ShawnPhang
 * @Date: 2021-12-16 16:20:16
 * @Description:  
 * @LastEditors: ShawnPhang
 * @LastEditTime: 2022-02-24 13:51:30
 * @site: book.palxp.com / blog.palxp.com
-->
<template>
  <div id="img-water-fall" ref="imgWaterFall">
    <div v-for="(item, index) in listData" :key="index + 'iwf'" class="img-box" draggable="true" @click.stop="selectImg(item, index)" @dragstart="dragStart($event, item)">
      <edit-model v-if="edit" :options="editOptions" :data="{ item, index }">
        <img class="img" :src="item.thumb || item.url" />
      </edit-model>
      <img v-else class="img" :src="item.thumb || item.url" />
    </div>
  </div>
</template>

<script>
// 图片素材-瀑布流组件（模仿稿定横向瀑布流
const NAME = 'img-water-fall'
// import api from '@/api/album'

export default {
  name: NAME,
  props: {
    listData: {
      type: Array,
      required: true,
    },
    edit: {},
  },
  emits: ['select-img', 'delete-img', 'load'],
  data() {
    return {
      editOptions: [
        {
          name: '删除',
          fn: this.delImage,
        },
      ],
    }
  },
  mounted() {},
  methods: {
    load() {
      this.$emit('load')
    },
    async delImage({ item, index }) {
      const key = item.url.split('/')
      key.splice(0, 3)
      // await api.deletePic({
      //   bucket: 'cloud-design',
      //   key: key.join('/'),
      // })
      this.$emit('delete-img', index)
    },
    selectImg(value, index) {
      this.$emit('select-img', value)
    },
    dragStart(e, item) {
      this.$store.commit('selectItem', { data: { value: item }, type: 'image' })
    },
  },
}
</script>

<style lang="less" scoped>
// Color variables (appears count calculates by raw css)
@color0: #ffffff; // Appears 3 times
#img-water-fall {
  // width: 290px;
  // height: 70vh;
  // overflow-y: scroll;
  padding: 0.7rem;
  column-count: 2;
  column-gap: 0.5rem;
  column-width: 10px;
  .img-box {
    opacity: 0.8;
    // margin-bottom: 0.2rem;
    break-inside: avoid;
    box-sizing: border-box;
    width: 100%;
    cursor: pointer;
    .img {
      width: 100%;
      max-height: 15vw;
    }
  }
  .img-box:hover {
    opacity: 1;
  }
}
</style>