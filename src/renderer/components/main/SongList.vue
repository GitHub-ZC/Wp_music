<template>
    <el-tabs v-model="editableTabsValue" addable @edit="handleTabsEdit" @tab-click="handleClick">
    <el-tab-pane
        :key="item.name"
        v-for="item in editableTabs"
        :label="item.title"
        :name="item.name"
        :closable="item.closable"
    >
        <MusicList @keys="key" :songlist="getLocalStore(item.name)" type="list" :key="keyIndex"></MusicList>
    </el-tab-pane>
    </el-tabs>
</template>
<script>
  import MusicList from '@/components/public/MusicList'
  export default {
    name: 'electron-music-songlist',
    components: {
      MusicList
    },
    data () {
      return {
        editableTabsValue: '2',
        editableTabs: [{
          title: '我的收藏',
          name: '1',
          closable: false
          // content: 'myLove'
        }, {
          title: '试听列表',
          name: '2',
          closable: false
          // content: 'playList'
        }],
        tabIndex: 2,
        keyIndex: 0/* key属性，及时刷新当前 子 组件 */
      }
    },
    methods: {
      handleClick (tab, event) {
        this.$store.commit('set_songlistTab', tab.name)
      },
      /* 自定义方法，子组件刷新父组件，用于歌单删除歌曲时，刷新歌单 */
      key () {
        ++this.keyIndex
      },
      /* 返回每一个歌单的歌曲列表 */
      getLocalStore (index) {
        return JSON.parse(localStorage.getItem(index))
      },
      /* 触发导航栏添加tab或者删除tab时触发，主要是为了创建删除歌单，以及保存、使用歌单数据 */
      handleTabsEdit (targetName, action) {
        /* 添加tab时触发 */
        if (action === 'add') {
          /* 创建element-ui提供的messageBox对象，接受和判断歌单名称、以及判断歌单名是否重复 */
          this.$prompt('请输入歌单名称', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            inputValidator: (info) => {
              let flag = false
              for (let value of this.editableTabs) {
                if (value.title === info) {
                  flag = true
                }
                if (flag) {
                  return '歌单已存在'
                }
              }
            }
          }).then(({ value }) => { /* 按下messageBox的确认键触发，添加localstore缓存 */
            this.$message({
              type: 'success',
              message: '歌单名称是: ' + value
            })
            let newTabName = ++this.tabIndex + ''
            this.editableTabs.push({
              title: value,
              name: newTabName,
              // content: 'New Tab content',
              closable: true
            })
            this.editableTabsValue = newTabName
            localStorage.setItem('editableTabs', JSON.stringify(this.editableTabs))
            localStorage.setItem('tabIndex', JSON.stringify(newTabName))
            localStorage.setItem(newTabName, JSON.stringify([]))
          }).catch(() => { /* 按下取消键触发，提示消息 */
            this.$message({
              type: 'info',
              message: '取消输入'
            })
          })
        }
        /* 删除tab时触发 */
        if (action === 'remove') {
          this.$confirm('此操作将永久删除该歌单, 是否继续?', '提示', {/* 警告提示 */
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => { /* 按下确认键触发，删除相关tab缓存 */
            this.$message({
              type: 'success',
              message: '删除成功!'
            })
            let tabs = this.editableTabs
            let activeName = this.editableTabsValue
            if (activeName === targetName) {
              tabs.forEach((tab, index) => {
                if (tab.name === targetName) {
                  let nextTab = tabs[index + 1] || tabs[index - 1]
                  if (nextTab) {
                    activeName = nextTab.name
                  }
                }
              })
            }
  
            this.editableTabsValue = activeName
            this.editableTabs = tabs.filter(tab => tab.name !== targetName)
            localStorage.removeItem(targetName)
            localStorage.setItem('editableTabs', JSON.stringify(this.editableTabs))
          }).catch(() => { /* 按下取消键触发 */
            this.$message({
              type: 'info',
              message: '已取消删除'
            })
          })
        }
      }
    },
    /* 初始判断localstore是否存储数据、不存在则创建数据缓存 */
    /* 移动到NavMenu.vue组件的beforeMount生命周期中 */
    mounted () {
      /* 初始化歌单数据 */
      if (localStorage.getItem('editableTabs')) {
        this.editableTabs = JSON.parse(localStorage.getItem('editableTabs'))
        this.tabIndex = JSON.parse(localStorage.getItem('tabIndex'))
      }
    }
  }
</script>