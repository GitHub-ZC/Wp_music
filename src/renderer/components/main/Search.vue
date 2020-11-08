<template>
  <div ref="ll">
    <el-tabs v-model="activeName" @tab-click="handleClick">
      <el-tab-pane label="企鹅" name="1">
        <MusicList :songlist="$store.state.Counter.QQ_songlist" type="search"></MusicList>
      </el-tab-pane>
      <el-tab-pane label="网易云" name="2">
        <MusicList :songlist="$store.state.Counter.WY_songlist" type="search"></MusicList>
      </el-tab-pane>
      <el-tab-pane label="咪咕" name="3">
        <MusicList :songlist="$store.state.Counter.MG_songlist" type="search"></MusicList>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
<script>
import MusicList from '@/components/public/MusicList'
export default {
  name: 'electron-music-search',
  data () {
    return {
      activeName: '1'
    }
  },
  methods: {
    handleClick (tab, event) {
      console.log(tab, event)
      this.$store.commit('set_search_tab', parseInt(tab.name))
      if (this.$store.state.Counter.search_pack.trim() !== '') {
        if (tab.name === '1') {
          this.$store.dispatch('QQ_search', this.$store.state.Counter.search_pack)
        } else if (tab.name === '2') {
          this.$store.dispatch('WY_search', this.$store.state.Counter.search_pack)
        } else {
          this.$store.dispatch('MG_search', this.$store.state.Counter.search_pack)
        }
      }
    }
  },
  components: {
    MusicList: MusicList
  },
  mounted: function () {
    // let ll = this.$refs.ll
    // console.log(ll)
    // ll.style.height = parseInt(getComputedStyle(document.getElementsByClassName('el-main')[0])['height']) - parseInt(getComputedStyle(document.getElementsByClassName('el-tabs__header')[0])['height']) + 'px'
  },
  destroyed () {
    this.$store.commit('clear_QQ_Songlist')
    this.$store.commit('clear_WY_Songlist')
    this.$store.commit('clear_MG_Songlist')
  }
}
</script>

<style scoped>

</style>