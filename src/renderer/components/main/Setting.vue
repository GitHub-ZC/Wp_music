<template>
  <overlay-scrollbars ref="osComponentRef" id="slide">
    <h2>基本设置</h2>
    <h4>导航栏</h4>
    <el-switch
      style="display: block"
      v-model="value1"
      active-color="#13ce66"
      inactive-color="#ff4949"
      active-text="关闭导航栏"
      inactive-text="打开导航栏"
      @change="only"
    >
    </el-switch>
    <h4>音质选择</h4>
    <el-radio-group v-model="radio" @change="change_r">
      <el-radio :label="1">标准</el-radio>
      <el-radio :label="2">高品质</el-radio>
      <el-radio :label="3">无损</el-radio>
    </el-radio-group>
    <h2>使用说明</h2>
    <div>
      <h4>软件架构</h4>
      <p>使用 Electron + Node.js 构建</p>
      <h4>使用说明</h4>
      <p>右键菜单：歌曲列表中的每一首歌曲，鼠标右键可以打开右键菜单，右键菜单中的 _复制歌曲信息_ 当前版本无任何效果</p>
      <p>音质选择：只对企鹅平台音乐有效果，网易、咪咕默认都是普通音质</p>
      <p>播放下载：播放或者下载音乐时，无音乐源会在窗口顶部有警告提示</p>
      <p>播放顺序：默认为列表播放，当前版本未添加其他播放方式，如果想要单曲循环，可以让播放列表只有一首歌曲</p>
      <p>下载地址：会自动在桌面生成Wp_music文件夹，默认歌曲都在其中，企鹅可以下载无损、高标准，网易、咪咕仅普通</p>
    </div>
  </overlay-scrollbars>
</template>

<script>
export default {
  name: 'electron-music-setting',
  data () {
    return {
      value1: this.$store.state.Counter.isCollapse,
      radio: this.$store.state.Counter.br
    }
  },
  methods: {
    /* 设置，改变音乐源的音质 */
    change_r (index) {
      this.$store.commit('set_br', parseInt(this.radio))
      localStorage.setItem('br', JSON.stringify(parseInt(this.radio)))
    },
    only (flag) {
      this.$store.commit('set_isCollapse', flag)
      localStorage.setItem('isCollapse', JSON.stringify(flag))
    }
  }
}
</script>
<style scoped>
#slide {
  height: 100%;
}
</style>