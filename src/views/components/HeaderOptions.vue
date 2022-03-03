<!--
 * @Author: ShawnPhang
 * @Date: 2022-01-12 11:26:53
 * @Description: 顶部操作按钮组
 * @LastEditors: ShawnPhang
 * @LastEditTime: 2022-03-03 14:07:10
 * @site: book.palxp.com / blog.palxp.com
-->
<template>
  <div class="top-title"><el-input v-model="title" placeholder="未命名的设计" class="input-wrap" /></div>
  <div class="top-icon-wrap">
    <template v-if="tempEditing">
      <span style="color: #999; font-size: 14px; margin-right: 0.5rem">{{ stateBollean ? '启用' : '停用' }}</span> <el-switch v-model="stateBollean" size="small" @change="stateChange" />
      <div style="margin: 0 1rem; color: #999">|</div>
      <el-button size="small" type="primary" @click="saveTemp">保存模板</el-button>
      <el-button size="small" @click="$store.commit('managerEdit', false)">取消</el-button>
      <div style="margin: 0 1rem; color: #999">|</div>
    </template>
    <!-- <el-button size="small" @click="draw">绘制(测试)</el-button>
    <div style="margin: 0 1rem; color: #999">|</div> -->
    <el-button class="primary-btn" :disabled="tempEditing" @click="save(false)">保存</el-button>
    <el-button class="primary-btn" :disabled="tempEditing" type="primary" @click="download">下载作品</el-button>
  </div>
  <!-- 生成图片弹窗组件 -->
  <!-- <SaveImage ref="canvasImage" /> -->
</template>

<script lang="ts">
import api from '@/api'
import { defineComponent, reactive, toRefs, getCurrentInstance, ComponentInternalInstance } from 'vue'
import { mapGetters, useStore } from 'vuex'
import { useRoute, useRouter } from 'vue-router'
import downloadImg from '@/common/methods/download'
import useNotification from '@/common/methods/notification'
// import SaveImage from '@/components/business/save-download/SaveImage.vue'
import { useFontStore } from '@/common/methods/fonts'

export default defineComponent({
  components: {},
  props: ['modelValue'],
  emits: ['change', 'update:modelValue'],
  setup(props, context) {
    const { proxy }: any = getCurrentInstance() as ComponentInternalInstance
    const route = useRoute()
    const router = useRouter()
    const store = useStore()
    const state = reactive({
      stateBollean: false,
      title: '',
    })
    // 保存作品
    async function save(simple: boolean = false) {
      store.commit('setShowMoveable', false) // 清理掉上一次的选择框
      console.log(proxy?.dPage, proxy?.dWidgets)
      const { id, tempid } = route.query
      // const cover = simple ? undefined : await proxy?.draw()
      const { id: newId, stat, msg } = await api.home.saveWorks({ simple, id, title: proxy.title || '未命名设计', data: JSON.stringify({ page: proxy.dPage, widgets: proxy.dWidgets }), temp_id: tempid, width: proxy.dPage.width, height: proxy.dPage.height })
      stat != 0 ? useNotification('保存成功', '可在"我的设计"中查看') : useNotification('保存失败', msg, 'error')
      !id && router.push({ path: '/home', query: { id: newId }, replace: true })
    }
    // 保存模板
    async function saveTemp() {
      const { tempid } = route.query
      const { stat } = await api.home.saveTemp({ id: tempid, title: proxy.title || '未命名模板', content: JSON.stringify({ page: proxy.dPage, widgets: proxy.dWidgets }), width: proxy.dPage.width, height: proxy.dPage.height })
      stat != 0 && useNotification('保存成功', '模板内容已变更')
    }
    // 停用启用
    async function stateChange(e: any) {
      const { tempid } = route.query
      const { stat } = await api.home.saveTemp({ id: tempid, state: e ? 1 : 0 })
      stat != 0 && useNotification('保存成功', '模板内容已变更')
    }
    async function download() {
      await save(true)
      setTimeout(async () => {
        const { id } = route.query
        if (id) {
          const { width, height } = proxy.dPage
          context.emit('update:modelValue', true)
          context.emit('change', { downloadPercent: 1, downloadText: '准备合成图片' })
          await downloadImg(api.home.download({ id, width, height }) + '&r=' + Math.random(), (progress: number, xhr: any) => {
            if (props.modelValue) {
              context.emit('change', { downloadPercent: Number(progress.toFixed(0)), downloadText: '图片生成中' })
            } else {
              xhr.abort()
            }
          })
          context.emit('change', { downloadPercent: 0, downloadText: '' })
        }
      }, 100)
    }

    return {
      ...toRefs(state),
      download,
      save,
      saveTemp,
      stateChange,
    }
  },
  computed: {
    ...mapGetters(['dPage', 'dWidgets', 'tempEditing']),
  },
  // watch: {
  //   tempEditing(val) {
  //     console.log(val)
  //   },
  // },
  methods: {
    async load(id: any, tempId: any, cb: Function) {
      if (this.$route.name !== 'Draw') {
        await useFontStore().init() // 初始化加载字体
      }
      const apiName = tempId && !id ? 'getTempDetail' : 'getWorks'
      if (!id && !tempId) {
        cb()
        return
      }
      const { data: content, title, state } = await api.home[apiName]({ id: id || tempId })
      if (content) {
        const data = JSON.parse(content)
        this.stateBollean = !!state
        this.title = title
        this.$store.commit('setShowMoveable', false) // 清理掉上一次的选择框
        this.$store.commit('setDWidgets', [])
        this.$store.commit('setDPage', data.page)
        id ? this.$store.commit('setDWidgets', data.widgets) : this.$store.dispatch('setTemplate', data.widgets)
        cb()
      }
    },
    // draw() {
    //   // return new Promise((resolve) => {
    //   //   this.$refs.canvasImage.createImg((url) => {
    //   //     resolve(url)
    //   //   })
    //   // })
    // },
  },
})
</script>

<style lang="less" scoped>
// .wrap {
//   padding: 0 1rem;
// }
.top-icon-wrap {
  display: flex;
  align-items: center;
  padding-right: 20px;
  height: 54px;
  .top-icon {
    background-color: rgba(0, 0, 0, 0.4);
    border-radius: 5px;
    color: #ffffff;
    cursor: pointer;
    font-weight: bold;
    margin: 8px;
    padding: 5px 8px;
    &:hover {
      background-color: rgba(0, 0, 0, 0.5);
    }
  }
}
.top-title {
  color: @color-black;
  cursor: pointer;
  flex: 1;
  padding-left: 5.2rem;
  // font-weight: bold;
  .input-wrap {
    width: 15rem;
    :deep(input) {
      border-color: #ffffff;
      // border-color: #e8eaec;
    }
  }
  .input-wrap:hover {
    :deep(input) {
      border-color: #e8eaec;
    }
  }
}
.primary-btn {
  transform: scale(0.95);
}
</style>