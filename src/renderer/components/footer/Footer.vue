<template>
  <div>
    <el-slider
      v-model="value"
      :max="dt_slide"
      @change="slide_change"
      @input="slide_input"
    ></el-slider>
    <el-row>
      <el-col :span="8">
        <div class="grid-content">
          <div class="img" @click="lyric_drawer = !lyric_drawer">
            <img :src="$store.state.Counter.songInfo.picUrl" />
            <i class="el-icon-d-arrow-left"></i>
            <i class="el-icon-d-arrow-right"></i>
          </div>
          <div class="art">
            <span>{{ $store.state.Counter.songInfo.songName }}</span> -
            <span>{{ $store.state.Counter.songInfo.art }}</span>
          </div>
          <div class="time">
            <span>{{ dt_start }}</span> /
            <span>{{ dt_end }}</span>
          </div>
        </div>
      </el-col>
      <el-col :span="8">
        <div class="grid-content el_btn_i_2">
          <i class="el-icon-caret-left" @click="left"></i>
          <transition name="el-fade-in" mode="out-in">
            <i
              class="el-icon-video-pause"
              id="pause"
              @click="pause"
              v-if="show"
              :key="1"
            ></i>
            <i
              class="el-icon-video-play"
              id="play"
              @click="play"
              v-else
              :key="2"
            ></i>
          </transition>
          <i class="el-icon-caret-right" @click="right"></i>
        </div>
      </el-col>
      <el-col :span="8">
        <div class="grid-content el_btn_i_3">
          <!-- <el-dropdown trigger="click" placement="top" id="sound_quality">
            <span class="el-dropdown-link">
              flac<i class="el-icon-arrow-up el-icon--right"></i>
            </span>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item icon="el-icon-plus">128K</el-dropdown-item>
              <el-dropdown-item icon="el-icon-circle-plus"
                >320K</el-dropdown-item
              >
              <el-dropdown-item icon="el-icon-circle-plus-outline"
                >flac</el-dropdown-item
              >
            </el-dropdown-menu>
          </el-dropdown> -->
          <i class="el-icon-s-unfold" @click="drawer = !drawer"></i>
        </div>
      </el-col>
    </el-row>
    <audio ref="audio" src=""></audio>
    <el-drawer
      title="播放列表"
      :modal="false"
      :visible.sync="drawer"
      size="300px"
      :with-header="true"
      :show-close="false"
    >
      <overlay-scrollbars style="height: calc(100% - 60px)">
        <ul class="playList_ul" :key="$store.state.Counter.playListCount" @click="allTarget_click">
          <li v-for="li in recentSong()" :key="li.id" :songData="JSON.stringify(li)">
            <el-row>
              <el-col :span="12">
                <div class="grid-playList_ul">
                  <p style="white-space: nowrap;"><span style="font-weight: bold;">{{ li.name }}</span></p>
                  <p style="white-space: nowrap;"><span style="opacity: 0.7;">{{ li.art }}</span></p>
                </div>
              </el-col>
              <el-col :span="12">
                <div class="grid-playList_ul playList_i">
                  <el-tag size="mini" style="position: relative; top: -16px; left: -10px;">{{ li.source }}</el-tag>
                  <i class="el-icon-video-play" title="播放歌曲"></i>
                  <!-- <i class="el-icon-circle-plus-outline" title="无"></i> -->
                  <i class="el-icon-circle-close" title="从播放列表删除"></i>
                </div>
              </el-col>
            </el-row>
          </li>
        </ul>
      </overlay-scrollbars>
      <div class="playList_btn">
        <i class="el-icon-delete" @click="el_icon_delete" title="删除全部"></i>
      </div>
    </el-drawer>
    <el-drawer
      title=""
      :modal="false"
      :visible.sync="lyric_drawer"
      direction="btt"
      size="100%"
      :with-header="true"
      @opened="lyricopen"
      custom-class="lyric-drawer"
    >
      <div class="lyric">
        <img :src="$store.state.Counter.songInfo.picUrl" alt="" />
        <p>歌手：<span>{{ $store.state.Counter.songInfo.art }}</span></p>
        <p>歌曲：<span>{{ $store.state.Counter.songInfo.songName }}</span></p>
        <p>专辑：<span>{{ $store.state.Counter.songInfo.album }}</span></p>
      </div>
      <div class="mouse-wheel-vertical-scroll">
        <div class="mouse-wheel-wrapper" ref="scroll">
          <div class="mouse-wheel-content">
            <div class="mouse-wheel-item" v-for="(n, index) in $store.state.Counter.lyric" :key="index + n">
              {{ n }}
            </div>
          </div>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script>
import url from 'url' /* 用来第一次判断audio有没有src */
import BScroll from '@better-scroll/core' /* 歌词滚动插件 */
import MouseWheel from '@better-scroll/mouse-wheel'
import axios from 'axios'
BScroll.use(MouseWheel)
export default {
  name: 'electron-music-footer',
  data () {
    return {
      value: 100,
      show: false,
      drawer: false,
      lyric_drawer: false,
      // songName: '晴天',
      // art: '周杰伦',
      dt_start: '00:00',
      dt_end: '00:00',
      visible: false,
      timer: null /* 计时器 */,
      dt_slide: 0
    }
  },
  methods: {
    lyricopen () { /* 歌词同步器打开时的回调函数 */
      this.init()
    },
    init () { /* 歌词滚动 */
      if (this.scroll) {
        console.log('better-scroll is mounted')
      } else {
        this.scroll = new BScroll(this.$refs.scroll, {
          mouseWheel: true
        })
      }
    },
    /* 事件冒泡，事件监听器，监听所有鼠标单击事件 */
    allTarget_click (event) {
      console.log(event.target.getAttribute('class'))
      if (event.target.getAttribute('class') === 'el-icon-video-play') {
        let songDate = JSON.parse(event.target.parentElement.parentElement.parentElement.parentElement.getAttribute('songData'))
        this.getUrl(songDate)
      } else if (event.target.getAttribute('class') === 'el-icon-circle-close') {
        let song = JSON.parse(localStorage.getItem('recentSong'))
        let songDate = JSON.parse(event.target.parentElement.parentElement.parentElement.parentElement.getAttribute('songData'))
        song = song.filter(x => !(x.id === songDate.id && x.source === songDate.source))
        localStorage.setItem('recentSong', JSON.stringify(song))
        this.$store.commit('set_playListCount')
      }
    },
    /* 上一首歌曲 */
    left () {
      let songData = JSON.parse(localStorage.getItem('recentSong'))
      if (!songData.length) {
        if (document.getElementById('pause')) {
          let play = document.getElementById('pause')
          play.click()
        }
        return
      }
      for (let i in songData) {
        if (songData[i].id === this.$store.state.Counter.songInfo.id) {
          if (parseInt(i) - 1 < 0) {
            this.getUrl(songData[songData.length - 1])
          } else {
            this.getUrl(songData[--i])
          }
          return
        }
      }
      this.getUrl(songData[0])
    },
    /* 下一首歌曲 */
    right () {
      let songData = JSON.parse(localStorage.getItem('recentSong'))
      if (!songData.length) {
        if (document.getElementById('pause')) {
          let play = document.getElementById('pause')
          play.click()
        }
        return
      }
      for (let i in songData) {
        if (songData[i].id === this.$store.state.Counter.songInfo.id) {
          if (parseInt(i) + 1 > songData.length - 1) {
            this.getUrl(songData[0])
          } else {
            this.getUrl(songData[++i])
          }
          return
        }
      }
      this.getUrl(songData[0])
    },
    /* 播放按钮 */
    play () {
      let audio = this.$refs.audio

      if (url.parse(audio.src).path !== '/') {
        /* 返回音频当前的就绪状态 */
        this.show = !this.show

        audio.play()
        // this.dt_end = methods.durationTime(audio.duration)/* 设置当前歌曲总时长 */
        // this.dt_slide = audio.duration
        let that = this /* 获取 定时器 的 this */
        this.timer = setInterval(function () {
          if (audio.readyState) {
            that.dt_end = methods.durationTime(
              audio.duration
            ) /* 设置当前歌曲总时长 */
            that.dt_slide = audio.duration
          }
          that.dt_start = methods.durationTime(
            audio.currentTime
          ) /* 设置当前歌曲播放时长 */
          that.value = audio.currentTime

          /* 歌词随时间的滚动 */
          if (document.querySelector('.mouse-wheel-content')) {
            let lyric = document.querySelector('.mouse-wheel-content')
            let lyricPer = document.querySelector('.mouse-wheel-wrapper')
            let lyricLis = document.querySelectorAll('.mouse-wheel-item')
            let flag = that.$store.state.Counter.lyricDt.indexOf(methods.durationTime(audio.currentTime))
            if (flag !== -1) {
              lyric.style.transform = `translateY(${-50 * flag + parseInt(lyricPer.offsetHeight / 2) - 50}px)`
              lyric.style.transitionDuration = '800ms'

              for (let li of lyricLis) {
                li.style.color = '#333'
              }
              lyricLis[flag].style.color = '#1ece9b'
            }
          }
          if (audio.ended) {
            that.right()
          }
        }, 1000)
      }
    },
    /* 暂停按钮 */
    pause () {
      this.show = !this.show

      let audio = this.$refs.audio
      clearInterval(this.timer)
      audio.pause()
    },
    slide_change (index) {
      let audio = this.$refs.audio
      audio.currentTime = index
    },
    slide_input (index) {
      this.dt_start = methods.durationTime(index)
    },
    recentSong () {
      let playList = JSON.parse(localStorage.getItem('recentSong'))
      return playList
    },
    el_icon_delete () { /* 清空播放列表 */
      localStorage.setItem('recentSong', JSON.stringify([]))
      this.$store.commit('set_playListCount')
    },
    set_audio (url, song) { /* 代码写的比较烂，由于vue总是报错，采用原生js，方便 */
      let audio = this.$refs.audio
      audio.src = url/* 设置歌曲链接 */

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

      // 判断播放按钮的状态
      if (document.getElementById('play')) {
        let play = document.getElementById('play')
        play.click()
      } else {
        audio.play()
      }
    },
    getUrl (song) {
      let songType = {
        '1': '128',
        '2': '320',
        '3': 'flac'
      }
      let that = this
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
    },
    getNextSong () {

    }
  },
  mounted () {
    this.$store.commit('set_audio', this.$refs.audio)
  }
}
const methods = {
  /* 时间转化函数 */
  durationTime: (duration) => {
    var timer = null
    if (duration < 10) {
      timer = '00:0' + Math.floor(duration)
    } else if (duration < 60) {
      timer = '00:' + Math.floor(duration)
    } else {
      var minet = parseInt(duration / 60)
      var sec = duration - minet * 60
      if (sec < 10) {
        timer = '0' + minet + ':' + '0' + parseInt(sec)
      } else {
        timer = '0' + minet + ':' + parseInt(sec)
      }
    }
    return timer
  }
}
</script>

<style scoped>
/* 进度条 */
>>> .el-tooltip {
  width: 6px;
  height: 6px;
}
>>> .el-slider__runway {
  margin: 0;
}
>>> .el-slider__bar {
  background-color: #1ece9b;
}
.art {
  position: absolute;
  left: 52px;
  top: 4px;
  font-size: 14px;
  opacity: 0.9;
}
.time {
  position: absolute;
  left: 52px;
  top: 26px;
  font-size: 14px;
  opacity: 0.8;
}

/* 图片的设定 */
.img {
  width: 40px;
  height: 40px;
  position: relative;
  left: 5px;
  top: 5px;
}
.img img {
  height: 100%;
  width: 100%;
  border-radius: 4px;
}
.img i {
  position: absolute;
  font-size: 20px;
  opacity: 0;
}
.img i:nth-of-type(1) {
  left: 5px;
  top: 12px;
}
.img i:nth-of-type(2) {
  left: 15px;
  top: 12px;
}
.img:hover img {
  filter: blur(1px);
}
.img:hover i:nth-of-type(1) {
  transform: translateX(-4px);
  opacity: 1;
}
.img:hover i:nth-of-type(2) {
  transform: translateX(4px);
  opacity: 1;
}
/* 图片 结束 */

.el-col {
  border-radius: 4px;
}
.grid-content {
  min-height: 54px;
}
.el_btn_i_2 {
  font-size: 36px;
  line-height: 54px;
  text-align: center;
}
.el_btn_i_2 i:hover {
  color: #1ece9b;
}

.el_btn_i_3 {
  font-size: 24px;
  line-height: 54px;
  text-align: right;
}
.el_btn_i_3 i:hover {
  color: #1ece9b;
}

#sound_quality {
  position: absolute;
  z-index: 1000;
  right: 160px;
  top: 0px;
}

/* 歌词的显示 */
.lyric {
  width: 300px;
  margin: 0 5%;
}
.lyric img {
  width: 300px;
  height: 300px;
  text-align: center;
}
.mouse-wheel-vertical-scroll {
  height: 70%;
  width: 450px;
  margin: 0 5%;
  /* border: 1px black solid; */
}
.mouse-wheel-wrapper {
  height: 100%;
  overflow: hidden;
}
.mouse-wheel-item {
  height: 50px;
  line-height: 50px;
  font-size: 20px;
  font-weight: bold;
  text-align: center;
  font-size: 16px;
  overflow: hidden;
}
>>> .lyric-drawer .el-drawer__body {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 85%;
}

/* 播放列表相关css设置 */
.playList_btn {
  width: 60px;
  font-size: 24px;
  line-height: 60px;
  padding-left: 20px;
}
.playList_btn:hover {
  color: #1ece9b;
}
.playList_ul {
  list-style: none;
  padding: 0;
}
.playList_ul li {
  height: 60px;
  padding-left: 20px;
  font-size: 14px;
}
.playList_ul li:hover {
  background-color: #f3f3f3;
}
.playList_ul li p {
  margin: 0;
  padding: 4px 0;
  text-overflow: ellipsis;
  overflow: hidden;
}
/* 分栏的高度设置 */
.grid-playList_ul {
  min-height: 60px;
}
/* 分栏的i标签设置 */
.grid-playList_ul i {
  font-size: 24px;
  opacity: 0.7;
  position: relative;
  right: 10px;
}
/* 每首歌曲的操作按钮样式 */
.playList_i {
  line-height: 60px;
  text-align: right;
}
.playList_i i:hover {
  opacity: 1;
}
</style>