<template>
  <overlay-scrollbars ref="osComponentRef" :options="options" v-loading="$store.state.Counter.loading">
    <transition-group name="list" tag="ul" ref="uuu">
      <li id="first" key="only">
        <i class="song-index">#</i>
        <span class="song-name">歌曲名</span>
        <span class="song-art">歌手</span>
        <span class="song-album">专辑</span>
        <span class="song-make">操作</span>
        <span class="song-dt">时长</span>
      </li>
      <li v-for="(song, index) in songlist" :key="song.id" :songData="JSON.stringify(song)" v-contextmenu:contextmenu>
        <i class="song-index">{{ index + 1 }}</i>
        <span class="song-name" :title="song.name">{{ song.name }}</span>
        <span class="song-art" :title="song.art">{{ song.art }}</span>
        <span class="song-album" :title="song.album">{{ song.album }}</span>
        <span class="song-make">
          <i class="el-icon-headset" @dblclick.stop="" title="聆听"></i>
          <!-- <el-dropdown @command="handleCommand_playlist" placement="top">
            <span class="el-dropdown-link">
              <i class="el-icon-circle-plus-outline"></i>
            </span>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item command="a">128</el-dropdown-item>
              <el-dropdown-item command="b">320</el-dropdown-item>
              <el-dropdown-item command="c" disabled>flac</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
          <el-dropdown @command="handleCommand_download" placement="top">
            <span class="el-dropdown-link">
              <i class="el-icon-download"></i>
            </span>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item command="a">128</el-dropdown-item>
              <el-dropdown-item command="b">320</el-dropdown-item>
              <el-dropdown-item command="c" disabled>flac</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown> -->
          <i class="el-icon-circle-close" v-if="type==='list'" title="从列表中删除"></i>
        </span>
        <span class="song-dt" :title="song.dt">{{ song.dt }}</span>
      </li>
    </transition-group>
    <VContextmenu ref="contextmenu">
      <VContextmenuItem @click="a">播放</VContextmenuItem>
      <VContextmenuItem @click="b">下一首播放</VContextmenuItem>
      <VContextmenuItem divider></VContextmenuItem>
      <VContextmenuSubmenu title="添加到">
        <VContextmenuItem @click="addSongList('recentSong')">播放队列</VContextmenuItem>
        <VContextmenuItem divider></VContextmenuItem>
        <VContextmenuItem @click="addSongList('1')">我喜欢</VContextmenuItem>
        <VContextmenuItem @click="addSongList('2')">试听列表</VContextmenuItem>
        <VContextmenuItem divider></VContextmenuItem>
        <VContextmenuItem v-for="list in getAllList()" :key="list.name" @click="addSongList(list.name)">{{ list.title }}</VContextmenuItem>
      </VContextmenuSubmenu>
      <VContextmenuSubmenu title="下载">
        <VContextmenuItem @click="download('128')">标准</VContextmenuItem>
        <VContextmenuItem @click="download('320')">高品质</VContextmenuItem>
        <VContextmenuItem @click="download('flac')">无损</VContextmenuItem>
      </VContextmenuSubmenu>
      <VContextmenuItem divider></VContextmenuItem>
      <VContextmenuItem>复制歌曲信息</VContextmenuItem>
    </VContextmenu>
  </overlay-scrollbars>
</template>

<script>
import axios from 'axios'
// import fs from 'fs'
// import path from 'path'
import { ipcRenderer } from 'electron'

export default {
  name: 'electron-music-musiclist',
  props: ['songlist', 'type'],
  data () {
    return {
      options: {},
      contextmenu_song: null/* 用于记录每一个歌曲信息，以方便右键菜单时获取songData */
    }
  },
  methods: {
    /* 右键菜单播放按钮 */
    a (vm, event) {
      this.db_play_song(this.contextmenu_song)
    },
    /* 右键菜单下一首 */
    b (vm, event) {
      let songData = JSON.parse(localStorage.getItem('recentSong'))

      /* 初始播放器没有歌曲的情况 */
      if (this.$store.state.Counter.songInfo.id === '') {
        this.db_play_song(this.contextmenu_song)
        return
      }
      /* 移出已经存在的歌曲 */
      for (let i in songData) {
        if (this.contextmenu_song.id === songData[i].id && this.contextmenu_song.source === songData[i].source) {
          songData.splice(i, 1)
        }
      }
      /* 插入歌曲，这里就不判断音乐源的问题了，比较懒 */
      for (let element in songData) {
        if (songData[element].id === this.$store.state.Counter.songInfo.id) {
          if (parseInt(element) + 1 > songData.length - 1) {
            songData.splice(0, 0, this.contextmenu_song)
          } else {
            songData.splice(parseInt(element) + 1, 0, this.contextmenu_song)
          }
          localStorage.setItem('recentSong', JSON.stringify(songData))
          return
        }
      }
    },
    /* 用于每一种歌单添加歌曲 */
    addSongList (e) {
      let songArr = JSON.parse(localStorage.getItem(e))

      let flag = true
      for (let i of songArr) { /* 通过flag判断，防止重复添加相同歌曲 */
        if (i.source === this.contextmenu_song.source && i.id === this.contextmenu_song.id) {
          flag = false
        }
      }
      if (flag) { /* 无重复 flag为true */
        songArr.push(this.contextmenu_song)
        localStorage.setItem(e, JSON.stringify(songArr))
      }
    },
    /* 右键菜单下载的按钮 */
    download (e) {
      // let desktop = path.join(require('os').homedir(), 'Desktop/Wp_music')
      if (this.contextmenu_song.source === '企鹅') {
        let that = this
        axios.get(`http://iecoxe.top:3500/qq/song/url/?mid=${this.contextmenu_song.id}&br=${e}`).then(res => {
          let url = res.data.data.url[that.contextmenu_song.id.toString()]
          if (url === undefined) {
            that.$message({
              message: that.contextmenu_song.name + ': 无音乐源,请尝试其他音质',
              type: 'warning'
            })
          } else {
            ipcRenderer.send('downloadSong', e, that.contextmenu_song, url.toString())
          }
        })
      } else if (this.contextmenu_song.source === '网易') {
        let that = this
        axios.get(`http://iecoxe.top:3000/song/url?id=${this.contextmenu_song.id}`).then(res => {
          let url = res.data.data[0].url
          if (url === undefined) {
            that.$message({
              message: that.contextmenu_song.name + ': 无音乐源,请尝试其他音质',
              type: 'warning'
            })
          } else {
            ipcRenderer.send('downloadSong', e, that.contextmenu_song, url.toString())
          }
        })
      } else {
        let that = this
        axios.get(`http://iecoxe.top:3500/migu/song/url/?id=${this.contextmenu_song.id}`).then(res => {
          let url = res.data.data.listenUrl
          if (url === undefined) {
            that.$message({
              message: that.contextmenu_song.name + ': 无音乐源,请尝试其他音质',
              type: 'warning'
            })
          } else {
            ipcRenderer.send('downloadSong', e, that.contextmenu_song, url.toString())
          }
        })
      }
    },
    /* 右键菜单，用于显示循环的歌单列表 */
    getAllList () {
      return JSON.parse(localStorage.getItem('editableTabs')).filter(x => {
        if (x.name === '1') return false
        if (x.name === '2') return false
        return true
      })
    },
    allTarget_dbclick (event) {
      /* 通过事件监听器 判断 是不是LI标签 播放音乐 */
      if (event.target.parentElement.nodeName === 'LI' && event.target.parentElement.getAttribute('id') === null) {
        let songDate = JSON.parse(event.target.parentElement.getAttribute('songData'))
        this.db_play_song(songDate)
      }
      // console.log(event.target.parentElement.getAttribute('id'))
    },
    /* 统一处理所有的点击li标签事件 */
    allTarget_click (event) {
      if (event.target.getAttribute('class') === 'el-icon-headset') { /* 播放按钮 */
        let songDate = JSON.parse(event.target.parentElement.parentElement.getAttribute('songData'))
        this.db_play_song(songDate)
      } else if (event.target.getAttribute('class') === 'el-icon-circle-close') { /* 从歌单删除歌曲 按钮 */
        let song = JSON.parse(localStorage.getItem(this.$store.state.Counter.songlistTab))
        let songDate = JSON.parse(event.target.parentElement.parentElement.getAttribute('songData'))

        song = song.filter(x => !(x.id === songDate.id && x.source === songDate.source))

        localStorage.setItem(this.$store.state.Counter.songlistTab, JSON.stringify(song))
        this.$emit('keys')
      }
    },
    /* 播放歌曲函数 */
    db_play_song (song) {
      let songType = {
        '1': '128',
        '2': '320',
        '3': 'flac'
      }
      let that = this

      if (this.type === 'search') { /* 判断是否为第一路由 */
        if (this.$store.state.Counter.search_tab === 1) {
          axios.get(`http://iecoxe.top:3500/qq/song/url/?mid=${song.id}&br=${songType[this.$store.state.Counter.br]}`).then(res => { /* QQ音乐 url 获取 */
            let url = res.data.data.url[song.id.toString()]
            if (url === undefined) {
              that.$message({
                message: song.name + ': 无音乐源,请尝试其他音质',
                type: 'warning'
              })
            } else {
              this.set_audio(url, song)
            }
          })
          axios.get(`http://iecoxe.top:3500/qq/lyric/?mid=${song.id}`).then(res => { /* QQ音乐歌词 获取 */
            let arr = res.data.lyric.toString().split('\n')
            arr = arr.filter((element, index, self) => {
              if (index > 4 && element.replace(/\[.*?\]/g, '').trim() !== '') {
                return true
              } else {
                return false
              }
            })
            let arrDt = arr.map(x => x.substring(1, 6))
            arr = arr.map(x => x.replace(/\[.*?\]/g, ''))
            this.$store.commit('set_lyric', arr)
            this.$store.commit('set_lyricDt', arrDt)
          })
        } else if (this.$store.state.Counter.search_tab === 2) {
          axios.get(`http://iecoxe.top:3000/song/url?id=${song.id}`).then(res => { /* 网易音乐 url 获取 */
            let url = res.data.data[0].url
            if (url === undefined) {
              that.$message({
                message: song.name + ': 无音乐源,请尝试其他音质',
                type: 'warning'
              })
            } else {
              this.set_audio(url, song)
            }
          })
          axios.get(`http://iecoxe.top:3000/lyric?id=${song.id}`).then(res => { /* 网易音乐歌词 获取 */
            let arr = res.data.lrc.lyric.split('\n')
            arr = arr.filter((element, index, self) => {
              if (element.replace(/\[.*?\]/g, '').trim() !== '') {
                return true
              } else {
                return false
              }
            })
            let arrDt = arr.map(x => x.substring(1, 6))
            arr = arr.map(x => x.replace(/\[.*?\]/g, ''))
            this.$store.commit('set_lyric', arr)
            this.$store.commit('set_lyricDt', arrDt)
          })
        } else {
          axios.get(`http://iecoxe.top:3500/migu/song/url/?id=${song.id}`).then(res => { /* 咪咕音乐 url 获取 */
            let url = res.data.data.listenUrl
            if (url === undefined) {
              that.$message({
                message: song.name + ': 无音乐源,请尝试其他音质',
                type: 'warning'
              })
            } else {
              this.set_audio(url, song)
            }
          })
          axios.get(`http://iecoxe.top:3500/migu/lyric/?id=${song.id}`).then(res => { /* 咪咕音乐歌词 获取 */
            let arr = res.data.lyric.split('\r\n')
            arr = arr.filter((element, index, self) => {
              if (index > 4 && element.replace(/\[.*?\]/g, '').trim() !== '') {
                return true
              } else {
                return false
              }
            })
            let arrDt = arr.map(x => x.substring(1, 6))
            arr = arr.map(x => x.replace(/\[.*?\]/g, ''))
            this.$store.commit('set_lyric', arr)
            this.$store.commit('set_lyricDt', arrDt)
          })
        }
      }

      if (this.type === 'top') { /* 判断路由是否为第二路由 */
        if (this.$store.state.Counter.top_tab === 1) {
          axios.get(`http://iecoxe.top:3500/qq/song/url/?mid=${song.id}&br=${songType[this.$store.state.Counter.br]}`).then(res => {
            let url = res.data.data.url[song.id.toString()]
            if (url === undefined) {
              that.$message({
                message: song.name + ': 无音乐源,请尝试其他音质',
                type: 'warning'
              })
            } else {
              this.set_audio(url, song)
            }
          })
          axios.get(`http://iecoxe.top:3500/qq/lyric/?mid=${song.id}`).then(res => { /* QQ音乐歌词获取 */
            let arr = res.data.lyric.toString().split('\n')
            arr = arr.filter((element, index, self) => {
              if (index > 4 && element.replace(/\[.*?\]/g, '').trim() !== '') {
                return true
              } else {
                return false
              }
            })
            let arrDt = arr.map(x => x.substring(1, 6))
            arr = arr.map(x => x.replace(/\[.*?\]/g, ''))
            this.$store.commit('set_lyric', arr)
            this.$store.commit('set_lyricDt', arrDt)
          })
        } else if (this.$store.state.Counter.top_tab === 2) {
          axios.get(`http://iecoxe.top:3000/song/url?id=${song.id}`).then(res => {
            let url = res.data.data[0].url
            if (url === undefined) {
              that.$message({
                message: song.name + ': 无音乐源,请尝试其他音质',
                type: 'warning'
              })
            } else {
              this.set_audio(url, song)
            }
          })
          axios.get(`http://iecoxe.top:3000/lyric?id=${song.id}`).then(res => { /* 网易音乐歌词 获取 */
            let arr = res.data.lrc.lyric.split('\n')
            arr = arr.filter((element, index, self) => {
              if (element.replace(/\[.*?\]/g, '').trim() !== '') {
                return true
              } else {
                return false
              }
            })
            let arrDt = arr.map(x => x.substring(1, 6))
            arr = arr.map(x => x.replace(/\[.*?\]/g, ''))
            this.$store.commit('set_lyric', arr)
            this.$store.commit('set_lyricDt', arrDt)
          })
        } else {
          axios.get(`http://iecoxe.top:3500/migu/song/url/?id=${song.id}`).then(res => {
            let url = res.data.data.listenUrl
            if (url === undefined) {
              that.$message({
                message: song.name + ': 无音乐源,请尝试其他音质',
                type: 'warning'
              })
            } else {
              this.set_audio(url, song)
            }
          })
          axios.get(`http://iecoxe.top:3500/migu/lyric/?id=${song.id}`).then(res => { /* 咪咕音乐歌词 获取 */
            let arr = res.data.lyric.split('\r\n')
            arr = arr.filter((element, index, self) => {
              if (element.replace(/\[.*?\]/g, '').trim() !== '') {
                return true
              } else {
                return false
              }
            })
            let arrDt = arr.map(x => x.substring(1, 6))
            arr = arr.map(x => x.replace(/\[.*?\]/g, ''))
            this.$store.commit('set_lyric', arr)
            this.$store.commit('set_lyricDt', arrDt)
          })
        }
      }

      if (this.type === 'list') {
        if (song.source === '企鹅') {
          axios.get(`http://iecoxe.top:3500/qq/song/url/?mid=${song.id}&br=${songType[this.$store.state.Counter.br]}`).then(res => {
            let url = res.data.data.url[song.id.toString()]
            if (url === undefined) {
              that.$message({
                message: song.name + ': 无音乐源,请尝试其他音质',
                type: 'warning'
              })
            } else {
              this.set_audio(url, song)
            }
          })
          axios.get(`http://iecoxe.top:3500/qq/lyric/?mid=${song.id}`).then(res => { /* QQ音乐歌词获取 */
            let arr = res.data.lyric.toString().split('\n')
            arr = arr.filter((element, index, self) => {
              if (index > 4 && element.replace(/\[.*?\]/g, '').trim() !== '') {
                return true
              } else {
                return false
              }
            })
            let arrDt = arr.map(x => x.substring(1, 6))
            arr = arr.map(x => x.replace(/\[.*?\]/g, ''))
            this.$store.commit('set_lyric', arr)
            this.$store.commit('set_lyricDt', arrDt)
          })
        } else if (song.source === '网易') {
          axios.get(`http://iecoxe.top:3000/song/url?id=${song.id}`).then(res => {
            let url = res.data.data[0].url
            if (url === undefined) {
              that.$message({
                message: song.name + ': 无音乐源,请尝试其他音质',
                type: 'warning'
              })
            } else {
              this.set_audio(url, song)
            }
          })
          axios.get(`http://iecoxe.top:3000/lyric?id=${song.id}`).then(res => { /* 网易音乐歌词 获取 */
            let arr = res.data.lrc.lyric.split('\n')
            arr = arr.filter((element, index, self) => {
              if (element.replace(/\[.*?\]/g, '').trim() !== '') {
                return true
              } else {
                return false
              }
            })
            let arrDt = arr.map(x => x.substring(1, 6))
            arr = arr.map(x => x.replace(/\[.*?\]/g, ''))
            this.$store.commit('set_lyric', arr)
            this.$store.commit('set_lyricDt', arrDt)
          })
        } else {
          axios.get(`http://iecoxe.top:3500/migu/song/url/?id=${song.id}`).then(res => {
            let url = res.data.data.listenUrl
            if (url === undefined) {
              that.$message({
                message: song.name + ': 无音乐源,请尝试其他音质',
                type: 'warning'
              })
            } else {
              this.set_audio(url, song)
            }
          })
          axios.get(`http://iecoxe.top:3500/migu/lyric/?id=${song.id}`).then(res => { /* 咪咕音乐歌词 获取 */
            let arr = res.data.lyric.split('\r\n')
            arr = arr.filter((element, index, self) => {
              if (element.replace(/\[.*?\]/g, '').trim() !== '') {
                return true
              } else {
                return false
              }
            })
            let arrDt = arr.map(x => x.substring(1, 6))
            arr = arr.map(x => x.replace(/\[.*?\]/g, ''))
            this.$store.commit('set_lyric', arr)
            this.$store.commit('set_lyricDt', arrDt)
          })
        }
      }
    },
    set_audio (url, song) { /* 代码写的比较烂，由于vue总是报错，采用原生js，方便 */
      let audio = this.$store.state.Counter.audio
      audio.src = url/* 设置歌曲链接 */
      console.log(url)

      this.$store.commit('set_songInfo', {/* 双击设置每一个歌曲的 歌名、歌手、图片 */
        songName: song.name,
        art: song.art,
        picUrl: song.picUrl,
        album: song.album,
        id: song.id
      })

      // 设置localStorage, 试听列表
      let songArr = []
      if (localStorage.getItem('2')) {
        songArr = JSON.parse(localStorage.getItem('2'))
        let flag = true/* 防止重复添加歌曲 */
        for (let i of songArr) {
          if (i.source === song.source && i.id === song.id) {
            flag = false
          }
        }
        if (flag) {
          songArr.push(song)
          // localStorage.setItem('recentSong', JSON.stringify(songArr))
          localStorage.setItem('2', JSON.stringify(songArr))
          // this.$store.commit('set_playListCount', songArr.length)
        }
      } else {
        songArr.push(song)
        localStorage.setItem('2', JSON.stringify(songArr))
      }

      /* 播放列表，当前播放列表 */
      if (localStorage.getItem('recentSong')) {
        if (this.$route.path === '/top') { /* 判断是否是排行榜，是 就将所有音乐添加到播放列表 */
          if (this.$store.state.Counter.top_tab === 1) {
            localStorage.setItem('recentSong', JSON.stringify(this.$store.state.Counter.QQ_Top_songlist))
          } else if (this.$store.state.Counter.top_tab === 2) {
            localStorage.setItem('recentSong', JSON.stringify(this.$store.state.Counter.WY_Top_songlist))
          } else {
            localStorage.setItem('recentSong', JSON.stringify(this.$store.state.Counter.MG_Top_songlist))
          }
        } else if (this.$route.path === '/songlist') { /* 判断是否是自定义歌单，是 就将所有音乐添加到播放列表 */
          localStorage.setItem('recentSong', localStorage.getItem(this.$store.state.Counter.songlistTab))
        } else { /* 在播放列表中添加不重复歌曲 */
          songArr = JSON.parse(localStorage.getItem('recentSong'))
          let flag = true/* 防止重复添加歌曲 */
          for (let i of songArr) {
            if (i.source === song.source && i.id === song.id) {
              flag = false
            }
          }
          if (flag) {
            songArr.push(song)
            localStorage.setItem('recentSong', JSON.stringify(songArr))
            this.$store.commit('set_playListCount')
          }
        }
      } else {
        songArr.push(song)
        localStorage.setItem('recentSong', JSON.stringify(songArr))
        this.$store.commit('set_playListCount')
      }

      // 判断播放按钮的状态
      if (document.getElementById('play')) {
        let play = document.getElementById('play')
        play.click()
      } else {
        audio.play()
      }
      // else if (document.getElementById('pause')) {
      //   let pause = document.getElementById('pause')
      //   pause.click()
      // }
    }
  },
  mounted: function () {
    /* 此处 自动改变 (原生js 比较low) 组件的高度 通过事件监听器 */
    let oscnp = this.$refs.osComponentRef
    oscnp.$el.style.height = parseInt(getComputedStyle(document.getElementsByClassName('el-main')[0])['height']) - 95 - parseInt(getComputedStyle(document.getElementsByClassName('el-tabs__header')[0])['height']) + 'px'
    console.log(oscnp.$el.style.height)
    let resize = function () {
      oscnp.$el.style.height = parseInt(getComputedStyle(document.getElementsByClassName('el-main')[0])['height']) - 55 - parseInt(getComputedStyle(document.getElementsByClassName('el-tabs__header')[0])['height']) + 'px'
      console.log(oscnp.$el.style.height)
    }
    /* 事件监听器 */
    window.addEventListener('resize', resize)

    // 绑定事件，利用事件冒泡原理，防止为每一个LI标签添加事件
    let uuu = this.$refs.uuu.$el
    uuu.addEventListener('dblclick', this.allTarget_dbclick)
    uuu.addEventListener('click', this.allTarget_click)
    uuu.addEventListener('contextmenu', (event) => {
      this.contextmenu_song = JSON.parse(event.target.parentElement.getAttribute('songData'))
    })
  }
}
</script>

<style scoped>
/* 设置每个歌曲项的样式 */
ul {list-style: none; padding: 0;}
ul li{height: 50px; line-height: 50px; font-size: 14px;}
.song-index{width: 7%; display: inline-block; opacity: 0.5; text-overflow: ellipsis; white-space: nowrap; overflow: hidden; height: 50px;}
.song-name{width: 20%; display: inline-block; text-overflow: ellipsis; white-space: nowrap; overflow: hidden; height: 50px;}
.song-art{width: 20%; display: inline-block; text-overflow: ellipsis; white-space: nowrap; overflow: hidden; height: 50px;}
.song-album{width: 20%; display: inline-block; text-overflow: ellipsis; white-space: nowrap; overflow: hidden; height: 50px;}
.song-make{width: 20%; display: inline-block; text-overflow: ellipsis; white-space: nowrap; overflow: hidden; height: 50px;}
.song-dt{width: 8%; display: inline-block; text-overflow: ellipsis; white-space: nowrap; overflow: hidden; height: 50px;}
li:hover{background-color: #f3f3f3;}

/* 设置操作区域的样式 */
span :nth-child(n) {
  width: 14%;
  font-size: 18px;
  height: 50px;
  line-height: 50px;
}
ul li span i:hover {
  color: #1ece9b;
}

.list-enter-active, .list-leave-active {
  transition: all 1s;
}
.list-enter, .list-leave-to
/* .list-leave-active for below version 2.1.8 */ {
  opacity: 0;
  transform: translateY(30px);
}

/* 右键菜单 */
.v-contextmenu li {
  height: auto;
}
</style>