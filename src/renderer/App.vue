<template>
  <div id="app">
    <el-container>
      <el-aside style="width:none">
        <NavMenu></NavMenu>
      </el-aside>
      <el-container>
        <el-header>
          <Head></Head>
        </el-header>
        <el-main ref="el_main" style="padding-right: 0;">
          <router-view></router-view>
        </el-main>
        <el-footer>
          <Footer></Footer>
        </el-footer>
      </el-container>
    </el-container>
  </div>
</template>

<script>
import NavMenu from '@/components/aside/NavMenu'
import Head from '@/components/head/Head'
import Search from '@/components/main/Search'
import Footer from '@/components/footer/Footer'

export default {
  name: 'electron-music',
  components: {
    NavMenu,
    Head,
    Search,
    Footer
  },
  mounted () {
    // console.log(this.$refs.el_main.$el.offsetHeight)
    // this.$store.commit('set_audio', this.$refs.footer)
  }
}
</script>

<style>
/* CSS */
html,
body {
  margin: 0;
  padding: 0;
  height: 100%;
  -webkit-user-select: none;
}
/* 去除聚焦 */
:focus {
  outline: 0;
}
*{font-family:  'Microsoft YaHei', SimSun, Microsoft YaHei; cursor: default;}

#app {
  height: 100%;
}

.el-footer {
  background-color: #FAFAFA;
  color: #333;
}
.el-header {
  -webkit-app-region: drag;
  background-color: #FAFAFA;
  color: #333;
}

.el-aside {
  background-color: #f6f6f6;
  color: #333;
}

.el-main {
  background-color: #FAFAFA;
  color: #333;
}

.el-container {
  height: 100%;
}
</style>
