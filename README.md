<!--
 * @Author: ShawnPhang
 * @LastEditors: ShawnPhang
 * @Description: README
 * @Date: 2021-07-13 02:48:38
 * @LastEditTime: 2022-02-20 19:24:38
 * @site: book.palxp.com / blog.palxp.com
-->

# 速图设计

开发中，微仿稿定设计

# Vue3 + vite + vuex + vue-router + axios + ElementPlus

整合 vite 按需引入 elementPlus，未整合 webpack，参考文档：[element-plus.org](https://element-plus.org/#/zh-CN/component/quickstart)

- 项目为 vue-cli 初始化，故可以使用 webpack 的功能，但推荐 vite 运行和打包（目前已无做兼容 webpack）

- 全局变量(src/config)目前没有兼容处理，只能手动切换 (已兼容)

- 项目整合装饰器混合开发模式，可以 class 形式开发页面和组件（移除）

- 已整合 Gzip 打包压缩

## 快速开始

```
本地开发：yarn dev
打包：yarn v-build-fast
发布：<git push>
```

## vite start

```
yarn dev
```

## vite build

```
yarn v-build-fast
yarn v-build
```

## Project setup

```
yarn
```

### Compiles and hot-reloads for development

```
yarn serve
```

### Compiles and minifies for production

```
yarn build
```

### Customize configuration

See [Configuration Reference](https://cli.vuejs.org/config/).
