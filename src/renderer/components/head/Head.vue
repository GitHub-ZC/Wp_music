<template>
  <el-row ref="head">
    <el-col :span="8">
      <div class="grid-content bg-purple">
        <el-autocomplete
          v-model="state"
          :fetch-suggestions="querySearchAsync"
          placeholder="请输入内容"
          @select="handleSelect"
          size="small"
          style="-webkit-app-region: no-drag;"
          id="el_search"
          @focus="el_focus"
          @blur="el_blur"
          prefix-icon="el-icon-search"
          @keyup.enter.native="ls"
        ></el-autocomplete>
      </div>
    </el-col>
    <el-col :span="8"><div class="grid-content bg-purple"></div></el-col>
    <el-col :span="8">
      <div class="grid-content bg-purple tray">
        <i class="el-icon-close" @click="el_colse"></i>
        <i class="el-icon-copy-document" @click="el_max_min"></i>
        <i class="el-icon-minus" @click="el_min"></i>
      </div>
    </el-col>
  </el-row>
</template>

<script>
// eslint-disable-next-line
import { ipcRenderer } from 'electron'
import axios from 'axios'

export default {
  name: 'electron-music-head',
  data: function () {
    return {
      restaurants: [],
      state: '',
      timeout: 0
    }
  },
  methods: {
    ls: function () {
      this.$router.push({ path: 'search' }, onComplete => {}, onAbort => {})
      if (this.$store.state.Counter.search_tab === 1) {
        this.$store.dispatch('QQ_search', this.state)
      } else if (this.$store.state.Counter.search_tab === 2) {
        this.$store.dispatch('WY_search', this.state)
      } else {
        this.$store.dispatch('MG_search', this.state)
      }
      this.$store.commit('set_search_pack', this.state) /* 设置搜索 search_pack */
      console.log(this.$store)
    },
    el_focus: function () {
      this.$refs.head.$el.style['-webkit-app-region'] = 'no-drag'
    },
    el_blur: function () {
      this.$refs.head.$el.style['-webkit-app-region'] = 'drag'
    },
    el_max_min: function () {
      ipcRenderer.send('maximize')
    },
    el_min: function () {
      ipcRenderer.send('minimize')
    },
    el_colse: function () {
      ipcRenderer.send('close')
    },
    querySearchAsync: function (queryString, cb) {
      // var restaurants = this.restaurants
      // var results = queryString ? restaurants.filter(this.createStateFilter(queryString)) : restaurants
      if (!queryString.trim()) {
        axios.get(`http://iecoxe.top:3000/search/hot`).then((res) => {
          let searchInfo = res.data.result.hots
          let arr = []
          for (let info of searchInfo) {
            arr.push({value: info.first})
          }
          cb(arr)
        }).catch(err => {
          console.log(err)
        })
      } else {
        axios.get(`http://iecoxe.top:3000/search/suggest?type=mobile&keywords=${queryString}`).then((res) => {
          let searchInfo = res.data.result.allMatch
          if (searchInfo === undefined) {
            return
          }
          let arr = []
          for (let info of searchInfo) {
            arr.push({value: info.keyword})
          }
          cb(arr)
        }).catch(err => {
          console.log(err)
        })
      }
    },
    createStateFilter: function (queryString) {
      return (state) => {
        return (state.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0)
      }
    },
    handleSelect (item) {

    }
  }
}
</script>

<style scoped>
/* 输入框的 搜索 按钮 */
>>> .el-icon-search {
  position: relative;
  top: 8px;
  left: 16px;
}
>>> .el-icon-search:hover {
  color: #1ECC94;
}
/* 输入框 大小、圆弧 */
>>> #el_search {
  margin-top: 14px;
  margin-left: 20px;
  border-radius: 20px;
}
/* 窗口的缩放、关闭图标 */
.tray i {
  float: right;
  font-size: 22px;
  margin-right: 4px;
  line-height: 60px;
  -webkit-app-region: no-drag;
}
i:hover {
  color: #1ECC94;
}

.el-col {
  border-radius: 4px;
}
.bg-purple {
  /* background: #d3dce6; */
}
.grid-content {
  min-height: 60px;
  border-radius: 4px;
}
</style>