<template>
  <div ref="ll">
    <el-dropdown trigger="click" id="topList" @command="handleCommand">
      <span class="el-dropdown-link">
        {{ topinfo }}<i class="el-icon-arrow-down el-icon--right"></i>
      </span>
      <el-dropdown-menu slot="dropdown">
        <el-dropdown-item v-for="top in topList" :key="top.id" :command="top">
          {{ top.name }}
        </el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>
    <el-tabs v-model="activeName" @tab-click="handleClick">
      <el-tab-pane label="企鹅" name="1">
        <MusicList :songlist="$store.state.Counter.QQ_Top_songlist" type="top"></MusicList>
      </el-tab-pane>
      <el-tab-pane label="网易云" name="2">
        <MusicList :songlist="$store.state.Counter.WY_Top_songlist" type="top"></MusicList>
      </el-tab-pane>
      <el-tab-pane label="咪咕" name="3">
        <MusicList :songlist="$store.state.Counter.MG_Top_songlist" type="top"></MusicList>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
<script>
import axios from 'axios'
import MusicList from '@/components/public/MusicList'
export default {
  name: 'electron-music-top',
  data () {
    return {
      activeName: '1',
      topList: [], /* 排行榜种类 */
      QQ_topList: [],
      WY_topList: [],
      MG_topList: [],
      topinfo: '热歌榜',
      QQ_topId: {id: 26, name: '热歌榜'},
      WY_topId: {id: 3778678, name: '云音乐热歌榜'},
      MG_topId: {id: 2, name: '尖叫热歌榜'}
    }
  },
  methods: {
    handleCommand (command) {
      console.log(command)
      if (this.$store.state.Counter.top_tab === 1) { /* 根据TOP的位数显示排行榜 */
        this.$store.dispatch('QQ_top', command.id)
        this.topinfo = command.name
        this.QQ_topId = {id: command.id, name: command.name}
      } else if (this.$store.state.Counter.top_tab === 2) {
        this.$store.dispatch('WY_top', command.id)
        this.topinfo = command.name
        this.WY_topId = {id: command.id, name: command.name}
      } else {
        this.$store.dispatch('MG_top', command.id)
        this.topinfo = command.name
        this.MG_topId = {id: command.id, name: command.name}
      }
    },
    handleClick (tab, event) {
      this.$store.commit('set_top_tab', parseInt(tab.name)) /* 提交TOP的tab位 */
      if (tab.name === '1') { /* 根据TOP的位数显示排行榜 */
        // this.$store.dispatch('QQ_top', 26)
        this.topList = this.QQ_topList
        this.handleCommand(this.QQ_topId)
      } else if (tab.name === '2') {
        // this.$store.dispatch('WY_top', 3779629)
        this.topList = this.WY_topList
        this.handleCommand(this.WY_topId)
      } else {
        // this.$store.dispatch('MG_top', 2)
        this.topList = this.MG_TOPList
        this.handleCommand(this.MG_topId)
      }
      console.log(tab, event)
    }
  },
  components: {
    MusicList: MusicList
  },
  mounted: function () {
    axios.get('http://iecoxe.top:3500/qq/top/category/').then(res => {
      let tops = res.data.topList.data.group
      for (let top of tops) {
        for (let _top of top.toplist) {
          this.QQ_topList.push({id: _top.topId, name: _top.title})
        }
      }
    })
    axios.get('http://iecoxe.top:3000/toplist').then(res => {
      let tops = res.data.list
      for (let top of tops) {
        this.WY_topList.push({id: top.id, name: top.name})
      }
    })
    this.MG_TOPList = [
      {id: 1, name: '尖叫新歌榜'}, {id: 2, name: '尖叫热歌榜'}, {id: 3, name: '尖叫原创榜'}, {id: 4, name: '音乐榜'}, {id: 5, name: '影视榜'}, {id: 6, name: '内地榜'},
      {id: 7, name: '港台榜'}, {id: 8, name: '欧美榜'}, {id: 9, name: '日韩榜'}, {id: 10, name: '彩铃榜'}, {id: 11, name: 'KTV榜'}, {id: 12, name: '网络榜'}, {id: 13, name: '新专辑榜'}
    ]

    this.handleClick({name: '1'})
  },
  destroyed () {
    this.$store.commit('clear_QQ_Top_songlist')
    this.$store.commit('clear_WY_Top_songlist')
    this.$store.commit('clear_MG_Top_songlist')
  }
}
</script>

<style scoped>
#topList {
  position: absolute;
  right: 10px;
  top: 90px;
  z-index: 1000;
  opacity: 0.9;
}
#topList:hover {
  opacity: 1;
  color: #1ECE9B;
}
.el-dropdown-menu {
  height: 400px;
  overflow-y: auto;
}
</style>