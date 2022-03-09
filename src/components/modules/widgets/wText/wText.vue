<template>
  <div
    :id="params.uuid"
    ref="widget"
    v-loading="loading"
    :class="['w-text', { editing: editable, 'layer-lock': params.lock }, params.uuid]"
    :style="{
      position: 'absolute',
      left: params.left - parent.left + 'px',
      top: params.top - parent.top + 'px',
      width: Math.max(params.fontSize, params.width) + 'px',
      minWidth: params.fontSize + 'px',
      minHeight: params.fontSize * params.lineHeight + 'px',
      lineHeight: params.fontSize * params.lineHeight + 'px',
      letterSpacing: (params.fontSize * params.letterSpacing) / 100 + 'px',
      fontSize: params.fontSize + 'px',
      color: params.color,
      textAlign: params.textAlign,
      fontWeight: params.fontWeight,
      fontStyle: params.fontStyle,
      textDecoration: params.textDecoration,
      opacity: params.opacity,
      backgroundColor: params.backgroundColor,
      writingMode: params.writingMode,
    }"
    @dblclick="(e) => dblclickText(e)"
  >
    <template v-if="params.isEffect && !editable">
      <component :is="params.isEffect" :params="params" />
    </template>
    <!-- plaintext-only -->
    <div v-else ref="editWrap" :style="{ fontFamily: `'${params.fontClass.value}'` }" class="edit-text" spellcheck="false" :contenteditable="editable ? 'plaintext-only' : false" @input="writingText($event)" @blur="writeDone($event)" v-html="params.text"></div>
  </div>
</template>

<script>
// 文本组件
const NAME = 'w-text'

import { mapGetters, mapActions } from 'vuex'
import effect from './specialText/effect.vue'
import api from '@/api'

export default {
  name: NAME,
  components: { effect },
  setting: {
    name: '文本',
    type: NAME,
    uuid: -1,
    editable: false,
    left: 0,
    top: 0,
    transform: '',
    lineHeight: 1.5,
    letterSpacing: 0,
    fontSize: 24,
    zoom: 1,
    fontClass: { alias: '思源黑体 常规' },
    fontFamily: 'SourceHanSansSC-Regular',
    fontWeight: 'normal',
    fontStyle: 'normal',
    writingMode: 'horizontal-tb',
    textDecoration: 'none',
    color: 'rgba(0, 0, 0, 1)',
    textAlign: 'left',
    text: '',
    opacity: 1,
    backgroundColor: '',
    parent: '-1',
    record: {
      width: 0,
      height: 0,
      minWidth: 0,
      minHeight: 0,
      dir: 'horizontal',
    },
  },
  props: ['params', 'parent'],
  data() {
    return {
      loading: false,
      editable: false,
      loadFontDone: false,
    }
  },
  computed: {
    ...mapGetters(['dActiveElement']),
    isDraw() {
      return this.$route.name === 'Draw'
    },
  },
  watch: {
    params: {
      async handler(nval) {
        this.updateText()
        if (this.loading) {
          return
        }
        let font = nval.fontClass
        const isDone = font.value === this.loadFontDone
        if (!font.url && nval.fontFamily) {
          this.loading = true
          let localFonts = localStorage.getItem('FONTS') ? JSON.parse(localStorage.getItem('FONTS') || '') : []
          let gdFont = localFonts.find((font) => font.name === nval.fontFamily)
          if (!gdFont) {
            const searchFallback = await api.gaoding.searchFonts(nval.fontFamily)
            for (let i = 0; i < searchFallback.length; i++) {
              const { dest } = searchFallback[i]
              gdFont = localFonts.find((font) => font.name === dest)
              if (gdFont) {
                break
              }
            }
          }
          if (gdFont) {
            font.id = gdFont.id
            font.value = gdFont.name
            font.url = gdFont.url
            font.alias = gdFont.alias
          }
          delete nval.fontFamily
        }

        if (font.url && !isDone) {
          if (font.id && this.isDraw) {
            this.loading = false
            return
          }
          this.loading = true
          const loadFont = new window.FontFace(font.value, `url(${font.url})`)
          await loadFont.load()
          document.fonts.add(loadFont)
          this.loadFontDone = font.value
          this.loading = false
        } else {
          this.loading = false
        }
      },
      immediate: true,
      deep: true,
    },
    editable(value) {
      this.updateWidgetData({
        uuid: this.params.uuid,
        key: 'editable',
        value,
      })
    },
  },
  updated() {
    this.updateRecord()
  },
  async mounted() {
    this.updateRecord()
    // await this.$nextTick()
    console.log(this.params.textEffects)
    if (this.params.textEffects && this.params.textEffects.length <= 2 && this.params.textEffects[0]) {
      const shadow = this.params.textEffects[0].shadow
      if (shadow) {
        this.$refs.widget.style.textShadow = `${shadow.offsetX}px ${shadow.offsetY}px ${shadow.blur}px ${shadow.color}`
      }
      const stroke = this.params.textEffects[0].stroke
      if (stroke) {
        this.$refs.widget.style.webkitTextStroke = `${stroke.width}px ${stroke.color}`
      }
      const grad = this.params.textEffects[0].filling?.gradient
      if (grad) {
        this.$refs.widget.style['-webkit-background-clip'] = 'text' // background-clip: text;
        this.$refs.widget.style['-webkit-text-fill-color'] = 'transparent' // -webkit-text-fill-color: transparent;
        // this.$refs.widget.style.backgroundImage = `linear-gradient(${grad.angle}deg, ${grad.stops[0].color} ${Number(grad.stops[0].offset) * 100}%, ${grad.stops[1].color} ${Number(grad.stops[1].offset) * 100}%)`
      }
    }

    this.params.transform && (this.$refs.widget.style.transform = this.params.transform)
    this.params.rotate && (this.$refs.widget.style.transform += `rotate(${this.params.rotate})`)
  },
  methods: {
    ...mapActions(['updateWidgetData']),
    updateRecord() {
      if (this.dActiveElement.uuid === this.params.uuid) {
        let record = this.dActiveElement.record
        record.width = this.$refs.widget.offsetWidth
        record.height = this.$refs.widget.offsetHeight
        record.minWidth = this.params.fontSize
        record.minHeight = this.params.fontSize * this.params.lineHeight
        this.writingText()
      }
    },
    updateText(e) {
      const value = e ? e.target.innerHTML : this.params.text.replace(/\n/g, '<br/>')
      // const value = (e ? e.target.innerText : this.params.text).replace(/<br\/>/g, '\r\n').replace(/&nbsp;/g, ' ')
      if (value !== this.params.text) {
        this.updateWidgetData({
          uuid: this.params.uuid,
          key: 'text',
          value,
        })
      }
    },
    writingText() {
      this.$store.commit('updateRect')
    },
    writeDone(e) {
      this.editable = false
      this.updateText(e)
    },
    dblclickText(e) {
      this.editable = true
      setTimeout(() => {
        this.$refs.editWrap.focus()
        if (document.selection) {
          const range = document.body.createTextRange()
          range.moveToElementText(this.$refs.editWrap)
          range.select()
        } else if (window.getSelection) {
          const range = document.createRange()
          range.selectNodeContents(this.$refs.editWrap)
          window.getSelection().removeAllRanges()
          window.getSelection().addRange(range)
        }
      }, 100)
    },
  },
}
</script>

<style lang="less" scoped>
.w-text {
  cursor: pointer;
  user-select: none;
}
.w-text.editing {
  cursor: text;
  user-select: text;
}
.edit-text {
  outline: none;
  word-break: break-word;
  // white-space: pre;
  margin: 0;
}

// @font-face {
//   font-family: 'FONT-AZPPT';
//   font-display: swap;
//   src: url('./AZPPT.ttf') format('truetype');
// }
// .FONT-AZPPT {
//   font-family: 'FONT-AZPPT';
// }
</style>
