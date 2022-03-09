<!--
 * @Author: ShawnPhang
 * @Date: 2021-08-04 11:46:39
 * @Description: 原版movable插件
 * @LastEditors: ShawnPhang
 * @LastEditTime: 2022-03-08 13:52:56
 * @site: book.palxp.com / blog.palxp.com
-->
<template>
  <!-- <button @click="lock = !lock">{{ lock ? '解锁' : '锁住' }}</button> -->
  <div id="empty" class="remove zk-moveable-style"></div>
</template>
<script lang="ts">
import { defineComponent, nextTick } from 'vue'
import Selecto from 'selecto'
import Moveable, { EVENTS, getElementInfo } from 'moveable' // PROPERTIES, METHODS,
import MoveableHelper from 'moveable-helper'
import { mapGetters, mapActions } from 'vuex'
import { setTransformAttribute } from '@/common/methods/handleTransform'

export default defineComponent({
  setup() {},
  // data() {
  //   return {
  //     lock: false,
  //   }
  // },
  computed: mapGetters(['dSelectWidgets', 'dActiveElement', 'activeMouseEvent', 'showMoveable', 'showRotatable', 'dWidgets', 'updateRect', 'updateSelect']),
  watch: {
    async dActiveElement(val) {
      // if (this.lock) {
      //   return
      // }
      if (!val.record) {
        return
      }
      // 选中非面板 并且不是组合内的元素
      if (val.uuid != -1) {
        await nextTick()
        const target = `[id="${val.uuid}"]`
        this._target = `[id="${val.uuid}"]`
        this.moveable.rotatable = true // 选择时会取消旋转
        // 方向点位设置
        // this.moveable.renderDirections = val.type === 'w-text' ? ['e', 'se'] : 'w-image' ? ['nw', 'n', 'ne', 'w', 'e', 'sw', 's', 'se'] : ['nw', 'ne', 'sw', 'se']
        switch (val.type) {
          case 'w-text':
            this.moveable.renderDirections = ['e', 'se', 's']
            break
          case 'w-image':
            this.moveable.renderDirections = ['nw', 'n', 'ne', 'w', 'e', 'sw', 's', 'se']
            break
          default:
            this.moveable.renderDirections = ['nw', 'ne', 'sw', 'se']
            break
        }
        // // Set Move Auto
        this.moveable.setState({ target: this._target }, () => {
          // 当出现mouseevent时进行即刻选中
          if (this.activeMouseEvent) {
            this.moveable.dragStart(this.activeMouseEvent)
            // TODO 使用后销毁mouseevent
            this.$store.commit('setMouseEvent', null)
          }
        })
        // // End
        this.$store.commit('setShowMoveable', true)
        // 参考线设置
        if (!this.moveable.elementGuidelines.includes(target)) {
          this.moveable.elementGuidelines.push(target)
        }
      } else {
        this.moveable.target = `[id="empty"]`
        if (this.moveable.target !== `[id="empty"]`) {
          setTimeout(() => {
            this.moveable.target = `[id="empty"]`
          }, 210)
        }
        // feature: 可以遍历来设置参考线，目前先粗暴清空
        this.moveable.elementGuidelines.length = 0
      }
    },
    showMoveable(val) {
      if (val) {
        this.moveable.target = this._target
      } else {
        this.moveable.target = `[id="empty"]`
      }
    },
    showRotatable(val) {
      this.moveable.resizable = val
      this.moveable.scalable = val
      document.getElementsByClassName('moveable-rotation')[0].style.display = val ? 'block' : 'none'
    },
    updateRect(val) {
      this.moveable.updateRect()
    },
    updateSelect() {
      const items = this.$store.getters.dSelectWidgets
      setTimeout(async () => {
        this.moveable.updateRect()
        await this.$nextTick()
        for (let i = 0; i < items.length; i++) {
          console.log(items[i].uuid)

          document.getElementById(items[i].uuid)?.classList.add('widget-selected')
        }
        this.moveable.renderDirections = []
        this.moveable.rotatable = false
        const targetCollector = [].slice.call(document.querySelectorAll('.widget-selected'))
        console.log(targetCollector)

        this.moveable.target = targetCollector
        for (let i = 0; i < items.length; i++) {
          document.getElementById(items[i].uuid)?.classList.remove('widget-selected')
        }
      }, 400)
    },
    // 选择的元素
    dSelectWidgets: {
      handler(items) {
        const alt = this.$store.getters.dAltDown
        // if (items.length > 1) {
        //   console.log('打开组合面板')
        // }
        if (alt) {
          for (let i = 0; i < items.length; i++) {
            document.getElementById(items[i].uuid)?.classList.add('widget-selected')
          }
          this.moveable.renderDirections = []
          this.moveable.rotatable = false
          const targetCollector = [].slice.call(document.querySelectorAll('.widget-selected'))
          // this.moveable.target = `[id="empty"]`
          this.moveable.target = targetCollector
          for (let i = 0; i < items.length; i++) {
            document.getElementById(items[i].uuid)?.classList.remove('widget-selected')
          }
        }
      },
      deep: true,
    },
  },
  mounted() {
    let holdGroupPosition: any = null
    const moveableOptions: any = {
      target: document.querySelector(`[id="empty"]`),
      elementGuidelines: [],
      zoom: 0.8,
      draggable: true,
      clippable: false, // 裁剪
      throttleDrag: 0,
      resizable: true,
      scalable: true,
      throttleResize: 1,
      keepRatio: true,
      throttleScale: 0,
      rotatable: true,
      throttleRotate: 0,
      renderDirections: ['nw', 'ne', 'sw', 'se'], // ['nw', 'ne', 'sw', 'se'] // 'e'
      pinchable: true, // ["draggable", "resizable", "scalable", "rotatable"]
      origin: false,
      defaultGroupOrigin: '0% 0%',
      // 样式相关
      rotationPosition: 'bottom',
      className: 'zk-moveable-style',
      // -- 吸附对齐 Start --
      snappable: true,
      verticalGuidelines: [],
      horizontalGuidelines: [],
      snapThreshold: 2,
      isDisplaySnapDigit: true,
      snapGap: false,
      snapElement: true,
      snapVertical: true,
      snapHorizontal: true,
      snapCenter: false,
      snapDigit: 0,
      // -- END --
    }
    const moveable = new Moveable(document.body, moveableOptions)
    this.moveable = moveable

    const helper: any = new MoveableHelper()

    EVENTS.forEach((event) => {
      let helperEvent = event.replace(event[0], 'on' + event[0].toUpperCase())
      // console.log(event)
      // 'resizeStart', 'resize', 'resizeEnd', rotate
      if (['resizeStart', 'rotate', 'resize'].includes(event)) {
        moveable.on(event, (...args) => {
          // this.$emit(event, ...args)
          helper[helperEvent] && helper[helperEvent](...args)
        })
      }
    })
    /* draggable */
    let resizeStartWidth = 0

    moveable
      .on('dragStart', ({ inputEvent, target, stop }) => {
        if (inputEvent.target.nodeName === 'PRE') {
          this.dActiveElement.editable && stop()
        }
      })
      .on('drag', ({ target, transform, left, top, inputEvent }) => {
        // target!.style.transform = transform]
        target!.style.left = `${left}px`
        target!.style.top = `${top}px`
        this.holdPosition = { left, top }
      })
      .on('dragEnd', ({ target, isDrag, inputEvent }) => {
        // console.log('onDragEnd', inputEvent)
        // TODO 清理mouseevent
        this.$store.commit('setMouseEvent', null)
        inputEvent.stopPropagation()
        inputEvent.preventDefault()
        // console.log(this.holdPosition, inputEvent.pageX, inputEvent.pageY)
        if (this.holdPosition) {
          this.updateWidgetData({
            uuid: this.dActiveElement.uuid,
            key: 'left',
            value: this.holdPosition?.left,
          })
          this.updateWidgetData({
            uuid: this.dActiveElement.uuid,
            key: 'top',
            value: this.holdPosition?.top,
          })
          this.holdPosition = null // important
        }
      })
      // .on('keyUp', (e) => {
      //   moveable.updateRect()
      // })
      .on('dragGroup', (e) => {
        e.inputEvent.stopPropagation()
        e.inputEvent.preventDefault()
        holdGroupPosition = {}
        const events = e.events
        for (let i = 0; i < events.length; i++) {
          const ev = events[i]
          const currentWidget = this.dWidgets.find((item: any) => item.uuid === ev.target.getAttribute('data-uuid'))
          const left = Number(currentWidget.left) + ev.beforeTranslate[0]
          // debug -- start --
          if (i === 1) {
            console.log(Number(currentWidget.left), ev.beforeTranslate[0])
          }
          // debug -- end --
          const top = Number(currentWidget.top) + ev.beforeTranslate[1]
          ev.target.style.left = `${left}px`
          ev.target.style.top = `${top}px`
          holdGroupPosition[`${ev.target.getAttribute('data-uuid')}`] = { left, top }
        }
      })
      .on('dragGroupEnd', (e) => {
        for (const key in holdGroupPosition) {
          if (Object.prototype.hasOwnProperty.call(holdGroupPosition, key)) {
            const item = holdGroupPosition[key]
            this.updateWidgetData({
              uuid: key,
              key: 'left',
              value: item.left,
            })
            this.updateWidgetData({
              uuid: key,
              key: 'top',
              value: item.top,
            })
          }
        }
        holdGroupPosition = null
        // background: linear-gradient(to right, #ccc 0%, #ccc 50%, transparent 50%);
        // background-size: 12px 1px;
      })
      .on('rotate', ({ target, beforeDist, dist, transform }: any) => {
        // console.log('onRotate', Number(this.dActiveElement.rotate) + Number(beforeDist + dist))
        // target.style.transform = transform
        console.log(target.style.transform)
      })
      .on('rotateEnd', (e: any) => {
        const tf = e.target.style.transform
        const iof = tf.indexOf('rotate')
        let rotate = ''
        if (iof != -1) {
          const index = iof + 'rotate'.length
          const half = tf.substring(index + 1)
          rotate = half.slice(0, half.indexOf(')'))
        }
        rotate &&
          this.updateWidgetData({
            uuid: this.dActiveElement.uuid,
            key: 'rotate',
            value: rotate,
          })
      })
      .on('resizeStart', (args) => {
        if (this.dActiveElement.type === 'w-text') {
          moveable.keepRatio = false
          if (String(args.direction) === '1,1') {
            resizeStartWidth = args.target.offsetWidth
            this.startHL = Number(args.target!.style.lineHeight.replace('px', ''))
            this.startLS = Number(args.target!.style.letterSpacing.replace('px', ''))
            this.resetRatio = 1
          }
        } else if (this.dActiveElement.type === 'w-image') {
          const dirs = ['1,0', '0,-1', '-1,0', '0,1']
          dirs.includes(String(args.direction)) && (moveable.keepRatio = false)
        }
      })
      .on('resize', ({ target, width, height, dist, delta, clientX, clientY, direction }: any) => {
        if (this.dActiveElement.type === 'w-text') {
          if (String(direction) === '1,1') {
            this.resetRatio = width / resizeStartWidth
            target!.style.fontSize = this.dActiveElement.fontSize * this.resetRatio + 'px'
            target!.style.letterSpacing = this.startLS * this.resetRatio + 'px'
            target!.style.lineHeight = this.startHL * this.resetRatio + 'px'
          }
          target.style.width = width
          target.style.height = height
          this.resizeTempData = { width, height }
          // moveable.updateRect()
          // moveable.keepRatio !== this.resetRatio > 1 && (moveable.keepRatio = this.resetRatio > 1)
        } else if (this.dActiveElement.type == 'w-image') {
          this.resizeTempData = { width, height }
        } else if (this.dActiveElement.type == 'w-group') {
          // let record = this.dActiveElement.record
          // this.dActiveElement.tempScale = width / record.width
          this.$store.commit('resize', { width: width, height: height })
          // this.resizeTempData = { width, height }
          // let record = this.dActiveElement.record
          // setTransformAttribute(target, 'scale', width / record.width)
        } else {
          this.$store.commit('resize', { width: width, height: height })
        }
        this.dActiveElement.rotate && (target!.style.transform = target!.style.transform.replace('0deg', this.dActiveElement.rotate))
      })
      .on('resizeEnd', (e: any) => {
        if (e.lastEvent) {
          setTimeout(() => {
            // 重置translate
            const tf = e.target.style.transform
            const iof = tf.indexOf('translate')
            const FRONT = tf.slice(0, iof + 'translate'.length + 1)
            const half = tf.substring(iof + 'translate'.length + 1)
            const END = half.substring(half.indexOf(')'))
            e.target.style.transform = FRONT + '0, 0' + END
            // 转换成位置
            const left = e.lastEvent.drag.translate[0]
            const top = e.lastEvent.drag.translate[1]
            // this.updateWidgetData({
            //   uuid: this.dActiveElement.uuid,
            //   key: 'left',
            //   value: Number(this.dActiveElement.left) + left,
            // })
            // this.updateWidgetData({
            //   uuid: this.dActiveElement.uuid,
            //   key: 'top',
            //   value: Number(this.dActiveElement.top) + top,
            // })
            this.updateWidgetMultiple({
              uuid: this.dActiveElement.uuid,
              data: [
                {
                  key: 'left',
                  value: Number(this.dActiveElement.left) + left,
                },
                {
                  key: 'top',
                  value: Number(this.dActiveElement.top) + top,
                },
              ],
            })
            this.moveable.updateRect()
          }, 300)
        }
        if (this.resizeTempData) {
          this.$store.commit('resize', this.resizeTempData)
          this.resizeTempData = null
          this.moveable.updateRect()
        }
        if (this.dActiveElement.type === 'w-text') {
          const d = e.direction || e.lastEvent.direction
          String(d) === '1,1' && (this.dActiveElement.fontSize = this.dActiveElement.fontSize * this.resetRatio)
        }
        moveable.keepRatio = true
      })
      .on('resizeGroupStart', ({ events }: any) => {
        console.log(events)
        // events.forEach((ev, i) => {
        //     const frame = this.frames[i];
        //     // Set origin if transform-origin use %.
        //     ev.setOrigin(["%", "%"]);

        //     // If cssSize and offsetSize are different, set cssSize.
        //     const style = window.getComputedStyle(ev.target);
        //     const cssWidth = parseFloat(style.width);
        //     const cssHeight = parseFloat(style.height);
        //     ev.set([cssWidth, cssHeight]);

        //     // If a drag event has already occurred, there is no dragStart.
        //     ev.dragStart && ev.dragStart.set(frame.translate);
        // });
      })
      .on('resizeGroup', (e: any) => {
        // events.forEach(({ target, width, height, drag }, i) => {
        //     const frame = this.frames[i];
        //     target.style.width = `${width}px`;
        //     target.style.height = `${height}px`;
        //     // get drag event
        //     frame.translate = drag.beforeTranslate;
        //     target.style.transform
        //         = `translate(${drag.beforeTranslate[0]}px, ${drag.beforeTranslate[1]}px)`;
        // });
      })
      .on('resizeGroupEnd', ({ targets, isDrag }: any) => {
        console.log('onResizeGroupEnd', targets, isDrag)
      })
    // .on('clip', (e: any) => {
    //   if (e.clipType === 'rect') {
    //     e.target.style.clip = e.clipStyle
    //   } else {
    //     e.target.style.clipPath = e.clipStyle
    //   }
    // })

    // -- 选择功能 Start --
    const selecto = new Selecto({
      container: document.getElementById('page-design'),
      selectableTargets: ['.layer'],
      selectByClick: false,
      // 是否从内部目标中选择(default: true)
      selectFromInside: false,
      // 选择后，是否与所选目标一起选择下一个目标
      continueSelect: false,
      // Determines which key to continue selecting the next target via keydown and keyup.
      toggleContinueSelect: 'shift',
      // The container for keydown and keyup events
      keyContainer: document.getElementById('page-design'),
      // 目标与要选择的拖动区域重叠的速率。(默认:100)
      hitRate: 5,
      getElementRect: getElementInfo,
    })
    selecto.on('select', (e) => {
      e.added.forEach((el) => {
        el.classList.add('widget-selected')
        this.selectWidgetsInOut({
          uuid: el.getAttribute('data-uuid'),
        })
      })
      e.removed.forEach((el) => {
        el.classList.remove('widget-selected')
        this.selectWidgetsInOut({
          uuid: el.getAttribute('data-uuid'),
        })
      })
      this.moveable.renderDirections = [] // ['nw', 'ne', 'sw', 'se'] // []
      this.moveable.rotatable = false
      this.moveable.target = [].slice.call(document.querySelectorAll('.widget-selected'))
    })
    // -- 选择功能 END --
  },
  async created() {
    await nextTick()
    const Ele = document.getElementById('page-design')
    // 后续可能加个节流 TODO
    Ele?.addEventListener('scroll', () => {
      this.moveable.updateRect()
    })
  },
  methods: {
    ...mapActions(['updateWidgetData', 'updateWidgetMultiple', 'selectWidgetsInOut']),
    // switchClip() {
    //   this.moveable.clippable = !this.moveable.clippable
    // },
  },
})
</script>

<style lang="less" scoped>
.remove {
  position: fixed;
  left: -9999px;
  top: -9999px;
}
</style>

<style lang="less">
// 2层 .zk-moveable-style 增加css权重层级，避免太多 important
.zk-moveable-style.zk-moveable-style {
  --moveable-color: #6ccfff;

  // 缩放圆点
  .moveable-control {
    background: #fff;
    box-sizing: border-box;
    display: block;
    border: 1px solid #c0c5cf;
    box-shadow: 0 0 2px 0 rgb(86, 90, 98, 0.2);
    width: 12px;
    height: 12px;
    margin-top: -6px;
    margin-left: -6px;

    // &.moveable-n,
    // &.moveable-s,
    // &.moveable-e,
    // &.moveable-w {
    //   display: none;
    // }

    // 上下缩放点
    &.moveable-n,
    &.moveable-s {
      width: 16px;
      height: 8px;
      margin-top: -4px;
      margin-left: -8px;
      border-radius: 6px;
    }
    // 左右缩放点
    &.moveable-e,
    &.moveable-w {
      width: 8px;
      height: 16px;
      margin-left: -4px;
      margin-top: -8px;
      border-radius: 6px;
    }
  }

  // 旋转按钮
  .moveable-rotation {
    height: 35px;
    display: block;
    .moveable-rotation-control {
      border: none;
      background-image: url('./rotation-icon.svg');
      width: 24px;
      height: 24px;
      background-size: 100% 100%;
      display: block;
      margin-left: -11px;
      // margin-top: -11px;
    }

    // 旋转的操作条
    .moveable-rotation-line {
      display: none;
    }
  }
}
</style>