import axios from 'axios'

const state = {
  isCollapse: true, /* 导航栏显示 */
  WY_songlist: [], /* 搜索音乐歌曲列表，以下同意 */
  QQ_songlist: [],
  MG_songlist: [],
  WY_Top_songlist: [],
  QQ_Top_songlist: [],
  MG_Top_songlist: [],
  loading: false, /* loading图标的加载 */
  search_tab: 1, /* 搜索框的tab位数，这里用 1、2、3表示QQ\WY\MG */
  top_tab: 1, /* 排行榜框的tab位数，这里用 1、2、3表示QQ\WY\MG */
  songlistTab: '2', /* 歌单框的tab位数，用每个歌单的 name 属性 来赋值 */
  search_pack: '', /* 搜索懒加载 */
  audio: null, /* 播放器的 refs ，用于获取播放器对象 */
  songInfo: {/* 播放器的歌曲信息显示 */
    id: '',
    songName: '一路向北',
    art: '周杰伦',
    album: '叶惠美',
    picUrl: 'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1603600121914&di=9013c3d2ddafd42011828bb96cc5da95&imgtype=0&src=http%3A%2F%2Fb.hiphotos.baidu.com%2Fzhidao%2Fpic%2Fitem%2F7aec54e736d12f2e08524bdf4ec2d5628535683e.jpg'
  },
  lyric: null, /* 歌词 */
  lyricDt: null, /* 歌词时间 */
  playListCount: 0, /* 播放列表歌曲数量,作为key，实时刷新 */
  br: 3/* 1: 标准 2：高品质 3：无损 */
}

const mutations = {
  /* 设置br */
  set_br (state, index) {
    state.br = index
  },
  /* 设置歌单的tab ，唯一判断，用于删除歌曲的索引 */
  set_songlistTab (state, songlistTab) {
    state.songlistTab = songlistTab
  },
  /* 设置播放列表歌曲数量 */
  set_playListCount (state) {
    state.playListCount += 1
  },
  /* 设置歌词时间 */
  set_lyricDt (state, lyricDt) {
    state.lyricDt = lyricDt
  },
  /* 设置歌词 */
  set_lyric (state, lyric) {
    state.lyric = lyric
  },
  /* 设置播放器的相关操作的 element */
  set_songInfo (state, songInfo) {
    state.songInfo = songInfo
  },
  /* 设置播放器的相关操作的 element */
  set_audio (state, audio) {
    state.audio = audio
  },
  /* 设置导航栏 */
  set_isCollapse (state, flag) {
    state.isCollapse = flag
  },
  /* 设置当前搜索的tab位置 */
  set_search_tab (state, index) {
    state.search_tab = index
  },
  /* 设置当前TOP的tab位置 */
  set_top_tab (state, index) {
    state.top_tab = index
  },
  /* 设置搜索框的懒加载 */
  set_search_pack (state, index) {
    state.search_pack = index
  },
  set_WY_Songlist (state, data) {
    state.WY_songlist.push(...data)
  },
  clear_WY_Songlist (state) {
    state.WY_songlist.length = 0
  },
  set_QQ_Songlist (state, data) {
    state.QQ_songlist.push(...data)
  },
  clear_QQ_Songlist (state) {
    state.QQ_songlist.length = 0
  },
  set_MG_Songlist (state, data) {
    state.MG_songlist.push(...data)
  },
  clear_MG_Songlist (state) {
    state.MG_songlist.length = 0
  }, /* 清空搜索页面的歌曲列表 */
  set_WY_Top_songlist (state, data) {
    state.WY_Top_songlist.push(...data)
  },
  clear_WY_Top_songlist (state) {
    state.WY_Top_songlist.length = 0
  },
  set_QQ_Top_songlist (state, data) {
    state.QQ_Top_songlist.push(...data)
  },
  clear_QQ_Top_songlist (state) {
    state.QQ_Top_songlist.length = 0
  },
  set_MG_Top_songlist (state, data) {
    state.MG_Top_songlist.push(...data)
  },
  clear_MG_Top_songlist (state) {
    state.MG_Top_songlist.length = 0
  },
  setloading (state, data) {
    state.loading = data
  }
}

const actions = {
  WY_search: async function (context, msg) {
    if (!msg.trim()) {
      return
    }
    context.commit('setloading', true)
    var res = await axios.get(`http://iecoxe.top:3000/cloudsearch?keywords=${msg}`)
    var data = res.data.result.songs
    console.log('WY')

    context.commit('clear_WY_Songlist')
    let arr = []
    for (const song of data) {
      const obj = {
        name: song.name,
        id: song.id,
        art: methods.artists(song.ar),
        album: song.al.name,
        dt: methods.durationTime(song.dt / 1000),
        picUrl: song.al.picUrl,
        source: '网易'
      }
      arr.push(obj)
    }
    context.commit('set_WY_Songlist', arr)
    context.commit('setloading', false)
  },
  QQ_search: async function (context, msg) {
    if (!msg.trim()) {
      console.log('jk')
      return
    }
    context.commit('setloading', true)
    var res = await axios.get(`http://iecoxe.top:3500/qq/search/?key=${msg}`)
    var data = res.data.data.song.list
    console.log('QQ')

    context.commit('clear_QQ_Songlist')
    let arr = []
    for (const song of data) {
      const obj = {
        name: song.songname,
        id: song.songmid,
        art: methods.artists(song.singer),
        album: song.albumname,
        dt: methods.durationTime(song.interval),
        picUrl: `https://y.gtimg.cn/music/photo_new/T002R300x300M000${song.albummid}.jpg`,
        source: '企鹅'
      }
      arr.push(obj)
    }
    context.commit('set_QQ_Songlist', arr)
    context.commit('setloading', false)
  },
  MG_search: async function (context, msg) {
    if (!msg.trim()) {
      return
    }
    context.commit('setloading', true)
    var res = await axios.get(`http://iecoxe.top:3500/migu/search/?key=${msg}`)
    var data = res.data.musics
    console.log('MG')

    context.commit('clear_MG_Songlist')
    let arr = []
    for (const song of data) {
      const obj = {
        name: song.songName,
        id: song.copyrightId,
        art: song.artist,
        album: song.albumName,
        dt: 0,
        picUrl: song.cover,
        source: '咪咕'
      }
      arr.push(obj)
    }
    context.commit('set_MG_Songlist', arr)
    context.commit('setloading', false)
  },
  QQ_top: async function (context, msg) {
    context.commit('setloading', true)
    var res = await axios.get(`http://iecoxe.top:3500/qq/top/?topId=${msg}`)
    var data = res.data.detail.data.songInfoList

    context.commit('clear_QQ_Top_songlist')
    let arr = []
    for (const song of data) {
      const obj = {
        name: song.name,
        id: song.mid,
        art: methods.artists(song.singer),
        album: song.album ? song.album.name : '',
        dt: methods.durationTime(song.interval),
        picUrl: `https://y.gtimg.cn/music/photo_new/T002R300x300M000${song.album ? song.album.mid : 'https://p2.music.126.net/6y-UleORITEDbvrOLV0Q8A==/5639395138885805.jpg'}.jpg`,
        source: '企鹅'
      }
      arr.push(obj)
    }
    context.commit('set_QQ_Top_songlist', arr)
    context.commit('setloading', false)
  },
  WY_top: async function (context, msg) {
    context.commit('setloading', true)
    var res = await axios.get(`http://iecoxe.top:3000/playlist/detail?id=${msg}`)
    var data = res.data.playlist.tracks

    context.commit('clear_WY_Top_songlist')
    let arr = []
    for (const song of data) {
      const obj = {
        name: song.name,
        id: song.id,
        art: methods.artists(song.ar),
        album: song.al ? song.al.name : '',
        dt: methods.durationTime(song.dt / 1000),
        picUrl: song.al.picUrl,
        source: '网易'
      }
      arr.push(obj)
    }
    context.commit('set_WY_Top_songlist', arr)
    context.commit('setloading', false)
  },
  MG_top: async function (context, msg) {
    context.commit('setloading', true)
    var res = await axios.get(`http://iecoxe.top:3500/migu/top/?topId=${msg}`)
    var data = res.data.songs.items

    context.commit('clear_MG_Top_songlist')
    let arr = []
    for (const song of data) {
      const obj = {
        name: song.name,
        id: song.copyrightId,
        art: methods.artists(song.singers),
        album: song.album ? song.album.albumName : '',
        dt: song.duration.substring(3),
        picUrl: song.mediumPic,
        source: '咪咕'
      }
      arr.push(obj)
    }
    context.commit('set_MG_Top_songlist', arr)
    context.commit('setloading', false)
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
  },
  /* 歌曲歌手的总格式化 */
  artists: (artists) => {
    let str = ''
    for (const art of artists) {
      str = art.name + '、' + str
    }
    return str.substring(0, str.length - 1)
  }
}

export default {
  state,
  mutations,
  actions
}
