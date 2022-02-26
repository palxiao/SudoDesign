import Vue, { VNode } from 'vue'

declare global {
  namespace Type {
    export interface Object {
      [propName: string]: any
    }
  }
  namespace Ajax {
    // reqposne interface
    export interface GqlResult {
      [field: string]: any
    }

    // axios return data
    export interface Gql {
      [field: string]: GqlResult
    }

    export interface Result {
      [field: string]: any
    }
  }
}

declare module '*.vue' {
  export default Vue
}

declare module '~data'
declare module 'qrcode'
declare module '@antv/f2/*'
declare module 'dayjs'
declare module 'fontfaceobserver'

declare module 'vue/types/vue' {
  interface Vue {
    $utils: Type.Object
    $nextTick: any
  }
}
