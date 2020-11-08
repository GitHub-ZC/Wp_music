<template>
  <div>
    <div class="nav_head">
      <img src="https://docsify.js.org/_media/icon.svg" data-origin="https://docsify.js.org/_media/icon.svg">
      <span v-if="!$store.state.Counter.isCollapse" style="font-size: 18px;">Wp_music</span>
    </div>
    <el-menu
      :default-active="$route.path"
      :router="true"
      class="el-menu-vertical-demo"
      :collapse="$store.state.Counter.isCollapse"
      background-color="#f6f6f6"
      active-text-color="#1ECE9B"
    >
      <el-menu-item index="/search">
        <i class="el-icon-location"></i>
        <span slot="title">发现音乐</span>
      </el-menu-item>
      <el-menu-item index="/top">
        <i class="el-icon-menu"></i>
        <span slot="title">排行榜</span>
      </el-menu-item>
      <el-menu-item index="/songlist">
        <i class="el-icon-document"></i>
        <span slot="title">我的歌单</span>
      </el-menu-item>
      <el-menu-item index="/setting">
        <i class="el-icon-setting"></i>
        <span slot="title">设置</span>
      </el-menu-item>
    </el-menu>
  </div>
</template>

<style>
.el-menu-vertical-demo:not(.el-menu--collapse) {
  width: 200px;
  min-height: 400px;
}

.nav_head {
  height: 60px;
  text-align: center;
  -webkit-app-region: drag;
}
.nav_head img {
  height: 35px;
  width: 35px;
  position: relative;
  top: 10px;
}
</style>

<script>
export default {
  name: 'electron-music-navmenu',
  data () {
    return {
      isCollapse: false
    }
  },
  methods: {
  },
  mounted () {
  },
  beforeMount () {
    /* 初始判断localstore是否存储数据、不存在则创建数据缓存 */
    /* 判断nav的收缩 */
    if (!localStorage.getItem('isCollapse')) {
      this.$store.commit('set_isCollapse', true)
      localStorage.setItem('isCollapse', JSON.stringify(true))
    } else {
      let flag = localStorage.getItem('isCollapse')
      this.$store.commit('set_isCollapse', JSON.parse(flag))
    }
    if (!localStorage.getItem('br')) {
      this.$store.commit('set_br', 3)
      localStorage.setItem('br', JSON.stringify(3))
    } else {
      let flag = localStorage.getItem('br')
      this.$store.commit('set_br', JSON.parse(flag))
    }
    /* 初始判断localstore是否存储数据、不存在则创建数据缓存 */
    /* 初始化歌单数据 */
    if (!localStorage.getItem('editableTabs')) {
      let tabIndex = 2
      let editableTabs = [{
        title: '我的收藏',
        name: '1',
        closable: false
      }, {
        title: '试听列表',
        name: '2',
        closable: false
      }]
      localStorage.setItem('editableTabs', JSON.stringify(editableTabs))
      localStorage.setItem('tabIndex', JSON.stringify(tabIndex))
      for (let tab of editableTabs) {
        localStorage.setItem(tab.name, JSON.stringify([]))
      }
    } else {
      this.editableTabs = JSON.parse(localStorage.getItem('editableTabs'))
      this.tabIndex = JSON.parse(localStorage.getItem('tabIndex'))
    }
  }
}
</script>